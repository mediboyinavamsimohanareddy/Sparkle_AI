package com.novaai.service;

import com.novaai.dto.WorkspaceRequest;
import com.novaai.entity.Workspace;
import com.novaai.repository.WorkspaceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WorkspaceService {

    @Autowired
    private WorkspaceRepository workspaceRepository;

    public Workspace createWorkspace(WorkspaceRequest request) {
        Workspace ws = new Workspace(request.getName(), request.getDescription());
        if (request.getIcon() != null) ws.setIcon(request.getIcon());
        if (request.getColor() != null) ws.setColor(request.getColor());
        return workspaceRepository.save(ws);
    }

    public List<Workspace> getWorkspaces() {
        List<Workspace> list = workspaceRepository.findAll();
        if (list.isEmpty()) {
            Workspace def = new Workspace("Personal", "Default workspace");
            list.add(workspaceRepository.save(def));
        }
        return list;
    }

    public Workspace updateWorkspace(Long id, WorkspaceRequest request) {
        Workspace ws = workspaceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));
        if (request.getName() != null) ws.setName(request.getName());
        if (request.getDescription() != null) ws.setDescription(request.getDescription());
        if (request.getIcon() != null) ws.setIcon(request.getIcon());
        if (request.getColor() != null) ws.setColor(request.getColor());
        return workspaceRepository.save(ws);
    }

    public void deleteWorkspace(Long id) {
        workspaceRepository.deleteById(id);
    }
}
