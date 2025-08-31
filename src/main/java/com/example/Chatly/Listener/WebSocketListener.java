package com.example.Chatly.Listener;



//this basically listenes what is going on in the websocket
//if any new websocket connection happens (someone new added to group chat), we have already handled this in the controller , when user clicks join the message gets broadcasted to evryone

//if somone disconnected (somone left the group chat)
//See a user can join only if he clicks join, so thats handled in the front end
// but a user can leave either by clicking or by unexpected network problems or closing the browser, these are events that user doesnt do so we wont be able to catch it
//


import com.example.Chatly.Model.ChatMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class WebSocketListener {
    @Autowired
    private SimpMessagingTemplate simpMessagingTemplate;

    @EventListener
    public void handleWebSocketDisconnectionListener(SessionDisconnectEvent event) {
        String username = (String) event.getUser().getName(); //get the username from the event

        if (username != null) {
            ChatMessage chatMessage = new ChatMessage();
            chatMessage.setType(ChatMessage.MessageType.LEAVE);
            chatMessage.setSender(username);
            chatMessage.setTimeStamp(LocalDateTime.now());
            simpMessagingTemplate.convertAndSend("/topic/public", chatMessage);
            System.out.println("Disconnected unexpectedly");
        }
    }

}
