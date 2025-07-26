import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { loginSchema, studentFormSchema, insertUserSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import { generatePDF } from "./services/pdfGenerator";
import { getRandomizedQuestions } from "./services/ishiharaQuestions";
import { z } from "zod";

// Schema for updating teacher
const updateTeacherSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  email: z.string().email("Format email tidak valid"),
  nip: z.string().min(1, "NIP wajib diisi"),
  subject: z.string().min(1, "Mata pelajaran wajib diisi"),
  password: z.string().optional(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user || !user.isActive) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // In a real app, you'd use JWT or sessions
      res.json({ 
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          role: user.role,
          nip: user.nip,
          subject: user.subject 
        } 
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    res.json({ message: "Logged out successfully" });
  });

  // Student routes
  app.post("/api/students", async (req, res) => {
    try {
      const studentData = studentFormSchema.parse(req.body);
      const student = await storage.createStudent(studentData);
      res.json(student);
    } catch (error) {
      res.status(400).json({ message: "Invalid student data" });
    }
  });

  // Test routes
  app.get("/api/test/questions", async (req, res) => {
    try {
      const questions = await getRandomizedQuestions();
      res.json(questions);
    } catch (error) {
      res.status(500).json({ message: "Failed to get test questions" });
    }
  });

  app.post("/api/test/submit", async (req, res) => {
    try {
      const { studentId, teacherId, answers, testDuration } = req.body;
      
      const result = await storage.submitTestResult({
        studentId,
        teacherId,
        answers,
        testDuration,
      });

      // Get the full result with relations for return
      const fullResult = await storage.getTestResultById(result.id);
      res.json(fullResult);
    } catch (error) {
      res.status(400).json({ message: "Failed to submit test results" });
    }
  });

  app.delete("/api/test/student/:studentId", async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);

    if (isNaN(studentId)) {
      return res.status(400).json({ message: "Invalid student ID" });
    }

    await storage.deleteTestByStudentId(studentId);

    res.json({ message: "Test result deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete test result" });
  }
});

  // Teacher routes
  app.get("/api/teacher/:teacherId/results", async (req, res) => {
    try {
      const teacherId = parseInt(req.params.teacherId);
      const results = await storage.getTestResultsByTeacher(teacherId);
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Failed to get test results" });
    }
  });

  app.get("/api/teacher/:teacherId/stats", async (req, res) => {
    try {
      const teacherId = parseInt(req.params.teacherId);
      const stats = await storage.getTeacherStats(teacherId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to get teacher stats" });
    }
  });

  // Admin routes
  app.get("/api/admin/teachers", async (req, res) => {
    try {
      const teachers = await storage.getAllTeachers();
      res.json(teachers);
    } catch (error) {
      res.status(500).json({ message: "Failed to get teachers" });
    }
  });

  app.post("/api/admin/teachers", async (req, res) => {
    try {
      const teacherData = insertUserSchema.parse(req.body);
      
      // Hash password
      const hashedPassword = await bcrypt.hash(teacherData.password, 10);
      const teacher = await storage.createTeacher({
        ...teacherData,
        password: hashedPassword,
        role: "teacher",
      });

      res.json({ 
        id: teacher.id, 
        name: teacher.name, 
        email: teacher.email, 
        nip: teacher.nip,
        subject: teacher.subject 
      });
    } catch (error) {
      res.status(400).json({ message: "Failed to create teacher account" });
    }
  });

  // NEW: Update teacher route
  app.put("/api/admin/teachers/:id", async (req, res) => {
    try {
      const teacherId = parseInt(req.params.id);
      
      if (!teacherId || isNaN(teacherId)) {
        return res.status(400).json({ message: "Invalid teacher ID" });
      }

      // Validate request body
      const updateData = updateTeacherSchema.parse(req.body);
      
      // Check if teacher exists
      const existingTeacher = await storage.getTeacherById(teacherId);
      if (!existingTeacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }

      // Check if email is already taken by another teacher
      if (updateData.email !== existingTeacher.email) {
        const emailExists = await storage.getUserByEmail(updateData.email);
        if (emailExists && emailExists.id !== teacherId) {
          return res.status(400).json({ message: "Email sudah digunakan oleh guru lain" });
        }
      }

      // Check if NIP is already taken by another teacher
      if (updateData.nip !== existingTeacher.nip) {
        const nipExists = await storage.getTeacherByNip(updateData.nip);
        if (nipExists && nipExists.id !== teacherId) {
          return res.status(400).json({ message: "NIP sudah digunakan oleh guru lain" });
        }
      }

      // Prepare update data
      const dataToUpdate: any = {
        name: updateData.name,
        email: updateData.email,
        nip: updateData.nip,
        subject: updateData.subject,
      };

      // Hash password if provided
      if (updateData.password && updateData.password.trim() !== "") {
        dataToUpdate.password = await bcrypt.hash(updateData.password, 10);
      }

      // Update teacher
      const updatedTeacher = await storage.updateTeacher(teacherId, dataToUpdate);

      res.json({
        id: updatedTeacher.id,
        name: updatedTeacher.name,
        email: updatedTeacher.email,
        nip: updatedTeacher.nip,
        subject: updatedTeacher.subject,
      });
    } catch (error) {
      console.error("Update teacher error:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Data tidak valid", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ message: "Failed to update teacher" });
    }
  });

  app.get("/api/admin/stats", async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to get admin stats" });
    }
  });

  app.get("/api/admin/all-results", async (req, res) => {
    try {
      const results = await storage.getAllTestResults();
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Failed to get all test results" });
    }
  });

  app.delete("/api/admin/teachers/:id", async (req, res) => {
    try {
      const teacherId = parseInt(req.params.id);
      await storage.deactivateTeacher(teacherId);
      res.json({ message: "Teacher deactivated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to deactivate teacher" });
    }
  });

  // PDF generation
  app.get("/api/results/:id/pdf", async (req, res) => {
    try {
      const resultId = parseInt(req.params.id);
      const result = await storage.getTestResultById(resultId);
      
      if (!result) {
        return res.status(404).json({ message: "Test result not found" });
      }

      const pdf = await generatePDF(result);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="test-result-${result.student.name}-${result.id}.pdf"`);
      res.send(pdf);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate PDF" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}