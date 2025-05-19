/**
 * Chatbot Moderno - JavaScript Aprimorado
 * Este script fornece funcionalidades avançadas e uma experiência de usuário melhorada
 */

// Função auto-executável para evitar poluição do escopo global
(function() {
  // Armazenar referências aos elementos DOM
  let elements = {};
  
  // Configurações
  const config = {
    typingDelay: 300, // Tempo para mostrar o indicador de digitação (ms)
    responseDelay: 800, // Tempo para simular o "pensamento" do bot (ms)
    welcomeMessage: "Olá! 👋 Sou o assistente virtual. Como posso ajudar você hoje?",
    placeholderText: "Digite sua mensagem...",
    errorMessage: "Desculpe, ocorreu um erro ao processar sua pergunta. Tente novamente mais tarde.",
    noMatchMessage: "Desculpe, não consegui entender completamente. Você poderia reformular sua pergunta ou escolher um dos tópicos abaixo?",
    suggestedTopics: [
      "Formas de pagamento",
      "Prazo de entrega",
      "Devolução de produtos",
      "Garantia"
    ]
  };
  
  // Inicialização do chatbot
  function initChatbot() {
    // Carregar elementos do DOM
    elements = {
      container: document.getElementById('chatbot-container'),
      toggle: document.getElementById('chatbot-toggle'),
      close: document.getElementById('chatbot-close'),
      messages: document.getElementById('chatbot-messages'),
      input: document.getElementById('chatbot-user-input'),
      send: document.getElementById('chatbot-send')
    };
    
    // Atualizar o placeholder do input
    if (elements.input) {
      elements.input.placeholder = config.placeholderText;
    }
    
    // Garantir que o chatbot esteja inicialmente oculto
    if (elements.container) {
      elements.container.style.display = 'none';
    }
    
    // Configurar eventos
    setupEventListeners();
  }
  
  // Configurar ouvintes de eventos
  function setupEventListeners() {
    // Botão para abrir/fechar chatbot
    if (elements.toggle) {
      elements.toggle.addEventListener('click', toggleChatbot);
    }
    
    // Botão para fechar o chatbot
    if (elements.close) {
      elements.close.addEventListener('click', function(event) {
        closeChatbot();
        event.stopPropagation();
      });
    }
    
    // Botão para enviar mensagem
    if (elements.send) {
      elements.send.addEventListener('click', sendMessage);
    }
    
    // Enter para enviar mensagem
    if (elements.input) {
      elements.input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          sendMessage();
        }
      });
      
      // Desabilitar botão de envio quando o input estiver vazio
      elements.input.addEventListener('input', function() {
        elements.send.disabled = !this.value.trim();
      });
    }
    
    // Impedir que cliques dentro do container fechem o chatbot
    if (elements.container) {
      elements.container.addEventListener('click', function(event) {
        event.stopPropagation();
      });
    }
  }
  
  // Abrir ou fechar o chatbot
  function toggleChatbot() {
    if (elements.container.style.display === 'none' || getComputedStyle(elements.container).display === 'none') {
      openChatbot();
    } else {
      closeChatbot();
    }
  }
  
  // Abrir o chatbot
  function openChatbot() {
    // Mostrar o container
    elements.container.style.display = 'flex';
    
    // Adicionar classe para animar a entrada
    setTimeout(() => {
      elements.container.classList.add('chatbot-active');
    }, 10);
    
    // Limpar mensagens anteriores
    elements.messages.innerHTML = '';
    
    // Mostrar mensagem de boas-vindas com indicador de digitação
    showTypingIndicator();
    
    setTimeout(() => {
      // Remover indicador de digitação
      removeTypingIndicator();
      
      // Adicionar mensagem de boas-vindas
      addMessage(config.welcomeMessage, false, 'welcome');
      
      // Focar no campo de entrada
      elements.input.focus();
    }, config.typingDelay);
  }
  
  // Fechar o chatbot
  function closeChatbot() {
    // Remover classe para animar a saída
    elements.container.classList.remove('chatbot-active');
    
    // Esconder o container após a animação
    setTimeout(() => {
      elements.container.style.display = 'none';
    }, 300);
  }
  
  // Enviar mensagem
  function sendMessage() {
    const message = elements.input.value.trim();
    
    if (!message) return;
    
    // Adicionar mensagem do usuário
    addMessage(message, true);
    
    // Limpar input e focar
    elements.input.value = '';
    elements.input.focus();
    
    // Desabilitar botão de envio
    elements.send.disabled = true;
    
    // Mostrar indicador de digitação
    showTypingIndicator();
    
    // Processar a resposta
    processMessage(message);
  }
  
  // Processar a mensagem e obter resposta
  async function processMessage(message) {
    try {
      // Buscar FAQ
      const response = await fetch('faq.json');
      const faq = await response.json();
      
      // Encontrar a melhor correspondência
      const bestMatch = findBestMatch(message, faq);
      
      // Simular tempo de resposta
      setTimeout(() => {
        // Remover indicador de digitação
        removeTypingIndicator();
        
        if (bestMatch) {
          // Adicionar resposta
          addMessage(bestMatch.resposta, false);
        } else {
          // Sem correspondência, mostrar mensagem de erro e sugestões
          addMessage(config.noMatchMessage, false);
          
          // Mostrar sugestões após um breve delay
          setTimeout(() => {
            addSuggestions();
          }, 500);
        }
      }, config.responseDelay);
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
      
      // Remover indicador de digitação
      removeTypingIndicator();
      
      // Mostrar mensagem de erro
      addMessage(config.errorMessage, false);
    }
  }
  
  // Encontrar a melhor correspondência no FAQ
  function findBestMatch(userInput, faq) {
    userInput = userInput.toLowerCase().trim();
    let bestMatch = null;
    let highestScore = 0;
    
    faq.forEach(item => {
      const pergunta = item.pergunta.toLowerCase();
      
      // Correspondência exata
      if (pergunta === userInput) {
        highestScore = 1;
        bestMatch = item;
        return;
      }
      
      // Correspondência por palavras
      let score = 0;
      const userWords = userInput.split(' ').filter(word => word.length > 2);
      const perguntaWords = pergunta.split(' ');
      
      // Contar palavras em comum
      userWords.forEach(word => {
        if (perguntaWords.includes(word)) score += 2;
        
        // Verificar palavras parciais (para lidar com erros de digitação)
        perguntaWords.forEach(pWord => {
          if (pWord.includes(word) || word.includes(pWord)) {
            score += 0.5;
          }
        });
      });
      
      // Normalizar pontuação
      score = score / Math.max(userWords.length, 1);
      
      if (score > highestScore && score > 0.4) {
        highestScore = score;
        bestMatch = item;
      }
    });
    
    return bestMatch;
  }
  
  // Adicionar sugestões de tópicos
  function addSuggestions() {
    const suggestionsDiv = document.createElement('div');
    suggestionsDiv.className = 'chatbot-suggestions';
    
    config.suggestedTopics.forEach(topic => {
      const button = document.createElement('button');
      button.className = 'suggestion-btn';
      button.textContent = topic;
      button.addEventListener('click', function() {
        // Preencher o input com a sugestão
        elements.input.value = topic;
        
        // Enviar a mensagem
        sendMessage();
      });
      
      suggestionsDiv.appendChild(button);
    });
    
    elements.messages.appendChild(suggestionsDiv);
    
    // Rolar para o final
    elements.messages.scrollTop = elements.messages.scrollHeight;
  }
  
  // Adicionar mensagem ao chat
  function addMessage(content, isUser, extraClass = '') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'bot'} ${extraClass}`;
    messageDiv.textContent = content;
    
    elements.messages.appendChild(messageDiv);
    
    // Rolar para o final
    elements.messages.scrollTop = elements.messages.scrollHeight;
  }
  
  // Mostrar indicador de digitação
  function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.id = 'typing-indicator';
    
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('span');
      typingDiv.appendChild(dot);
    }
    
    elements.messages.appendChild(typingDiv);
    
    // Rolar para o final
    elements.messages.scrollTop = elements.messages.scrollHeight;
  }
  
  // Remover indicador de digitação
  function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }
  
  // Carregar o chatbot quando o DOM estiver pronto
  document.addEventListener('DOMContentLoaded', initChatbot);
  
  // Caso o DOMContentLoaded já tenha sido disparado
  if (document.readyState === 'interactive' || document.readyState === 'complete') {
    initChatbot();
  }
})();