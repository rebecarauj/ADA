# chatbot_app/urls.py

from django.urls import path
from . import views

app_name = 'chatbot_app'

urlpatterns = [
    path('', views.chatbot_view, name='chatbot_view'),
    path('voice-prompt-audio/', views.get_voice_prompt_audio, name='get_voice_prompt_audio'),
]