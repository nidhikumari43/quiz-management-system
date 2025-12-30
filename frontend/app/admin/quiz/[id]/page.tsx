'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminApi, Quiz, Question } from '@/lib/api';

export default function EditQuizPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.id as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  useEffect(() => {
    loadQuiz();
  }, [quizId]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getQuiz(quizId);
      setQuiz(data);
    } catch (error) {
      console.error('Error loading quiz:', error);
      alert('Error loading quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = async (questionData: any) => {
    try {
      await adminApi.addQuestion(quizId, questionData);
      setShowQuestionForm(false);
      loadQuiz();
    } catch (error) {
      console.error('Error adding question:', error);
      alert('Error adding question');
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    try {
      await adminApi.deleteQuestion(questionId);
      loadQuiz();
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('Error deleting question');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading quiz...</p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Quiz not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{quiz.title}</h1>
            {quiz.description && (
              <p className="text-gray-600 mt-2">{quiz.description}</p>
            )}
          </div>
          <Link
            href="/admin"
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            ← Back to Admin
          </Link>
        </div>

        {!showQuestionForm && !editingQuestion ? (
          <button
            onClick={() => setShowQuestionForm(true)}
            className="mb-6 bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            + Add Question
          </button>
        ) : (
          <QuestionForm
            quizId={quizId}
            question={editingQuestion}
            onSubmit={handleAddQuestion}
            onCancel={() => {
              setShowQuestionForm(false);
              setEditingQuestion(null);
            }}
          />
        )}

        <div className="space-y-4">
          {quiz.questions.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-gray-600">No questions yet. Add your first question!</p>
            </div>
          ) : (
            quiz.questions.map((question, index) => (
              <QuestionCard
                key={question.id}
                question={question}
                index={index}
                onDelete={() => handleDeleteQuestion(question.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function QuestionCard({ question, index, onDelete }: { question: Question; index: number; onDelete: () => void }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm font-semibold text-indigo-600">Q{index + 1}</span>
            <span className="text-sm px-2 py-1 bg-gray-100 rounded">{question.question_type}</span>
            <span className="text-sm text-gray-500">{question.points} point{question.points !== 1 ? 's' : ''}</span>
          </div>
          <p className="text-lg font-medium text-gray-900 mb-3">{question.question_text}</p>

          {question.question_type === 'MCQ' && question.options && (
            <div className="space-y-2">
              {question.options.map((option, optIndex) => (
                <div
                  key={option.id}
                  className={`p-3 rounded border ${
                    option.is_correct
                      ? 'bg-green-50 border-green-300'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <span className="font-medium">{String.fromCharCode(65 + optIndex)}.</span> {option.option_text}
                  {option.is_correct && (
                    <span className="ml-2 text-green-600 font-semibold">✓ Correct</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {(question.question_type === 'TRUE_FALSE' || question.question_type === 'TEXT') &&
            question.correct_answer && (
              <div className="mt-3 p-3 bg-green-50 border border-green-300 rounded">
                <span className="text-sm font-semibold text-green-800">Correct Answer: </span>
                <span className="text-green-700">{question.correct_answer.correct_answer}</span>
              </div>
            )}
        </div>
        <button
          onClick={onDelete}
          className="ml-4 text-red-600 hover:text-red-800 font-semibold"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

function QuestionForm({
  quizId,
  question,
  onSubmit,
  onCancel,
}: {
  quizId: string;
  question: Question | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  const [questionText, setQuestionText] = useState(question?.question_text || '');
  const [questionType, setQuestionType] = useState<'MCQ' | 'TRUE_FALSE' | 'TEXT'>(question?.question_type || 'MCQ');
  const [points, setPoints] = useState(question?.points || 1);
  const [options, setOptions] = useState<Array<{ text: string; is_correct: boolean }>>(
    question?.options?.map((opt) => ({ text: opt.option_text, is_correct: opt.is_correct })) || [
      { text: '', is_correct: false },
      { text: '', is_correct: false },
    ]
  );
  const [correctAnswer, setCorrectAnswer] = useState(question?.correct_answer?.correct_answer || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const questionData: any = {
      question_text: questionText,
      question_type: questionType,
      points: points,
      order: question?.order || 0,
    };

    if (questionType === 'MCQ') {
      questionData.options = options
        .filter((opt) => opt.text.trim())
        .map((opt, index) => ({
          option_text: opt.text,
          is_correct: opt.is_correct,
          order: index,
        }));
    } else {
      questionData.correct_answer_text = correctAnswer;
    }

    onSubmit(questionData);
  };

  const addOption = () => {
    setOptions([...options, { text: '', is_correct: false }]);
  };

  const updateOption = (index: number, field: 'text' | 'is_correct', value: string | boolean) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setOptions(newOptions);
  };

  return (
    <div className="mb-6 bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">
        {question ? 'Edit Question' : 'Add New Question'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Question Text *
          </label>
          <textarea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            rows={3}
            placeholder="Enter your question"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question Type *
            </label>
            <select
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="MCQ">Multiple Choice</option>
              <option value="TRUE_FALSE">True/False</option>
              <option value="TEXT">Text Answer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Points *
            </label>
            <input
              type="number"
              value={points}
              onChange={(e) => setPoints(parseInt(e.target.value))}
              min="1"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {questionType === 'MCQ' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Options *
            </label>
            {options.map((option, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) => updateOption(index, 'text', e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={option.is_correct}
                    onChange={(e) => updateOption(index, 'is_correct', e.target.checked)}
                  />
                  <span className="text-sm">Correct</span>
                </label>
              </div>
            ))}
            <button
              type="button"
              onClick={addOption}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              + Add Option
            </button>
          </div>
        )}

        {(questionType === 'TRUE_FALSE' || questionType === 'TEXT') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correct Answer *
            </label>
            {questionType === 'TRUE_FALSE' ? (
              <select
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select answer</option>
                <option value="True">True</option>
                <option value="False">False</option>
              </select>
            ) : (
              <input
                type="text"
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter correct answer"
              />
            )}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            {question ? 'Update Question' : 'Add Question'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

