'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { publicApi, Quiz, Question, Submission } from '@/lib/api';

export default function TakeQuizPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    loadQuiz();
  }, [slug]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      const data = await publicApi.getQuiz(slug);
      setQuiz(data);
    } catch (error) {
      console.error('Error loading quiz:', error);
      alert('Error loading quiz. Please check the quiz URL.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quiz) return;

    // Check if all questions are answered
    const unansweredQuestions = quiz.questions.filter(
      (q) => !answers[q.id] || answers[q.id].trim() === ''
    );

    if (unansweredQuestions.length > 0) {
      if (
        !confirm(
          `You have ${unansweredQuestions.length} unanswered question(s). Submit anyway?`
        )
      ) {
        return;
      }
    }

    try {
      setSubmitting(true);
      const answersArray = Object.entries(answers).map(([question_id, answer_text]) => ({
        question_id,
        answer_text: answer_text || '',
      }));

      const result = await publicApi.submitQuiz(slug, answersArray);
      setSubmission(result);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Error submitting quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <p className="text-gray-600">Loading quiz...</p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-xl text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quiz Not Found</h2>
          <p className="text-gray-600 mb-6">The quiz you're looking for doesn't exist or is inactive.</p>
          <Link
            href="/"
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (submission) {
    return <ResultsView quiz={quiz} submission={submission} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{quiz.title}</h1>
          {quiz.description && (
            <p className="text-gray-600 mb-4">{quiz.description}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>{quiz.questions.length} questions</span>
            <span>•</span>
            <span>
              {quiz.questions.reduce((sum, q) => sum + q.points, 0)} total points
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {quiz.questions.map((question, index) => (
            <QuestionCard
              key={question.id}
              question={question}
              index={index}
              value={answers[question.id] || ''}
              onChange={(value) => handleAnswerChange(question.id, value)}
            />
          ))}

          <div className="bg-white rounded-lg shadow-xl p-6">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-indigo-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function QuestionCard({
  question,
  index,
  value,
  onChange,
}: {
  question: Question;
  index: number;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="bg-white rounded-lg shadow-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-lg font-bold text-indigo-600">Q{index + 1}</span>
        <span className="text-sm px-3 py-1 bg-gray-100 rounded-full">
          {question.question_type}
        </span>
        <span className="text-sm text-gray-500">{question.points} point{question.points !== 1 ? 's' : ''}</span>
      </div>
      <p className="text-lg font-medium text-gray-900 mb-4">{question.question_text}</p>

      {question.question_type === 'MCQ' && question.options ? (
        <div className="space-y-2">
          {question.options.map((option, optIndex) => (
            <label
              key={option.id}
              className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                value === option.id
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name={`question-${question.id}`}
                value={option.id}
                checked={value === option.id}
                onChange={(e) => onChange(e.target.value)}
                className="mr-3 w-5 h-5 text-indigo-600"
              />
              <span className="font-medium mr-2">
                {String.fromCharCode(65 + optIndex)}.
              </span>
              <span>{option.option_text}</span>
            </label>
          ))}
        </div>
      ) : question.question_type === 'TRUE_FALSE' ? (
        <div className="space-y-2">
          {['True', 'False'].map((option) => (
            <label
              key={option}
              className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                value === option
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name={`question-${question.id}`}
                value={option}
                checked={value === option}
                onChange={(e) => onChange(e.target.value)}
                className="mr-3 w-5 h-5 text-indigo-600"
              />
              <span className="font-medium">{option}</span>
            </label>
          ))}
        </div>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          rows={4}
          placeholder="Type your answer here..."
        />
      )}
    </div>
  );
}

function ResultsView({ quiz, submission }: { quiz: Quiz; submission: Submission }) {
  const scorePercentage = submission.total_points > 0
    ? Math.round((submission.score || 0) / submission.total_points * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8 mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Results</h1>
          <p className="text-gray-600 mb-6">{quiz.title}</p>

          <div className="inline-block p-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mb-6">
            <div className="text-5xl font-bold text-white mb-2">
              {submission.score || 0} / {submission.total_points}
            </div>
            <div className="text-2xl font-semibold text-white">{scorePercentage}%</div>
          </div>

          <div className="text-gray-600">
            Submitted on {new Date(submission.submitted_at).toLocaleString()}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Answers</h2>
          {submission.answers.map((answer, index) => {
            const question = quiz.questions.find((q) => q.id === answer.question);
            if (!question) return null;

            return (
              <div
                key={answer.id}
                className={`bg-white rounded-lg shadow-xl p-6 border-2 ${
                  answer.is_correct
                    ? 'border-green-500'
                    : answer.is_correct === false
                    ? 'border-red-500'
                    : 'border-yellow-500'
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-lg font-bold text-indigo-600">Q{index + 1}</span>
                  {answer.is_correct === true && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                      ✓ Correct (+{answer.points_earned} points)
                    </span>
                  )}
                  {answer.is_correct === false && (
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
                      ✗ Incorrect (0 points)
                    </span>
                  )}
                  {answer.is_correct === null && (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                      ⚠ Needs Review
                    </span>
                  )}
                </div>

                <p className="text-lg font-medium text-gray-900 mb-3">{answer.question_text}</p>

                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-semibold text-gray-700">Your Answer: </span>
                    <span className="text-gray-900">{answer.answer_text || '(No answer provided)'}</span>
                  </div>

                  {question.question_type !== 'TEXT' && question.question_type !== 'TRUE_FALSE' && (
                    <div>
                      <span className="text-sm font-semibold text-green-700">Correct Answer: </span>
                      <span className="text-green-900">
                        {question.question_type === 'MCQ'
                          ? question.options?.find((opt) => opt.is_correct)?.option_text
                          : question.correct_answer?.correct_answer}
                      </span>
                    </div>
                  )}

                  {question.question_type === 'TRUE_FALSE' && question.correct_answer && (
                    <div>
                      <span className="text-sm font-semibold text-green-700">Correct Answer: </span>
                      <span className="text-green-900">{question.correct_answer.correct_answer}</span>
                    </div>
                  )}

                  {question.question_type === 'TEXT' && question.correct_answer && (
                    <div>
                      <span className="text-sm font-semibold text-green-700">Expected Answer: </span>
                      <span className="text-green-900">{question.correct_answer.correct_answer}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

