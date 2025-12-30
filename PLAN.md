# Quiz Management System - Plan

## Assumptions

1. **Authentication**: For MVP, we'll use a simple admin interface without full authentication. In production, we'd add proper user authentication.
2. **Quiz Access**: Public quizzes are accessible via a unique URL/slug. No authentication required to take a quiz.
3. **Question Types**: Support MCQ (Multiple Choice), True/False, and Text (Short Answer) questions.
4. **Scoring**: 
   - MCQ and True/False: Automatic scoring based on correct answer
   - Text: Manual review (for MVP, we'll show the answer but mark as "needs review")
5. **Database**: Using PostgreSQL (Neon DB) for production-ready relational data.
6. **Deployment**: Backend on Railway/Render, Frontend on Vercel (good to have).

## Scope

### Phase 1: Core Features (MVP)
- ✅ Admin panel to create quizzes with questions
- ✅ Support for MCQ, True/False, and Text question types
- ✅ Public quiz page accessible via unique URL
- ✅ Quiz submission and results display
- ✅ Basic UI with Tailwind CSS

### Out of Scope (for MVP)
- User authentication system
- Quiz analytics/dashboard
- Time limits for quizzes
- Question randomization
- Multiple attempts tracking
- Email notifications

## High-Level Architecture

```
┌─────────────────┐
│   Next.js App   │  (Frontend)
│  - Admin Panel  │
│  - Public Quiz  │
└────────┬────────┘
         │ REST API
┌────────▼────────┐
│  Django Backend │  (Backend)
│  - REST API     │
│  - Admin API    │
└────────┬────────┘
         │
┌────────▼────────┐
│  PostgreSQL     │  (Database)
│  - Quizzes      │
│  - Questions    │
│  - Submissions  │
└─────────────────┘
```

## Database Schema

### Quiz
- `id` (UUID, Primary Key)
- `title` (String)
- `slug` (String, Unique)
- `description` (Text, Optional)
- `created_at` (DateTime)
- `updated_at` (DateTime)
- `is_active` (Boolean)

### Question
- `id` (UUID, Primary Key)
- `quiz` (ForeignKey to Quiz)
- `question_text` (Text)
- `question_type` (Choice: MCQ, TRUE_FALSE, TEXT)
- `order` (Integer)
- `points` (Integer, default 1)
- `created_at` (DateTime)

### Option (for MCQ questions)
- `id` (UUID, Primary Key)
- `question` (ForeignKey to Question)
- `option_text` (String)
- `is_correct` (Boolean)
- `order` (Integer)

### Answer (for True/False and Text questions)
- `id` (UUID, Primary Key)
- `question` (OneToOne to Question)
- `correct_answer` (String/Text)
- `created_at` (DateTime)

### Submission
- `id` (UUID, Primary Key)
- `quiz` (ForeignKey to Quiz)
- `submitted_at` (DateTime)
- `score` (Integer, nullable - calculated after submission)
- `total_points` (Integer)

### SubmissionAnswer
- `id` (UUID, Primary Key)
- `submission` (ForeignKey to Submission)
- `question` (ForeignKey to Question)
- `answer_text` (Text)
- `is_correct` (Boolean, nullable)
- `points_earned` (Integer, default 0)

## API Endpoints

### Admin Endpoints
- `GET /api/admin/quizzes/` - List all quizzes
- `POST /api/admin/quizzes/` - Create a new quiz
- `GET /api/admin/quizzes/{id}/` - Get quiz details
- `PUT /api/admin/quizzes/{id}/` - Update quiz
- `DELETE /api/admin/quizzes/{id}/` - Delete quiz
- `POST /api/admin/quizzes/{id}/questions/` - Add question to quiz
- `PUT /api/admin/questions/{id}/` - Update question
- `DELETE /api/admin/questions/{id}/` - Delete question

### Public Endpoints
- `GET /api/quizzes/{slug}/` - Get quiz by slug (public)
- `POST /api/quizzes/{slug}/submit/` - Submit quiz answers

## Tech Stack Details

### Backend
- **Framework**: Django 4.2+
- **API**: Django REST Framework
- **Database**: PostgreSQL (Neon DB)
- **CORS**: django-cors-headers

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **HTTP Client**: Fetch API / Axios
- **UI Components**: Custom components with Tailwind

## Implementation Steps

1. ✅ Create project structure and PLAN.md
2. Set up Django backend with models
3. Create REST API endpoints
4. Set up Next.js frontend
5. Build admin panel UI
6. Build public quiz page
7. Connect frontend to backend
8. Test and refine
9. Prepare for deployment

## Scope Changes During Implementation

1. **Database**: Used SQLite for development instead of PostgreSQL initially, as it's easier for setup. PostgreSQL can be configured for production.

2. **Text Question Scoring**: Implemented automatic text answer comparison (case-insensitive) instead of marking all as "needs review". This provides immediate feedback while still allowing for manual review in production.

3. **Question Editing**: Added full CRUD operations for questions, allowing editing and deletion directly from the admin panel.

4. **UI Enhancements**: Added a landing page with navigation, improved styling with gradients and better visual feedback for correct/incorrect answers.

5. **API Structure**: Used ViewSets for admin endpoints and APIView for public endpoints to maintain clear separation of concerns.

## Reflection

### What would I do next if I had more time?

1. **Authentication & Authorization**:
   - Implement JWT-based authentication for admin panel
   - Add role-based access control (admin, teacher, student)
   - Secure API endpoints with proper permissions

2. **Enhanced Features**:
   - Quiz analytics dashboard showing submission statistics
   - Time limits for quizzes
   - Question randomization and shuffling
   - Multiple attempts tracking with best score
   - Export quiz results to CSV/PDF

3. **User Experience**:
   - Add loading states and skeleton screens
   - Implement optimistic UI updates
   - Add form validation with better error messages
   - Support for images in questions
   - Rich text editor for question text

4. **Testing**:
   - Unit tests for backend models and views
   - Integration tests for API endpoints
   - Frontend component tests with React Testing Library
   - E2E tests with Playwright or Cypress

5. **Production Readiness**:
   - Set up PostgreSQL database (Neon DB)
   - Configure environment variables properly
   - Add error tracking (Sentry)
   - Implement rate limiting
   - Add API documentation (Swagger/OpenAPI)
   - Set up CI/CD pipeline
   - Deploy backend to Railway/Render
   - Deploy frontend to Vercel

6. **Performance**:
   - Add database indexing for frequently queried fields
   - Implement caching for quiz data
   - Optimize API responses with pagination
   - Add image optimization for frontend

7. **Accessibility**:
   - Ensure WCAG 2.1 AA compliance
   - Add keyboard navigation
   - Screen reader support
   - High contrast mode

The current implementation provides a solid MVP that demonstrates core functionality, clean architecture, and production-ready code structure. With more time, the focus would be on security, testing, and enhanced features to make it a fully production-ready system.

