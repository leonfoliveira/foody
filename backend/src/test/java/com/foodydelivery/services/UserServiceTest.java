package com.foodydelivery.services;

import com.foodydelivery.dto.response.UserResponseDTO;
import com.foodydelivery.entities.User;
import com.foodydelivery.exception.ConflictException;
import com.foodydelivery.repositories.UserRepository;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

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

            final UserResponseDTO responseDTO = userService.register(registerDTO);

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
}