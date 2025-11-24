# URLs (Django)

As *URLs* definem como as rotas são organizadas no projeto e como cada endpoint é acessado.

---

## 📍 Localização

ada/urls.py → rotas principais
api/urls.py → rotas da API
chatbot/urls.py → rotas relacionadas ao chatbot


---

## 🌐 Exemplo: URL principal

```python
urlpatterns = [
    path("", views.home, name="home"),
    path("chatbot/", include("chatbot.urls")),
    path("api/", include("api.urls")),
    path("admin/", admin.site.urls),
]
🤖 Rotas do Chatbot


urlpatterns = [
    path("", chatbot_view, name="chatbot"),
]
🛰️ Rotas da API


urlpatterns = [
    path("message/", ChatbotAPI.as_view(), name="api_message"),
]
📌 Resumo
O projeto segue uma estrutura limpa e moderna:

FLow claro: / → frontend, /chatbot/ → bot, /api/ → integrações

Agrupamento por apps

Uso de include() para modularizar

# Views (Django)

As *views* são responsáveis por receber requisições, processar dados e retornar respostas ao usuário ou ao chatbot.

No projeto ADA, as views são divididas em:

- **Views tradicionais (renderização de templates)**  
- **Views usadas pela API**  
- **Views específicas do fluxo do chatbot**

---

## 📍 Localização

ada/views.py
api/views.py
chatbot/processor.py


---

## 🧠 Exemplo: View principal do chatbot

```python
def chatbot_view(request):
    if request.method == "POST":
        user_text = request.POST.get("message")
        response = process_message(user_text)
        return JsonResponse({"response": response})

    return render(request, "chatbot/index.html")
Função:

recebe mensagem do usuário

envia para o mecanismo do chatbot

retorna resposta via JSON

✨ Exemplo: View da APIpython

class ChatbotAPI(APIView):
    def post(self, request):
        message = request.data.get("message")
        response = process_message(message)
        return Response({"reply": response})
Função:
Permite comunicação externa com o chatbot via requisições HTTP.

⭐ Boas práticas aplicadas
Separação entre views do Django e da API

Respostas padronizadas

Delegação da lógica para módulos específicos

📌 Resumo
As views do projeto são simples, diretas e delegam ao core do chatbot toda a lógica inteligente, mantendo o código organizado e limpo.