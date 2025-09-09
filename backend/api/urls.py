from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RegisterView,
    UserView,
    ResumeViewSet,
    CertificateViewSet,
    SkillViewSet,
    UserSkillViewSet,
    DashboardDataView,  # Optional: include if you want a dashboard endpoint
    JobListingViewSet,
    InterviewQuestionViewSet,
    CareerGuidanceView,FaceRegistrationView, FaceLoginView, StudyGroupViewSet
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

# Create router and register viewsets
router = DefaultRouter()
router.register(r'resume', ResumeViewSet, basename='resume')
router.register(r'certificates', CertificateViewSet, basename='certificate')
router.register(r'skills', SkillViewSet, basename='skill')
router.register(r'user-skills', UserSkillViewSet, basename='user-skill')
router.register(r'job-listings', JobListingViewSet, basename='joblisting')
router.register(r'interview-questions', InterviewQuestionViewSet, basename='interviewquestion')
router.register(r'study-groups', StudyGroupViewSet, basename='studygroup')



# URL patterns
urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('user/', UserView.as_view(), name='user'),
    path('dashboard/', DashboardDataView.as_view(), name='dashboard-data'),  # Optional
    path('career-guidance/', CareerGuidanceView.as_view(), name='career-guidance'),
    path('face-register/', FaceRegistrationView.as_view(), name='face-register'),
    path('face-login/', FaceLoginView.as_view(), name='face-login'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('', include(router.urls)),
]
