package com.example.Chatly.Controller;


import com.example.Chatly.Model.ChatMessage;
import com.example.Chatly.Model.User;
import com.example.Chatly.Repository.ChatMessageRepo;
import com.example.Chatly.Service.ChatMessageService;
import com.example.Chatly.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.converter.SimpleMessageConverter;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;
import java.util.List;


@Controller
// aren't using RestController because that's for HTTP methods, this is STOMP websockets
// also we aren't using any RequestMapping because we aren't exposing our backend API's
@RequiredArgsConstructor
public class ChatController {
    // < ----Info on some annotations----- >
    // any endpoint starting with /app goes to @MessageMapping
    // @SimpMessageHeaderAccess is an annotation used for accessing the websocket messages headers.
    // @Payload is basically used for getting the body from websocket messages because we aren't using HTTP methods, remember we are using a whole different protocol

    @Autowired
    private UserService userService;

    @Autowired
    private ChatMessageService chatMessageService;

    @Autowired
    private SimpMessagingTemplate simpMessagingTemplate; //its a bean provided by WebSocket/STOMP
    //messageMapping allows us to accept messages and route it, but this bean allows us to publish messages



    //<----------- USER JOINS----------->(on front end we click join)
    @MessageMapping("/chat.addUser") // so the user hit /app/chat.addUser
    @SendTo("/topic/public") //now send whatever is returned by this method to the public channel
    public ChatMessage addUser(@Payload ChatMessage chatMessage, SimpMessageHeaderAccessor simpMessageHeaderAccessor) {
        //the user joined chat, everyone should know who joined

        //first the user must create an account then click on the join button
        if(userService.userExists(chatMessage.getSender())){ //is the user in the DB, i.e is he authenticated?

            //store username in the session, each websocket session has its own attributes
            //we store session manually here unlike HTTP where the server creates a HTTP session and then returns it to the client
            //here websocket never closes and it is statefull, so we need sessions.
            simpMessageHeaderAccessor.getSessionAttributes().put("username",chatMessage.getSender());

            //set the user status as online
            userService.setUserOnlineStatus(chatMessage.getSender(),true);

            System.out.println("User added successfully "+chatMessage.getSender()+" with session id : "+simpMessageHeaderAccessor.getSessionId());

            //set the time the user joined the chat
            chatMessage.setTimeStamp(LocalDateTime.now());

            if(chatMessage.getContent() == null){
                chatMessage.setContent(""); //when i click join i dont send any message, so this message gets saved in db, if i dont do "" it will save null
            }

            chatMessage.setType(ChatMessage.MessageType.JOIN); //user joined at this time

            System.out.println(chatMessage.getSender()+" joined");

            //finally saves the message
            chatMessageService.saveMessage(chatMessage);

            // ✅ Broadcast updated online users list to all users
            List<User> onlineUsers = userService.getIsOnlineUsers();
            simpMessagingTemplate.convertAndSend("/topic/onlineUsers", onlineUsers);

            //join message
            ChatMessage joinMessage = new ChatMessage();
            joinMessage.setSender(chatMessage.getSender());
            joinMessage.setTimeStamp(chatMessage.getTimeStamp());
            joinMessage.setType(chatMessage.getType());
            joinMessage.setContent(chatMessage.getSender()+" joined the chat");

           return joinMessage;
        }
        return null;
    }



    //<----------- USER SENDS PUBLIC MESSAGE-----------> (on front end we click send)
    @MessageMapping("/chat.sendMessage")// the user hit /app/chat.sendMessage
    @SendTo("/topic/public")// now send whatever is returned by this method to the public channel
    public ChatMessage sendMessage(@Payload ChatMessage chatMessage){
        //public messages are being sent by the user

        if(userService.userExists(chatMessage.getSender())){
            //set the time when message was sent
            if(chatMessage.getTimeStamp() == null){
                chatMessage.setTimeStamp(LocalDateTime.now());
            }

            // Reject empty messages
            if (chatMessage.getContent() == null || chatMessage.getContent().trim().isEmpty()) {
                throw new IllegalArgumentException("Message content cannot be empty");
            }


            //sending a group chat
            chatMessage.setType(ChatMessage.MessageType.CHAT);

            //finally save the messages being sent in the ChatMessageRepo
            return chatMessageService.saveMessage(chatMessage);

        }
        return null;
    }


    //<----------- USER SENDS PRIVATE MESSAGE----------->
    @MessageMapping("/chat.sendPrivateMessage")// the user hit /app/chat.sendPrivateMessage
    public void sendPrivateMessage(@Payload ChatMessage chatMessage, SimpMessageHeaderAccessor simpMessageHeaderAccessor){
        //here we aren't returning anything, we will build the private user endpoint her and send the message to that user only
        if(userService.userExists(chatMessage.getSender()) && userService.userExists(chatMessage.getRecipient())){
            if(chatMessage.getTimeStamp() == null){
                chatMessage.setTimeStamp(LocalDateTime.now());
            }

            if(chatMessage.getContent() == null || chatMessage.getContent().trim().isEmpty()) {
                System.out.println("Empty message, ignoring");
                return;
            }
            chatMessage.setType(ChatMessage.MessageType.PRIVATE_CHAT);

            ChatMessage savedChatMessage = chatMessageService.saveMessage(chatMessage);
            System.out.println("Message saved "+savedChatMessage.getContent()+" with id "+savedChatMessage.getId());

            try{
                //sending the message to the recipient
                String recipientDestination = "/user/"+savedChatMessage.getRecipient()+"/queue/private";
                System.out.println("Sending message to destination : "+recipientDestination);
                simpMessagingTemplate.convertAndSend(recipientDestination,savedChatMessage);

                //have to send the messgae back to user to show in front end
                String senderDestination = "/user/"+savedChatMessage.getSender()+"/queue/private";
                System.out.println("Sending message back to sender : "+senderDestination);
                simpMessagingTemplate.convertAndSend(senderDestination,savedChatMessage);
            }
            catch (Exception e){
                System.out.println("Error occured while sending the message"+e.getMessage());
            }
        }
        else{
            System.out.println("EROR: "+chatMessage.getSender()+" or "+chatMessage.getRecipient()+" does not exist");
        }
    }
    @MessageMapping("/chat.leaveUser")
    public void leaveUser(@Payload ChatMessage chatMessage, SimpMessageHeaderAccessor headerAccessor) {
        if (!userService.userExists(chatMessage.getSender())) return;

        // Set user as offline
        userService.setUserOnlineStatus(chatMessage.getSender(), false);

        System.out.println("User left: " + chatMessage.getSender());

        // Prepare LEAVE message
        chatMessage.setTimeStamp(LocalDateTime.now());
        chatMessage.setContent(chatMessage.getSender() + " left the chat");
        chatMessage.setType(ChatMessage.MessageType.LEAVE);

        // Save in DB
        chatMessageService.saveMessage(chatMessage);

        // ✅ Broadcast updated online users list to all users
        List<User> onlineUsers = userService.getIsOnlineUsers();
        simpMessagingTemplate.convertAndSend("/topic/onlineUsers", onlineUsers);

        // ✅ Optionally broadcast LEAVE message to public chat
        simpMessagingTemplate.convertAndSend("/topic/public", chatMessage);
    }
}
