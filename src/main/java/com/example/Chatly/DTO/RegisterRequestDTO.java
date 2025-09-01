package com.example.Chatly.DTO;

import lombok.Data;

@Data
//when registering the first time we need the email
public class RegisterRequestDTO {
    private String username;
    private String password;
    private String email;
}
