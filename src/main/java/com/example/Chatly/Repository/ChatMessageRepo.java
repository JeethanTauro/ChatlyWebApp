package com.example.Chatly.Repository;

import com.example.Chatly.Model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepo extends JpaRepository<ChatMessage, Long> {

    // query to write get all the private messages between the two users
    @Query("SELECT cm FROM ChatMessage cm " +
            "WHERE cm.type = :type " +
            "AND ((cm.sender = :user1 AND cm.recipient = :user2) " +
            "  OR (cm.sender = :user2 AND cm.recipient = :user1)) " +
            "ORDER BY cm.timeStamp ASC")
    List<ChatMessage> findPrivateMessagesBetweenTwoUsers(@Param("user1") String user1,
                                                         @Param("user2") String user2,
                                                         @Param("type") ChatMessage.MessageType type);
}
