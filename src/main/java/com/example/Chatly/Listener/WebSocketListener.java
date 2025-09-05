package com.example.Chatly.Controller;

import com.example.Chatly.Model.ChatMessage;
import com.example.Chatly.Service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.time.LocalDateTime;
import java.util.Objects;

@Component
@RequiredArgsConstructor
@Slf4j // ✅ Use a proper logger instead of System.out.println
public class WebSocketListener {

    private final UserService userService;
    private final SimpMessageSendingOperations messagingTemplate;

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());

        // ✅ Retrieve the username we stored in the session attributes
        String username = (String) headerAccessor.getSessionAttributes().get("username");

        if (username != null) {
            log.info("User disconnected: {}", username);

            // ✅ Set user status to offline in the database
            userService.setUserOnlineStatus(username, false);

            // ✅ Create and broadcast a LEAVE message to all users
            var chatMessage = new ChatMessage();
            chatMessage.setType(ChatMessage.MessageType.LEAVE);
            chatMessage.setSender(username);
            chatMessage.setContent(username + " has left the chat.");
            chatMessage.setTimeStamp(LocalDateTime.now());

            messagingTemplate.convertAndSend("/topic/public", chatMessage);
        }
    }
}