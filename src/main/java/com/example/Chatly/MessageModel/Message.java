package com.example.Chatly.MessageModel;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;


//this is the message model will be used
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Message {
    private String sender; //information of the sender
    private String receiver; //information of the receiver
    private MessageType messageType; //JOIN, LEAVE, LEAVE_PRIVATE, JOIN_PRIVATE
    private boolean isPrivate;// to check if the chat is private
    private String content; // content of the message
    private LocalDateTime timeStamp; //current date time
    public enum MessageType {
        LEAVE, JOIN, JOIN_PRIVATE,LEAVE_PRIVATE
    }
}
