package com.example.Chatly.DTO;

import lombok.Data;

@Data
// after loging in we have to send back a response with JWT Token and the user details
public class LoginResponseDTO {
    private String token;
    private UserDTO userDTO;
}
