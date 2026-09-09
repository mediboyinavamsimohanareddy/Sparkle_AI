package com.novaai.repository;

import com.novaai.entity.Folder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FolderRepository extends JpaRepository<Folder, Long> {
    List<Folder> findByWorkspaceId(Long workspaceId);
    List<Folder> findByParentId(Long parentId);
    List<Folder> findByNameContainingIgnoreCase(String query);
}
