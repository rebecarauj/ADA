# Models (Django)

Os *models* representam as estruturas de dados do sistema. No projeto ADA, eles são responsáveis por armazenar:

- informações relacionadas ao chatbot  
- registros de interação  
- dados auxiliares usados pela API  

---

## 📂 Estrutura Geral

Os models estão localizados em:

ada/models.py


---

## 🧱 Principais Modelos

### 🔹 Exemplo: Registro de Conversas

```python
class ChatMessage(models.Model):
    user_message = models.TextField()
    bot_response = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Chat at {self.created_at}"

Função:
Armazena o histórico de conversas para auditoria, melhoria do chatbot e depuração.

🔹 Exemplo: Intenções do Chatbot
class Intent(models.Model):
    name = models.CharField(max_length=100)
    keywords = models.TextField()
    response = models.TextField()

    def __str__(self):
        return self.name
    
Função:
Mapeia intenções simples com palavras-chave e respostas pré-definidas.

📝 Boas práticas aplicadas

Uso de auto_now_add=True para rastrear datas automaticamente.

__str__() implementado para melhorar a visualização no admin.

Direcionamento dos dados para futuras análises de uso.

📌 Resumo

Os models do ADA são simples e focados em:

registrar interações

gerenciar intenções

manter dados estruturados e fáceis de consultar

Essa leveza torna o chatbot rápido e fácil de manter.