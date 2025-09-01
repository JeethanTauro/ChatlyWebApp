package com.example.Chatly.Service;

import com.example.Chatly.DTO.LoginRequestDTO;
import com.example.Chatly.DTO.LoginResponseDTO;
import com.example.Chatly.DTO.RegisterRequestDTO;
import com.example.Chatly.DTO.UserDTO;
import com.example.Chatly.JWT.JWTService;
import com.example.Chatly.Model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JWTService jwtService;

    public UserDTO signUp(RegisterRequestDTO registerRequestDTO){
        String username = registerRequestDTO.getUsername();
        if(userService.userExists(username)){
            //username already exists
            throw new RuntimeException("Username already exists");
        }
        User user =new User();
        user.setUsername(username);
        user.setEmail(registerRequestDTO.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequestDTO.getPassword()));


        //saving the user in the db
        User savedUser = userService.saveUser(user);

        //reutrning userdto

        UserDTO userDTO = new UserDTO();
        userDTO.setUsername(savedUser.getUsername());
        userDTO.setId(savedUser.getId());
        userDTO.setOnline(savedUser.isOnline());
        userDTO.setEmail(savedUser.getEmail());

        return userDTO;
    }

    public LoginResponseDTO login(LoginRequestDTO loginRequestDTO){
        String username = loginRequestDTO.getUsername();

        //authenticate the username and passwrod, if any one of those are wrong then we can return an exception saying invalid credentials
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(username,loginRequestDTO.getPassword()));


        User user = userService.getUser(username);


        UserDTO userDTO = new UserDTO();
        userDTO.setUsername(user.getUsername());
        userDTO.setId(user.getId());
        userDTO.setOnline(user.isOnline());
        userDTO.setEmail(user.getEmail());


        String jwtToken = jwtService.generateToken(user);
        return LoginResponseDTO.builder()
                .token(jwtToken)
                .userDTO(userDTO)
                .build();

    }

    public ResponseEntity<String> logout(){
        ResponseCookie responseCookie = ResponseCookie.from("JWT","")
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(0)
                .sameSite("strict")
                .build();
        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, responseCookie.toString())
                .body("Logged out successfully");

    }
}
