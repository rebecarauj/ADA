# accounts_app/views.py

from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib import messages
from django.contrib.auth import logout # Importe a função logout do Django
from django.views.decorators.http import require_POST # Importe o decorador require_POST
from cadastro_app.models import Pessoa # Importe o modelo de interesse
from django.http import HttpResponse
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from reportlab.lib.styles import getSampleStyleSheet
import pandas as pd
from reportlab.lib.colors import HexColor

styles = getSampleStyleSheet()
# print(styles.byName.keys()) # Isso vai imprimir todos os nomes de estilos disponíveis

# Função para verificar se o usuário é superusuário ou tem permissão específica
def is_privileged_user(user):
    return user.is_superuser or user.has_perm('cadastro_app.can_manage_cadastro') # Exemplo de permissão customizada

def register(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get('username')
            messages.success(request, f'Conta {username} criada com sucesso! Faça login para continuar.')
            return redirect('accounts_app:login')
    else:
        form = UserCreationForm()
    return render(request, 'accounts_app/register.html', {'form': form})

@login_required # Garante que apenas usuários logados possam acessar
@user_passes_test(is_privileged_user, login_url='/accounts/login/') # Garante que apenas usuários privilegiados possam acessar
def dashboard(request):
    pessoas = Pessoa.objects.all() # Busca todos os cadastros
    return render(request, 'accounts_app/dashboard.html', {'pessoas': pessoas})

@login_required
@user_passes_test(is_privileged_user, login_url='/accounts/login/')
def export_data(request):
    format_type = request.GET.get('format', 'csv') # Pega o formato da URL (default CSV)
    pessoas = Pessoa.objects.all()

    if not pessoas.exists():
        messages.warning(request, "Não há dados de cadastro para exportar.")
        return redirect('accounts_app:dashboard')

    if format_type == 'excel':
        df = pd.DataFrame(list(pessoas.values(
            'id', 'nome', 'email', 'whatsapp',
            'cidade_curso', 'data_cadastro'
        )))

        # PRIMEIRA ETAPA: Formata a coluna de data usando o nome original do campo
        df['data_cadastro'] = df['data_cadastro'].dt.strftime('%d/%m/%Y  %H:%M:%S') # <-- MOVER ESTA LINHA PARA CIMA

        # SEGUNDA ETAPA: Renomeia as colunas, incluindo a data já formatada
        df = df.rename(columns={
            'id': 'ID',
            'nome': 'Nome Completo',
            'email': 'E-mail',
            'whatsapp': 'WhatsApp',
            'cidade_curso': 'Cidade do Curso',
            'data_cadastro': 'Data de Cadastro' # <-- Agora 'data_cadastro' já está formatada antes de ser renomeada
        }) # Mantenha inplace=True se desejar modificar o DF diretamente

        output = BytesIO()
        writer = pd.ExcelWriter(output, engine='xlsxwriter')

        if writer is None:
            print("ERRO: pd.ExcelWriter retornou None. Verifique a instalação do xlsxwriter e a compatibilidade.")
            # Você pode até mesmo raise uma exceção aqui para parar a execução e ver o erro mais claramente.
            # raise ValueError("Falha ao inicializar o ExcelWriter. O writer é None.")
        else:
            print(f"DEBUG: ExcelWriter inicializado com sucesso. Tipo: {type(writer)}")

        df.to_excel(writer, index=False, sheet_name='Cadastros')
        writer.close() # Use writer.close() ou writer.save() dependendo da versão do pandas
        output.seek(0)

        response = HttpResponse(output.read(), content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="cadastros.xlsx"'
        return response

    elif format_type == 'pdf':
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()

        data = [
            ['ID', 'Nome Completo', 'Email', 'Telefone', 'Cidade Curso', 'Data Cadastro']
        ]
        for pessoa in pessoas:
            data.append([
                str(pessoa.id),
                pessoa.nome,
                pessoa.email,
                pessoa.whatsapp,
                pessoa.cidade_curso if hasattr(pessoa, 'cidade_curso') else 'N/A',
                pessoa.data_cadastro.strftime('%d/%m/%Y  %H:%M:%S')
            ])

           # Cria a tabela e define o estilo
        table = Table(data)
        table.setStyle(TableStyle([
            # Estilo para o CABEÇALHO da tabela (primeira linha)
            ('BACKGROUND', (0, 0), (-1, 0), HexColor('#7B3EBC')), # Cor roxa do dashboard
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),          # Texto branco
            ('ALIGN', (0, 0), (-1, 0), 'LEFT'),                    # Alinha o cabeçalho à esquerda (como no HTML)
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),      # Fonte negrito
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),               # Espaçamento inferior

            # Estilo para as LINHAS DE DADOS (do segundo elemento em diante)
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),        # Fundo branco uniforme (sem zebrado)
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),         # Texto preto ou cinza escuro

            # Alinhamento para TODAS as células
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),                   # Alinha todo o conteúdo à esquerda

            # Bordas da grade (mais sutis, se desejar)
            # Para simular o visual sem bordas muito aparentes do HTML:
            ('GRID', (0, 0), (-1, -1), 0.25, colors.lightgrey),    # Borda muito fina e cinza claro
            ('BOX', (0, 0), (-1, -1), 0.5, colors.lightgrey),     # Borda externa um pouco mais visível, mas ainda suave
            # Ou, se quiser remover completamente as bordas de grade e deixar apenas a externa suave:
            # ('BOX', (0, 0), (-1, -1), 0.5, colors.lightgrey), # Apenas borda externa suave
        ]))

        elements = [Paragraph("Relatório de Cadastros de Interesse", styles['Heading1']), table]
        doc.build(elements)
        buffer.seek(0)

        response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="cadastros.pdf"'
        return response

    else:
        messages.error(request, "Formato de exportação inválido.")
        return redirect('accounts_app:dashboard')

@login_required
@user_passes_test(is_privileged_user, login_url='/accounts/login/')
def delete_data(request, pk):
    pessoa = get_object_or_404(Pessoa, pk=pk)
    if request.method == 'POST':
        pessoa.delete()
        messages.success(request, f'Cadastro de {pessoa.nome} excluído com sucesso.')
        return redirect('accounts_app:dashboard')
    return render(request, 'accounts_app/confirm_delete.html', {'pessoa': pessoa})

@require_POST # Garante que esta view só aceita requisições POST
def user_logout(request):
    logout(request)
    messages.info(request, "Você foi desconectado com sucesso.")
    return redirect('accounts_app:login') # Redireciona para a página de login após o logout
