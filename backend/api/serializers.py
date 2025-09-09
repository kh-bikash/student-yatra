from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Resume
from .models import Resume, Certificate, Skill, UserSkill, JobListing, InterviewQuestion, UserProfile, StudyGroup

class CertificateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certificate
        fields = ['id', 'user', 'title', 'issuing_organization', 'file', 'uploaded_at']
        read_only_fields = ['user', 'uploaded_at']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, required=True, label='Confirm password', style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ('username', 'password', 'password2', 'email', 'first_name', 'last_name')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        user.set_password(validated_data['password'])
        user.save()
        return user
# User Serializer
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email')
class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name', 'category']

class UserSkillSerializer(serializers.ModelSerializer):
    # Include the skill's name for easier display on the frontend.
    skill_name = serializers.CharField(source='skill.name', read_only=True)

    class Meta:
        model = UserSkill
        fields = ['id', 'skill', 'skill_name', 'proficiency']
        read_only_fields = ('user',)

class ResumeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resume
        fields = '__all__'
        read_only_fields = ('user',)

# --- Add JobListingSerializer below ---
class JobListingSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobListing
        fields = '__all__'
#Interview
# --- Add InterviewQuestionSerializer below ---
class InterviewQuestionSerializer(serializers.ModelSerializer):
    skill_name = serializers.CharField(source='skill.name', read_only=True)

    class Meta:
        model = InterviewQuestion
        fields = ['id', 'skill', 'skill_name', 'question_text', 'answer_text', 'difficulty']
# --- End of new serializer ---

# --- Add StudyGroupSerializer below ---
class StudyGroupSerializer(serializers.ModelSerializer):
    # Use a read-only field to show the creator's username
    creator_username = serializers.CharField(source='creator.username', read_only=True)
    # Use a read-only field to show how many members are in the group
    members_count = serializers.IntegerField(source='members.count', read_only=True)
    # Check if the current user is a member
    is_member = serializers.SerializerMethodField()

    class Meta:
        model = StudyGroup
        fields = ['id', 'name', 'description', 'creator', 'creator_username', 'members', 'members_count', 'is_member', 'created_at']
        read_only_fields = ('creator', 'members') # These are handled by custom actions

    def get_is_member(self, obj):
        user = self.context['request'].user
        return obj.members.filter(id=user.id).exists()
# --- End of new serializer ---
