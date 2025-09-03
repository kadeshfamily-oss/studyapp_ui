import OpenAI from 'openai';

// Initialize OpenAI client with API key from environment
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.API_KEY || process.env.ANTHROPIC_API_KEY || "",
});

// Fallback to a simple response generator if no API key is available
const generateFallbackResponse = (message: string): string => {
  const responses = [
    "I understand you're asking about: " + message + ". Let me help you with that concept.",
    "That's a great question! Here's what I can tell you about " + message.toLowerCase() + ".",
    "Let me break down " + message + " for you in simpler terms.",
    "I'd be happy to help you understand " + message + " better. Here's an explanation:",
  ];
  
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  
  if (message.toLowerCase().includes("derivative") || message.toLowerCase().includes("calculus")) {
    return `${randomResponse} Derivatives measure the rate of change of a function. Think of it as how fast something is changing at any given moment. For example, if you're driving and your speedometer shows 60 mph, that's the derivative of your position with respect to time. The basic rules include: the derivative of x^n is n*x^(n-1), and the derivative of a constant is 0.`;
  }
  
  if (message.toLowerCase().includes("psychology") || message.toLowerCase().includes("cognitive")) {
    return `${randomResponse} In cognitive psychology, we study how people process information, including perception, memory, thinking, and problem-solving. The mind works like an information processing system, taking in data from the environment, processing it, and producing responses.`;
  }
  
  if (message.toLowerCase().includes("computer science") || message.toLowerCase().includes("programming")) {
    return `${randomResponse} Computer science combines mathematical rigor with creative problem-solving. Programming is about breaking down complex problems into smaller, manageable steps that a computer can execute. Start with understanding the problem, then design an algorithm, and finally implement it in code.`;
  }
  
  return `${randomResponse} I'm here to help you learn! Feel free to ask me specific questions about your coursework, and I'll provide detailed explanations and examples to help you understand the concepts better.`;
};

export const generateAIResponse = async (userMessage: string, userId: string): Promise<string> => {
  try {
    // If no API key is available, use fallback response
    if (!process.env.OPENAI_API_KEY && !process.env.API_KEY && !process.env.ANTHROPIC_API_KEY) {
      return generateFallbackResponse(userMessage);
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an AI learning assistant for a university platform. You help students with their coursework, explain concepts clearly, provide study tips, and generate practice questions. Be helpful, encouraging, and educational. Keep responses concise but informative. If asked about specific subjects like mathematics, computer science, psychology, etc., provide accurate and detailed explanations suitable for university-level students.`
        },
        {
          role: "user",
          content: userMessage
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response at the moment. Please try again.";
  } catch (error) {
    console.error("Error generating AI response:", error);
    
    // Fall back to simple response generation
    return generateFallbackResponse(userMessage);
  }
};

export const generateStudyRecommendations = async (userId: string, courseData: any[]): Promise<string[]> => {
  try {
    if (!process.env.OPENAI_API_KEY && !process.env.API_KEY && !process.env.ANTHROPIC_API_KEY) {
      return [
        "Review your recent quiz performance and focus on weaker areas",
        "Schedule a study session for your upcoming assignments",
        "Practice with AI-generated questions for better understanding",
      ];
    }

    const courseInfo = courseData.map(course => `${course.title} (${course.progress}% complete)`).join(", ");
    
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an AI study advisor. Generate 3 specific, actionable study recommendations based on the student's course progress."
        },
        {
          role: "user",
          content: `Student is enrolled in: ${courseInfo}. Generate study recommendations.`
        }
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content || "";
    return content.split('\n').filter((line: string) => line.trim().length > 0).slice(0, 3);
  } catch (error) {
    console.error("Error generating study recommendations:", error);
    return [
      "Review your recent quiz performance and focus on weaker areas",
      "Schedule a study session for your upcoming assignments", 
      "Practice with AI-generated questions for better understanding",
    ];
  }
};
