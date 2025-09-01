package com.example.Chatly.JWT;

import com.example.Chatly.Model.User;
import com.example.Chatly.Service.UserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Optional;

//we will generate the token in jwt service

//this is the authentication filter we are creating, when the user does anything,
//on every request the token is sent
//here we have to validate the jwt token

@RequiredArgsConstructor
public class JWTAuthentiationFilter extends OncePerRequestFilter {

    @Autowired
    private JWTService jwtService;

    @Autowired
    private UserService userService;
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        Long userId = null;
        String jwtToken = null;

        //get the auth header from the request sent
        String authHeader = request.getHeader("Authorization");


        //if the auth request is present and it has a bearer, get the jwt token from there
        if(authHeader != null && authHeader.startsWith("Bearer ")){
            jwtToken = authHeader.substring(7);
        }


        //if we couldn't get the jwt token from the auth header lets search in the cookies.
        //remember when the first time a user logs in , we give the jwt token in the cookies with the key "JWT"
        if(jwtToken == null){
            Cookie[] cookies = request.getCookies();
            if(cookies != null){
                for(Cookie cookie : cookies){
                    if("JWT".equals(cookie.getName())){
                        jwtToken = cookie.getValue();
                        break;
                    }
                }
            }
        }


        //if we still didnt get the jwt token then just pass the user to the next filter
        if(jwtToken == null){
            filterChain.doFilter(request,response);
            return;
        }

        //if we got teh token, then lets get the user ID from the token
        userId = jwtService.extractUserId(jwtToken);


        //if we got teh user ID and he is not authenticated
        if(userId != null && SecurityContextHolder.getContext().getAuthentication()==null){

            //get the user
            Optional<User> user = userService.getUserById(userId);
            User userDetails = null;
            if(user.isPresent()){
                userDetails = user.get();
            }
            //validated the token
            if(jwtService.isTokenValid(jwtToken,userDetails)){
                //build the user and add the user in the SecurityContext Holder
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(userDetails , null , Collections.emptyList());

                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        //move to the next filter
        filterChain.doFilter(request,response);
        return;

    }
}
