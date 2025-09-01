package com.example.Chatly.Service;

import com.example.Chatly.Model.ChatMessage;
import com.example.Chatly.Model.User;
import com.example.Chatly.Repository.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

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
    public User getUser(String username){
        return userRepo.findByUsername(username);
    }
    public User saveUser(User user){
        return userRepo.save(user);
    }

    public Optional<User> getUserById(Long userId){
        return userRepo.findById(userId);
    }
}
