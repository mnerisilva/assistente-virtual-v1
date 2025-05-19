
// Função para carregar o FAQ
async function loadFAQ() {
    try {
        const response = await fetch('faq.json');
        return await response.json();
    } catch (error) {
        console.error('Erro ao carregar FAQ:', error);
        return [];
    }
}

// Função para encontrar a melhor resposta
function findBestMatch(userInput, faq) {
    userInput = userInput.toLowerCase().trim();
    let bestMatch = null;
    let highestScore = 0;

    faq.forEach(item => {
        const pergunta = item.pergunta.toLowerCase();
        let score = 0;

        // Contar palavras em comum
        const userWords = userInput.split(' ');
        const perguntaWords = pergunta.split(' ');
        userWords.forEach(word => {
            if (perguntaWords.includes(word)) score++;
        });

        // Normalizar pontuação
        score = score / Math.max(perguntaWords.length, 1);

        if (score > highestScore && score > 0.3) { // Limiar mínimo de similaridade
            highestScore = score;
            bestMatch = item;
        }
    });

    return bestMatch ? bestMatch.resposta : 'Desculpe, não entendi sua pergunta. Tente reformular ou entre em contato conosco!';
}

// Função para adicionar mensagem ao chat
function addMessage(content, isUser) {
    const messagesDiv = document.getElementById('chatbot-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
    messageDiv.textContent = content;
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight; // Rolagem automática
}

// Inicializar o chatbot
document.addEventListener('DOMContentLoaded', async () => {
    const faq = await loadFAQ();
    const chatbotContainer = document.getElementById('chatbot-container');
    const toggleButton = document.getElementById('chatbot-toggle');
    const closeButton = document.getElementById('chatbot-close');
    const sendButton = document.getElementById('chatbot-send');
    const userInput = document.getElementById('chatbot-user-input');

    // Garantir que o chatbot começa escondido
    chatbotContainer.classList.add('chatbot-hidden');

    // Abrir/Fechar Chatbot
    toggleButton.addEventListener('click', () => {
        chatbotContainer.classList.toggle('chatbot-hidden');
        if (!chatbotContainer.classList.contains('chatbot-hidden')) {
            // Limpar mensagens anteriores ao abrir o chat
            document.getElementById('chatbot-messages').innerHTML = '';
            // Mostrar mensagem de boas-vindas
            addMessage('Olá! Como posso ajudar você hoje?', false);
            userInput.focus();
        }
    });

    // Corrigir manipulador do botão fechar
    closeButton.addEventListener('click', () => {
        console.log('Botão fechar clicado'); // Log para debug
        chatbotContainer.classList.add('chatbot-hidden');
    });

    // Enviar Mensagem
    sendButton.addEventListener('click', () => {
        const input = userInput.value.trim();
        if (input) {
            addMessage(input, true);
            const resposta = findBestMatch(input, faq);
            setTimeout(() => addMessage(resposta, false), 500); // Simula "pensamento"
            userInput.value = '';
        }
    });

    // Enviar com Enter
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendButton.click();
    });
});