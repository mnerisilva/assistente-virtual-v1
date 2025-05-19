// Solução definitiva para os problemas do chatbot
window.onload = function() {
  // Forçar o chatbot a ficar escondido inicialmente
  var chatbot = document.getElementById('chatbot-container');
  if (chatbot) {
    chatbot.style.display = 'none';
  }
  
  // Configurar o botão de alternar manualmente
  var toggleBtn = document.getElementById('chatbot-toggle');
  if (toggleBtn) {
    toggleBtn.onclick = function() {
      if (chatbot.style.display === 'none' || getComputedStyle(chatbot).display === 'none') {
        chatbot.style.display = 'flex';
        var messages = document.getElementById('chatbot-messages');
        if (messages) {
          messages.innerHTML = '';
          var welcomeMsg = document.createElement('div');
          welcomeMsg.className = 'message bot';
          welcomeMsg.textContent = 'Olá! Como posso ajudar você hoje?';
          messages.appendChild(welcomeMsg);
          
          // Foco no campo de entrada
          var inputField = document.getElementById('chatbot-user-input');
          if (inputField) {
            inputField.focus();
          }
        }
      } else {
        chatbot.style.display = 'none';
      }
    };
  }
  
  // Configurar o botão fechar manualmente
  var closeBtn = document.getElementById('chatbot-close');
  if (closeBtn) {
    // Usando esta abordagem para garantir que o evento seja capturado
    closeBtn.onclick = function(event) {
      console.log('Botão fechar clicado');
      chatbot.style.display = 'none';
      // Prevenir propagação do evento
      event.stopPropagation();
      return false;
    };
  }
  
  // Configurar envio de mensagens
  var sendButton = document.getElementById('chatbot-send');
  var userInput = document.getElementById('chatbot-user-input');
  
  if (sendButton && userInput) {
    // Enviar mensagem ao clicar no botão
    sendButton.onclick = function() {
      sendMessage();
    };
    
    // Enviar mensagem ao pressionar Enter
    userInput.onkeypress = function(e) {
      if (e.key === 'Enter') {
        sendMessage();
      }
    };
  }
  
  // Função para enviar mensagem
  function sendMessage() {
    var input = userInput.value.trim();
    if (input) {
      // Adicionar mensagem do usuário
      addChatMessage(input, true);
      
      // Buscar resposta do FAQ
      fetchResponse(input);
      
      // Limpar campo de entrada
      userInput.value = '';
      userInput.focus();
    }
  }
  
  // Função para adicionar mensagem ao chat
  function addChatMessage(content, isUser) {
    var messagesDiv = document.getElementById('chatbot-messages');
    var messageDiv = document.createElement('div');
    messageDiv.className = 'message ' + (isUser ? 'user' : 'bot');
    messageDiv.textContent = content;
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }
  
  // Função para buscar resposta do FAQ
  async function fetchResponse(userInput) {
    try {
      const response = await fetch('faq.json');
      const faq = await response.json();
      
      // Lógica simplificada de correspondência
      let bestMatch = null;
      let highestScore = 0;
      
      userInput = userInput.toLowerCase();
      
      faq.forEach(item => {
        const pergunta = item.pergunta.toLowerCase();
        
        // Correspondência básica - conta palavras em comum
        let score = 0;
        const userWords = userInput.split(' ');
        const perguntaWords = pergunta.split(' ');
        
        userWords.forEach(word => {
          if (perguntaWords.includes(word)) score++;
        });
        
        // Normalizar pontuação
        score = score / Math.max(perguntaWords.length, 1);
        
        if (score > highestScore && score > 0.3) {
          highestScore = score;
          bestMatch = item;
        }
      });
      
      const resposta = bestMatch ? bestMatch.resposta : 'Desculpe, não entendi sua pergunta. Tente reformular ou entre em contato conosco!';
      
      // Simular um pequeno delay para dar a impressão de "pensamento"
      setTimeout(() => {
        addChatMessage(resposta, false);
      }, 500);
      
    } catch (error) {
      console.error('Erro ao processar a resposta:', error);
      addChatMessage('Desculpe, ocorreu um erro ao processar sua pergunta.', false);
    }
  }
};
