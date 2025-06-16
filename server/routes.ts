import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { loginSchema, studentFormSchema, insertUserSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import { generatePDF } from "./services/pdfGenerator";
import { getRandomizedQuestions } from "./services/ishiharaQuestions";

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
