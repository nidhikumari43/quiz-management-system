from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import QuizViewSet, QuestionViewSet, PublicQuizView, SubmitQuizView

router = DefaultRouter()
router.register(r'admin/quizzes', QuizViewSet, basename='quiz')
router.register(r'admin/questions', QuestionViewSet, basename='question')

urlpatterns = router.urls + [
    path('quizzes/<str:slug>/', PublicQuizView.as_view(), name='public-quiz'),
    path('quizzes/<str:slug>/submit/', SubmitQuizView.as_view(), name='submit-quiz'),
]

