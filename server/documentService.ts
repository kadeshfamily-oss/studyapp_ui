import OpenAI from 'openai';
import { storage } from './storage';
import type { InsertCourseDocument, InsertDocumentChunk } from '@shared/schema';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.API_KEY || process.env.ANTHROPIC_API_KEY || "",
});

export interface ProcessedDocument {
  chunks: string[];
  metadata: {
    totalPages: number;
    totalText: string;
    fileName: string;
  };
}

export class DocumentService {
  // Process PDF and extract text
  async processPDF(buffer: Buffer, fileName: string): Promise<ProcessedDocument> {
    try {
      // Lazy load pdf-parse to avoid startup issues
      const pdfParse = await import('pdf-parse');
      const pdfData = await pdfParse.default(buffer);
      const text = pdfData.text;
      
      // Split text into chunks (roughly 500 words each)
      const chunks = this.splitTextIntoChunks(text, 500);
      
      return {
        chunks,
        metadata: {
          totalPages: pdfData.numpages,
          totalText: text,
          fileName
        }
      };
    } catch (error) {
      console.error('Error processing PDF:', error);
      throw new Error('Failed to process PDF document');
    }
  }

  // Split text into manageable chunks for embedding
  private splitTextIntoChunks(text: string, wordsPerChunk: number = 500): string[] {
    const words = text.split(/\s+/);
    const chunks: string[] = [];
    
    for (let i = 0; i < words.length; i += wordsPerChunk) {
      const chunk = words.slice(i, i + wordsPerChunk).join(' ');
      if (chunk.trim().length > 0) {
        chunks.push(chunk.trim());
      }
    }
    
    return chunks;
  }

  // Generate embeddings for text chunks
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      if (!process.env.OPENAI_API_KEY && !process.env.API_KEY) {
        // Simple fallback: use basic text-based similarity (word frequency)
        return this.generateSimpleEmbedding(text);
      }

      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      // Fallback to simple embedding
      return this.generateSimpleEmbedding(text);
    }
  }

  // Simple text-based embedding as fallback
  private generateSimpleEmbedding(text: string): number[] {
    const words = text.toLowerCase().split(/\W+/);
    const wordFreq: Record<string, number> = {};
    
    // Count word frequencies
    words.forEach(word => {
      if (word.length > 2) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });

    // Create a simple 100-dimensional vector based on common words and patterns
    const embedding = new Array(100).fill(0);
    const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of'];
    
    // Fill embedding with word frequencies and text characteristics
    let index = 0;
    for (const [word, freq] of Object.entries(wordFreq)) {
      if (index < 50) {
        embedding[index] = freq / words.length; // Normalized frequency
        index++;
      }
    }
    
    // Add text characteristics
    embedding[50] = text.length / 1000; // Text length
    embedding[51] = words.length / 100; // Word count
    embedding[52] = (text.match(/\d/g) || []).length / text.length; // Number density
    embedding[53] = (text.match(/[A-Z]/g) || []).length / text.length; // Capital letter density
    
    return embedding;
  }

  // Calculate cosine similarity between embeddings
  calculateSimilarity(embedding1: number[], embedding2: number[]): number {
    if (embedding1.length !== embedding2.length) return 0;
    
    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;
    
    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      magnitude1 += embedding1[i] * embedding1[i];
      magnitude2 += embedding2[i] * embedding2[i];
    }
    
    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);
    
    if (magnitude1 === 0 || magnitude2 === 0) return 0;
    
    return dotProduct / (magnitude1 * magnitude2);
  }

  // Process and store document with embeddings
  async processAndStoreDocument(
    buffer: Buffer,
    fileName: string,
    courseId: string,
    uploadedBy: string
  ): Promise<void> {
    try {
      // Process PDF
      const processed = await this.processPDF(buffer, fileName);
      
      // Store document record
      const document = await storage.createCourseDocument({
        courseId,
        fileName,
        filePath: `uploads/${courseId}/${Date.now()}-${fileName}`,
        fileType: 'pdf',
        fileSize: buffer.length,
        uploadedBy,
        isProcessed: false
      });

      // Process and store chunks with embeddings
      for (let i = 0; i < processed.chunks.length; i++) {
        const chunk = processed.chunks[i];
        const embedding = await this.generateEmbedding(chunk);
        
        await storage.createDocumentChunk({
          documentId: document.id,
          chunkIndex: i,
          content: chunk,
          embedding: JSON.stringify(embedding),
          metadata: {
            fileName,
            chunkIndex: i,
            totalChunks: processed.chunks.length,
            wordCount: chunk.split(/\s+/).length
          }
        });
      }

      // Mark document as processed
      await storage.updateCourseDocument(document.id, { isProcessed: true });
      
      console.log(`Successfully processed document: ${fileName} with ${processed.chunks.length} chunks`);
    } catch (error) {
      console.error('Error processing and storing document:', error);
      throw error;
    }
  }

  // Search for relevant document chunks
  async searchDocuments(
    query: string,
    courseId: string,
    limit: number = 5
  ): Promise<Array<{ content: string; similarity: number; fileName: string; metadata: any }>> {
    try {
      const queryEmbedding = await this.generateEmbedding(query);
      const chunks = await storage.getCourseDocumentChunks(courseId);
      
      const results = chunks.map(chunk => {
        const chunkEmbedding = JSON.parse(chunk.embedding || '[]');
        const similarity = this.calculateSimilarity(queryEmbedding, chunkEmbedding);
        
        return {
          content: chunk.content,
          similarity,
          fileName: chunk.document?.fileName || 'Unknown',
          metadata: chunk.metadata
        };
      });

      // Sort by similarity and return top results
      return results
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);
    } catch (error) {
      console.error('Error searching documents:', error);
      return [];
    }
  }
}

export const documentService = new DocumentService();