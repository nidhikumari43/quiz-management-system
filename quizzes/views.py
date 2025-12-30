from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Quiz, Question, Submission, SubmissionAnswer
from .serializers import (
    QuizSerializer, QuizCreateSerializer,
    QuestionSerializer, QuestionCreateSerializer,
    SubmissionSerializer, QuizSubmissionSerializer
)


class QuizViewSet(viewsets.ModelViewSet):
    """ViewSet for managing quizzes (admin)"""
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return QuizCreateSerializer
        return QuizSerializer

    @action(detail=True, methods=['post'])
    def questions(self, request, pk=None):
        """Add a question to a quiz"""
        quiz = self.get_object()
        serializer = QuestionCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(quiz=quiz)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class QuestionViewSet(viewsets.ModelViewSet):
    """ViewSet for managing questions (admin)"""
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return QuestionCreateSerializer
        return QuestionSerializer


class PublicQuizView(APIView):
    """Public endpoint to get quiz by slug"""
    def get(self, request, slug):
        quiz = get_object_or_404(Quiz, slug=slug, is_active=True)
        serializer = QuizSerializer(quiz)
        return Response(serializer.data)


class SubmitQuizView(APIView):
    """Public endpoint to submit quiz answers"""
    def post(self, request, slug):
        quiz = get_object_or_404(Quiz, slug=slug, is_active=True)
        
        submission_serializer = QuizSubmissionSerializer(data=request.data)
        if not submission_serializer.is_valid():
            return Response(submission_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Create submission
        total_points = sum(q.points for q in quiz.questions.all())
        submission = Submission.objects.create(quiz=quiz, total_points=total_points)

        # Process answers
        answers_data = submission_serializer.validated_data['answers']
        score = 0

        for answer_data in answers_data:
            question_id = answer_data.get('question_id')
            answer_text = answer_data.get('answer_text', '')

            try:
                question = Question.objects.get(id=question_id, quiz=quiz)
            except Question.DoesNotExist:
                continue

            is_correct = False
            points_earned = 0

            # Check answer based on question type
            if question.question_type == 'MCQ':
                # For MCQ, check if selected option is correct
                try:
                    option = question.options.get(id=answer_text)
                    is_correct = option.is_correct
                    if is_correct:
                        points_earned = question.points
                except:
                    pass

            elif question.question_type == 'TRUE_FALSE':
                # For True/False, compare with correct answer
                if hasattr(question, 'correct_answer'):
                    correct = question.correct_answer.correct_answer.strip().lower()
                    user_answer = answer_text.strip().lower()
                    is_correct = correct == user_answer
                    if is_correct:
                        points_earned = question.points

            elif question.question_type == 'TEXT':
                # For text, we'll mark as needs review (is_correct = None)
                # In production, this would require manual review
                if hasattr(question, 'correct_answer'):
                    correct = question.correct_answer.correct_answer.strip().lower()
                    user_answer = answer_text.strip().lower()
                    is_correct = correct == user_answer
                    if is_correct:
                        points_earned = question.points

            SubmissionAnswer.objects.create(
                submission=submission,
                question=question,
                answer_text=answer_text,
                is_correct=is_correct,
                points_earned=points_earned
            )

            if is_correct:
                score += points_earned

        # Calculate and save final score
        submission.score = score
        submission.save()

        # Return submission with results
        result_serializer = SubmissionSerializer(submission)
        return Response(result_serializer.data, status=status.HTTP_201_CREATED)
