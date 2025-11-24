# Estrutura de Pastas do Projeto

A seguir está uma visão geral da estrutura do repositório ADA e a função de cada diretório.

---

## 📂 Estrutura Geral



ADA/
├── ada/ # Aplicação principal do Django
│ ├── settings.py # Configurações do projeto
│ ├── urls.py # URLs globais
│ ├── wsgi.py # Interface WSGI
│ └── asgi.py # Interface ASGI
│
├── api/ # API utilizada pelo chatbot
│ ├── urls.py
│ └── views.py
│
├── chatbot/ # Lógica e base de conhecimento do bot
│ ├── intents/ # Arquivos de intenções
│ ├── processor.py # Processamento das mensagens
│ └── responses.py # Respostas automáticas
│
├── frontend/ # Templates e arquivos estáticos
│
├── db.sqlite3 # Banco de dados padrão
├── manage.py
└── requirements.txt


---

## 📝 Descrição das principais partes

- **ada/** → núcleo do projeto Django  
- **api/** → endpoints REST usados para comunicação com o chatbot  
- **chatbot/** → regras de decisão, fluxo e respostas  
- **frontend/** → parte visual integrada ao site  
- **requirements.txt** → dependências Python  
- **manage.py** → utilitário principal para comandos Django  

---
