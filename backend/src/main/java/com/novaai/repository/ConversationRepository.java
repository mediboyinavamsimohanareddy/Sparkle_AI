package com.novaai.repository;

import com.novaai.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    List<Conversation> findByWorkspaceIdOrderByUpdatedAtDesc(Long workspaceId);
    List<Conversation> findByFolderIdOrderByUpdatedAtDesc(Long folderId);
    List<Conversation> findAllByOrderByUpdatedAtDesc();
    List<Conversation> findByTitleContainingIgnoreCase(String query);
}
