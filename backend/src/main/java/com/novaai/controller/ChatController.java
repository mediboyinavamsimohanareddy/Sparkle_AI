package com.novaai.controller;

import com.novaai.dto.ChatRequest;
import com.novaai.dto.ChatResponse;
import com.novaai.entity.Conversation;
import com.novaai.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/chats", "/api/chat"})
public class ChatController {

    @Autowired
    private ChatService chatService;

    @PostMapping
    public ResponseEntity<ChatResponse> createOrContinueChat(@RequestBody ChatRequest request) {
        return ResponseEntity.ok(chatService.processChat(request));
    }

    @GetMapping
    public ResponseEntity<List<Conversation>> getConversations(
            @RequestParam(required = false) Long workspaceId,
            @RequestParam(required = false) String q) {
        return ResponseEntity.ok(chatService.getAllConversations(workspaceId, q));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Conversation> getConversation(@PathVariable Long id) {
        return ResponseEntity.ok(chatService.getConversation(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Conversation> updateConversation(@PathVariable Long id, @RequestBody Conversation conversation) {
        return ResponseEntity.ok(chatService.updateConversation(id, conversation));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteConversation(@PathVariable Long id) {
        chatService.deleteConversation(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/regenerate")
    public ResponseEntity<ChatResponse> regenerateResponse(@PathVariable Long id) {
        return ResponseEntity.ok(chatService.regenerateResponse(id));
    }
}
