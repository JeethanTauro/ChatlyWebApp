package com.example.Chatly.Controller;


import com.example.Chatly.DTO.LoginRequestDTO;
import com.example.Chatly.DTO.LoginResponseDTO;
import com.example.Chatly.DTO.RegisterRequestDTO;
import com.example.Chatly.DTO.UserDTO;
import com.example.Chatly.Model.User;
import com.example.Chatly.Service.AuthenticationService;
import com.example.Chatly.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

//for authentication, we can't use websockets, we need a rest controller

@RequiredArgsConstructor
@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthenticationService authenticationService;

    @Autowired
    private UserService userService;

    //signing up for the first time
    @PostMapping("/signup")
    public ResponseEntity<UserDTO> signUp(@RequestBody RegisterRequestDTO registerRequestDTO){
        return ResponseEntity.ok(authenticationService.signUp(registerRequestDTO));
    }


    //logging in with username and password
    //after logging in we are supposed to send a JWT token in the cookie.
    //we are using JWT auth, so we must do stuff manually, if it was basic auth then spring security does session management on it own
    @PostMapping("/login")
    public ResponseEntity<UserDTO> login(@RequestBody LoginRequestDTO loginRequestDTO){
        LoginResponseDTO loginResponseDTO  = authenticationService.login(loginRequestDTO);

        //have to create a cookie which contains a JWT token
        ResponseCookie responseCookie = ResponseCookie.from("jwt" , loginResponseDTO.getToken())
                .httpOnly(true) // JS cannot access the tokens , protects from XSS attacks
                .path("/")
                .maxAge(60*60) //1 hour , time limit for the token, after this user has to log in again
                .sameSite("strict")
                .build();

        //sending the response with the http headers
        return ResponseEntity.ok().
                header(HttpHeaders.COOKIE,responseCookie.toString()).
                body(loginResponseDTO.getUserDTO());
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(){

        return authenticationService.logout();
    }

    @GetMapping("/onlineUsers")
    public ResponseEntity<Map<String, Object>> getOnlineUsers(){
        return ResponseEntity.ok(authenticationService.getOnlineUsers());
    }

    @GetMapping("/getCurrentUser")
    //the authentication object is injected by spring security automatically
    public ResponseEntity<?> getCurrentUser(Authentication authentication){
        if(authentication == null){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("USER NOT AUTHORIZED");
        }

        String username = authentication.getName();
        User user = userService.getUser(username);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("USER NOT FOUND");
        }

        // Convert to DTO to avoid exposing sensitive fields (like password)
        UserDTO userDTO = new UserDTO();
        userDTO.setUsername(user.getUsername());
        userDTO.setId(user.getId());
        userDTO.setOnline(user.isOnline());
        userDTO.setEmail(user.getEmail());

        return ResponseEntity.ok(userDTO);
    }

}
