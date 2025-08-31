package com.example.Chatly.Service;

import com.example.Chatly.Model.ChatMessage;
import com.example.Chatly.Repository.ChatMessageRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatMessageService {
    @Autowired
    private ChatMessageRepo chatMessageRepo;

    public ChatMessage saveMessage(ChatMessage chatMessage){
        return chatMessageRepo.save(chatMessage);
    }

    public List<ChatMessage> privateMessagesBetweenTwoUsers(String user1, String user2){
        return chatMessageRepo.findPrivateMessagesBetweenTwoUsers(user1, user2);
    }
}
