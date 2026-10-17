package com.foodydelivery.services;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.foodydelivery.dto.response.UserResponseDTO;
import com.foodydelivery.entities.User;
import com.foodydelivery.exception.ConflictException;
import com.foodydelivery.exception.UnauthorizedException;
import com.foodydelivery.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Date;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(userService, "jwtSecret", "secret");
        ReflectionTestUtils.setField(userService, "jwtExpirationMs", 3600L);
    }

    @Nested
    class Register {
        @Test
        void shouldThrowConflictExceptionWhenEmailAlreadyExists() {
            final UserService.RegisterDTO registerDTO = new UserService.RegisterDTO(
                    "John Doe",
                    "john.doe@mail.com",
                    "password123"
            );
            when(userRepository.findByEmail(registerDTO.email())).thenReturn(Optional.of(new User()));

            assertThrows(ConflictException.class, () -> userService.register(registerDTO));
        }

        @Test
        void shouldRegisterUserSuccessfully() {
            final UserService.RegisterDTO registerDTO = new UserService.RegisterDTO(
                    "John Doe",
                    "john.doe@mail.com",
                    "password123"
            );
            when(userRepository.findByEmail(registerDTO.email())).thenReturn(Optional.empty());
            when(userRepository.save(any(User.class))).thenAnswer(i -> {
                User user = i.getArgument(0);
                user.setId(1L);
                return user;
            });

            final var result = userService.register(registerDTO);
            final UserResponseDTO responseDTO = result.userResponseDTO();

            assertEquals("John Doe", responseDTO.name());
            assertEquals("john.doe@mail.com", responseDTO.email());
            final ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
            verify(userRepository).save(userCaptor.capture());
            final User savedUser = userCaptor.getValue();
            assertEquals(registerDTO.name(), savedUser.getName());
            assertEquals(registerDTO.email(), savedUser.getEmail());
            assertNotEquals(registerDTO.password(), savedUser.getPassword());
        }
    }

    @Nested
    class Login {
        @Test
        void shouldThrowUnauthorizedExceptionWhenEmailDoesNotExist() {
            final UserService.LoginDTO loginDTO = new UserService.LoginDTO(
                    "john.doe@mail.com",
                    "password123"
            );
            when(userRepository.findByEmail(loginDTO.email())).thenReturn(Optional.empty());

            assertThrows(UnauthorizedException.class, () -> userService.login(loginDTO));
        }

        @Test
        void shouldThrowUnauthorizedExceptionWhenPasswordIsIncorrect() {
            final UserService.LoginDTO loginDTO = new UserService.LoginDTO(
                    "john.doe@mail.com",
                    "wrongpassword"
            );
            final User user = new User();
            user.setPassword(BCrypt.hashpw("password123", BCrypt.gensalt()));
            when(userRepository.findByEmail(loginDTO.email())).thenReturn(Optional.of(user));

            assertThrows(UnauthorizedException.class, () -> userService.login(loginDTO));
        }

        @Test
        void shouldLoginSuccessfully() {
            final UserService.LoginDTO loginDTO = new UserService.LoginDTO(
                    "john.doe@mail.com",
                    "password123"
            );
            final User user = new User();
            user.setId(1L);
            user.setPassword(BCrypt.hashpw("password123", BCrypt.gensalt()));
            when(userRepository.findByEmail(loginDTO.email())).thenReturn(Optional.of(user));

            final var result = userService.login(loginDTO);

            assertEquals(user.getId(), result.userResponseDTO().id());
        }
    }

    @Nested
    class DecodeToken {
        @Test
        void shouldThrowExceptionWhenTokenIsInvalid() {
            final String invalidToken = "invalid.token.here";

            assertThrows(UnauthorizedException.class, () -> userService.decodeToken(invalidToken));
        }

        @Test
        void shouldDecodeTokenSuccessfully() {
            final User user = new User();
            user.setId(1L);
            user.setName("John Doe");
            user.setEmail("john.doe@mail.com");
            final String token = JWT.create()
                    .withSubject(user.getId().toString())
                    .withExpiresAt(new Date(System.currentTimeMillis() + 3600))
                    .sign(Algorithm.HMAC256("secret"));

            final Long userId = userService.decodeToken(token);

            assertEquals(user.getId(), userId);
        }
    }

    @Nested
    class FindById {
        @Test
        void shouldThrowNotFoundExceptionWhenUserDoesNotExist() {
            final Long userId = 1L;
            when(userRepository.findById(userId)).thenReturn(Optional.empty());

            assertThrows(RuntimeException.class, () -> userService.findById(userId));
        }

        @Test
        void shouldFindUserByIdSuccessfully() {
            final Long userId = 1L;
            final User user = new User();
            user.setId(userId);
            user.setName("John Doe");
            user.setEmail("john.doe@mail.com");
            when(userRepository.findById(userId)).thenReturn(Optional.of(user));

            final UserResponseDTO responseDTO = userService.findById(userId);

            assertEquals(user.getId(), responseDTO.id());
            assertEquals(user.getName(), responseDTO.name());
            assertEquals(user.getEmail(), responseDTO.email());
        }
    }
}