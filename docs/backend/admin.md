# Admin (Django)

O Django Admin é utilizado no projeto ADA para:

- visualizar registros de conversas  
- gerenciar intenções  
- editar respostas fixas  
- facilitar testes internos do comportamento do chatbot  

---

## 📍 Localização das configurações

ada/admin.py


---

## 📝 Exemplo de registro de models no admin

```python
from django.contrib import admin
from .models import Intent, ChatMessage

admin.site.register(Intent)
admin.site.register(ChatMessage)
🎛️ Personalização recomendada
Para exibição mais profissional:


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ("user_message", "bot_response", "created_at")
    search_fields = ("user_message",)
🔐 Acesso
Crie um superusuário:



python manage.py createsuperuser
Acesse:


http://127.0.0.1:8000/admin/
📌 Resumo
O admin é uma ferramenta essencial do ADA para:

depurar respostas

revisar histórico

ajustar intenções

validar funcionamento do bot**admin.md**

```markdown
# Admin (Django)

O Django Admin é utilizado no projeto ADA para:

- visualizar registros de conversas  
- gerenciar intenções  
- editar respostas fixas  
- facilitar testes internos do comportamento do chatbot  

---

## 📍 Localização das configurações

ada/admin.py



---

## 📝 Exemplo de registro de models no admin

```python
from django.contrib import admin
from .models import Intent, ChatMessage

admin.site.register(Intent)
admin.site.register(ChatMessage)
🎛️ Personalização recomendada
Para exibição mais profissional:


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ("user_message", "bot_response", "created_at")
    search_fields = ("user_message",)
🔐 Acesso
Crie um superusuário:


python manage.py createsuperuser
Acesse:


http://127.0.0.1:8000/admin/
📌 Resumo
O admin é uma ferramenta essencial do ADA para:

depurar respostas

revisar histórico

ajustar intenções

validar funcionamento do bot
