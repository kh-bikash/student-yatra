from rest_framework import generics, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status # Import status for custom actions
from rest_framework.decorators import action # Import action decorator
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist
from django.conf import settings
import json
import numpy as np
import io
from PIL import Image
import face_recognition
import google.generativeai as genai

from .models import (
    Resume, Certificate, Skill, UserSkill,
    JobListing, InterviewQuestion, UserProfile, StudyGroup
)
from .serializers import (
    UserSerializer, RegisterSerializer,
    ResumeSerializer, CertificateSerializer,
    SkillSerializer, UserSkillSerializer,
    JobListingSerializer, InterviewQuestionSerializer, StudyGroupSerializer
)

# ------------------------
# User Registration and Info
# ------------------------
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

class UserView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

# ------------------------
# Skill and UserSkill Management
# ------------------------
class SkillViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Skill.objects.all().order_by('name')
    serializer_class = SkillSerializer
    permission_classes = [IsAuthenticated]

class UserSkillViewSet(viewsets.ModelViewSet):
    serializer_class = UserSkillSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserSkill.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# ------------------------
# Dashboard Data Endpoint
# ------------------------
class DashboardDataView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        try:
            resume = Resume.objects.get(user=user)
            resume_name = resume.full_name
        except Resume.DoesNotExist:
            resume_name = user.username

        certificate_count = Certificate.objects.filter(user=user).count()
        user_skills = UserSkill.objects.filter(user=user)
        skills_data = UserSkillSerializer(user_skills, many=True).data

        data = {
            'welcome_name': resume_name,
            'certificate_count': certificate_count,
            'skill_count': user_skills.count(),
            'skills_proficiency': skills_data
        }
        return Response(data)

# ------------------------
# Face Recognition - Registration & Login
# ------------------------
class FaceRegistrationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        image_file = request.FILES.get('image')

        if not image_file:
            return Response({"error": "No image file provided."}, status=400)

        try:
            image = Image.open(io.BytesIO(image_file.read()))
            image_array = np.array(image)
            face_encodings = face_recognition.face_encodings(image_array)

            if len(face_encodings) == 0:
                return Response({"error": "No face found in the image. Please try again."}, status=400)
            if len(face_encodings) > 1:
                return Response({"error": "More than one face found. Please upload only your face."}, status=400)

            encoding_str = json.dumps(face_encodings[0].tolist())

            profile, created = UserProfile.objects.get_or_create(user=user)
            profile.face_encoding = encoding_str
            profile.save()

            return Response({"message": "Face registered successfully."}, status=200)

        except Exception as e:
            return Response({"error": f"Error during face registration: {e}"}, status=500)

# --- Replace your existing FaceLoginView with this enhanced version ---
class FaceLoginView(APIView):
    permission_classes = [AllowAny]  # Allow unauthenticated users to login via face

    def post(self, request, *args, **kwargs):
        image_file = request.FILES.get('image')

        if not image_file:
            return Response({"error": "No image file provided."}, status=400)

        try:
            unknown_image = face_recognition.load_image_file(io.BytesIO(image_file.read()))
            unknown_encodings = face_recognition.face_encodings(unknown_image)

            if len(unknown_encodings) == 0:
                return Response({"error": "No face detected."}, status=400)

            unknown_encoding = unknown_encodings[0]

            profiles_with_faces = UserProfile.objects.filter(face_encoding__isnull=False).select_related('user')

            for profile in profiles_with_faces:
                try:
                    stored_encoding_list = json.loads(profile.face_encoding)
                    known_encoding = np.array(stored_encoding_list)
                    is_match = face_recognition.compare_faces([known_encoding], unknown_encoding)[0]

                    if is_match:
                        user = profile.user
                        refresh = RefreshToken.for_user(user)
                        return Response({
                            'refresh': str(refresh),
                            'access': str(refresh.access_token),
                        }, status=200)

                except Exception:
                    continue  # Skip profiles with bad face encodings

            return Response({"error": "Face not recognized or not registered."}, status=401)

        except Exception as e:
            return Response({"error": f"An error occurred during login: {e}"}, status=500)

# ------------------------
# Resume and Certificate Management
# ------------------------
class ResumeViewSet(viewsets.ModelViewSet):
    serializer_class = ResumeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        try:
            instance = Resume.objects.get(user=self.request.user)
            serializer.update(instance, serializer.validated_data)
        except Resume.DoesNotExist:
            serializer.save(user=self.request.user)

class CertificateViewSet(viewsets.ModelViewSet):
    serializer_class = CertificateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Certificate.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# ------------------------
# Job Listing & Interview Question APIs
# ------------------------
class JobListingViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = JobListing.objects.all()
    serializer_class = JobListingSerializer
    permission_classes = [IsAuthenticated]

class InterviewQuestionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = InterviewQuestionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = InterviewQuestion.objects.select_related('skill').all()
        skill_id = self.request.query_params.get('skill')
        if skill_id:
            queryset = queryset.filter(skill__id=skill_id)
        return queryset

# ------------------------
# AI Career Guidance
# ------------------------
class CareerGuidanceView(APIView):
    """
    Provides AI-powered career guidance based on a user's skills.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = self.request.user
        # We must query the UserSkill model to get the skills for the specific user
        user_skills = UserSkill.objects.filter(user=user).select_related('skill')

        if not user_skills.exists():
            return Response({"error": "No skills found. Please go to the 'Skills' page and add some skills first."}, status=400)

        # Correctly format the user's skills into a string for the prompt
        skills_list_str = ", ".join([f"{us.skill.name} (Proficiency: {us.proficiency})" for us in user_skills])

        # Configure the Gemini API using the key from settings.py
        try:
            # This is the proper way to access the key
            api_key = settings.GEMINI_API_KEY
            if not api_key or api_key == 'YOUR_GEMINI_API_KEY':
                 return Response({"error": "AI service is not configured on the server."}, status=500)
            
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-1.5-flash-latest')
        except Exception as e:
            return Response({"error": f"AI service configuration error: {e}"}, status=500)

        # Create the final, detailed and reliable prompt for the AI
        prompt = f"""
        Act as an expert career advisor for a university student in India.
        The student has the following skills: {skills_list_str}.

        Based ONLY on these skills, provide the following in a valid JSON object format:
        1. A key named "careerDetails" which must be an array of exactly 3 distinct job role suggestions (e.g., "Data Analyst", "Frontend Developer").
        2. Each object in the array must have the following keys, using these exact names:
           - "careerTitle": The name of the career.
           - "reasoning": A brief, encouraging explanation of why this career is a good fit for the student's current skills.
           - "skillsToDevelop": An array of 3 essential skills the student should learn to excel in this role.
           - "learningResources": An array of objects, where each object has a "title" and a "url" for a high-quality, real online resource (like a specific course on Coursera, a tutorial on freeCodeCamp, or official documentation) to learn one of the skills mentioned.

        Do not include any text, markdown formatting like ```json, or explanations outside of the main JSON object. The entire output must be only the JSON object itself.
        """
        
        # We are adding a print statement here for one final debug check
        print("\n--- DEBUG: Sending this prompt to AI ---")
        print(prompt)
        print("----------------------------------------\n")

        try:
            response = model.generate_content(prompt)
            # A more robust way to clean the response
            cleaned_response = response.text.strip().replace("```json", "").replace("```", "")
            guidance_data = json.loads(cleaned_response)
            return Response(guidance_data)
        except Exception as e:
            print(f"ERROR: Failed to get valid JSON from AI. Response was:\n{response.text}")
            return Response({"error": f"Failed to get career guidance from AI. The model may have returned an invalid format. Details: {e}"}, status=500)


#Study group
# --- Add the new StudyGroupViewSet below ---
class StudyGroupViewSet(viewsets.ModelViewSet):
    queryset = StudyGroup.objects.all().order_by('-created_at')
    serializer_class = StudyGroupSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Assign the creator and automatically add them as the first member
        group = serializer.save(creator=self.request.user)
        group.members.add(self.request.user)

    # Custom action to allow a user to join a group
    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        group = self.get_object()
        user = request.user
        if user in group.members.all():
            return Response({'detail': 'You are already a member.'}, status=status.HTTP_400_BAD_REQUEST)
        group.members.add(user)
        return Response({'detail': 'Successfully joined the group.'}, status=status.HTTP_200_OK)

    # Custom action to allow a user to leave a group
    @action(detail=True, methods=['post'])
    def leave(self, request, pk=None):
        group = self.get_object()
        user = request.user
        if user not in group.members.all():
            return Response({'detail': 'You are not a member of this group.'}, status=status.HTTP_400_BAD_REQUEST)
        group.members.remove(user)
        return Response({'detail': 'Successfully left the group.'}, status=status.HTTP_200_OK)

# ... rest of your views ...
