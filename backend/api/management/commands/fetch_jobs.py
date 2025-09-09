import requests
from django.core.management.base import BaseCommand
from api.models import JobListing
from django.conf import settings # Good practice to keep keys out of code

# --- IMPORTANT ---
# It's better to store your API key in your project's settings or environment variables.
# For simplicity in this step, we are placing it here.
# Replace 'YOUR_RAPIDAPI_KEY' with the actual key you got from RapidAPI.
RAPIDAPI_KEY = 'fbc04055a7mshae80bb1545e739dp1d98ddjsn691ba5fb17f8' 

class Command(BaseCommand):
    help = 'Fetches job listings from the JSearch API and saves them to the database'

    def handle(self, *args, **options):
        self.stdout.write('Starting to fetch job listings...')

        api_url = "https://jsearch.p.rapidapi.com/search?query=developer%20jobs%20in%20chicago&page=1&num_pages=1&country=us&date_posted=all"
        
        # We'll search for software internships in India
        querystring = {"query": "Software developer intern in India", "num_pages": "1"}
        
        headers = {
            "X-RapidAPI-Key": RAPIDAPI_KEY,
            "X-RapidAPI-Host": "jsearch.p.rapidapi.com"
        }

        try:
            response = requests.get(api_url, headers=headers, params=querystring)
            response.raise_for_status() # Raises an error for bad responses (4xx or 5xx)
            
            jobs_data = response.json().get('data', [])
            
            if not jobs_data:
                self.stdout.write(self.style.WARNING('No jobs found in the API response.'))
                return

            jobs_saved = 0
            for job in jobs_data:
                # Use update_or_create to avoid creating duplicate jobs.
                # It tries to find a job with the same job_id, and if it exists, updates it.
                # If not, it creates a new one.
                job_listing, created = JobListing.objects.update_or_create(
                    # Use a unique field from the API as a key
                    application_url=job.get('job_apply_link', 'N/A'),
                    defaults={
                        'title': job.get('job_title', 'No Title Provided'),
                        'company_name': job.get('employer_name', 'N/A'),
                        'location': job.get('job_city', 'N/A') + ", " + job.get('job_country', 'N/A'),
                        'description': job.get('job_description', 'No Description Provided'),
                        'job_type': job.get('job_employment_type', 'Full-time').title()
                    }
                )

                if created:
                    jobs_saved += 1
            
            self.stdout.write(self.style.SUCCESS(f'Successfully fetched and saved {jobs_saved} new job listings.'))

        except requests.exceptions.RequestException as e:
            self.stdout.write(self.style.ERROR(f'An error occurred: {e}'))
