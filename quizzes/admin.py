from django.contrib import admin
from .models import Quiz, Question, Option, Answer, Submission, SubmissionAnswer


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ['title', 'slug', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['title', 'slug']


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ['question_text', 'quiz', 'question_type', 'points', 'order']
    list_filter = ['question_type', 'quiz']
    search_fields = ['question_text']


@admin.register(Option)
class OptionAdmin(admin.ModelAdmin):
    list_display = ['option_text', 'question', 'is_correct', 'order']
    list_filter = ['is_correct']


@admin.register(Answer)
class AnswerAdmin(admin.ModelAdmin):
    list_display = ['question', 'correct_answer']


@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = ['quiz', 'submitted_at', 'score', 'total_points']
    list_filter = ['submitted_at', 'quiz']
    readonly_fields = ['submitted_at']


@admin.register(SubmissionAnswer)
class SubmissionAnswerAdmin(admin.ModelAdmin):
    list_display = ['submission', 'question', 'is_correct', 'points_earned']
    list_filter = ['is_correct']
