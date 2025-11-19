# # chatbot_project/urls.py

# from django.contrib import admin
# from django.urls import path, include
# # from cadastro_app.views import cadastro_pessoa, cadastro_sucesso

# urlpatterns = [
#     path('admin/', admin.site.urls),
#     path('chat/', include('chatbot_app.urls'), name='chat'), # <--- Esta linha é crucial!
#     path('cadastro/', include('cadastro_app.urls')),
#     path('accounts/', include('accounts_app.urls')),  # URLs do app de contas
# ]

# chatbot_project/urls.py

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static # <-- Certifique-se de que 'static' está importado

urlpatterns = [
    path('admin/', admin.site.urls),
    path('chat/', include('chatbot_app.urls')),
    path('cadastro/', include('cadastro_app.urls')),
    path('accounts/', include('accounts_app.urls')),
]

# ESTE BLOCO É CRUCIAL PARA SERVIR FICHEIROS DE MÍDIA EM DESENVOLVIMENTO
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
