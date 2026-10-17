package com.foodydelivery.controllers;

import com.foodydelivery.dto.response.UserResponseDTO;
import com.foodydelivery.services.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(value = UserController.class, properties = {
        "jwt.expirationMs=3600000"
})
@AutoConfigureMockMvc(addFilters = false)
class UserControllerTest {
    @MockitoBean
    private UserService userService;

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldRegisterUser() throws Exception {
        when(userService.register(any(UserService.RegisterDTO.class)))
                .thenReturn(new UserService.UserResponseWithTokenDTO("mocked-jwt-token", new UserResponseDTO(1L, "John Doe", "john.doe@mail.com")));

        mockMvc.perform(post("/v1/users/register")
                        .contentType("application/json")
                        .content("{\"name\":\"John Doe\",\"email\":\"john.doe@mail.com\",\"password\":\"password123\"}"))
                .andExpect(status().isOk())
                .andExpect(cookie().value("jwt", "mocked-jwt-token"));
    }

    @Test
    void shouldLoginUser() throws Exception {
        when(userService.login(any(UserService.LoginDTO.class)))
                .thenReturn(new UserService.UserResponseWithTokenDTO("mocked-jwt-token", new UserResponseDTO(1L, "John Doe", "john.doe@mail.com")));

        mockMvc.perform(post("/v1/users/login")
                        .contentType("application/json")
                        .content("{\"email\":\"john.doe@mail.com\",\"password\":\"password123\"}"))
                .andExpect(status().isOk())
                .andExpect(cookie().value("jwt", "mocked-jwt-token"));
    }

    @Test
    void shouldLogoutUser() throws Exception {
        mockMvc.perform(post("/v1/users/logout")
                        .contentType("application/json"))
                .andExpect(status().isOk())
                .andExpect(cookie().maxAge("jwt", 0));
    }

    @Test
    void shouldReturnUserDetails() throws Exception {
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(1L, null));
        when(userService.findById(1L))
                .thenReturn(new UserResponseDTO(1L, "John Doe", "john.doe@mail.com"));

        mockMvc.perform(get("/v1/users/me")
                        .contentType("application/json"))
                .andExpect(status().isOk());
    }
}