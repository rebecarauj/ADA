Procedimento

1 - primeiro clone em seu computador o projeto "TESTES"

2 - abra o terminal do VS Code e crie uma variável de ambiente com o comando abaixo para funcionar a api da openai:
$env:OPENAI_API_KEY='sua_chave_da_openai_aqui'

3 - inicie o ambiente virtual:
.\venv\Scripts\activate

4 - rode o servidor do django:
python manage.py runserver

5 - abra o navegador e cole o caminho abaixo:
http://127.0.0.1:8000/chat/

AGORA É SÓ TESTAR O CHATBOT ADA!

feature/audio