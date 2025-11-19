# chatbot_app/services.py

from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI()

def get_openai_response(prompt_text, history=None, system_prompt_override=None):
    """
    Envia um prompt para a API da OpenAI e retorna a resposta do modelo.
    Permite sobrescrever o system_prompt e incluir um histórico de mensagens.
    """
    try:
        initial_system_prompt = system_prompt_override if system_prompt_override else "Você é uma assistente prestativa, jovem, muito educada e amigável. RESPONDER SEMPRE EM PORTUGUES DO BRASIL."

        messages = []
        # Adiciona o prompt do sistema
        messages.append({"role": "system", "content": initial_system_prompt})

        # Adiciona o histórico de mensagens, se fornecido
        if history:
            # O histórico deve ser uma lista de dicionários no formato {"role": "user/assistant", "content": "texto"}
            messages.extend(history)

        # Adiciona a mensagem atual do usuário
        messages.append({"role": "user", "content": prompt_text})

        chat_completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            max_tokens=500,
            temperature=0,
        )
        return chat_completion.choices[0].message.content
    except Exception as e:
        print(f"Erro ao chamar a API da OpenAI: {e}")
        return "Desculpe, não consegui processar sua solicitação no momento."

def transcribe_audio(audio_file_path):
    """
    Transcreve um arquivo de áudio usando a API Whisper da OpenAI.
    audio_file_path: Caminho para o arquivo de áudio a ser transcrito.
    """
    try:
        with open(audio_file_path, "rb") as audio_file:
            transcript = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file
            )
        return transcript.text
    except Exception as e:
        print(f"Erro ao transcrever áudio com a API Whisper: {e}")
        return None

def generate_audio_from_text(text_to_speak, output_path="speech.mp3"):
    """
    Converte texto em áudio usando a API Text-to-Speech da OpenAI.
    Salva o áudio em output_path.
    """
    try:
        response = client.audio.speech.create(
            model="tts-1", # Ou "tts-1-hd" para qualidade superior
            voice="shimmer", # Escolha uma voz, ex: "alloy", "nova", "shimmer", etc.
            input=text_to_speak,
        )
        response.stream_to_file(output_path)
        return output_path
    except Exception as e:
        print(f"Erro ao gerar áudio com a API Text-to-Speech: {e}")
        return None
