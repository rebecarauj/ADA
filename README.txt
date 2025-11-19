Passo a passo para configurar e executar o projeto em um novo ambiente:

1. Clonar o repositório:
   - Abra o terminal ou prompt de comando.
   - Execute o comando: git clone https://github.com/renatoteodoro/ADA.git
   - Navegue para o diretório do projeto: cd ADA

2. Verificar a instalação do Python:
   - Certifique-se de que o Python 3.8 ou superior está instalado.
   - Verifique com: python --version

3. Criar um ambiente virtual (recomendado):
   - Execute: python -m venv venv
   - Ative o ambiente virtual:
     - No Windows: venv\Scripts\activate
     - No Linux/Mac: source venv/bin/activate

4. Instalar as dependências:
   - Execute: pip install -r requirements.txt
   - Isso instalará todas as bibliotecas necessárias, incluindo Django 5.2.4 e outras dependências.

5. Configurar o banco de dados:
   - Execute as migrações: python manage.py migrate
   - Isso criará as tabelas no banco de dados SQLite (configurado por padrão).

6. Coletar arquivos estáticos (opcional, mas recomendado para produção):
   - Execute: python manage.py collectstatic

7. Executar o servidor de desenvolvimento:
   - Execute: python manage.py runserver
   - O servidor será iniciado em http://127.0.0.1:8000/
   - Abra o navegador e acesse o endereço para ver a aplicação.

Notas:
- O projeto está configurado para o idioma português do Brasil (pt-br) e fuso horário America/Sao_Paulo.
- Para parar o servidor, pressione Ctrl+C no terminal.
- Se houver problemas com permissões no Windows, execute o prompt como administrador.