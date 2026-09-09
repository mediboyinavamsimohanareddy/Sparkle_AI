package com.novaai.service;

import com.novaai.dto.FolderRequest;
import com.novaai.entity.Folder;
import com.novaai.repository.FolderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FolderService {

    @Autowired
    private FolderRepository folderRepository;

    public Folder createFolder(FolderRequest request) {
        Folder folder = new Folder(request.getName(), request.getParentId(), request.getWorkspaceId());
        return folderRepository.save(folder);
    }

    public List<Folder> getFolders(Long workspaceId) {
        if (workspaceId != null) {
            return folderRepository.findByWorkspaceId(workspaceId);
        }
        return folderRepository.findAll();
    }

    public Folder updateFolder(Long id, FolderRequest request) {
        Folder folder = folderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Folder not found"));
        if (request.getName() != null) folder.setName(request.getName());
        if (request.getParentId() != null) folder.setParentId(request.getParentId());
        if (request.getWorkspaceId() != null) folder.setWorkspaceId(request.getWorkspaceId());
        return folderRepository.save(folder);
    }

    public void deleteFolder(Long id) {
        folderRepository.deleteById(id);
    }
}
