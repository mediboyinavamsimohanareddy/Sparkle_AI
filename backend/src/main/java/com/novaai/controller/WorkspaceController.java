package com.novaai.controller;

import com.novaai.dto.WorkspaceRequest;
import com.novaai.entity.Workspace;
import com.novaai.service.WorkspaceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workspaces")
public class WorkspaceController {

    @Autowired
    private WorkspaceService workspaceService;

    @PostMapping
    public ResponseEntity<Workspace> createWorkspace(@RequestBody WorkspaceRequest request) {
        return ResponseEntity.ok(workspaceService.createWorkspace(request));
    }

    @GetMapping
    public ResponseEntity<List<Workspace>> getWorkspaces() {
        return ResponseEntity.ok(workspaceService.getWorkspaces());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Workspace> updateWorkspace(@PathVariable Long id, @RequestBody WorkspaceRequest request) {
        return ResponseEntity.ok(workspaceService.updateWorkspace(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkspace(@PathVariable Long id) {
        workspaceService.deleteWorkspace(id);
        return ResponseEntity.noContent().build();
    }
}
