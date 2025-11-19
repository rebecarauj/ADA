# accounts_app/urls.py
from django.urls import path
from . import views
from django.contrib.auth import views as auth_views # Importa as views de autenticação padrão do Django

app_name = 'accounts_app' # Namespace para suas URLs

urlpatterns = [
    # URLs de autenticação padrão do Django
    path('login/', auth_views.LoginView.as_view(template_name='accounts_app/login.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(next_page='accounts_app:login'), name='logout'),
    path('register/', views.register, name='register'),
    path('dashboard/', views.dashboard, name='dashboard'), # Área restrita para usuários logados
    path('export_data/', views.export_data, name='export_data'), # Nova view para exportação
    path('delete_data/<int:pk>/', views.delete_data, name='delete_data'), # Nova view para deletar
]


# # accounts_app/urls.py
# from django.urls import path
# from django.contrib.auth import views as auth_views # Se você estiver usando as views de autenticação padrão do Django
# from . import views

# app_name = 'accounts_app'

# urlpatterns = [
#     path('register/', views.register, name='register'),
#     path('login/', auth_views.LoginView.as_view(template_name='accounts_app/login.html'), name='login'),
#     path('logout/', views.user_logout, name='logout'), # Adicione esta linha
#     path('dashboard/', views.dashboard, name='dashboard'),
#     path('export/', views.export_data, name='export_data'),
#     path('delete/<int:pk>/', views.delete_data, name='delete_data'),
# ]