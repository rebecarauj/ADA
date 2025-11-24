# Lógica do Chatbot

Esta seção descreve como o chatbot funciona internamente no projeto.

---

## **1. Arquitetura Geral**
O chatbot foi implementado como um módulo Django dentro de `chatbot_app/`.

Ele contém:
- funções de processamento da mensagem
- carregamento da base de conhecimento
- lógica de seleção de resposta
- integração com templates front-end

---

## **2. Fluxo Geral**
1. Usuário envia uma mensagem via HTML / JS.
2. A view recebe a mensagem e chama o módulo de processamento.
3. O processamento identifica:
   - intenção
   - palavras-chave
   - categoria da pergunta
4. A resposta é montada e enviada ao usuário.

---

## **3. Processamento**
O código faz:
- sanitização da entrada
- busca por termos-chave
- comparação com base de conhecimento (FAQ estruturada)
- fallback caso não encontre resultados

---

## **4. Templates**
Os templates HTML formatam o chat em tempo real.

---

## **5. Objetivo**
Criar um chatbot simples, rápido e acessível para orientar usuários no sistema.
