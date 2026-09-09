package com.novaai.controller;

import com.novaai.dto.FolderRequest;
import com.novaai.entity.Folder;
import com.novaai.service.FolderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/folders")
public class FolderController {

    @Autowired
    private FolderService folderService;

    @PostMapping
    public ResponseEntity<Folder> createFolder(@RequestBody FolderRequest request) {
        return ResponseEntity.ok(folderService.createFolder(request));
    }

    @GetMapping
    public ResponseEntity<List<Folder>> getFolders(@RequestParam(required = false) Long workspaceId) {
        return ResponseEntity.ok(folderService.getFolders(workspaceId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Folder> updateFolder(@PathVariable Long id, @RequestBody FolderRequest request) {
        return ResponseEntity.ok(folderService.updateFolder(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFolder(@PathVariable Long id) {
        folderService.deleteFolder(id);
        return ResponseEntity.noContent().build();
    }
}
