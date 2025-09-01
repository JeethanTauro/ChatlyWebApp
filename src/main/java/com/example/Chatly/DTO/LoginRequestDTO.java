package com.example.Chatly.DTO;

import lombok.Data;

@Data
//this is the DTO for login, after registering with email, we can just ask username and password
public class LoginRequestDTO {
    private String username;
    private String password;
}
