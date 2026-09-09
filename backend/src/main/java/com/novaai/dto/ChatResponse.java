package com.novaai.dto;

import com.novaai.entity.Conversation;
import com.novaai.entity.Message;

public class ChatResponse {
    private Conversation conversation;
    private Message userMessage;
    private Message aiMessage;

    public ChatResponse() {}

    public ChatResponse(Conversation conversation, Message userMessage, Message aiMessage) {
        this.conversation = conversation;
        this.userMessage = userMessage;
        this.aiMessage = aiMessage;
    }

    public Conversation getConversation() { return conversation; }
    public void setConversation(Conversation conversation) { this.conversation = conversation; }

    public Message getUserMessage() { return userMessage; }
    public void setUserMessage(Message userMessage) { this.userMessage = userMessage; }

    public Message getAiMessage() { return aiMessage; }
    public void setAiMessage(Message aiMessage) { this.aiMessage = aiMessage; }
}
