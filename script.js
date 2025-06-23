import h from "lite-jsx";

const chatContainer = document.getElementById('chat-container');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');

let conversationHistory = [];

const addMessageToChat = (message, role) => {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', `${role}-message`);
    messageElement.textContent = message; // Use textContent to prevent XSS
    chatContainer.appendChild(messageElement);
    chatContainer.scrollTop = chatContainer.scrollHeight; // Auto-scroll to bottom
};

const adjustInputHeight = () => {
    messageInput.style.height = 'auto'; // Reset height
    messageInput.style.height = messageInput.scrollHeight + 'px'; // Set to scroll height
    // Limit height to prevent it from getting too tall, e.g., max 150px
    if (messageInput.scrollHeight > 150) {
        messageInput.style.height = '150px';
    }
};


const sendMessage = async () => {
    const userMessageText = messageInput.value.trim();
    if (!userMessageText) {
        return;
    }

    // Add user message to history and display
    const newUserMessage = { role: "user", content: userMessageText };
    conversationHistory.push(newUserMessage);
    addMessageToChat(userMessageText, "user");

    messageInput.value = ""; // Clear input
    adjustInputHeight(); // Adjust height after clearing

    // Disable input and button while AI is thinking
    messageInput.disabled = true;
    sendButton.disabled = true;
    sendButton.textContent = "Thinking...";

    try {
        // Only send the last 10 messages to the language model to save tokens and maintain context
        const messagesToSend = conversationHistory.slice(-10);

        const completion = await websim.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a friendly and helpful AI assistant. Keep your responses concise and to the point. If asked a factual question, try to provide a direct answer.",
                },
                ...messagesToSend,
            ],
        });

        const aiResponseText = completion.content;
        const newAiMessage = { role: "assistant", content: aiResponseText };
        conversationHistory.push(newAiMessage);
        addMessageToChat(aiResponseText, "ai");

    } catch (error) {
        console.error("Error communicating with AI:", error);
        addMessageToChat("Oops! Something went wrong. Please try again.", "ai");
    } finally {
        // Re-enable input and button
        messageInput.disabled = false;
        sendButton.disabled = false;
        sendButton.textContent = "Send";
        messageInput.focus(); // Focus back on input
    }
};

sendButton.addEventListener('click', sendMessage);

messageInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) { // Send on Enter, unless Shift+Enter for new line
        event.preventDefault(); // Prevent new line in textarea
        sendMessage();
    }
});

messageInput.addEventListener('input', adjustInputHeight); // Adjust height as user types

// Initial adjustment in case of pre-filled text (not applicable here, but good practice)
adjustInputHeight();