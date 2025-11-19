
from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
import json
import os
import uuid
from django.conf import settings
from asgiref.sync import sync_to_async
from .utils import scrape_jovemprogramador_playwright
from .services import get_openai_response, transcribe_audio, generate_audio_from_text
from .models import Message

@csrf_exempt
async def chatbot_view(request):
    session_id = request.session.session_key
    if not session_id:
        await sync_to_async(request.session.save)()
        session_id = request.session.session_key

    if request.method == 'POST':
        user_message_text = ""
        response_audio_url = None

        try:
            if 'audio' in request.FILES:
                audio_file = request.FILES['audio']
                temp_audio_filename = f"temp_user_audio_{uuid.uuid4()}.{audio_file.name.split('.')[-1]}"
                temp_audio_path = os.path.join(settings.MEDIA_ROOT, temp_audio_filename)

                os.makedirs(settings.MEDIA_ROOT, exist_ok=True)

                with open(temp_audio_path, 'wb+') as destination:
                    for chunk in audio_file.chunks():
                        destination.write(chunk)

                transcription_result = await sync_to_async(transcribe_audio)(temp_audio_path)
                os.remove(temp_audio_path)

                if transcription_result:
                    user_message_text = transcription_result
                    print(f"Áudio transcrito: {user_message_text}")
                else:
                    return JsonResponse({'error': 'Falha na transcrição do áudio.'}, status=500)

            elif 'message' in request.POST:
                user_message_text = request.POST.get('message', '').lower()
            else:
                data = json.loads(request.body)
                user_message_text = data.get('message', '').lower()

            if not user_message_text:
                return JsonResponse({'error': 'Nenhuma mensagem de texto ou áudio válida fornecida.'}, status=400)

            await sync_to_async(Message.objects.create)(
                session_id=session_id,
                sender='user',
                text=user_message_text
            )
            print(f"Mensagem do usuário salva: {user_message_text}")

            # Obter histórico de mensagens
            messages_history = await sync_to_async(list)(
                Message.objects.filter(session_id=session_id).order_by('timestamp')
            )

            # Formatar histórico para a API
            history_for_api = []
            for msg in messages_history:
                role = "assistant" if msg.sender == "bot" else "user"
                history_for_api.append({"role": role, "content": msg.text})

            bot_response_text = ""

            # 1. Prioridade: Perguntas sobre a criação/hackaton (resposta fixa)
            hackaton_keywords = ['quem te criou', 'quem te fez', 'quem lhe criou', 'projeto hackaton', 'projeto do hackaton senac', 'equipe', 'time', 'desenvolvedor', 'desenvolvedores', 'criada por', 'protótipo']
            hackaton_keywords1 = ['quais os patrocinadores?' ]
            hackaton_keywords2 = ['quais os parceiros?']
            hackaton_keywords3 = ['quais os apoiadores?']
            hackaton_keywords4 = ['em que linguagem você foi desenvolvida?']
            
            if any(keyword in user_message_text for keyword in hackaton_keywords):
                bot_response_text = (
                    "Fui desenvolvida pela equipe Python Rangers, sou um projeto para o Hackaton 2025!"
                    "A equipe é formada pelos alunos do curso Jovem Programador do Senac de Palhoça/SC: "
                    "Renato Teodoro, Matheus Moraes, Hudson Franco, Gustavo Lohn e Vinícius Costa. "
                    "Professora: Karina Fernandes. Coordenador: Vlademir Machado. Gestor de Núcleo: Cleber Rodrigues. Diretora: Renata Scheidt"
                )

            elif any(keyword in user_message_text for keyword in hackaton_keywords4):
                bot_response_text = (
                    
                    "Fui desenvolvida na linguagem Python, utilizando o framework Django para futuras ampliações! Para a parte de IA, estou usando o OpenAI gpt-4o-mini (ChatGPT). Para que eu possa raspar o site Jovem Programador, utilizo o Playwright. Para armazenar as mensagens e raspagens, estou usando o banco de dados SQLite. Tenho algumas funções de áudio, como transcrição de áudio e geração de áudio a partir de texto, usando a API Whisper e Text-to-Speech da OpenAI. Fui pensada em acessibilidade, então tenho suporte para Libras e audiodescrição. Fui desenvolvida com muito carinho pela equipe Python Rangers do Senac de Palhoça/SC!"
                )

            #Perguntas sobre a identidade geral da ADA (nome, quem é, propósito)
            # Nestes casos, a ADA DEVE usar conhecimento geral, não o site.
            elif any(keyword in user_message_text for keyword in ['porque ADA?', 'porque ada', 'porque ada?', 'seu nome', 'quem é você', 'sua identidade', 'sua origem', 'por que ada']):
                system_prompt_ada_identity = (
                    
                    "responda com um paragrafo curto que seu nome é uma homenagem da equipe Python Rangers em memória de Ada Lovelace, a primeira programadora do mundo."
                    "Seja sempre prestativa, clara e educada nas respostas."
                    "Resumir para retornar um texto com no maximo 200 caracteres."
                )
                # Não precisamos raspar o site para estas perguntas, então a chamada à raspagem é pulada.
                bot_response_text = get_openai_response(user_message_text, history=history_for_api, system_prompt_override=system_prompt_ada_identity)

            #Prioridade: Perguntas sobre a idade (resposta fixa)
            elif any(keyword in user_message_text for keyword in hackaton_keywords1):
                bot_response_text = (
                    "Olá! Confira abaixo os patrocinadores do nosso evento:\n\n"

                    "🎯 *Patrocinadores:*\n"
                    "- Clubes Associados Software by Limber\n"
                    "- DataRunk\n"
                    "- Tecnológica\n"
                    "- Senior\n"
                    "- Radek\n"
                    "- ADM Sistemas\n"
                    "- DataInfo\n"
                    "- Ap.Controle\n"
                    "- Buss Construção\n"
                    "- Grupo Softplan\n"
                    "- KLab\n"
                    "- NDD\n"
                    "- CB Sistemas\n"
                    "- WK\n"
                    "- Loqquei\n"
                    "- HartSystem Sistemas\n"
                    "- Exímio\n"
                    "- Dev10\n"
                    "- CloudPark\n"
                    "- DGSYS\n"
                    "- Grupo BST Sistemas\n\n"
                )
                 #Prioridade: Perguntas sobre a idade (resposta fixa)
            elif any(keyword in user_message_text for keyword in hackaton_keywords2):
                bot_response_text = (
                    "Olá! Confira abaixo os parceiros do nosso evento:\n\n"

                    "🤝 *Parceiros:*\n"
                    "- Senac\n"
                    "- Seprosc\n\n"
                )

             #Prioridade: Perguntas sobre a idade (resposta fixa)
            elif any(keyword in user_message_text for keyword in hackaton_keywords3):
                bot_response_text = (
                    "Olá! Confira abaixo os apoiadores do nosso evento:\n\n"

                    "💡 *Apoiadores:*\n"
                    "- Communitech\n"
                    "- Somar\n"
                    "- Orion\n"
                    "- CIB – Centro de Inovação Blumenau\n"
                    "- Novela Hub\n"
                    "- Collabtech\n"
                    "- Gene Conecta\n"
                    "- CITeB\n"
                    "- Inovale\n"
                    "- Acate\n"
                    "- Amureltec"
                )


            # hackaton_keywords = ['quem te criou', 'quem te fez', 'quem lhe criou', 'projeto hackaton', 'projeto do hackaton senac', 'equipe', 'time', 'desenvolvedor', 'senac', 'criada por', 'protótipo']
            # if any(keyword in user_message_text for keyword in hackaton_keywords):
            #     bot_response_text = (
            #         "Fui criada pela equipe Python Rangers como projeto para o Hackaton do Senac. "
            #         "A equipe é formada pelos alunos do curso Jovem Programador: "
            #         "Renato Teodoro, Matheus Moraes, Hudson Franco, Gustavo Lohn e Vinícius Costa. "
            #         "Professora responsável: Karina Fernandes. Coordenador do curso: Vlademir Machado. Gestor de Núcleo: Cleber Rodrigues. Diretora: Renata Scheidt. "
            #     )
            # elif any(keyword in user_message_text for keyword in ['porque ada', 'seu nome', 'quem é você', 'sua identidade', 'sua origem', 'seu propósito', 'o que você faz', 'por que ada']):
            #     system_prompt_ada_identity = (
            #         "Você é ADA, uma assistente virtual criada para responder dúvidas com base em informações confiáveis. "
            #         "Quando o usuário perguntar sobre seu nome, identidade, origem ou propósito, você deve usar seu conhecimento geral para oferecer a melhor explicação possível. "
            #         "Seja sempre prestativa, clara e educada nas respostas."
            #         "Resumir para retornar um texto com no maximo 300 caracteres."
            #     )
            #     bot_response_text = await sync_to_async(get_openai_response)(user_message_text, system_prompt_override=system_prompt_ada_identity)
            
            # 3. Última prioridade: Todas as outras perguntas (raspar o site)
            else:
                scraped_content = ""
                alert_message = ""
                print(f"Tentando raspar jovemprogramador.com.br com Playwright.")
                scraped_result = await scrape_jovemprogramador_playwright()

                if scraped_result == "CONTEUDO_NAO_ENCONTRADO_SITE":
                    alert_message = "Apesar de ter acessado o site Jovem Programador, não encontrei informações relevantes ou específicas sobre sua pergunta no conteúdo que pude raspar. Tente refinar sua pergunta ou verificar o site diretamente."
                    scraped_content = ""
                else:
                    scraped_content = scraped_result
                    print(f"Conteúdo raspado com sucesso do Jovem Programador ({len(scraped_content)} chars).")

                system_prompt_site = (
                    "Você é ADA, uma assistente virtual criada para responder dúvidas com base em informações confiáveis do site Jovem Programador. "
                    "Não use conhecimento geral da internet para responder a perguntas que se referem ao site. "
                    "Seja sempre prestativa, clara e educada nas respostas."
                )

                if scraped_content and scraped_content != "CONTEUDO_NAO_ENCONTRADO_SITE":
                    system_prompt_site += f" As seguintes informações foram raspadas do site Jovem Programador: {scraped_content}. Responda à pergunta do usuário usando APENAS essas informações. Se a resposta para a pergunta do usuário não estiver clara e diretamente no texto fornecido, diga claramente que a informação não foi encontrada no site Jovem Programador."
                else:
                    system_prompt_site += f" {alert_message} Portanto, não posso responder a essa pergunta com informações do site Jovem Programador. Não tente inventar uma resposta com base em conhecimento generalizado."

                bot_response_text = await sync_to_async(get_openai_response)(user_message_text, system_prompt_override=system_prompt_site)

            if bot_response_text:
                unique_audio_filename = f"bot_response_{uuid.uuid4()}.mp3"
                audio_output_full_path = os.path.join(settings.MEDIA_ROOT, unique_audio_filename)

                generated_audio_path = await sync_to_async(generate_audio_from_text)(bot_response_text, audio_output_full_path)

                if generated_audio_path:
                    response_audio_url = os.path.join(settings.MEDIA_URL, unique_audio_filename)
                    print(f"Áudio da resposta gerado: {response_audio_url}")
                else:
                    print("Falha ao gerar áudio da resposta da IA.")

            await sync_to_async(Message.objects.create)(
                session_id=session_id,
                sender='bot',
                text=bot_response_text
            )
            print(f"Mensagem do bot salva: {bot_response_text[:50]}...")

            return JsonResponse({
                'user_message_text': user_message_text, # <-- Adicionado o texto transcrito do usuário
                'response_text': bot_response_text,
                'response_audio_url': response_audio_url
            })
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Requisição inválida (JSON). Certifique-se de que o corpo da requisição é um JSON válido ou um formulário multipart/form-data.'}, status=400)
        except Exception as e:
            print(f"Erro geral na chatbot_view: {e}")
            error_response_text = f'Ocorreu um erro interno: {e}'
            await sync_to_async(Message.objects.create)(
                session_id=session_id,
                sender='bot',
                text=error_response_text
            )
            return JsonResponse({'error': error_response_text}, status=500)

    return render(request, 'chatbot_app/index.html')

def generate_voice_prompt_audios():
    """
    Gera os arquivos de áudio para o prompt inicial e confirmação de voz.
    Retorna os caminhos dos arquivos gerados.
    """
    # Cria o diretório de mídia se não existir
    os.makedirs(settings.MEDIA_ROOT, exist_ok=True)
    
    # Gera o áudio para a pergunta inicial
    prompt_text = "Deseja realizar a conversa por voz?"
    prompt_filename = "voice_prompt.mp3"
    prompt_path = os.path.join(settings.MEDIA_ROOT, prompt_filename)
    
    # Gera o áudio para a confirmação
    confirmation_text = "Pode falar agora, estou ouvindo."
    confirmation_filename = "voice_confirmation.mp3"
    confirmation_path = os.path.join(settings.MEDIA_ROOT, confirmation_filename)
    
    # Gera os arquivos de áudio usando a API Text-to-Speech
    generate_audio_from_text(prompt_text, prompt_path)
    generate_audio_from_text(confirmation_text, confirmation_path)
    
    return {
        'prompt': os.path.join(settings.MEDIA_URL, prompt_filename),
        'confirmation': os.path.join(settings.MEDIA_URL, confirmation_filename)
    }

@csrf_exempt
def get_voice_prompt_audio(request):
    """
    Endpoint para obter os URLs dos arquivos de áudio para o prompt de voz.
    """
    # Verifica se os arquivos já existem, caso contrário, gera-os
    prompt_filename = "voice_prompt.mp3"
    confirmation_filename = "voice_confirmation.mp3"
    prompt_path = os.path.join(settings.MEDIA_ROOT, prompt_filename)
    confirmation_path = os.path.join(settings.MEDIA_ROOT, confirmation_filename)
    
    if not (os.path.exists(prompt_path) and os.path.exists(confirmation_path)):
        audio_urls = generate_voice_prompt_audios()
    else:
        audio_urls = {
            'prompt': os.path.join(settings.MEDIA_URL, prompt_filename),
            'confirmation': os.path.join(settings.MEDIA_URL, confirmation_filename)
        }
    
    return JsonResponse(audio_urls)
