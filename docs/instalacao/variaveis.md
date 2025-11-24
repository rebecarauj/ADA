# Executar o Projeto Localmente

Depois de concluir a instalação, siga os passos abaixo para rodar o ADA em sua máquina.

---

## 1. 🚀 Ative o ambiente virtual

- **Windows**
  ```bash
  venv\Scripts\activate

2. 🗄️ Execute as migrações
python manage.py migrate

3. 🧪 (Opcional) Crie um superusuário
python manage.py createsuperuser

4. ▶️ Inicie o servidor local
python manage.py runserver


O servidor ficará disponível em:

http://127.0.0.1:8000/

5. ❗ Possíveis problemas
Erro	Causa	Solução
ModuleNotFoundError	Ambiente virtual não ativado	Ative o venv
Secret Key inválida	.env faltando	Crie o arquivo .env
Banco ausente	Migrações não rodadas	Executar migrate
Pronto! 🎉

Seu ambiente local está funcionando e você já pode testar o ADA em tempo real.


---

# ✔️ O que você faz agora?

1. Vá para a pasta:  


docs/instalacao/

2. Crie cada arquivo:  
- requisitos.md  
- instalacao.md  
- estrutura.md  
- variaveis.md  
- rodar_local.md  

3. Cole o conteúdo e salve.

4. No navegador (onde o MkDocs está rodando), recarregue — as páginas aparecerão automaticamente no menu lateral.

---

variáveis.md

# Variáveis de Ambiente

O projeto ADA utiliza algumas variáveis de ambiente para configurar a aplicação em diferentes cenários.

---

## 🔐 Variáveis recomendadas

Crie um arquivo `.env` na raiz do projeto com:

```env
DEBUG=True
SECRET_KEY=alterar_para_uma_chave_segura
ALLOWED_HOSTS=127.0.0.1,localhost

📝 Observações

Em produção, DEBUG deve ser False.

Nunca compartilhe sua SECRET_KEY.

Se estiver usando outro banco ou API externa, adicione as variáveis aqui.

📦 Como carregar o .env no Django

Instale o pacote (se ainda não estiver instalado):

pip install python-dotenv


No settings.py:

from dotenv import load_dotenv
load_dotenv()


---
