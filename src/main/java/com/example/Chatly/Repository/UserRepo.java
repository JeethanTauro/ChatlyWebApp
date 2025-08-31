package com.example.Chatly.Repository;

import com.example.Chatly.Model.ChatMessage;
import com.example.Chatly.Model.User;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepo extends JpaRepository<User,Long> {
     boolean existsByUsername(String username);

     // we cant use derived methods for updating stuff
    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.isOnline = :status WHERE u.username = :username")
    void updateUserIsOnline(@Param("username") String username, @Param("status") Boolean status);
}
