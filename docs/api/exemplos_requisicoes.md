# Endpoints da API

Esta seção documenta os principais endpoints expostos pelo backend.

---

## **1. /login/**
Autentica o usuário.

**Método:** POST  
**Retorno:** Token ou mensagem de erro.

---

## **2. /cadastro/**
Cria um novo usuário.

**Método:** POST

---

## **3. /chatbot/**
Processa mensagens enviadas ao chatbot.

**Método:** POST  
**Body:** `{ "mensagem": "..." }`  
**Retorno:** `{ "resposta": "..." }`