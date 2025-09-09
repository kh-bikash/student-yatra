import os
import django
from django.core.asgi import get_asgi_application

# CRITICAL: This block of code MUST come first, before any other imports
# that rely on Django (like your api.routing or api.middleware).
# This sets up the environment and initializes Django's settings.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'student_yatra.settings')
django.setup()

# Now that Django is fully configured and ready, we can safely import
# the Channels components and our application's routing.
from channels.routing import ProtocolTypeRouter, URLRouter
from api.middleware import TokenAuthMiddleware
import api.routing

application = ProtocolTypeRouter({
    # Handles standard HTTP requests using Django's normal views.
    "http": get_asgi_application(),
    
    # Handles WebSocket connections, authenticating with our custom middleware.
    "websocket": TokenAuthMiddleware(
        URLRouter(
            api.routing.websocket_urlpatterns
        )
    ),
})