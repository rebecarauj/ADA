# Arquitetura do Projeto

Este documento apresenta a arquitetura geral do projeto **ADA** e como seus módulos se conectam para formar o chatbot funcional.

---

# 🏗 Arquitetura Geral

O projeto segue a estrutura padrão do Django:

ADA/
├── chatbot_project/ # Projeto Django principal
├── chatbot_app/ # App onde a lógica do chatbot está
├── static/ # Arquivos estáticos (CSS, JS, imagens)
├── templates/ # Interface do chatbot
├── requirements.txt
├── manage.py


---

# 🔧 Componentes Principais

### **1. Django Project (`chatbot_project/`)**
Contém configurações globais:

- `settings.py`
- `urls.py`
- `wsgi.py`
- `asgi.py`

Define:
- apps instalados
- templates
- caminhos estáticos
- configuração do Django

---

### **2. App do Chatbot (`chatbot_app/`)**

Aqui vive a lógica do chatbot:

- mapeamento de intenções  
- funções de resposta  
- view principal  
- rotas do chatbot  
- base de conhecimento  

É o coração do ADA.

---

### **3. Templates (`templates/`)**

Contém as páginas HTML utilizadas para exibir:

- campo de mensagem  
- mensagens do bot  
- respostas na interface  

---

### **4. Static (`static/`)**

Arquivos visuais e scripts:

- CSS  
- JavaScript  
- Imagens  
- Ícones  

---

# 🔌 Fluxo de Funcionamento

1. Usuário envia uma pergunta pelo formulário  
2. Django recebe a mensagem via view  
3. A lógica do bot analisa o texto  
4. O bot identifica a intenção  
5. Uma resposta da base de conhecimento é selecionada  
6. A view retorna para o template  
7. O usuário vê a resposta na interface

---

# 📊 Diagrama Simplificado

Usuário → View → Lógica do Chatbot → Base de Conhecimento → Resposta → Template


---

# 🚀 Extensibilidade

A arquitetura foi pensada para ser simples de manter:

- adicionar novas intenções  
- criar novas respostas  
- melhorar o template  
- converter para API futuramente  