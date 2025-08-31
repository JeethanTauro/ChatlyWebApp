package com.example.Chatly.Service;

import com.example.Chatly.Model.ChatMessage;
import com.example.Chatly.Model.User;
import com.example.Chatly.Repository.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor

public class UserService{
    @Autowired
    private UserRepo userRepo;


    public boolean userExists(String username){
        return userRepo.existsByUsername(username);
    }

    public void setUserOnlineStatus(String username , boolean status){
        userRepo.updateUserIsOnline(username,status);
    }
}
