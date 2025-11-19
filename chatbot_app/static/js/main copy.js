const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const microphoneButton = document.getElementById('microphone-button');
const chatbotContainer = document.getElementById('chatbot-container');
const openChatButton = document.getElementById('open-chat-button');
const chatToggleIcon = document.getElementById('chat-toggle-icon');
const charCountSpan = document.getElementById('char-count');

// Obter os caminhos das imagens do botão de chat do data-set no HTML
const chatOpenIconUrl = openChatButton.dataset.chatOpenIcon;
const chatCloseIconUrl = openChatButton.dataset.chatCloseIcon;

let isSending = false;
let isRecording = false;
let mediaRecorder;
let audioChunks = [];
let loadingMessageDiv = null;

// Audio context for sound effects
let audioContext;

// Initialize audio context on user interaction to comply with browser policies
function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

// Function to play a hover sound effect
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

// Function to play a notification sound when chat window is opened/closed
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

// Function to play a sound when microphone button is clicked
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

function dragStart(e) {
    initialX = e.clientX - xOffset;
    initialY = e.clientY - yOffset;

    if (e.target === chatbotContainer.querySelector('.chatbot-header')) {
        isDragging = true;
    }
}

document.addEventListener('mouseup', dragEnd);
document.addEventListener('mousemove', drag);

function dragEnd(e) {
    initialX = currentX;
    initialY = currentY;
    isDragging = false;
}

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

function setTranslate(xPos, yPos, el) {
    el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
}

// Funções do chatbot
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

        const playButton = document.createElement('button');
        playButton.className = 'play-audio-button';
        playButton.textContent = '▶️';
        
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

function toggleInputState(disabled) {
    userInput.disabled = disabled;
    sendButton.disabled = disabled;
    microphoneButton.disabled = disabled;
    isSending = disabled;
    charCountSpan.style.opacity = disabled ? '0.5' : '1';
}

let userMessageDiv = null;

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

userInput.addEventListener('input', updateCharCount);

userInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter' && !isRecording) {
        sendMessage();
    }
});

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

function handleVoiceChoiceNo() {
    isListeningForVoiceChoice = false;
    if (speechRecognition) {
        speechRecognition.stop();
    }
    
    console.log('Usuário escolheu não conversar por voz');
    userChoseVoiceConversation = false;
    userInput.focus();
}

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

openChatButton.addEventListener('mouseenter', playHoverSound);
microphoneButton.addEventListener('mouseenter', playHoverSound);

openChatButton.addEventListener('click', async function() {
    initAudioContext();
    
    const wasActive = chatbotContainer.classList.contains('active');
    chatbotContainer.classList.toggle('active');
    
    playChatToggleSound(!wasActive);
    
    if (chatbotContainer.classList.contains('active')) {
        userInput.focus();
        chatToggleIcon.src = chatCloseIconUrl; // Usando a URL do dataset
        updateCharCount();
        
        if (!voicePromptAudio || !voiceConfirmationAudio) {
            const audiosLoaded = await loadVoicePromptAudios();
            if (!audiosLoaded) {
                console.error('Não foi possível carregar os áudios de prompt de voz');
                return;
            }
        }
        
        if (!speechRecognition) {
            const speechInitialized = initSpeechRecognition();
            if (!speechInitialized) {
                console.error('Não foi possível inicializar o reconhecimento de fala');
                return;
            }
        }
        
        voicePromptAudio.play();
        
        voicePromptAudio.onended = function() {
            startListeningForVoiceChoice();
        };
    } else {
        chatToggleIcon.src = chatOpenIconUrl; // Usando a URL do dataset
        
        if (isListeningForVoiceChoice && speechRecognition) {
            isListeningForVoiceChoice = false;
            speechRecognition.stop();
        }
        
        userChoseVoiceConversation = false;
    }
});

window.onload = function() {
    addMessage('Olá! Como posso ajudar você hoje?', 'bot');
    updateCharCount();
};

