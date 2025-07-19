package com.example.Chatly.Controller;


import com.example.Chatly.MessageModel.Message;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;

@Controller
public class ChatController {
    @Autowired
    private SimpMessagingTemplate simpMessagingTemplate;

    @MessageMapping("/chat")
    public void send(Message message){
        message.setTimeStamp(LocalDateTime.now()); //setting the  time stamp
        if(!message.isPrivate()){ //if message is public send it to the public topic
            simpMessagingTemplate.convertAndSend("/topic/public", message);
        }
        else {
            // Private message: send to /user/{receiver}/queue/private
            simpMessagingTemplate.convertAndSendToUser(
                    message.getReceiver(), // username
                    "/queue/private",      // destination
                    message //message payload
            );
        }
    }


}
