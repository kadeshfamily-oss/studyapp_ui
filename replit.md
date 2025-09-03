# Learning Buddy - AI-Powered University Platform

## Overview

Learning Buddy is a comprehensive university learning platform that combines AI tutoring capabilities with course management and student analytics. Built as a full-stack TypeScript application, it provides students with personalized learning experiences through AI-powered features while offering instructors and administrators tools for course and assignment management. The platform includes real-time AI tutoring, progress tracking, study recommendations, and comprehensive academic workflows.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, using Vite for build tooling and development
- **Routing**: Wouter for client-side routing with route protection based on authentication
- **State Management**: TanStack React Query for server state management and caching
- **UI Framework**: Radix UI components with shadcn/ui styling system and Tailwind CSS
- **Authentication Flow**: Integrated with Replit authentication system with session-based auth

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database ORM**: Drizzle ORM with PostgreSQL dialect for type-safe database operations
- **Authentication**: Replit OIDC integration with OpenID Connect and Passport.js
- **Session Management**: Express-session with PostgreSQL session store using connect-pg-simple
- **API Design**: RESTful API with role-based access control (student, instructor, admin)

### Database Design
- **Primary Database**: PostgreSQL with connection pooling via Neon serverless
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Core Tables**: Users, courses, enrollments, assignments, submissions, chat messages, AI recommendations, study sessions
- **Session Storage**: Dedicated sessions table for authentication state persistence
- **Data Relationships**: Proper foreign key relationships with cascade operations

### AI Integration
- **AI Service**: OpenAI GPT integration with fallback response system when API unavailable
- **Chat System**: Real-time AI tutoring with message persistence and conversation history
- **Recommendation Engine**: AI-powered study recommendations based on user progress and behavior
- **Content Generation**: AI-assisted quiz generation and study material creation

### Development Environment
- **Build System**: Vite for frontend bundling, esbuild for backend compilation
- **Development Server**: Hot module replacement with Vite middleware integration
- **TypeScript Configuration**: Strict type checking with path aliases for clean imports
- **Code Organization**: Monorepo structure with shared types and utilities

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Database URL**: Environment variable configuration for database connections

### AI Services
- **OpenAI API**: GPT-3.5-turbo integration for AI tutoring and content generation
- **API Key Management**: Support for multiple AI provider API keys (OpenAI, Anthropic)

### Authentication Services
- **Replit Auth**: OIDC-based authentication with automatic user provisioning
- **Session Storage**: PostgreSQL-backed session management for scalability

### Frontend Dependencies
- **UI Components**: Extensive Radix UI component library for accessible interfaces
- **Styling**: Tailwind CSS with custom design tokens and responsive design
- **Icons**: Lucide React for consistent iconography
- **Forms**: React Hook Form with Zod validation for type-safe form handling

### Development Tools
- **Replit Integration**: Cartographer plugin for Replit-specific development features
- **Error Handling**: Runtime error overlay for development debugging
- **Font Loading**: Google Fonts integration with multiple font families