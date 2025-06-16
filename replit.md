# Color Blindness Test Application (IshiTest SMK)

## Overview

This is a full-stack web application designed for conducting color blindness tests in vocational schools (SMK) using the Ishihara test method. The application provides role-based access for administrators and teachers, allowing them to conduct standardized color vision tests for students and generate comprehensive reports.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state and React Context for authentication
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and bundling

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Database ORM**: Drizzle ORM
- **Database**: PostgreSQL (via Neon serverless)
- **Authentication**: Session-based with bcrypt password hashing
- **PDF Generation**: PDFKit for test result reports

### Project Structure
- **Monorepo Layout**: Shared schema between client and server
- **Client**: React frontend in `/client` directory
- **Server**: Express backend in `/server` directory
- **Shared**: Common types and schemas in `/shared` directory

## Key Components

### Authentication System
- Role-based access control (Admin and Teacher roles)
- Secure password hashing with bcrypt
- Session management with localStorage
- Protected routes based on user roles

### Database Schema
- **Users Table**: Stores admin and teacher accounts with roles, credentials, and profile information
- **Students Table**: Student demographic information including name, birth date, and major
- **Ishihara Questions Table**: Test questions with images, correct answers, and multiple choice options
- **Test Results Table**: Comprehensive test results including answers, scores, diagnosis, and recommendations

### Test Interface
- Interactive color blindness test using Ishihara plates
- Randomized question order to prevent cheating
- Timer functionality for test duration tracking
- Real-time progress indication
- Automatic scoring and diagnosis generation

### Report Generation
- PDF report generation with comprehensive test results
- Includes student information, test scores, diagnosis, and recommendations
- Professional formatting suitable for medical/educational documentation

## Data Flow

1. **Authentication Flow**: User logs in → Credentials validated → Session established → Role-based dashboard redirect
2. **Test Workflow**: Teacher creates student → Student data entered → Test initiated → Questions presented → Answers recorded → Results calculated → Diagnosis generated → PDF report available
3. **Admin Workflow**: Manage teachers → View all test results → Generate reports → Monitor system statistics

## External Dependencies

### Core Libraries
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI component primitives
- **react-hook-form**: Form state management
- **zod**: Runtime type validation

### UI Components
- **shadcn/ui**: Pre-built accessible components
- **Tailwind CSS**: Utility-first styling
- **class-variance-authority**: Component variant management
- **Lucide React**: Icon library

### Utilities
- **bcrypt**: Password hashing
- **pdfkit**: PDF document generation
- **date-fns**: Date manipulation utilities

## Deployment Strategy

### Development Environment
- **Replit Integration**: Configured for Replit development environment
- **Hot Module Replacement**: Vite HMR for fast development
- **Development Scripts**: `npm run dev` for concurrent client/server development

### Production Build
- **Client Build**: Vite production build to `/dist/public`
- **Server Build**: esbuild for Node.js server bundling
- **Static Serving**: Express serves built client assets
- **Database**: Neon serverless PostgreSQL for production

### Environment Configuration
- **Database URL**: Required environment variable for database connection
- **Build Process**: Automated build pipeline via npm scripts
- **Port Configuration**: Configurable port with default fallback

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- June 16, 2025. Initial setup