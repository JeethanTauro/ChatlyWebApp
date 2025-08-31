package com.example.Chatly.Model;

import jakarta.annotation.Nonnull;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity //defines that this is an entity
@Data //this is a lombok feature where it generates all the getters and the setters
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "users") //table name is "users"

public class User {

    @Id //this means id is a primary key
    @GeneratedValue(strategy = GenerationType.AUTO) //it generates the id in the table automatically
    private Long id;


    @Column(unique = true , nullable = false) //the username of each user must be unique and not null
    private String username;

    @Column(nullable = false)
    private String password; //password cannot be null

    @Column(unique = true, nullable = false) //email of each user must be unique and not null
    private String email;

    @Column(nullable = false , name = "is_Online")
    private boolean isOnline  =false; //by default the user is offline
}
