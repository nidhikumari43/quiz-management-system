# Quick Setup Guide

## Prerequisites

1. **Python 3.8+** - For Django backend
2. **Node.js 18+ and npm** - For Next.js frontend

## Quick Start

### 1. Backend Setup

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start backend server
python manage.py runserver
```

Backend will run on `http://localhost:8000`

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start frontend server
npm run dev
```

Frontend will run on `http://localhost:3000`

## Testing the System

1. Open `http://localhost:3000` in your browser
2. Click "Admin Panel"
3. Create a new quiz
4. Add questions to the quiz
5. Click "View" to see the public quiz page
6. Take the quiz and submit to see results

## Troubleshooting

### Backend Issues
- Make sure virtual environment is activated
- Check that port 8000 is not in use
- Verify all migrations are applied: `python manage.py migrate`

### Frontend Issues
- Make sure Node.js 18+ is installed: `node --version`
- Delete `node_modules` and `package-lock.json`, then run `npm install` again
- Check that port 3000 is not in use

### CORS Issues
- Ensure backend is running on port 8000
- Check `backend/settings.py` has CORS configured for `localhost:3000`

