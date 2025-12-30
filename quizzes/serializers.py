from rest_framework import serializers
from django.utils.text import slugify
from .models import Quiz, Question, Option, Answer, Submission, SubmissionAnswer


class OptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = ['id', 'option_text', 'is_correct', 'order']


class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ['id', 'correct_answer']


class QuestionSerializer(serializers.ModelSerializer):
    options = OptionSerializer(many=True, read_only=True)
    correct_answer = AnswerSerializer(read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'question_text', 'question_type', 'order', 'points', 'options', 'correct_answer']


class QuestionCreateSerializer(serializers.ModelSerializer):
    options = OptionSerializer(many=True, required=False)
    correct_answer_text = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = Question
        fields = ['id', 'question_text', 'question_type', 'order', 'points', 'options', 'correct_answer_text']

    def create(self, validated_data):
        options_data = validated_data.pop('options', [])
        correct_answer_text = validated_data.pop('correct_answer_text', None)
        question = Question.objects.create(**validated_data)

        # Create options for MCQ questions
        if question.question_type == 'MCQ' and options_data:
            for option_data in options_data:
                Option.objects.create(question=question, **option_data)

        # Create answer for True/False and Text questions
        if question.question_type in ['TRUE_FALSE', 'TEXT'] and correct_answer_text:
            Answer.objects.create(question=question, correct_answer=correct_answer_text)

        return question

    def update(self, instance, validated_data):
        options_data = validated_data.pop('options', None)
        correct_answer_text = validated_data.pop('correct_answer_text', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update options for MCQ
        if instance.question_type == 'MCQ' and options_data is not None:
            instance.options.all().delete()
            for option_data in options_data:
                Option.objects.create(question=instance, **option_data)

        # Update answer for True/False and Text
        if instance.question_type in ['TRUE_FALSE', 'TEXT'] and correct_answer_text is not None:
            if hasattr(instance, 'correct_answer'):
                instance.correct_answer.correct_answer = correct_answer_text
                instance.correct_answer.save()
            else:
                Answer.objects.create(question=instance, correct_answer=correct_answer_text)

        return instance


class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    question_count = serializers.IntegerField(source='questions.count', read_only=True)

    class Meta:
        model = Quiz
        fields = ['id', 'title', 'slug', 'description', 'is_active', 'created_at', 'updated_at', 'questions', 'question_count']


class QuizCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = ['id', 'title', 'slug', 'description', 'is_active']

    def create(self, validated_data):
        if not validated_data.get('slug'):
            validated_data['slug'] = slugify(validated_data['title'])
        return super().create(validated_data)


class SubmissionAnswerSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(source='question.question_text', read_only=True)
    question_type = serializers.CharField(source='question.question_type', read_only=True)

    class Meta:
        model = SubmissionAnswer
        fields = ['id', 'question', 'question_text', 'question_type', 'answer_text', 'is_correct', 'points_earned']


class SubmissionSerializer(serializers.ModelSerializer):
    answers = SubmissionAnswerSerializer(many=True, read_only=True)
    quiz_title = serializers.CharField(source='quiz.title', read_only=True)

    class Meta:
        model = Submission
        fields = ['id', 'quiz', 'quiz_title', 'submitted_at', 'score', 'total_points', 'answers']


class QuizSubmissionSerializer(serializers.Serializer):
    """Serializer for submitting quiz answers"""
    answers = serializers.ListField(
        child=serializers.DictField()
    )

    def validate_answers(self, value):
        if not value:
            raise serializers.ValidationError("Answers cannot be empty")
        return value

