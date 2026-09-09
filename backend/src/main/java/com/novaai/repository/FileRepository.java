package com.novaai.repository;

import com.novaai.entity.UploadedFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FileRepository extends JpaRepository<UploadedFile, Long> {
    List<UploadedFile> findByWorkspaceId(Long workspaceId);
    List<UploadedFile> findByFolderId(Long folderId);
    List<UploadedFile> findByOriginalNameContainingIgnoreCase(String query);
}
