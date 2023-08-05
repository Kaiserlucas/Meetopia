import VideoManager from './VideoManager'
import GameManager from './GameManager'

export default class NetworkManager {
    constructor() {
        const chatContainer = document.createElement('div');
        chatContainer.id = 'chatContainer';

        const chatWrapper = document.createElement('div');
        chatWrapper.id = 'chatWrapper';

        const messagesContainer = document.createElement('div');
        messagesContainer.id = 'messagesContainer';

        const chatForm = document.createElement('form');
        chatForm.id = 'chatForm';

        const chatInput = document.createElement('input');
        chatInput.id = 'chatInput';
        chatInput.type = 'text';
        chatInput.placeholder = 'Type a message';

        const submitButton = document.createElement('button');
        submitButton.type = 'submit';
        submitButton.textContent = 'Send';

        chatForm.appendChild(chatInput);
        chatForm.appendChild(submitButton);

        chatWrapper.appendChild(messagesContainer);

        chatContainer.appendChild(chatWrapper);
        chatContainer.appendChild(chatForm);

        document.body.appendChild(chatContainer);

        chatForm.addEventListener('submit', function(event) {
            event.preventDefault();
            GameManager.getInstance().getChatManager().broadcastMessage();
        });

        const controlsContainer = document.getElementById('controls-container');
        const toggleChatButton = document.createElement('button');
        toggleChatButton.id = 'toggle-chat-button';
        toggleChatButton.title = "Chat einblenden";
        const chatIcon = document.createElement('i');
        chatIcon.className = 'fas fa-comment';
        toggleChatButton.appendChild(chatIcon);

        toggleChatButton.addEventListener('click', toggleChat);
        controlsContainer.appendChild(toggleChatButton);

        function toggleChat() {
            const chatContainer = document.getElementById('chatContainer');
            const isChatHidden = (chatContainer.style.display === 'none');
            chatContainer.style.display = isChatHidden ? '' : 'none';
            toggleChatButton.innerHTML = isChatHidden ? '<i class="fas fa-comment"></i>' : '<i class="fas fa-comment-slash red-icon"></i>';
            if(isChatHidden) {
                toggleChatButton.title = "Chat ausblenden";
            } else {
                toggleChatButton.title = "Chat einblenden";
            }
        }

        this.socket = GameManager.getInstance().getNetworkManager().getSocket();

        toggleChat();

        this.controlsContainer = controlsContainer;
        this.toggleChatButton = toggleChatButton;
    }

    update(dts) {

    }

    disableChat() {
        this.controlsContainer.removeChild(this.toggleChatButton);
    }

    broadcastMessage() {  
        this.socket.emit(
            "messagesend",
            chatInput.value, GameManager.getInstance().getPlayerManager().getMainPlayerName(), 
            GameManager.getInstance().getPlayerManager().getMainPlayerId()
        );

        chatInput.value = "";
    }
}