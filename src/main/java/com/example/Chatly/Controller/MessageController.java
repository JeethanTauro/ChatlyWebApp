package com.example.Chatly.Controller;


import com.example.Chatly.Model.ChatMessage;
import com.example.Chatly.Repository.ChatMessageRepo;
import com.example.Chatly.Service.ChatMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private ChatMessageService chatMessageService;
    @GetMapping("/private")
    public ResponseEntity<List<ChatMessage>> getPrivateMessages(@RequestParam String user1 , @RequestParam String user2){
        List<ChatMessage> messages = chatMessageService.privateMessagesBetweenTwoUsers(user1, user2);
        return ResponseEntity.ok(messages);
    }
}
