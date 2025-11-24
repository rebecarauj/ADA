# Templates (HTML + Django Templates)

A interface do chatbot e parte do frontend do projeto são construídos usando **Django Templates**, permitindo:

- integração com componentes dinâmicos  
- uso de variáveis do backend  
- criação de páginas leves e acessíveis  

---

## 📍 Localização

frontend/templates/
chatbot/templates/



---

## 🖼️ Exemplo: Template do chatbot

```html
<div id="chat-container">
    <div id="messages"></div>

    <form method="POST" id="chat-form">
        {% csrf_token %}
        <input type="text" name="message" placeholder="Digite sua dúvida..." required>
        <button type="submit">Enviar</button>
    </form>
</div>
🎨 Estilos
Os estilos são carregados via:


frontend/static/css/
💬 Fluxo
Usuário envia mensagem

Página envia POST → view

View processa → chatbot

Resposta volta em JSON

JavaScript renderiza no chat

📌 Resumo
Os templates permitem uma interface integrada ao visual do SENAC, garantindo:

acessibilidade

leveza

compatibilidade

fácil manutenção



---
