const chatBox = document.getElementById('chat-box'); // Caixa de chat
const userInput = document.getElementById('user-input'); // Campo de entrada do usuário
const sendButton = document.getElementById('send-button'); // Botão de envio
const microphoneButton = document.getElementById('microphone-button'); // Botão de microfone
const chatbotContainer = document.getElementById('chatbot-container'); // Container do chatbot
const openChatButton = document.getElementById('open-chat-button'); // Botão de abrir chat
const chatToggleIcon = document.getElementById('chat-toggle-icon'); // Ícone de alternância do chat
const charCountSpan = document.getElementById('char-count'); // Span para contagem de caracteres
const closeButton = document.getElementById('close-button'); // Botão de fechar chat
const sideButton = document.getElementById('side-button'); // Botão lateral para abrir o chat

// Obter os caminhos das imagens do botão de chat do data-set no HTML
const chatOpenIconUrl = openChatButton.dataset.chatOpenIcon; // URL do ícone de abrir chat
const chatCloseIconUrl = openChatButton.dataset.chatCloseIcon; // URL do ícone de fechar chat

let isSending = false;
let isRecording = false;
let mediaRecorder;
let audioChunks = [];
let loadingMessageDiv = null;

// Contexto de áudio para efeitos sonoros
let audioContext;


// Inicializa o contexto de áudio na interação do usuário para cumprir com as políticas do navegador
function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

// Função para reproduzir um efeito sonoro de hover
function playHoverSound() {
    initAudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
    oscillator.frequency.linearRampToValueAtTime(880, audioContext.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.05, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.15);
}

// Função para reproduzir um som de notificação quando a janela de bate-papo é aberta/fechada
function playChatToggleSound(isOpening) {
    initAudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    if (isOpening) {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1320, audioContext.currentTime + 0.1);
    } else {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(660, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(440, audioContext.currentTime + 0.1);
    }

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.3);
}

// Função para reproduzir um som quando o botão do microfone é clicado
function playMicrophoneSound(isStarting) {
    initAudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    if (isStarting) {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(587.33, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
    } else {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(587.33, audioContext.currentTime + 0.1);
    }

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.2);
}

// Variáveis para os áudios de prompt de voz
let voicePromptAudio = null;
let voiceConfirmationAudio = null;
let speechRecognition = null;
let isListeningForVoiceChoice = false;
let userChoseVoiceConversation = false;

// Variáveis para o arrasto do chatbot
let isDragging = false;
let currentX;
let currentY;
let initialX;
let initialY;
let xOffset = 0;
let yOffset = 0;

// Adiciona eventos de arrasto ao cabeçalho do chatbot
chatbotContainer.querySelector('.chatbot-header').addEventListener('mousedown', dragStart);

// Funções para arrastar o chatbot
function dragStart(e) {
    initialX = e.clientX - xOffset;
    initialY = e.clientY - yOffset;

    if (e.target === chatbotContainer.querySelector('.chatbot-header')) {
        isDragging = true;
    }
}

// Adiciona eventos de mouseup e mousemove ao documento para controlar o arrasto
document.addEventListener('mouseup', dragEnd);
document.addEventListener('mousemove', drag);

// Funções para finalizar e atualizar a posição do arrasto
function dragEnd(e) {
    initialX = currentX;
    initialY = currentY;
    isDragging = false;
}

// Função para atualizar a posição do chatbot durante o arrasto
function drag(e) {
    if (isDragging) {
        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;

        xOffset = currentX;
        yOffset = currentY;

        setTranslate(currentX, currentY, chatbotContainer);
    }
}

// Função para definir a posição do chatbot usando transformações CSS
function setTranslate(xPos, yPos, el) {
    el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
}

// Funções do chatbot
// Adiciona uma nova mensagem ao chat
function addMessage(text, sender, audioUrl = null) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;

    let displayText = text;
    if (sender === 'bot' && userChoseVoiceConversation) {
        displayText = text;
    }

    if (sender === 'bot' && audioUrl) {
        const contentDiv = document.createElement('div');
        contentDiv.className = 'bot-message-content';

        const textSpan = document.createElement('span');
        textSpan.textContent = displayText;
        contentDiv.appendChild(textSpan);

        const playButton = document.createElement('play-audio-button');
        playButton.className = 'play-audio-button';
        playButton.textContent = '▶';
        
        const audio = new Audio(audioUrl);
        
        if (userChoseVoiceConversation && sender === 'bot') {
            console.log('Reproduzindo áudio automaticamente');
            setTimeout(() => {
                audio.play();
            }, 300);
        }
        
        playButton.onclick = () => {
            audio.play();
        };
        
        contentDiv.appendChild(playButton);
        messageDiv.appendChild(contentDiv);
    } else {
        messageDiv.textContent = displayText;
    }

    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    return messageDiv;
}

// Função para desabilitar os campos de entrada enquanto a mensagem está sendo enviada
function toggleInputState(disabled) {
    userInput.disabled = disabled;
    sendButton.disabled = disabled;
    microphoneButton.disabled = disabled;
    isSending = disabled;
    charCountSpan.style.opacity = disabled ? '0.5' : '1';
}

// Variáveis para o estado da mensagem do usuário
let userMessageDiv = null;

// Função para enviar a mensagem do usuário
async function sendMessage(audioBlob = null) {
    if (isSending) return;

    let messageToSend = '';
    let formData = new FormData();

    if (audioBlob) {
        formData.append('audio', audioBlob, 'audio.webm');
        userMessageDiv = addMessage('Transcrevendo áudio...', 'user');
    } else {
        messageToSend = userInput.value.trim();
        if (!messageToSend) return;

        if (messageToSend.length > 150) {
            alert('A sua pergunta não pode ter mais de 150 caracteres.');
            return;
        }
        formData.append('message', messageToSend);
        addMessage(messageToSend, 'user');
    }

    userInput.value = '';
    updateCharCount();

    toggleInputState(true);
    loadingMessageDiv = addMessage('Digitando...', 'loading');

    try {
        const response = await fetch('/chat/', {
            method: 'POST',
            body: formData,
        });

        if (loadingMessageDiv && chatBox.contains(loadingMessageDiv)) {
            chatBox.removeChild(loadingMessageDiv);
            loadingMessageDiv = null;
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro na requisição');
        }

        const data = await response.json();

        if (audioBlob && userMessageDiv) {
            userMessageDiv.textContent = data.user_message_text;
            userMessageDiv = null;
        }

        addMessage(data.response_text, 'bot', data.response_audio_url);

    } catch (error) {
        console.error('Erro:', error);
        if (loadingMessageDiv && chatBox.contains(loadingMessageDiv)) {
            chatBox.removeChild(loadingMessageDiv);
            loadingMessageDiv = null;
        }
        if (audioBlob && userMessageDiv && chatBox.contains(userMessageDiv)) {
            chatBox.removeChild(userMessageDiv);
            userMessageDiv = null;
        }
        addMessage('Desculpe, houve um erro ao processar sua solicitação: ' + error.message, 'bot');
    } finally {
        toggleInputState(false);
    }
}

// Evento para o botão de envio
// Adiciona o efeito sonoro de hover ao botão de enviar
microphoneButton.addEventListener('click', async () => {
    if (!isRecording) {
        try {
            playMicrophoneSound(true);
            
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];

            mediaRecorder.ondataavailable = event => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                sendMessage(audioBlob);
            };

            mediaRecorder.start();
            isRecording = true;
            microphoneButton.classList.add('recording');
            userInput.placeholder = 'Gravando áudio...';
            userInput.disabled = true;
            sendButton.disabled = true;
            console.log('Gravação iniciada.');
            
            setTimeout(() => {
                if (isRecording) {
                    console.log('Parando gravação automaticamente após 5 segundos');
                    playMicrophoneSound(false);
                    
                    mediaRecorder.stop();
                    isRecording = false;
                    microphoneButton.classList.remove('recording');
                    userInput.placeholder = 'Digite sua mensagem...';
                    userInput.disabled = false;
                    sendButton.disabled = false;
                    console.log('Gravação parada automaticamente.');
                }
            }, 5000);
            
        } catch (err) {
            console.error('Erro ao acessar o microfone:', err);
            alert('Não foi possível acessar o microfone. Verifique as permissões.');
        }
    } else {
        playMicrophoneSound(false);
        
        mediaRecorder.stop();
        isRecording = false;
        microphoneButton.classList.remove('recording');
        userInput.placeholder = 'Digite sua mensagem...';
        userInput.disabled = false;
        sendButton.disabled = false;
        console.log('Gravação parada.');
    }
});

// Evento para o botão de envio
// Adiciona o efeito sonoro de hover ao botão de enviar
function updateCharCount() {
    const currentLength = userInput.value.length;
    const maxLength = userInput.maxLength;
    charCountSpan.textContent = `${currentLength} / ${maxLength}`;

    if (currentLength >= maxLength * 0.9) {
        charCountSpan.style.color = 'orange';
    } else if (currentLength >= maxLength) {
        charCountSpan.style.color = 'red';
    } else {
        charCountSpan.style.color = '#b0b0b0';
    }
}

// Atualiza a contagem de caracteres ao digitar
userInput.addEventListener('input', updateCharCount);

// Evento para o botão de envio
// Adiciona o efeito sonoro de hover ao botão de enviar
userInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter' && !isRecording) {
        sendMessage();
    }
});

// Evento para o botão de envio
// Adiciona o efeito sonoro de hover ao botão de enviar
function initSpeechRecognition() {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        speechRecognition = new SpeechRecognition();
        speechRecognition.lang = 'pt-BR';
        speechRecognition.continuous = false;
        speechRecognition.interimResults = false;
        
        speechRecognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript.toLowerCase();
            console.log('Resposta reconhecida:', transcript);
            
            if (transcript.includes('sim') || transcript.includes('s')) {
                handleVoiceChoiceYes();
            } else if (transcript.includes('não') || transcript.includes('nao') || transcript.includes('n')) {
                handleVoiceChoiceNo();
            } else {
                setTimeout(() => {
                    if (isListeningForVoiceChoice) {
                        voicePromptAudio.play();
                        startListeningForVoiceChoice();
                    }
                }, 1000);
            }
        };
        
        speechRecognition.onerror = function(event) {
            console.error('Erro no reconhecimento de fala:', event.error);
            isListeningForVoiceChoice = false;
        };
        
        speechRecognition.onend = function() {
            if (isListeningForVoiceChoice) {
                setTimeout(() => {
                    if (isListeningForVoiceChoice) {
                        speechRecognition.start();
                    }
                }, 500);
            }
        };
        
        return true;
    } else {
        console.error('Reconhecimento de fala não suportado neste navegador');
        return false;
    }
}

// Função para iniciar o reconhecimento de fala e escutar a escolha do usuário
function startListeningForVoiceChoice() {
    if (speechRecognition) {
        try {
            speechRecognition.start();
            isListeningForVoiceChoice = true;
            console.log('Escutando resposta para escolha de voz...');
        } catch (error) {
            console.error('Erro ao iniciar reconhecimento de fala:', error);
        }
    }
}

// Função para lidar com a escolha do usuário sobre conversar por voz
function handleVoiceChoiceYes() {
    isListeningForVoiceChoice = false;
    if (speechRecognition) {
        speechRecognition.stop();
    }
    
    console.log('Usuário escolheu conversar por voz');
    userChoseVoiceConversation = true;
    
    if (voiceConfirmationAudio) {
        voiceConfirmationAudio.play();
        
        voiceConfirmationAudio.onended = function() {
            if (!isRecording) {
                microphoneButton.click();
                
                setTimeout(function() {
                    if (isRecording) {
                        console.log('Parando gravação automaticamente após 5 segundos');
                        microphoneButton.click();
                    }
                }, 5000);
            }
        };
    } else {
        if (!isRecording) {
            microphoneButton.click();
            
            setTimeout(function() {
                if (isRecording) {
                    console.log('Parando gravação automaticamente após 5 segundos');
                    microphoneButton.click();
                }
            }, 5000);
        }
    }
}

// Função para lidar com a escolha do usuário de não conversar por voz
function handleVoiceChoiceNo() {
    isListeningForVoiceChoice = false;
    if (speechRecognition) {
        speechRecognition.stop();
    }
    
    console.log('Usuário escolheu não conversar por voz');
    userChoseVoiceConversation = false;
    userInput.focus();
}

// Função para carregar os áudios de prompt de voz
async function loadVoicePromptAudios() {
    try {
        const response = await fetch('/chat/voice-prompt-audio/');
        if (!response.ok) {
            throw new Error('Erro ao carregar áudios de prompt de voz');
        }
        
        const data = await response.json();
        
        voicePromptAudio = new Audio(data.prompt);
        voiceConfirmationAudio = new Audio(data.confirmation);
        
        console.log('Áudios de prompt de voz carregados com sucesso');
        return true;
    } catch (error) {
        console.error('Erro ao carregar áudios de prompt de voz:', error);
        return false;
    }
}

// Evento para o botão de fechar
// Adiciona o efeito sonoro de hover ao botão de abrir chat
openChatButton.addEventListener('mouseenter', playHoverSound);
// Evento para o botão de fechar
// Adiciona o efeito sonoro de hover ao botão de microfone
microphoneButton.addEventListener('mouseenter', playHoverSound);

// Evento para o botão de fechar
// Adiciona o efeito sonoro de hover ao botão de enviar
openChatButton.addEventListener('click', async function() {
    initAudioContext(); // Inicializa o contexto de áudio ao clicar no botão de abrir chat
    
    const wasActive = chatbotContainer.classList.contains('active'); // Verifica se o chatbot já está ativo
    chatbotContainer.classList.toggle('active'); // Alterna a classe 'active' para mostrar ou esconder o chatbot
    
    playChatToggleSound(!wasActive); // Reproduz o som de alternância do chat
    
    if (chatbotContainer.classList.contains('active')) {
        userInput.focus(); // Foca no campo de entrada do usuário ao abrir o chat
        chatToggleIcon.src = chatCloseIconUrl; // Usando a URL do dataset
        updateCharCount(); // Atualiza a contagem de caracteres ao abrir o chat
        closeButton.style.display = 'none'; // Esconde o botão de fechar
        
        if (!voicePromptAudio || !voiceConfirmationAudio) {
            const audiosLoaded = await loadVoicePromptAudios(); // Carrega os áudios de prompt de voz
            if (!audiosLoaded) {
                console.error('Não foi possível carregar os áudios de prompt de voz'); // Se falhar, não inicia o reconhecimento de fala
                return; // Não inicia o reconhecimento de fala se os áudios não puderem ser carregados
            }
        }
        
        if (!speechRecognition) {
            const speechInitialized = initSpeechRecognition(); // Inicializa o reconhecimento de fala
            if (!speechInitialized) {
                console.error('Não foi possível inicializar o reconhecimento de fala'); // Se falhar, não inicia o reconhecimento de fala
                return; // Não inicia o reconhecimento de fala se não puder ser inicializado
            }
        }
        
        voicePromptAudio.play(); // Reproduz o áudio de prompt de voz ao abrir o chat
        
        voicePromptAudio.onended = function() {
            startListeningForVoiceChoice(); // Inicia o reconhecimento de fala para escutar a escolha do usuário
        };
    } else {
        chatToggleIcon.src = chatOpenIconUrl; // Usando a URL do dataset
        closeButton.style.display = 'block'; // Mostra o botão de fechar ao fechar o chat
        
        if (isListeningForVoiceChoice && speechRecognition) {
            isListeningForVoiceChoice = false; // Para de escutar a escolha do usuário
            speechRecognition.stop(); // Para o reconhecimento de fala
        }
        
        userChoseVoiceConversation = false; // Reseta a escolha do usuário para não conversar por voz
    }
});
// Evento para o botão de fechar
window.onload = function() {
    addMessage('Olá! Como posso ajudar você hoje?', 'bot'); // Mensagem de boas-vindas
    updateCharCount(); // Atualiza a contagem de caracteres ao carregar a página
};

// Ocultar botão de chat + botão X com animação
closeButton.addEventListener('click', () => {
    openChatButton.classList.remove('slide-in'); // Remove a classe de animação de entrada
    openChatButton.classList.add('slide-out'); // Adiciona a classe de animação de saída
    closeButton.style.display = 'none'; // Esconde o botão de fechar

    setTimeout(() => {
      openChatButton.style.display = 'none'; // Esconde o botão de abrir chat
      sideButton.classList.remove('slide-out'); // Remove a classe de animação de saída
      sideButton.classList.add('slide-in'); // Adiciona a classe de animação de entrada
      sideButton.style.transform = 'translateX(0)'; // Reseta a posição do botão lateral
      sideButton.style.opacity = '1'; // Torna o botão lateral visível
    }, 400); // Espera a animação de saída terminar antes de esconder o botão de chat

    chatbotContainer.classList.remove('active'); // Remove a classe 'active' para esconder o chatbot
});

  // Mostrar botão do chat + botão X com animação
sideButton.addEventListener('click', () => {
    sideButton.classList.remove('slide-in'); // Remove a classe de animação de entrada
    sideButton.classList.add('slide-out'); // Adiciona a classe de animação de saída
    sideButton.style.transform = 'translateX(150%)'; // Move o botão para fora da tela
    sideButton.style.opacity = '0'; // Torna o botão invisível

    setTimeout(() => {
      openChatButton.style.display = 'block'; // Mostra o botão de abrir chat
      openChatButton.classList.remove('slide-out'); // Remove a classe de animação de saída
      openChatButton.classList.add('slide-in'); // Adiciona a classe de animação de entrada
      closeButton.style.display = 'block'; // Mostra o botão de fechar
    }, 400); // Espera a animação de saída terminar antes de mostrar o botão de chat

    // chatbotContainer.classList.add('active'); // Adiciona a classe 'active' para mostrar o chatbot
  });

document.addEventListener('DOMContentLoaded', function() {
    const linkSobre = document.querySelector('.dropdown-menu a[href="#sobre-o-programa"]');
    const videoContainer = document.getElementById('video-sobre');
    const video = videoContainer.querySelector('video');

    if (linkSobre && video) {
        linkSobre.addEventListener('click', function(event) {
            // Impede o comportamento padrão do link de navegar para uma nova página
            event.preventDefault();

            // Rola a página até o contêiner do vídeo com uma animação suave
            videoContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Inicia a reprodução do vídeo
            video.play();
        });
    }
});


