import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { generateAIResponse } from "./aiService";
import { documentService } from "./documentService";
import { ragService } from "./ragService";
import { insertCourseSchema, insertAssignmentSchema, insertChatMessageSchema } from "@shared/schema";
import { z } from "zod";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Course routes
  app.get('/api/courses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const courses = await storage.getUserCourses(userId);
      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  app.get('/api/courses/all', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'instructor' && user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }
      const courses = await storage.getCourses();
      res.json(courses);
    } catch (error) {
      console.error("Error fetching all courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  app.post('/api/courses', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'instructor' && user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const courseData = insertCourseSchema.parse(req.body);
      const course = await storage.createCourse({
        ...courseData,
        instructorId: req.user.claims.sub,
      });
      res.json(course);
    } catch (error) {
      console.error("Error creating course:", error);
      res.status(500).json({ message: "Failed to create course" });
    }
  });

  app.post('/api/courses/:courseId/enroll', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { courseId } = req.params;
      const enrollment = await storage.enrollUserInCourse(userId, courseId);
      res.json(enrollment);
    } catch (error) {
      console.error("Error enrolling in course:", error);
      res.status(500).json({ message: "Failed to enroll in course" });
    }
  });

  // Assignment routes
  app.get('/api/assignments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const assignments = await storage.getUserAssignments(userId);
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      res.status(500).json({ message: "Failed to fetch assignments" });
    }
  });

  app.post('/api/assignments', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'instructor' && user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const assignmentData = insertAssignmentSchema.parse(req.body);
      const assignment = await storage.createAssignment(assignmentData);
      res.json(assignment);
    } catch (error) {
      console.error("Error creating assignment:", error);
      res.status(500).json({ message: "Failed to create assignment" });
    }
  });

  // Chat routes
  app.get('/api/chat/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const messages = await storage.getUserChatMessages(userId);
      res.json(messages.reverse()); // Return in chronological order
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  app.post('/api/chat/message', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const messageData = insertChatMessageSchema.parse({
        ...req.body,
        userId,
        type: 'user',
      });
      
      // Save user message
      const userMessage = await storage.createChatMessage(messageData);
      
      // Generate AI response
      const aiResponse = await generateAIResponse(messageData.content, userId);
      
      // Save AI response
      const aiMessage = await storage.createChatMessage({
        userId,
        content: aiResponse,
        type: 'ai',
        courseId: messageData.courseId,
      });
      
      res.json({ userMessage, aiMessage });
    } catch (error) {
      console.error("Error processing chat message:", error);
      res.status(500).json({ message: "Failed to process message" });
    }
  });

  // AI Recommendations routes
  app.get('/api/recommendations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const recommendations = await storage.getUserRecommendations(userId);
      res.json(recommendations);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      res.status(500).json({ message: "Failed to fetch recommendations" });
    }
  });

  // Analytics routes
  app.get('/api/analytics/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Document upload routes
  app.get('/api/courses/:courseId/documents', isAuthenticated, async (req: any, res) => {
    try {
      const { courseId } = req.params;
      const documents = await storage.getCourseDocuments(courseId);
      res.json(documents);
    } catch (error) {
      console.error('Error fetching course documents:', error);
      res.status(500).json({ message: 'Failed to fetch documents' });
    }
  });

  app.post('/api/courses/:courseId/documents/upload', isAuthenticated, upload.single('document'), async (req: any, res) => {
    try {
      const { courseId } = req.params;
      const userId = req.user.claims.sub;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      // Check if user is instructor or admin for this course
      const user = await storage.getUser(userId);
      if (user?.role !== 'instructor' && user?.role !== 'admin') {
        return res.status(403).json({ message: 'Only instructors can upload course documents' });
      }

      // Process document asynchronously
      documentService.processAndStoreDocument(
        file.buffer,
        file.originalname,
        courseId,
        userId
      ).catch(error => {
        console.error('Error processing document:', error);
      });

      res.json({ 
        message: 'Document uploaded successfully and is being processed',
        fileName: file.originalname
      });
    } catch (error) {
      console.error('Error uploading document:', error);
      res.status(500).json({ message: 'Failed to upload document' });
    }
  });

  // RAG-powered chat routes
  app.post('/api/chat/rag', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { message: query, courseId } = req.body;

      if (!query || !courseId) {
        return res.status(400).json({ message: 'Query and courseId are required' });
      }

      // Generate RAG response
      const response = await ragService.generateRAGResponse(query, courseId, userId);
      
      // Save both user message and AI response to chat history
      const userMessage = await storage.createChatMessage({
        userId,
        content: query,
        type: 'user',
        courseId
      });

      const aiMessage = await storage.createChatMessage({
        userId,
        content: response,
        type: 'ai',
        courseId
      });

      res.json({ 
        userMessage, 
        aiMessage,
        isRAGResponse: true
      });
    } catch (error) {
      console.error('Error processing RAG query:', error);
      res.status(500).json({ message: 'Failed to process query' });
    }
  });

  // Generate study questions from course materials
  app.get('/api/courses/:courseId/study-questions', isAuthenticated, async (req: any, res) => {
    try {
      const { courseId } = req.params;
      const questions = await ragService.generateStudyQuestions(courseId);
      res.json({ questions });
    } catch (error) {
      console.error('Error generating study questions:', error);
      res.status(500).json({ message: 'Failed to generate study questions' });
    }
  });

  // Search course documents
  app.post('/api/courses/:courseId/search', isAuthenticated, async (req: any, res) => {
    try {
      const { courseId } = req.params;
      const { query, limit = 5 } = req.body;

      if (!query) {
        return res.status(400).json({ message: 'Search query is required' });
      }

      const results = await documentService.searchDocuments(query, courseId, limit);
      res.json({ results });
    } catch (error) {
      console.error('Error searching documents:', error);
      res.status(500).json({ message: 'Failed to search documents' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
