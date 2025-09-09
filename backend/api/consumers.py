import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import StudyGroup, ChatMessage
from django.contrib.auth.models import AnonymousUser

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.group_id = self.scope['url_route']['kwargs']['group_id']
        self.group_name = f'chat_{self.group_id}'
        self.user = self.scope['user']

        # Reject connection if user is not authenticated
        if self.user.is_anonymous:
            await self.close()
        else:
            # Join the group
            await self.channel_layer.group_add(
                self.group_name,
                self.channel_name
            )
            await self.accept()

    async def disconnect(self, close_code):
        # Leave the group
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data.get('message', '').strip()

        if message:
            # Save the message to DB
            chat_message = await self.save_message(message)

            # Broadcast to group
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'chat_message',
                    'message': chat_message.message,
                    'username': self.user.username,
                    'timestamp': chat_message.timestamp.isoformat(),  # ISO format for frontend
                }
            )

    async def chat_message(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'username': event['username'],
            'timestamp': event['timestamp'],
        }))

    @database_sync_to_async
    def save_message(self, message):
        try:
            group = StudyGroup.objects.get(id=self.group_id)
            return ChatMessage.objects.create(
                group=group,
                user=self.user,
                message=message
            )
        except StudyGroup.DoesNotExist:
            # Handle the case where group doesn't exist
            raise ValueError(f"StudyGroup with id {self.group_id} does not exist.")
