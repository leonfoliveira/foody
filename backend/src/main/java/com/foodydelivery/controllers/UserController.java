package com.foodydelivery.controllers;

import com.foodydelivery.dto.response.UserResponseDTO;
import com.foodydelivery.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Objects;

@RestController
@RequestMapping("/v1/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @Value("${jwt.expirationMs}")
    private Long jwtExpirationMs;

    @PostMapping("/register")
    public ResponseEntity<UserResponseDTO> register(@RequestBody UserService.RegisterDTO registerDTO) {
        var result = userService.register(registerDTO);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, createJwtCookie(result.token()).toString())
                .body(result.userResponseDTO());
    }

    @PostMapping("/login")
    public ResponseEntity<UserResponseDTO> login(@RequestBody UserService.LoginDTO loginDTO) {
        var result = userService.login(loginDTO);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, createJwtCookie(result.token()).toString())
                .body(result.userResponseDTO());
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        var cookie = ResponseCookie.from("jwt", "")
                .httpOnly(true)
                .path("/")
                .maxAge(0)
                .build();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .build();
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponseDTO> me() {
        var authentication = Objects.requireNonNull(SecurityContextHolder.getContext().getAuthentication());
        var userId = (Long) authentication.getPrincipal();
        var userResponseDTO = userService.findById(userId);
        return ResponseEntity.ok(userResponseDTO);
    }

    private ResponseCookie createJwtCookie(String token) {
        return ResponseCookie.from("jwt", token)
                .httpOnly(true)
                .path("/")
                .sameSite("Lax")
                .maxAge(jwtExpirationMs / 1000)
                .build();
    }
}
