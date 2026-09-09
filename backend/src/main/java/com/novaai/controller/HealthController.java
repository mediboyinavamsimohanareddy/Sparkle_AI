package com.novaai.controller;

import com.novaai.entity.Conversation;
import com.novaai.entity.Folder;
import com.novaai.dto.FileResponse;
import com.novaai.repository.ConversationRepository;
import com.novaai.repository.FolderRepository;
import com.novaai.service.FileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private FolderRepository folderRepository;

    @Autowired
    private FileService fileService;

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "Sparkle AI Backend"));
    }

    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> globalSearch(@RequestParam("q") String query) {
        Map<String, Object> results = new HashMap<>();
        if (query == null || query.isBlank()) {
            results.put("conversations", List.of());
            results.put("folders", List.of());
            results.put("files", List.of());
            return ResponseEntity.ok(results);
        }

        List<Conversation> conversations = conversationRepository.findByTitleContainingIgnoreCase(query);
        List<Folder> folders = folderRepository.findByNameContainingIgnoreCase(query);
        List<FileResponse> files = fileService.getAllFiles(null, null).stream()
                .filter(f -> f.getOriginalName().toLowerCase().contains(query.toLowerCase()))
                .toList();

        results.put("conversations", conversations);
        results.put("folders", folders);
        results.put("files", files);

        return ResponseEntity.ok(results);
    }
}
