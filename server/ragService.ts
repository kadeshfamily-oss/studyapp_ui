import OpenAI from 'openai';
import { documentService } from './documentService';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.API_KEY || process.env.ANTHROPIC_API_KEY || "",
});

export class RAGService {
  // Generate response using retrieved documents
  async generateRAGResponse(
    query: string,
    courseId: string,
    userId: string
  ): Promise<string> {
    try {
      // Retrieve relevant documents
      const relevantDocs = await documentService.searchDocuments(query, courseId, 3);
      
      if (relevantDocs.length === 0) {
        return "I couldn't find any relevant documents for your question. Please make sure course materials have been uploaded, or try asking a different question.";
      }

      // Prepare context from retrieved documents
      const context = relevantDocs
        .map((doc, index) => 
          `Document ${index + 1} (${doc.fileName}):\n${doc.content}\n\n`
        )
        .join('');

      // Generate response with context
      if (!process.env.OPENAI_API_KEY && !process.env.API_KEY && !process.env.ANTHROPIC_API_KEY) {
        return this.generateFallbackRAGResponse(query, relevantDocs);
      }

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are an AI teaching assistant. Answer the student's question using ONLY the provided course documents. Be helpful, accurate, and cite which document you're referencing. If the documents don't contain enough information to answer the question, say so clearly.

Context from course documents:
${context}`
          },
          {
            role: "user",
            content: query
          }
        ],
        max_tokens: 500,
        temperature: 0.3,
      });

      let answer = response.choices[0]?.message?.content || 
        "I couldn't generate a response at the moment. Please try again.";
      
      // Add source citations
      const sources = relevantDocs
        .map((doc, index) => `${index + 1}. ${doc.fileName}`)
        .join('\n');
      
      answer += `\n\n📚 Sources:\n${sources}`;
      
      return answer;
    } catch (error) {
      console.error('Error generating RAG response:', error);
      
      // Fallback response
      const relevantDocs = await documentService.searchDocuments(query, courseId, 3);
      return this.generateFallbackRAGResponse(query, relevantDocs);
    }
  }

  // Fallback RAG response without OpenAI API
  private generateFallbackRAGResponse(
    query: string,
    docs: Array<{ content: string; fileName: string; similarity: number }>
  ): string {
    if (docs.length === 0) {
      return "I couldn't find any relevant documents for your question. Please make sure course materials have been uploaded.";
    }

    const topDoc = docs[0];
    const queryWords = query.toLowerCase().split(/\W+/);
    
    // Find the most relevant sentence from the top document
    const sentences = topDoc.content.split(/[.!?]+/);
    let bestSentence = sentences[0];
    let bestScore = 0;
    
    for (const sentence of sentences) {
      const sentenceWords = sentence.toLowerCase().split(/\W+/);
      const matchScore = queryWords.reduce((score, word) => {
        return score + (sentenceWords.includes(word) ? 1 : 0);
      }, 0);
      
      if (matchScore > bestScore) {
        bestScore = matchScore;
        bestSentence = sentence;
      }
    }
    
    const sources = docs
      .slice(0, 2)
      .map((doc, index) => `${index + 1}. ${doc.fileName}`)
      .join('\n');
    
    return `Based on the course materials, here's what I found:\n\n${bestSentence.trim()}\n\nFor more detailed information, please refer to the complete documents.\n\n📚 Sources:\n${sources}`;
  }

  // Generate study questions from documents
  async generateStudyQuestions(courseId: string): Promise<string[]> {
    try {
      const chunks = await documentService.searchDocuments(
        "important concepts definitions key points", 
        courseId, 
        5
      );
      
      if (chunks.length === 0) {
        return [
          "What are the main topics covered in this course?",
          "Can you explain the key concepts we've studied?",
          "What should I review for the upcoming assessment?"
        ];
      }

      if (!process.env.OPENAI_API_KEY && !process.env.API_KEY && !process.env.ANTHROPIC_API_KEY) {
        return this.generateFallbackQuestions(chunks);
      }

      const context = chunks.map(chunk => chunk.content).join('\n\n');
      
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `Generate 5 study questions based on the course content provided. Make them thought-provoking and educational.`
          },
          {
            role: "user",
            content: `Course content:\n${context}`
          }
        ],
        max_tokens: 300,
        temperature: 0.7,
      });

      const content = response.choices[0]?.message?.content || "";
      return content.split('\n').filter(line => line.trim().length > 0).slice(0, 5);
      
    } catch (error) {
      console.error('Error generating study questions:', error);
      return this.generateFallbackQuestions([]);
    }
  }

  private generateFallbackQuestions(chunks: Array<{ content: string }>): string[] {
    if (chunks.length === 0) {
      return [
        "What are the main topics covered in this course?",
        "Can you explain the key concepts we've studied?",
        "What should I review for the upcoming assessment?",
        "How do the different concepts relate to each other?",
        "What real-world applications does this material have?"
      ];
    }

    // Extract key terms from content for question generation
    const allText = chunks.map(chunk => chunk.content).join(' ');
    const sentences = allText.split(/[.!?]+/);
    
    return [
      "What are the key concepts discussed in the course materials?",
      "How would you explain the main ideas in your own words?",
      "What examples are provided to illustrate these concepts?",
      "What connections can you make between different topics?",
      "How might these concepts apply in real-world situations?"
    ];
  }
}

export const ragService = new RAGService();