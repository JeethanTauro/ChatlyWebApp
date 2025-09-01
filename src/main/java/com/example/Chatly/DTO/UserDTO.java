package com.example.Chatly.DTO;

import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;

@Data
//this is the userdto as we are responding with required info, no password and ID
public class UserDTO {

    private Long id;
    private String username;
    private String email;
    private boolean isOnline  =false;
}
