# cadastro_app/views.py

from django.shortcuts import render, redirect
from django.contrib import messages
from .forms import PessoaForm

def cadastro_pessoa(request):
    if request.method == 'POST':
        form = PessoaForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Cadastro de interesse efetuado com sucesso!')
            return redirect('cadastro_app:cadastro_sucesso') # Redirecionar para uma página de sucesso
    else:
        form = PessoaForm()
    return render(request, 'cadastro_app/cadastro_form.html', {'form': form})

def cadastro_sucesso(request):
    return render(request, 'cadastro_app/cadastro_sucesso.html')