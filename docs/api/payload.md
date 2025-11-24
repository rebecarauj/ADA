# Payloads da API

Abaixo estão os formatos padrão enviados e recebidos.

---

## **1. Login**
### Envio:
```json
{
  "email": "usuario@exemplo.com",
  "senha": "123456"
}
Retorno:


{
  "status": "ok",
  "token": "..."
}
2. Chatbot
Envio:


{
  "mensagem": "Como faço minha matrícula?"
}
Retorno:


{
  "resposta": "Para realizar sua matrícula..."
}
