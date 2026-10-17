package com.foodydelivery.services;

import com.foodydelivery.dto.response.UserResponseDTO;
import com.foodydelivery.entities.User;
import com.foodydelivery.exception.ConflictException;
import com.foodydelivery.repositories.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import java.util.logging.Logger;

@Service
@RequiredArgsConstructor
@Validated
public class UserService {
    private final UserRepository userRepository;

    private final Logger logger = Logger.getLogger(this.getClass().getName());

    public record RegisterDTO(
        @NotEmpty(message = "Name cannot be empty")
        String name,
        @Email(message = "Invalid email format")
        String email,
        @Min(value = 8, message = "Password must be at least 8 characters long")
        String password
    ) {}

    @Transactional
    public UserResponseDTO register(@Valid RegisterDTO registerDTO) {
        logger.info("Registering user");

        userRepository.findByEmail(registerDTO.email()).ifPresent(user -> {
            throw new ConflictException("Email is already in use");
        });

        final String hashedPassword = BCrypt.hashpw(registerDTO.password(), BCrypt.gensalt());

        User user = User.builder()
                .name(registerDTO.name())
                .email(registerDTO.email())
                .password(hashedPassword)
                .build();

        userRepository.save(user);

        logger.info("User registered successfully with id: " + user.getId());
        return new UserResponseDTO(user.getId(), user.getName(), user.getEmail());
    }
}
