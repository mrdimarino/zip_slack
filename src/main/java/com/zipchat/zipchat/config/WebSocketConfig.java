package com.zipchat.zipchat.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer{

    /*
     *  STOMP -> Simple Text Oriented Messaging Protocol
     *          - defines format and rules for data exchange
     *  SockJS -> enables fallback options for browsers that dont support websockets
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws").withSockJS();
    }

    /*  ****** ConfigureMessageBroker() *******
     *   The first line defines that the messages whose destination starts with
     *  “/app” should be routed to message-handling methods.
     *
     *  And, the second line defines that the messages whose destination starts with “/topic”
     *  should be routed to the message broker. Message broker broadcasts messages to all
     *  the connected clients who are subscribed to a particular topic.
    */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.setApplicationDestinationPrefixes("/app");
        registry.enableSimpleBroker("/topic");
    }
}
