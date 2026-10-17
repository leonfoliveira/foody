package com.foodydelivery.services;

import com.foodydelivery.dto.response.OrderResponseDTO;
import com.foodydelivery.entities.Order;
import com.foodydelivery.exception.BusinessException;
import com.foodydelivery.exception.NotFoundException;
import com.foodydelivery.repositories.OrderRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Validated
public class OrderService {
    private final OrderRepository orderRepository;

    private static final Map<Order.Status, Set<Order.Status>> VALID_STATUS_TRANSITIONS = Map.of(
        Order.Status.RECEBIDO, Set.of(Order.Status.EM_PREPARO, Order.Status.CANCELADO),
        Order.Status.EM_PREPARO, Set.of(Order.Status.SAIU_PARA_ENTREGA, Order.Status.CANCELADO),
        Order.Status.SAIU_PARA_ENTREGA, Set.of(Order.Status.ENTREGUE, Order.Status.CANCELADO),
        Order.Status.ENTREGUE, Set.of(),
        Order.Status.CANCELADO, Set.of()
    );

    public record CreateDTO(
            @NotEmpty
            String customer,
            @NotEmpty
            String items,
            @NotEmpty
            String address,
            Order.Status status
    ) {}

    @Transactional
    public OrderResponseDTO create(@Valid final CreateDTO createDTO) {
        Order order = Order.builder()
                .customer(createDTO.customer())
                .items(createDTO.items())
                .address(createDTO.address())
                .status(createDTO.status())
                .build();

        Order savedOrder = orderRepository.save(order);

        return new OrderResponseDTO(
                savedOrder.getId(),
                savedOrder.getCustomer(),
                savedOrder.getItems(),
                savedOrder.getAddress(),
                savedOrder.getStatus()
        );
    }

    @Transactional
    public OrderResponseDTO updateStatus(Long orderId, Order.Status newStatus) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new NotFoundException("Order not found with id: " + orderId));

        if (!VALID_STATUS_TRANSITIONS.get(order.getStatus()).contains(newStatus)) {
            throw new BusinessException("Invalid status transition from " + order.getStatus() + " to " + newStatus);
        }

        order.setStatus(newStatus);
        orderRepository.save(order);

        return new OrderResponseDTO(
            order.getId(),
            order.getCustomer(),
            order.getItems(),
            order.getAddress(),
            order.getStatus()
        );
    }

    @Transactional(readOnly = true)
    public OrderResponseDTO findAll() {
        return orderRepository.findAll().stream()
            .map(order -> new OrderResponseDTO(
                order.getId(),
                order.getCustomer(),
                order.getItems(),
                order.getAddress(),
                order.getStatus()
            ))
            .findFirst()
            .orElseThrow(() -> new NotFoundException("No orders found"));
    }

    @Transactional(readOnly = true)
    public OrderResponseDTO findById(Long id) {
        Order order = orderRepository.findById(id).orElseThrow(() -> new NotFoundException("Order not found with id: " + id));
        return new OrderResponseDTO(
            order.getId(),
            order.getCustomer(),
            order.getItems(),
            order.getAddress(),
            order.getStatus()
        );
    }
}
