# Personal Medical Assistant

## Overview

This is a location-aware, AI-powered web platform designed to assist travelers in managing unexpected health issues while abroad. The application provides symptom-based medical consultations through a chatbot interface, searches for prescriptive medications using AI, finds locally available alternatives tailored to the user's location, and displays pharmacy locations on an interactive map.

The platform serves as a proof-of-concept for a "Personal Medical Assistant" that can help travelers navigate health challenges in foreign countries by providing AI-powered medical guidance and location-specific medicine availability information.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript running on Vite
- **Routing**: Wouter for client-side routing with pages for Home, Demo, and Journey
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with custom medical theme colors and CSS variables
- **State Management**: TanStack Query for server state management and caching
- **Build Tool**: Vite with custom aliases and development tooling

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **API Design**: RESTful endpoints with `/api` prefix
- **AI Integration**: OpenAI GPT-4o for medical symptom analysis and recommendations
- **Data Storage**: In-memory storage implementation with interfaces for future database integration
- **Session Management**: Basic chat session tracking with user context

### Core Features Implementation
- **Medical Chat Interface**: Real-time AI-powered conversation system for symptom analysis
- **Location-Aware Services**: Country and city-based medicine and pharmacy recommendations
- **Interactive Pharmacy Map**: Component for displaying nearby pharmacy locations with contact details
- **Responsive Design**: Mobile-first approach with responsive grid layouts and components

### Data Models
- **Users**: Basic user management with username/password authentication
- **Chat Sessions**: Conversation tracking with symptoms, location, and AI recommendations
- **Medicines**: Drug database with generic names, dosages, descriptions, and country availability
- **Pharmacies**: Location-based pharmacy directory with coordinates, contact info, and hours

### Database Schema Design
- **PostgreSQL**: Configured for production use with Drizzle ORM
- **Schema Definition**: Type-safe database schema with Zod validation
- **Migration Support**: Drizzle Kit for database migrations and schema management
- **Environment Configuration**: DATABASE_URL-based connection management

### Development Tools
- **TypeScript**: Full type safety across frontend, backend, and shared code
- **Hot Module Replacement**: Vite development server with middleware integration
- **Code Organization**: Monorepo structure with shared schemas and utilities
- **Path Aliases**: Clean import paths with @ aliases for better code organization

## External Dependencies

### AI Services
- **OpenAI API**: GPT-4o model for medical symptom analysis and treatment recommendations
- **Response Format**: Structured JSON responses for consistent data handling

### Database Services
- **Neon Database**: Serverless PostgreSQL for production deployment
- **Connection Pooling**: @neondatabase/serverless for optimized database connections

### UI Framework Dependencies
- **Radix UI**: Comprehensive primitive components for accessibility and functionality
- **Lucide React**: Icon library for consistent iconography
- **Class Variance Authority**: Type-safe component variant system
- **Embla Carousel**: Carousel functionality for interactive elements

### Development Infrastructure
- **Replit Integration**: Development environment optimization with runtime error overlay
- **PostCSS**: CSS processing with Tailwind CSS and Autoprefixer
- **ESBuild**: Fast bundling for production builds
- **TSX**: TypeScript execution for development server

### Form and Validation
- **React Hook Form**: Form state management with performance optimization
- **Zod**: Runtime type validation and schema definition
- **Hookform Resolvers**: Integration between React Hook Form and Zod validation

### Date and Utility Libraries
- **Date-fns**: Date manipulation and formatting utilities
- **clsx/tailwind-merge**: Conditional CSS class management
- **nanoid**: Unique ID generation for chat sessions and data records