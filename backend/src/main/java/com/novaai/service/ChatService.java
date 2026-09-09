package com.novaai.service;

import com.novaai.dto.ChatRequest;
import com.novaai.dto.ChatResponse;
import com.novaai.entity.Conversation;
import com.novaai.entity.Message;
import com.novaai.repository.ConversationRepository;
import com.novaai.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ChatService {

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private AiService aiService;

    @Transactional
    public ChatResponse processChat(ChatRequest request) {
        Conversation conversation;

        if (request.getConversationId() != null) {
            conversation = conversationRepository.findById(request.getConversationId())
                    .orElseGet(() -> createNewConversation(request));
        } else {
            conversation = createNewConversation(request);
        }

        // Save User Message
        Message userMsg = new Message("user", request.getPrompt());
        userMsg.setImageUrl(request.getImageUrl());
        userMsg.setFileName(request.getFileName());
        if (request.getFileContent() != null) {
            userMsg.setFileSize((long) request.getFileContent().length());
        }
        userMsg.setConversation(conversation);
        userMsg = messageRepository.save(userMsg);
        if (!conversation.getMessages().contains(userMsg)) {
            conversation.getMessages().add(userMsg);
        }

        // Fetch History for AI
        List<Message> history = conversation.getMessages();

        // Call AI Service
        String aiText = aiService.generateResponse(
                request.getPrompt(),
                history,
                request.getMode(),
                request.getModel(),
                request.getImageUrl(),
                request.getFileContent()
        );

        // Save AI Message
        Message aiMsg = new Message("ai", aiText);
        aiMsg.setConversation(conversation);
        aiMsg = messageRepository.save(aiMsg);
        if (!conversation.getMessages().contains(aiMsg)) {
            conversation.getMessages().add(aiMsg);
        }

        conversation = conversationRepository.save(conversation);

        return new ChatResponse(conversation, userMsg, aiMsg);
    }

    private Conversation createNewConversation(ChatRequest request) {
        String title = request.getPrompt();
        if (title == null || title.isBlank()) {
            title = "New Chat Session";
        } else if (title.length() > 40) {
            title = title.substring(0, 37) + "...";
        }
        Conversation conversation = new Conversation(title, request.getMode(), request.getModel());
        conversation.setWorkspaceId(request.getWorkspaceId());
        conversation.setFolderId(request.getFolderId());
        return conversationRepository.save(conversation);
    }

    public List<Conversation> getAllConversations(Long workspaceId, String query) {
        if (query != null && !query.isBlank()) {
            return conversationRepository.findByTitleContainingIgnoreCase(query);
        }
        if (workspaceId != null) {
            return conversationRepository.findByWorkspaceIdOrderByUpdatedAtDesc(workspaceId);
        }
        return conversationRepository.findAllByOrderByUpdatedAtDesc();
    }

    public Conversation getConversation(Long id) {
        return conversationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Conversation not found with ID: " + id));
    }

    @Transactional
    public Conversation updateConversation(Long id, Conversation updated) {
        Conversation conv = getConversation(id);
        if (updated.getTitle() != null) conv.setTitle(updated.getTitle());
        if (updated.getFolderId() != null) conv.setFolderId(updated.getFolderId());
        if (updated.getWorkspaceId() != null) conv.setWorkspaceId(updated.getWorkspaceId());
        if (updated.getPinned() != null) conv.setPinned(updated.getPinned());
        return conversationRepository.save(conv);
    }

    @Transactional
    public void deleteConversation(Long id) {
        conversationRepository.deleteById(id);
    }

    @Transactional
    public ChatResponse regenerateResponse(Long conversationId) {
        Conversation conv = getConversation(conversationId);
        List<Message> msgs = conv.getMessages();
        if (msgs.isEmpty()) {
            throw new RuntimeException("Cannot regenerate empty conversation");
        }

        // Find last user message
        Message lastUserMsg = null;
        for (int i = msgs.size() - 1; i >= 0; i--) {
            if ("user".equalsIgnoreCase(msgs.get(i).getSender())) {
                lastUserMsg = msgs.get(i);
                break;
            }
        }

        if (lastUserMsg == null) {
            throw new RuntimeException("No user prompt found to regenerate response");
        }

        // Remove last AI message if exists
        if ("ai".equalsIgnoreCase(msgs.get(msgs.size() - 1).getSender())) {
            Message lastAi = msgs.remove(msgs.size() - 1);
            messageRepository.delete(lastAi);
        }

        // Re-generate
        String aiText = aiService.generateResponse(
                lastUserMsg.getContent(),
                conv.getMessages(),
                conv.getMode(),
                conv.getModel(),
                lastUserMsg.getImageUrl(),
                null
        );

        Message newAiMsg = new Message("ai", aiText);
        conv.addMessage(newAiMsg);
        conversationRepository.save(conv);

        return new ChatResponse(conv, lastUserMsg, newAiMsg);
    }
}
