package com.foodydelivery.controllers;

import com.foodydelivery.dto.response.OrderResponseDTO;
import com.foodydelivery.entities.Order;
import com.foodydelivery.services.OrderService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(value = OrderController.class)
@AutoConfigureMockMvc(addFilters = false)
class OrderControllerTest {

    @MockitoBean
    private OrderService orderService;

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldCreateOrder() throws Exception {
        when(orderService.create(any(OrderService.CreateDTO.class)))
                .thenReturn(new OrderResponseDTO(1L, "John Doe", "Pizza, Coke", "123 Main St", Order.Status.RECEBIDO));

        mockMvc.perform(post("/v1/orders")
                        .contentType("application/json")
                        .content("{}"))
                .andExpect(status().isOk());
    }

    @Test
    void shouldUpdateOrderStatus() throws Exception {
        when(orderService.updateStatus(eq(1L), any(Order.Status.class)))
                .thenReturn(new OrderResponseDTO(1L, "John Doe", "Pizza, Coke", "123 Main St", Order.Status.RECEBIDO));

        mockMvc.perform(patch("/v1/orders/1/status")
                        .param("newStatus", "RECEBIDO"))
                .andExpect(status().isOk());
    }

    @Test
    void shouldFindAllOrders() throws Exception {
        when(orderService.findAll())
                .thenReturn(List.of(new OrderResponseDTO(1L, "John Doe", "Pizza, Coke", "123 Main St", Order.Status.RECEBIDO)));

        mockMvc.perform(get("/v1/orders"))
                .andExpect(status().isOk());
    }

    @Test
    void shouldFindOrderById() throws Exception {
        when(orderService.findById(1L))
                .thenReturn(new OrderResponseDTO(1L, "John Doe", "Pizza, Coke", "123 Main St", Order.Status.RECEBIDO));

        mockMvc.perform(get("/v1/orders/1"))
                .andExpect(status().isOk());
    }
}