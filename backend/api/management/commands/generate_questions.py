import google.generativeai as genai
import json
from django.core.management.base import BaseCommand
from api.models import Skill, InterviewQuestion

# --- IMPORTANT ---
# Replace 'YOUR_GEMINI_API_KEY' with the actual key you got from Google AI Studio.
GEMINI_API_KEY = 'AIzaSyAhYXTljEnPdacmekNgtUQGWysS63I9Fio'

class Command(BaseCommand):
    help = 'Generates interview questions for existing skills using the Gemini API'

    def handle(self, *args, **options):
        try:
            genai.configure(api_key=GEMINI_API_KEY)
            model = genai.GenerativeModel('gemini-1.5-flash-002')
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Failed to configure Generative AI: {e}'))
            return

        skills = Skill.objects.all()
        if not skills.exists():
            self.stdout.write(self.style.WARNING('No skills found in the database. Please add skills first.'))
            return

        self.stdout.write(f'Found {skills.count()} skills. Generating questions...')

        for skill in skills:
            self.stdout.write(f"--- Generating for skill: {skill.name} ---")

            # Check if questions already exist for this skill to avoid re-generating
            if InterviewQuestion.objects.filter(skill=skill).exists():
                self.stdout.write(self.style.NOTICE(f'Questions already exist for {skill.name}. Skipping.'))
                continue

            prompt = f"""
            Generate 5 interview questions for a '{skill.name}' role.
            The questions should be of varying difficulty (at least one Easy, one Medium, and one Hard).
            For each question, provide a concise but comprehensive answer.
            Format the output as a valid JSON array of objects. Each object must have three keys: "question_text", "answer_text", and "difficulty" (with values "Easy", "Medium", or "Hard").
            Do not include any text or formatting outside of the JSON array.
            """

            try:
                response = model.generate_content(prompt)
                
                # Clean the response to ensure it's valid JSON
                cleaned_response = response.text.strip().lstrip('```json').rstrip('```')
                
                questions_data = json.loads(cleaned_response)

                questions_saved = 0
                for q_data in questions_data:
                    # Use get_or_create to avoid duplicates
                    question, created = InterviewQuestion.objects.get_or_create(
                        skill=skill,
                        question_text=q_data.get('question_text'),
                        defaults={
                            'answer_text': q_data.get('answer_text'),
                            'difficulty': q_data.get('difficulty', 'Medium')
                        }
                    )
                    if created:
                        questions_saved += 1
                
                self.stdout.write(self.style.SUCCESS(f'Successfully saved {questions_saved} new questions for {skill.name}.'))

            except json.JSONDecodeError:
                self.stdout.write(self.style.ERROR(f'Failed to parse JSON for skill {skill.name}. Response was: {cleaned_response}'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'An error occurred for skill {skill.name}: {e}'))
