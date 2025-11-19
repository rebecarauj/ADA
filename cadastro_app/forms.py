# File: cadastro_app/forms.py

import re
from django import forms
from .models import Pessoa

CIDADES_SC = [
    ('', 'Selecione a cidade'),
    ('Araranguá', 'Araranguá'),
    ('Blumenau', 'Blumenau'),
    ('Biguaçu', 'Biguaçu'),
    ('Brusque', 'Brusque'),
    ('Caçador', 'Caçador'),
    ('Canoinhas', 'Canoinhas'),
    ('Chapecó', 'Chapecó'),
    ('Concórdia', 'Concórdia'),
    ('Criciúma', 'Criciúma'),
    ('Curitibanos', 'Curitibanos'),
    ('Florianópolis', 'Florianópolis'),
    ('Fraiburgo', 'Fraiburgo'),
    ('Jaraguá do Sul', 'Jaraguá do Sul'),
    ('Joaçaba', 'Joaçaba'),
    ('Joinville', 'Joinville'),
    ('Lages', 'Lages'),
    ('Palhoça', 'Palhoça'),
    ('Rio do Sul', 'Rio do Sul'),
    ('São Miguel do Oeste', 'São Miguel do Oeste'),
    ('Tubarão', 'Tubarão'),
    ('Videira', 'Videira'),
    ('Xanxerê', 'Xanxerê'),
]

class PessoaForm(forms.ModelForm):
    cidade_curso = forms.ChoiceField(
        choices=CIDADES_SC,
        required=True,
        label="Cidade do curso",
        widget=forms.Select(attrs={'required': True})
    )

    class Meta:
        model = Pessoa
        fields = ['nome', 'cpf', 'whatsapp', 'email', 'cidade_curso']
        widgets = {
            'nome': forms.TextInput(attrs={
                'placeholder': 'Seu nome completo',
                'pattern': '^([A-Za-zÀ-ÿ]+(?: [A-Za-zÀ-ÿ]+)*)$',
                'title': 'Use apenas letras e espaços (sem números ou símbolos)',
                'maxlength': '100',
                'required': True,
            }),
            'cpf': forms.TextInput(attrs={
                'placeholder': '000.000.000-00',
                'data-mask': '000.000.000-00',
                'maxlength': '14',
                'required': True,
            }),
            'whatsapp': forms.TextInput(attrs={
                'placeholder': '(48) 9XXXX-XXXX',
                'data-mask': '(00) 00000-0000',
                'maxlength': '15',
                'required': True,
            }),
            'email': forms.EmailInput(attrs={
                'placeholder': 'seu.email@example.com',
                'autocomplete': 'email',
                'required': True,
            }),
        }

    def clean_cpf(self):
        cpf = self.cleaned_data.get('cpf')

        # Verifica o formato 000.000.000-00
        if not re.fullmatch(r'\d{3}\.\d{3}\.\d{3}-\d{2}', cpf):
            raise forms.ValidationError("CPF inválido. Use o formato 000.000.000-00.")

        # Remove pontuação
        numbers = re.sub(r'\D', '', cpf)

        # Verifica se todos os dígitos são iguais
        if numbers == numbers[0] * 11:
            raise forms.ValidationError("CPF inválido. Dígitos repetidos não são válidos.")

        # Cálculo dos dígitos verificadores
        def calc_dv(digs):
            soma = sum(int(d) * w for d, w in zip(digs, range(len(digs)+1, 1, -1)))
            resto = soma % 11
            return '0' if resto < 2 else str(11 - resto)

        dv1 = calc_dv(numbers[:9])
        dv2 = calc_dv(numbers[:9] + dv1)

        if numbers[-2:] != dv1 + dv2:
            raise forms.ValidationError("CPF inválido. Dígitos verificadores incorretos.")

        return cpf

    def clean_whatsapp(self):
        whatsapp = self.cleaned_data.get('whatsapp')

        # Verifica formato: (48) 99999-9999
        if not re.fullmatch(r'\(\d{2}\) \d{5}-\d{4}', whatsapp):
            raise forms.ValidationError("WhatsApp inválido. Use o formato (48) 91234-5678.")

        ddd = whatsapp[1:3]

        if ddd not in ['47', '48', '49']:
            raise forms.ValidationError("DDD inválido. Use um número com DDD de Santa Catarina (47, 48 ou 49).")

        return whatsapp
