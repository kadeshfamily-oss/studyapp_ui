import {
  users,
  courses,
  enrollments,
  assignments,
  submissions,
  chatMessages,
  aiRecommendations,
  studySessions,
  courseDocuments,
  documentChunks,
  type User,
  type UpsertUser,
  type Course,
  type InsertCourse,
  type Assignment,
  type InsertAssignment,
  type Submission,
  type InsertSubmission,
  type Enrollment,
  type ChatMessage,
  type InsertChatMessage,
  type AiRecommendation,
  type InsertAiRecommendation,
  type StudySession,
  type CourseDocument,
  type InsertCourseDocument,
  type DocumentChunk,
  type InsertDocumentChunk,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, count } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Course operations
  getCourses(): Promise<Course[]>;
  getUserCourses(userId: string): Promise<(Course & { progress: string })[]>;
  getCourse(id: string): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: string, course: Partial<InsertCourse>): Promise<Course>;
  enrollUserInCourse(userId: string, courseId: string): Promise<Enrollment>;

  // Assignment operations
  getAssignments(courseId?: string): Promise<Assignment[]>;
  getUserAssignments(userId: string): Promise<(Assignment & { status: string; course: Course })[]>;
  getAssignment(id: string): Promise<Assignment | undefined>;
  createAssignment(assignment: InsertAssignment): Promise<Assignment>;
  updateAssignment(id: string, assignment: Partial<InsertAssignment>): Promise<Assignment>;

  // Submission operations
  getSubmission(assignmentId: string, userId: string): Promise<Submission | undefined>;
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  updateSubmission(id: string, submission: Partial<InsertSubmission>): Promise<Submission>;

  // Chat operations
  getUserChatMessages(userId: string, limit?: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;

  // AI Recommendations
  getUserRecommendations(userId: string): Promise<AiRecommendation[]>;
  createRecommendation(recommendation: InsertAiRecommendation): Promise<AiRecommendation>;
  markRecommendationAsRead(id: string): Promise<void>;

  // Analytics
  getUserStats(userId: string): Promise<{
    activeCourses: number;
    pendingAssignments: number;
    studyStreak: number;
    aiInteractions: number;
  }>;

  // Document operations
  getCourseDocuments(courseId: string): Promise<CourseDocument[]>;
  createCourseDocument(document: InsertCourseDocument): Promise<CourseDocument>;
  updateCourseDocument(id: string, document: Partial<InsertCourseDocument>): Promise<CourseDocument>;
  deleteCourseDocument(id: string): Promise<void>;
  
  // Document chunk operations
  createDocumentChunk(chunk: InsertDocumentChunk): Promise<DocumentChunk>;
  getCourseDocumentChunks(courseId: string): Promise<Array<DocumentChunk & { document: CourseDocument | null }>>;
  searchDocumentChunks(query: string, courseId: string): Promise<DocumentChunk[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Course operations
  async getCourses(): Promise<Course[]> {
    return await db.select().from(courses).where(eq(courses.isActive, true));
  }

  async getUserCourses(userId: string): Promise<(Course & { progress: string })[]> {
    const result = await db
      .select({
        id: courses.id,
        title: courses.title,
        description: courses.description,
        instructorId: courses.instructorId,
        imageUrl: courses.imageUrl,
        isActive: courses.isActive,
        createdAt: courses.createdAt,
        updatedAt: courses.updatedAt,
        progress: enrollments.progress,
      })
      .from(courses)
      .innerJoin(enrollments, eq(courses.id, enrollments.courseId))
      .where(eq(enrollments.userId, userId));

    return result.map(row => ({
      ...row,
      progress: row.progress || "0",
    }));
  }

  async getCourse(id: string): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course;
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const [newCourse] = await db.insert(courses).values(course).returning();
    return newCourse;
  }

  async updateCourse(id: string, course: Partial<InsertCourse>): Promise<Course> {
    const [updatedCourse] = await db
      .update(courses)
      .set({ ...course, updatedAt: new Date() })
      .where(eq(courses.id, id))
      .returning();
    return updatedCourse;
  }

  async enrollUserInCourse(userId: string, courseId: string): Promise<Enrollment> {
    const [enrollment] = await db
      .insert(enrollments)
      .values({ userId, courseId })
      .returning();
    return enrollment;
  }

  // Assignment operations
  async getAssignments(courseId?: string): Promise<Assignment[]> {
    const query = db.select().from(assignments);
    if (courseId) {
      return await query.where(eq(assignments.courseId, courseId));
    }
    return await query;
  }

  async getUserAssignments(userId: string): Promise<(Assignment & { status: string; course: Course })[]> {
    const result = await db
      .select({
        id: assignments.id,
        title: assignments.title,
        description: assignments.description,
        courseId: assignments.courseId,
        dueDate: assignments.dueDate,
        maxPoints: assignments.maxPoints,
        createdAt: assignments.createdAt,
        updatedAt: assignments.updatedAt,
        status: sql<string>`COALESCE(${submissions.status}, 'not_started')`,
        course: courses,
      })
      .from(assignments)
      .innerJoin(courses, eq(assignments.courseId, courses.id))
      .innerJoin(enrollments, eq(courses.id, enrollments.courseId))
      .leftJoin(submissions, and(
        eq(assignments.id, submissions.assignmentId),
        eq(submissions.userId, userId)
      ))
      .where(eq(enrollments.userId, userId));

    return result;
  }

  async getAssignment(id: string): Promise<Assignment | undefined> {
    const [assignment] = await db.select().from(assignments).where(eq(assignments.id, id));
    return assignment;
  }

  async createAssignment(assignment: InsertAssignment): Promise<Assignment> {
    const [newAssignment] = await db.insert(assignments).values(assignment).returning();
    return newAssignment;
  }

  async updateAssignment(id: string, assignment: Partial<InsertAssignment>): Promise<Assignment> {
    const [updatedAssignment] = await db
      .update(assignments)
      .set({ ...assignment, updatedAt: new Date() })
      .where(eq(assignments.id, id))
      .returning();
    return updatedAssignment;
  }

  // Submission operations
  async getSubmission(assignmentId: string, userId: string): Promise<Submission | undefined> {
    const [submission] = await db
      .select()
      .from(submissions)
      .where(and(
        eq(submissions.assignmentId, assignmentId),
        eq(submissions.userId, userId)
      ));
    return submission;
  }

  async createSubmission(submission: InsertSubmission): Promise<Submission> {
    const [newSubmission] = await db.insert(submissions).values(submission).returning();
    return newSubmission;
  }

  async updateSubmission(id: string, submission: Partial<InsertSubmission>): Promise<Submission> {
    const [updatedSubmission] = await db
      .update(submissions)
      .set({ ...submission, updatedAt: new Date() })
      .where(eq(submissions.id, id))
      .returning();
    return updatedSubmission;
  }

  // Chat operations
  async getUserChatMessages(userId: string, limit = 50): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db.insert(chatMessages).values(message).returning();
    return newMessage;
  }

  // AI Recommendations
  async getUserRecommendations(userId: string): Promise<AiRecommendation[]> {
    return await db
      .select()
      .from(aiRecommendations)
      .where(eq(aiRecommendations.userId, userId))
      .orderBy(desc(aiRecommendations.createdAt));
  }

  async createRecommendation(recommendation: InsertAiRecommendation): Promise<AiRecommendation> {
    const [newRecommendation] = await db
      .insert(aiRecommendations)
      .values(recommendation)
      .returning();
    return newRecommendation;
  }

  async markRecommendationAsRead(id: string): Promise<void> {
    await db
      .update(aiRecommendations)
      .set({ isRead: true })
      .where(eq(aiRecommendations.id, id));
  }

  // Analytics
  async getUserStats(userId: string): Promise<{
    activeCourses: number;
    pendingAssignments: number;
    studyStreak: number;
    aiInteractions: number;
  }> {
    const [activeCoursesResult] = await db
      .select({ count: count() })
      .from(enrollments)
      .where(eq(enrollments.userId, userId));

    const [pendingAssignmentsResult] = await db
      .select({ count: count() })
      .from(submissions)
      .where(and(
        eq(submissions.userId, userId),
        eq(submissions.status, "not_started")
      ));

    const [aiInteractionsResult] = await db
      .select({ count: count() })
      .from(chatMessages)
      .where(and(
        eq(chatMessages.userId, userId),
        eq(chatMessages.type, "user")
      ));

    // Calculate study streak (simplified - last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const [studyStreakResult] = await db
      .select({ count: count() })
      .from(studySessions)
      .where(and(
        eq(studySessions.userId, userId),
        sql`${studySessions.startedAt} >= ${thirtyDaysAgo}`
      ));

    return {
      activeCourses: activeCoursesResult.count,
      pendingAssignments: pendingAssignmentsResult.count,
      studyStreak: studyStreakResult.count,
      aiInteractions: aiInteractionsResult.count,
    };
  }

  // Document operations
  async getCourseDocuments(courseId: string): Promise<CourseDocument[]> {
    return await db.select().from(courseDocuments).where(eq(courseDocuments.courseId, courseId));
  }

  async createCourseDocument(document: InsertCourseDocument): Promise<CourseDocument> {
    const [newDocument] = await db.insert(courseDocuments).values(document).returning();
    return newDocument;
  }

  async updateCourseDocument(id: string, document: Partial<InsertCourseDocument>): Promise<CourseDocument> {
    const [updatedDocument] = await db
      .update(courseDocuments)
      .set(document)
      .where(eq(courseDocuments.id, id))
      .returning();
    return updatedDocument;
  }

  async deleteCourseDocument(id: string): Promise<void> {
    await db.delete(courseDocuments).where(eq(courseDocuments.id, id));
  }

  // Document chunk operations
  async createDocumentChunk(chunk: InsertDocumentChunk): Promise<DocumentChunk> {
    const [newChunk] = await db.insert(documentChunks).values(chunk).returning();
    return newChunk;
  }

  async getCourseDocumentChunks(courseId: string): Promise<Array<DocumentChunk & { document: CourseDocument | null }>> {
    const result = await db
      .select({
        id: documentChunks.id,
        documentId: documentChunks.documentId,
        chunkIndex: documentChunks.chunkIndex,
        content: documentChunks.content,
        embedding: documentChunks.embedding,
        metadata: documentChunks.metadata,
        createdAt: documentChunks.createdAt,
        document: courseDocuments
      })
      .from(documentChunks)
      .leftJoin(courseDocuments, eq(documentChunks.documentId, courseDocuments.id))
      .where(eq(courseDocuments.courseId, courseId));
    
    return result;
  }

  async searchDocumentChunks(query: string, courseId: string): Promise<DocumentChunk[]> {
    // This is a simple text-based search. In a real implementation, you might use vector similarity
    const chunks = await this.getCourseDocumentChunks(courseId);
    return chunks.filter(chunk => 
      chunk.content.toLowerCase().includes(query.toLowerCase())
    );
  }
}

export const storage = new DatabaseStorage();
