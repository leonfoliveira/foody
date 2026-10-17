package com.foodydelivery.services;

import com.foodydelivery.dto.response.OrderResponseDTO;
import com.foodydelivery.entities.Order;
import com.foodydelivery.exception.BusinessException;
import com.foodydelivery.exception.NotFoundException;
import com.foodydelivery.repositories.OrderRepository;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @InjectMocks
    private OrderService orderService;

    @Nested
    class CreateTest {

        @Test
        void shouldCreateOrderSuccessfully() {
            OrderService.CreateDTO createDTO = new OrderService.CreateDTO(
                    "John Doe",
                    "Pizza",
                    "Main St"
            );

            Order savedOrder = Order.builder()
                    .id(1L)
                    .customer("John Doe")
                    .items("Pizza")
                    .address("Main St")
                    .status(Order.Status.RECEBIDO)
                    .build();

            when(orderRepository.save(any(Order.class))).thenReturn(savedOrder);

            OrderResponseDTO response = orderService.create(createDTO);

            assertNotNull(response);
            assertEquals(1L, response.id());
            assertEquals("John Doe", response.customer());
            assertEquals("Pizza", response.items());
            assertEquals("Main St", response.address());
            assertEquals(Order.Status.RECEBIDO, response.status());

            ArgumentCaptor<Order> orderCaptor = ArgumentCaptor.forClass(Order.class);
            verify(orderRepository).save(orderCaptor.capture());
            Order capturedOrder = orderCaptor.getValue();
            assertEquals("John Doe", capturedOrder.getCustomer());
            assertEquals(Order.Status.RECEBIDO, capturedOrder.getStatus());
        }
    }

    @Nested
    class UpdateStatusTest {

        @Test
        void shouldUpdateStatusSuccessfully() {
            Long orderId = 1L;
            Order existingOrder = Order.builder()
                    .id(orderId)
                    .customer("John Doe")
                    .items("Pizza")
                    .address("Main St")
                    .status(Order.Status.RECEBIDO)
                    .build();

            when(orderRepository.findById(orderId)).thenReturn(Optional.of(existingOrder));
            when(orderRepository.save(any(Order.class))).thenReturn(existingOrder);

            OrderResponseDTO response = orderService.updateStatus(orderId, Order.Status.EM_PREPARO);

            assertNotNull(response);
            assertEquals(Order.Status.EM_PREPARO, response.status());
            verify(orderRepository).findById(orderId);
            verify(orderRepository).save(existingOrder);
        }

        @Test
        void shouldThrowNotFoundExceptionWhenOrderDoesNotExist() {
            Long orderId = 1L;
            when(orderRepository.findById(orderId)).thenReturn(Optional.empty());

            assertThrows(NotFoundException.class, () ->
                    orderService.updateStatus(orderId, Order.Status.EM_PREPARO)
            );

            verify(orderRepository).findById(orderId);
            verify(orderRepository, never()).save(any(Order.class));
        }

        @Test
        void shouldThrowBusinessExceptionWhenTransitionIsInvalid() {
            Long orderId = 1L;
            Order existingOrder = Order.builder()
                    .id(orderId)
                    .customer("John Doe")
                    .items("Pizza")
                    .address("Main St")
                    .status(Order.Status.ENTREGUE)
                    .build();

            when(orderRepository.findById(orderId)).thenReturn(Optional.of(existingOrder));

            assertThrows(BusinessException.class, () ->
                    orderService.updateStatus(orderId, Order.Status.EM_PREPARO)
            );

            verify(orderRepository).findById(orderId);
            verify(orderRepository, never()).save(any(Order.class));
        }
    }

    @Nested
    class FindAllTest {

        @Test
        void shouldReturnFirstOrderSuccessfully() {
            Order order = Order.builder()
                    .id(1L)
                    .customer("John Doe")
                    .items("Pizza")
                    .address("Main St")
                    .status(Order.Status.RECEBIDO)
                    .build();

            when(orderRepository.findAll()).thenReturn(List.of(order));

            List<OrderResponseDTO> response = orderService.findAll();

            assertNotNull(response);
            assertEquals(1L, response.getFirst().id());
            assertEquals("John Doe", response.getFirst().customer());
            verify(orderRepository).findAll();
        }

        @Test
        void shouldThrowNotFoundExceptionWhenNoOrdersFound() {
            when(orderRepository.findAll()).thenReturn(List.of());

            assertThrows(NotFoundException.class, () -> orderService.findAll());

            verify(orderRepository).findAll();
        }
    }

    @Nested
    class FindByIdTest {

        @Test
        void shouldReturnOrderSuccessfully() {
            Long orderId = 1L;
            Order order = Order.builder()
                    .id(orderId)
                    .customer("John Doe")
                    .items("Pizza")
                    .address("Main St")
                    .status(Order.Status.RECEBIDO)
                    .build();

            when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));

            OrderResponseDTO response = orderService.findById(orderId);

            assertNotNull(response);
            assertEquals(orderId, response.id());
            assertEquals("John Doe", response.customer());
            verify(orderRepository).findById(orderId);
        }

        @Test
        void shouldThrowNotFoundExceptionWhenOrderNotFound() {
            Long orderId = 1L;
            when(orderRepository.findById(orderId)).thenReturn(Optional.empty());

            assertThrows(NotFoundException.class, () -> orderService.findById(orderId));

            verify(orderRepository).findById(orderId);
        }
    }
}