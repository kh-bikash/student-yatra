from django.contrib import admin
from .models import Skill, UserSkill, Certificate, Resume,JobListing, InterviewQuestion, UserProfile, StudyGroup

# Register your models here so you can manage them in the admin panel.
admin.site.register(Skill)
admin.site.register(UserSkill)
admin.site.register(Certificate)
admin.site.register(Resume)
admin.site.register(JobListing) # Register the new model
admin.site.register(InterviewQuestion) # Register the new model
admin.site.register(UserProfile) # Register the new model
admin.site.register(StudyGroup)