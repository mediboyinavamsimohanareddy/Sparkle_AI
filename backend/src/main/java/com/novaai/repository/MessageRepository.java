package com.novaai.repository;

import com.novaai.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByConversationIdOrderByIdAsc(Long conversationId);
    List<Message> findByContentContainingIgnoreCase(String query);
}
