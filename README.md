# Quiz Management System

A production-ready quiz management system built with Django (backend) and Next.js (frontend).

## Features

### Admin Panel
- Create and manage quizzes
- Add questions with multiple types:
  - Multiple Choice Questions (MCQ)
  - True/False questions
  - Text/Short Answer questions
- Edit and delete quizzes and questions
- View quiz statistics

### Public Quiz Page
- Take quizzes via unique slug URLs
- Support for all question types
- Real-time answer validation
- Results display with:
  - Score and percentage
  - Correct/incorrect answers
  - Points earned per question

## Tech Stack

### Backend
- **Django 6.0** - Web framework
- **Django REST Framework** - API development
- **PostgreSQL** - Database (SQLite for development)
- **django-cors-headers** - CORS handling

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Axios** - HTTP client

## Project Structure

```
quiz-management-system/
├── backend/              # Django project
│   ├── settings.py
│   └── urls.py
├── quizzes/              # Django app
│   ├── models.py         # Database models
│   ├── serializers.py    # API serializers
│   ├── views.py          # API views
│   └── urls.py           # API routes
├── frontend/             # Next.js app
│   ├── app/              # App router pages
│   │   ├── admin/        # Admin panel
│   │   └── quiz/         # Public quiz pages
│   ├── components/       # React components
│   └── lib/              # Utilities (API client)
├── PLAN.md               # Project plan and architecture
└── requirements.txt      # Python dependencies
```

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 18+ and npm
- PostgreSQL (optional, SQLite used by default)

### Backend Setup

1. Create and activate virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run migrations:
```bash
python manage.py migrate
```

4. Create superuser (optional):
```bash
python manage.py createsuperuser
```

5. Run development server:
```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

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
- `GET /api/quizzes/{slug}/` - Get quiz by slug
- `POST /api/quizzes/{slug}/submit/` - Submit quiz answers

## Usage

1. **Create a Quiz:**
   - Go to `/admin`
   - Click "Create New Quiz"
   - Enter title and description
   - Click "Create Quiz"

2. **Add Questions:**
   - Click "Edit" on a quiz
   - Click "Add Question"
   - Select question type and fill in details
   - For MCQ: Add options and mark correct answer(s)
   - For True/False or Text: Enter correct answer
   - Click "Add Question"

3. **Take a Quiz:**
   - Go to `/quiz/{slug}` (replace {slug} with your quiz slug)
   - Answer all questions
   - Click "Submit Quiz"
   - View results with score and correct answers

## Database Schema

- **Quiz**: Stores quiz information
- **Question**: Stores questions with type and points
- **Option**: Stores MCQ options
- **Answer**: Stores correct answers for True/False and Text questions
- **Submission**: Stores quiz submissions
- **SubmissionAnswer**: Stores individual answers for each submission

## Development Notes

- The backend uses SQLite by default for easy development
- For production, configure PostgreSQL in `backend/settings.py`
- CORS is configured to allow requests from `localhost:3000`
- The frontend proxies API requests through Next.js rewrites

## License

This project is created for assessment purposes.

