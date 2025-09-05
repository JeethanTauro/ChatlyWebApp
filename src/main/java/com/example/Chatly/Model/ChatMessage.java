package com.example.Chatly.Model;


import jakarta.persistence.*;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
@Data
@Entity
@Table(name = "chat_messages")
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id; // the message id in the table


    private String content; //the actual content of the message

    @Column(nullable = false)
    private LocalDateTime timeStamp; //the timestamp at which the message is sent

    private String color; //Here each user will be given a random color for messages and profile

    private String sender; // sent by whom

    private String recipient; //sent to whom, this field is important for sending the private messages

    @Enumerated(EnumType.STRING)
    private MessageType type; //this is very important as we can see if the message is a 'Text', 'Leave' , 'Private','Public' etc
    //let's take an example, Jeethan is right now typing a message, so it will show on others phone

    public enum MessageType{
        CHAT, PRIVATE_CHAT,JOIN, LEAVE, TYPING
    }

}
