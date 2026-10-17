package com.foodydelivery.services;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.foodydelivery.dto.response.UserResponseDTO;
import com.foodydelivery.entities.User;
import com.foodydelivery.exception.ConflictException;
import com.foodydelivery.exception.UnauthorizedException;
import com.foodydelivery.repositories.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import java.util.Date;
import java.util.logging.Logger;

@Service
@RequiredArgsConstructor
@Validated
public class UserService {
    private final UserRepository userRepository;

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expirationMs}")
    private Long jwtExpirationMs;

    private final Logger logger = Logger.getLogger(this.getClass().getName());

    public record UserResponseWithTokenDTO(
        String token,
        UserResponseDTO userResponseDTO
    ) {}

    public record RegisterDTO(
        @NotEmpty(message = "Name cannot be empty")
        String name,
        @Email(message = "Invalid email format")
        String email,
        @Min(value = 8, message = "Password must be at least 8 characters long")
        String password
    ) {}

    /**
     * Registers a new user.
     *
     * @param registerDTO the registration data transfer object containing user details
     * @return a UserResponseDTO containing the registered user's information
     * @throws ConflictException if the email is already in use
     */
    @Transactional
    public UserResponseWithTokenDTO register(@Valid final RegisterDTO registerDTO) {
        logger.info("Registering user");

        userRepository.findByEmail(registerDTO.email()).ifPresent(user -> {
            throw new ConflictException("Email is already in use");
        });

        final String hashedPassword = BCrypt.hashpw(registerDTO.password(), BCrypt.gensalt());

        final User user = User.builder()
                .name(registerDTO.name())
                .email(registerDTO.email())
                .password(hashedPassword)
                .build();

        userRepository.save(user);

        final String token = JWT.create()
                .withSubject(user.getId().toString())
                .withExpiresAt(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .sign(Algorithm.HMAC256(jwtSecret));

        logger.info("User registered successfully with id: " + user.getId());
        return new UserResponseWithTokenDTO(token, new UserResponseDTO(user.getId(), user.getName(), user.getEmail()));
    }

    public record LoginDTO(
        @Email(message = "Invalid email format")
        String email,
        @NotEmpty(message = "Password cannot be empty")
        String password
    ) {}

    /**
     * Logs in a user and generates a JWT token.
     *
     * @param loginDTO the login data transfer object containing user credentials
     * @return a Pair containing the JWT token and a UserResponseDTO with user information
     * @throws UnauthorizedException if the email or password is invalid
     */
    @Transactional(readOnly = true)
    public UserResponseWithTokenDTO login(@Valid final LoginDTO loginDTO) {
        logger.info("Logging in user");

        final User user = userRepository.findByEmail(loginDTO.email())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!BCrypt.checkpw(loginDTO.password(), user.getPassword())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        final String token = JWT.create()
                .withSubject(user.getId().toString())
                .withExpiresAt(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .sign(Algorithm.HMAC256(jwtSecret));

        logger.info("User logged in successfully with id: " + user.getId());
        return new UserResponseWithTokenDTO(token, new UserResponseDTO(user.getId(), user.getName(), user.getEmail()));
    }

    /**
     * Decodes a JWT token and retrieves the user ID.
     *
     * @param token the JWT token to decode
     * @return the user ID extracted from the token
     * @throws UnauthorizedException if the token is invalid or expired
     */
    public Long decodeToken(final String token) {
        try {
            return Long.parseLong(JWT.require(Algorithm.HMAC256(jwtSecret))
                    .build()
                    .verify(token)
                    .getSubject());
        } catch (Exception e) {
            throw new UnauthorizedException("Invalid or expired token");
        }
    }
}
