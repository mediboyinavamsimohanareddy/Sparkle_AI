package com.novaai.controller;

import com.novaai.dto.FileResponse;
import com.novaai.service.FileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/files")
public class FileController {

    @Autowired
    private FileService fileService;

    @PostMapping("/upload")
    public ResponseEntity<FileResponse> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) Long folderId,
            @RequestParam(required = false) Long workspaceId) {
        return ResponseEntity.ok(fileService.storeFile(file, folderId, workspaceId));
    }

    @GetMapping
    public ResponseEntity<List<FileResponse>> getFiles(
            @RequestParam(required = false) Long workspaceId,
            @RequestParam(required = false) Long folderId) {
        return ResponseEntity.ok(fileService.getAllFiles(workspaceId, folderId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FileResponse> getFile(@PathVariable Long id) {
        return ResponseEntity.ok(fileService.getFile(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFile(@PathVariable Long id) {
        fileService.deleteFile(id);
        return ResponseEntity.noContent().build();
    }
}
