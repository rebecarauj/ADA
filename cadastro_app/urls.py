# #
# from django.urls import path
# from . import views
# from django.urls import include


# urlpatterns = [
#     path('cadastro/', views.cadastro_pessoa, name='cadastro_pessoa'),
#     path('sucesso/', views.cadastro_sucesso, name='cadastro_sucesso'),
#     path('chat/', include('chatbot_app.urls'), name='chat')  # Inclui as URLs do chatbot
# ]

# cadastro_app/urls.py

from django.urls import path
from . import views

app_name = 'cadastro_app' # Define um namespace para as URLs do app

urlpatterns = [
    path('', views.cadastro_pessoa, name='cadastro_pessoa'),
    path('sucesso/', views.cadastro_sucesso, name='cadastro_sucesso'),
]