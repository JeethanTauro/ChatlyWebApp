package com.example.Chatly.Config;


import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker //This annotation allows us to use STOMP over websockets
//if we don't use this annotation we will have to use raw websockets
//this annotation also tells spring all the annotations required for the websocket to work


//the interface we are implementing is used to configure the STOMP websocket

public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {

        //spring enables a message broker, here any messages with these prefixes will be routed in the required manner
        config.enableSimpleBroker("/topic","/queue","/user");


        //client messages sent from /app prefix will be routed by the controller annotated with @MessageMapping
        config.setApplicationDestinationPrefixes("/app");


        //client messages sent from /user prefix will be routed to some other private user
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        //this is our entry point, this is where our front end will connect
        registry.addEndpoint("/ws")
                .setAllowedOrigins("http://localhost:5173" , "http://localhost:3000") //CORS
                .withSockJS(); //fallback mechanism, sometimes some browsers dont allow STOMP
    }
}
