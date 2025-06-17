import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";


export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(), // 'admin' | 'teacher'
  nip: text("nip"), // for teachers
  subject: text("subject"), // for teachers
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  birthDate: text("birth_date").notNull(),
  gender: text("gender").notNull(),
  major: text("major"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const ishiharaQuestions = pgTable("ishihara_questions", {
  id: serial("id").primaryKey(),
  imageUrl: text("image_url").notNull(),
  correctAnswer: text("correct_answer").notNull(),
  options: json("options").notNull().$type<string[]>(),
  description: text("description"),
});

export const testResults = pgTable("test_results", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => students.id),
  teacherId: integer("teacher_id").notNull().references(() => users.id),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  percentage: integer("percentage").notNull(),
  diagnosis: text("diagnosis").notNull(),
  recommendations: text("recommendations").notNull(),
  answers: json("answers").notNull().$type<{ questionId: number; answer: string; correct: boolean }[]>(),
  testDuration: integer("test_duration").notNull(), // in seconds
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  testResults: many(testResults),
}));

export const studentsRelations = relations(students, ({ many }) => ({
  testResults: many(testResults),
}));

export const testResultsRelations = relations(testResults, ({ one }) => ({
  student: one(students, {
    fields: [testResults.studentId],
    references: [students.id],
  }),
  teacher: one(users, {
    fields: [testResults.teacherId],
    references: [users.id],
  }),
}));

export const ishiharaQuestionsRelations = relations(ishiharaQuestions, ({ many }) => ({}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  createdAt: true,
});

export const insertTestResultSchema = createInsertSchema(testResults).omit({
  id: true,
  createdAt: true,
});

export const insertIshiharaQuestionSchema = createInsertSchema(ishiharaQuestions).omit({
  id: true,
});

// Login schema
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Student form schema
export const studentFormSchema = z.object({
  name: z.string().min(1, "Nama lengkap wajib diisi"),
  birthDate: z.string().min(1, "Tanggal lahir wajib diisi"),
  gender: z.enum(["Laki-laki", "Perempuan"], {
    required_error: "Jenis kelamin wajib dipilih",
    invalid_type_error: "Jenis kelamin tidak valid"
  }),
  major: z.string().optional(),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type TestResult = typeof testResults.$inferSelect;
export type InsertTestResult = z.infer<typeof insertTestResultSchema>;
export type IshiharaQuestion = typeof ishiharaQuestions.$inferSelect;
export type InsertIshiharaQuestion = z.infer<typeof insertIshiharaQuestionSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type StudentFormData = z.infer<typeof studentFormSchema>;
