import {
  users,
  students,
  testResults,
  ishiharaQuestions,
  type User,
  type InsertUser,
  type Student,
  type InsertStudent,
  type TestResult,
  type InsertTestResult
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, count, and, gte, not, countDistinct, sql } from "drizzle-orm";
import { calculateDiagnosis } from "./services/ishiharaQuestions";
import dotenv from 'dotenv';
dotenv.config();

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createTeacher(user: InsertUser): Promise<User>;
  getAllTeachers(): Promise<User[]>;
  deactivateTeacher(id: number): Promise<void>;

  // NEW: Additional teacher methods for update functionality
  getTeacherById(id: number): Promise<User | undefined>;
  getTeacherByNip(nip: string): Promise<User | undefined>;
  updateTeacher(id: number, data: Partial<InsertUser>): Promise<User>;

  // Student methods
  createStudent(student: InsertStudent): Promise<Student>;
  deleteTestByStudentId(studentId: number): Promise<void>;

  // Test result methods
  submitTestResult(data: {
    studentId: number;
    teacherId: number;
    answers: { questionId: number; answer: string; correct: boolean }[];
    testDuration: number;
  }): Promise<TestResult>;
  getTestResultsByTeacher(teacherId: number): Promise<any[]>;
  getAllTestResults(): Promise<any[]>;
  getTestResultById(id: number): Promise<any>;

  // Stats methods
  getTeacherStats(teacherId: number): Promise<{
    totalStudents: number;
    weeklyTests: number;
    accuracy: number;
  }>;
  getAdminStats(): Promise<{
    teachers: number;
    students: number;
    monthlyTests: number;
    colorBlind: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createTeacher(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({ ...insertUser, role: "teacher" })
      .returning();
    return user;
  }

  async getAllTeachers(): Promise<
  (User & { testsCount: number })[]
> {
  return await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      password: users.password,
      role: users.role, 
      nip: users.nip,
      subject: users.subject,
      isActive: users.isActive,
      createdAt: users.createdAt,
      testsCount: sql<number>`COUNT(${testResults.id})`.as("testsCount"),
    })
    .from(users)
    .leftJoin(testResults, eq(users.id, testResults.teacherId))
    .where(eq(users.role, "teacher"))
    .groupBy(users.id)
    .orderBy(desc(users.createdAt));
}

  async deactivateTeacher(id: number): Promise<void> {
    await db
      .update(users)
      .set({ isActive: false })
      .where(eq(users.id, id));
  }

  // NEW: Get teacher by ID
  async getTeacherById(id: number): Promise<User | undefined> {
    const [teacher] = await db
      .select()
      .from(users)
      .where(and(eq(users.id, id), eq(users.role, "teacher")));
    return teacher || undefined;
  }

  // NEW: Get teacher by NIP
  async getTeacherByNip(nip: string): Promise<User | undefined> {
    const [teacher] = await db
      .select()
      .from(users)
      .where(and(eq(users.nip, nip), eq(users.role, "teacher")));
    return teacher || undefined;
  }

  // NEW: Update teacher
  async updateTeacher(id: number, data: Partial<InsertUser>): Promise<User> {
    const [updatedTeacher] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return updatedTeacher;
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const [student] = await db
      .insert(students)
      .values(insertStudent)
      .returning();
    return student;
  }

  async deleteTestByStudentId(studentId: number) {
    // Hapus test result terlebih dahulu (karena foreign key constraint)
    await db.delete(testResults).where(eq(testResults.studentId, studentId));

    // Hapus data siswa dari tabel students
    await db.delete(students).where(eq(students.id, studentId));
  }

  async submitTestResult(data: {
    studentId: number;
    teacherId: number;
    answers: { questionId: number; answer: string; correct: boolean }[];
    testDuration: number;
  }): Promise<TestResult> {
    const score = data.answers.filter(a => a.correct).length;
    const totalQuestions = data.answers.length;
    const percentage = Math.round((score / totalQuestions) * 100);

    const { diagnosis, recommendations } = calculateDiagnosis(score, totalQuestions);

    const [result] = await db
      .insert(testResults)
      .values({
        studentId: data.studentId,
        teacherId: data.teacherId,
        score,
        totalQuestions,
        percentage,
        diagnosis,
        recommendations,
        answers: data.answers,
        testDuration: data.testDuration,
      })
      .returning();

    return result;
  }

  async getTestResultsByTeacher(teacherId: number): Promise<any[]> {
    return await db
      .select({
        id: testResults.id,
        score: testResults.score,
        totalQuestions: testResults.totalQuestions,
        percentage: testResults.percentage,
        diagnosis: testResults.diagnosis,
        recommendations: testResults.recommendations,
        testDuration: testResults.testDuration,
        createdAt: testResults.createdAt,
        student: {
          id: students.id,
          name: students.name,
          birthDate: students.birthDate,
          gender: students.gender,
          major: students.major,
        },
        teacher: {
          id: users.id,
          name: users.name,
          nip: users.nip,
        },
      })
      .from(testResults)
      .innerJoin(students, eq(testResults.studentId, students.id))
      .innerJoin(users, eq(testResults.teacherId, users.id))
      .where(eq(testResults.teacherId, teacherId))
      .orderBy(desc(testResults.createdAt));
  }

  async getAllTestResults(): Promise<any[]> {
    return await db
      .select({
        id: testResults.id,
        score: testResults.score,
        totalQuestions: testResults.totalQuestions,
        percentage: testResults.percentage,
        diagnosis: testResults.diagnosis,
        recommendations: testResults.recommendations,
        testDuration: testResults.testDuration,
        createdAt: testResults.createdAt,
        student: {
          id: students.id,
          name: students.name,
          birthDate: students.birthDate,
          gender: students.gender,
          major: students.major,
        },
        teacher: {
          id: users.id,
          name: users.name,
          nip: users.nip,
        },
      })
      .from(testResults)
      .innerJoin(students, eq(testResults.studentId, students.id))
      .innerJoin(users, eq(testResults.teacherId, users.id))
      .orderBy(desc(testResults.createdAt));
  }

  async getTestResultById(id: number): Promise<any> {
    const [result] = await db
      .select({
        id: testResults.id,
        score: testResults.score,
        totalQuestions: testResults.totalQuestions,
        percentage: testResults.percentage,
        diagnosis: testResults.diagnosis,
        recommendations: testResults.recommendations,
        testDuration: testResults.testDuration,
        answers: testResults.answers,
        createdAt: testResults.createdAt,
        student: {
          id: students.id,
          name: students.name,
          birthDate: students.birthDate,
          gender: students.gender,
          major: students.major,
        },
        teacher: {
          id: users.id,
          name: users.name,
          nip: users.nip,
        },
      })
      .from(testResults)
      .innerJoin(students, eq(testResults.studentId, students.id))
      .innerJoin(users, eq(testResults.teacherId, users.id))
      .where(eq(testResults.id, id));

    return result || null;
  }

  async getTeacherStats(teacherId: number): Promise<{
    totalStudents: number;
    weeklyTests: number;
    accuracy: number;
  }> {
    // Get total students tested by this teacher
    const [totalStudentsResult] = await db
      .select({
        count: countDistinct(sql`LOWER(${students.name})`)
      })
      .from(testResults)
      .innerJoin(students, eq(testResults.studentId, students.id))
      .where(eq(testResults.teacherId, teacherId));

    // Get weekly tests (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [weeklyTestsResult] = await db
      .select({ count: count() })
      .from(testResults)
      .where(
        and(
          eq(testResults.teacherId, teacherId),
          gte(testResults.createdAt, weekAgo)
        )
      );

    // Calculate average accuracy
    const results = await db
      .select({ percentage: testResults.percentage })
      .from(testResults)
      .where(eq(testResults.teacherId, teacherId));

    const avgAccuracy = results.length > 0
      ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length)
      : 0;

    return {
      totalStudents: totalStudentsResult.count,
      weeklyTests: weeklyTestsResult.count,
      accuracy: avgAccuracy,
    };
  }

  async getAdminStats(): Promise<{
    teachers: number;
    students: number;
    monthlyTests: number;
    colorBlind: number;
  }> {
    // Get total active teachers
    const [teachersResult] = await db
      .select({ count: count() })
      .from(users)
      .where(and(eq(users.role, "teacher"), eq(users.isActive, true)));

    // Get total students
    const [studentsResult] = await db
      .select({
        count: countDistinct(sql`LOWER(${students.name})`)
      })
      .from(testResults)
      .innerJoin(students, eq(testResults.studentId, students.id))

    // Get monthly tests (last 30 days)
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);

    const [monthlyTestsResult] = await db
      .select({ count: count() })
      .from(testResults)
      .where(gte(testResults.createdAt, monthAgo));

    // Get color blind cases (non-normal diagnosis)
    const [colorBlindResult] = await db
      .select({ count: count() })
      .from(testResults)
      .where(not(eq(testResults.diagnosis, "Penglihatan Warna Normal (Normal Trichromacy)")));

    return {
      teachers: teachersResult.count,
      students: studentsResult.count,
      monthlyTests: monthlyTestsResult.count,
      colorBlind: colorBlindResult.count,
    };
  }
}

export const storage = new DatabaseStorage();