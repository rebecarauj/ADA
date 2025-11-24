# Deploy em Produção

---

## **1. Ambiente Requerido**
- Python 3.10+
- Servidor com acesso SSH
- uWSGI ou Gunicorn
- Nginx para proxy reverso

---

## **2. Instalar dependências**
```bash
pip install -r requirements.txt
3. Configurar variáveis de ambiente
SECRET_KEY

DEBUG=False

ALLOWED_HOSTS

4. Coletar arquivos estáticos
python manage.py collectstatic

5. Rodar com uWSGI
uwsgi --ini uwsgi.ini

6. Configurar Nginx
Fazer proxy para a porta usada pelo uWSGI.

7. Reiniciar serviços
Após cada atualização.
