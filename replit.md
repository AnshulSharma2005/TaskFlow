# TaskFlow - Task Management Application

## Overview

TaskFlow is a modern task management application built with React, TypeScript, and Express.js. The application provides a comprehensive dashboard for users to create, manage, and track their tasks with features like categorization, priority levels, due dates, and completion tracking. It includes user authentication via Firebase, a responsive design with mobile navigation, and real-time task statistics.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for development tooling
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent design system
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **State Management**: React Context for authentication state, TanStack React Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Development**: TSX for TypeScript execution and hot reloading
- **API Design**: RESTful API structure with `/api` prefix routing
- **Database Layer**: Drizzle ORM with PostgreSQL dialect for type-safe database operations
- **Storage Interface**: Abstract storage interface with in-memory implementation for development

### Authentication System
- **Provider**: Firebase Authentication with Google OAuth and email/password sign-in
- **Session Management**: Firebase auth state management with automatic user profile creation
- **Protected Routes**: Context-based authentication with route guards
- **User Profiles**: Firestore integration for storing extended user profile data

### Data Models
- **Task Schema**: Comprehensive task model with title, description, category (Work, Personal, Shopping, Health), priority levels (Low, Medium, High), due dates, and completion status
- **User Schema**: User profile with email, display name, photo URL, and creation timestamp
- **Validation**: Zod schemas for runtime type validation and form validation

### Database Configuration
- **ORM**: Drizzle ORM with PostgreSQL adapter via Neon Database serverless driver
- **Migrations**: Drizzle Kit for schema migrations and database management
- **Schema**: Shared schema definitions between frontend and backend in TypeScript

### Development Environment
- **Bundling**: Vite for frontend build tooling with React plugin and path aliases
- **Development Server**: Express server with Vite middleware integration for SSR-like development experience
- **Error Handling**: Runtime error overlays and centralized error boundaries
- **Code Quality**: TypeScript strict mode with comprehensive type checking

## External Dependencies

### Core Infrastructure
- **Database**: Neon Database (PostgreSQL) for production data storage
- **Authentication**: Firebase Authentication and Firestore for user management
- **Hosting**: Designed for deployment on platforms supporting Node.js applications

### Development Tools
- **Replit Integration**: Cartographer plugin for Replit environment integration
- **Build Tools**: ESBuild for production server bundling, Vite for client bundling
- **Package Management**: NPM with lockfile for consistent dependencies

### Third-Party Libraries
- **UI Framework**: Radix UI component primitives for accessible components
- **Utility Libraries**: Class Variance Authority for component variants, clsx for conditional classes
- **Date Handling**: date-fns for date manipulation and formatting
- **Icons**: Lucide React for modern icon system, FontAwesome for additional icons
- **Fonts**: Google Fonts integration (Inter, DM Sans, Fira Code, Geist Mono, Architects Daughter)

### API Integration
- **Firebase Services**: Auth, Firestore for user data and task storage
- **Query Management**: TanStack React Query for caching and synchronization
- **HTTP Client**: Native fetch API with custom request/response handling