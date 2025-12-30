import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Quiz {
  id: string;
  title: string;
  slug: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  questions: Question[];
  question_count: number;
}

export interface Question {
  id: string;
  question_text: string;
  question_type: 'MCQ' | 'TRUE_FALSE' | 'TEXT';
  order: number;
  points: number;
  options?: Option[];
  correct_answer?: Answer;
}

export interface Option {
  id: string;
  option_text: string;
  is_correct: boolean;
  order: number;
}

export interface Answer {
  id: string;
  correct_answer: string;
}

export interface Submission {
  id: string;
  quiz: string;
  quiz_title: string;
  submitted_at: string;
  score: number | null;
  total_points: number;
  answers: SubmissionAnswer[];
}

export interface SubmissionAnswer {
  id: string;
  question: string;
  question_text: string;
  question_type: string;
  answer_text: string;
  is_correct: boolean | null;
  points_earned: number;
}

// Admin API
export const adminApi = {
  getQuizzes: async (): Promise<Quiz[]> => {
    const response = await api.get('/admin/quizzes/');
    return response.data;
  },

  getQuiz: async (id: string): Promise<Quiz> => {
    const response = await api.get(`/admin/quizzes/${id}/`);
    return response.data;
  },

  createQuiz: async (data: { title: string; description?: string; is_active?: boolean }): Promise<Quiz> => {
    const response = await api.post('/admin/quizzes/', data);
    return response.data;
  },

  updateQuiz: async (id: string, data: Partial<Quiz>): Promise<Quiz> => {
    const response = await api.put(`/admin/quizzes/${id}/`, data);
    return response.data;
  },

  deleteQuiz: async (id: string): Promise<void> => {
    await api.delete(`/admin/quizzes/${id}/`);
  },

  addQuestion: async (quizId: string, questionData: any): Promise<Question> => {
    const response = await api.post(`/admin/quizzes/${quizId}/questions/`, questionData);
    return response.data;
  },

  updateQuestion: async (id: string, questionData: any): Promise<Question> => {
    const response = await api.put(`/admin/questions/${id}/`, questionData);
    return response.data;
  },

  deleteQuestion: async (id: string): Promise<void> => {
    await api.delete(`/admin/questions/${id}/`);
  },
};

// Public API
export const publicApi = {
  getQuiz: async (slug: string): Promise<Quiz> => {
    const response = await api.get(`/quizzes/${slug}/`);
    return response.data;
  },

  submitQuiz: async (slug: string, answers: Array<{ question_id: string; answer_text: string }>): Promise<Submission> => {
    const response = await api.post(`/quizzes/${slug}/submit/`, { answers });
    return response.data;
  },
};

