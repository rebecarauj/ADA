from django.db import models

class Pessoa(models.Model):
    nome = models.CharField(max_length=100)
    cpf = models.CharField(max_length=14, unique=True)
    whatsapp = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(unique=True)
    cidade_curso = models.CharField(max_length=100)
    data_cadastro = models.DateTimeField(auto_now_add=True)


    def __str__(self):
        return self.nome