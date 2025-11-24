# Fluxo de Funcionamento do Chatbot ADA

Este documento explica o fluxo completo desde a pergunta do usuário até a resposta exibida na interface.

---

# 📥 1. Entrada do Usuário

O usuário digita uma pergunta no campo de texto da interface.  
Exemplo:

"Quais cursos o programa oferece?"


Essa mensagem é enviada via **POST** para a view principal do chatbot.

---

# 🔄 2. Processamento na View

A view recebe a pergunta e envia para o módulo responsável por identificar:

- qual é a intenção?  
- qual resposta corresponde?  

Essa etapa acessa a **lógica do bot**.

---

# 🧠 3. Identificação da Intenção

O sistema usa:

- listas de palavras-chave
- regras simples
- mapeamento de perguntas → respostas

Exemplo:

Se a pergunta contém "curso" → intenção = cursos


---

# 📚 4. Base de Conhecimento

Cada intenção tem respostas pré-definidas no código.  
A lógica retorna a resposta correspondente.

---

# 📤 5. Retorno da Resposta

A view envia a resposta para o template, que exibe:

- mensagem do usuário  
- resposta do bot  
- histórico da conversa  

---

# 📊 Fluxo Visual

[Usuário]
↓
[Formulário HTML]
↓
[View Django]
↓
[Lógica do Chatbot]
↓
[Base de Conhecimento]
↓
[Resposta]
↓
[Template]
↓
[Usuário vê a mensagem]


---

# ✔ Benefícios do Fluxo Simples

- Fácil de acompanhar  
- Fácil de editar  
- Baixa probabilidade de falhas  
- Entendimento rápido por novos desenvolvedores 