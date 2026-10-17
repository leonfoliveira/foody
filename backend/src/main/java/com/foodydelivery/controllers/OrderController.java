package com.foodydelivery.controllers;

import com.foodydelivery.dto.response.OrderResponseDTO;
import com.foodydelivery.entities.Order;
import com.foodydelivery.services.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/v1/orders")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;

    @PostMapping
    ResponseEntity<OrderResponseDTO> create(@RequestBody OrderService.CreateDTO createDTO) {
        var result = orderService.create(createDTO);
        return ResponseEntity.ok(result);
    }

    @PatchMapping("/{orderId}/status")
    ResponseEntity<OrderResponseDTO> updateStatus(@PathVariable("orderId") Long orderId, @RequestParam(value = "newStatus") Order.Status newStatus) {
        var result = orderService.updateStatus(orderId, newStatus);
        return ResponseEntity.ok(result);
    }

    @GetMapping
    ResponseEntity<List<OrderResponseDTO>> findAll() {
        var result = orderService.findAll();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{orderId}")
    ResponseEntity<OrderResponseDTO> findById(@PathVariable("orderId") Long orderId) {
        var result = orderService.findById(orderId);
        return ResponseEntity.ok(result);
    }
}
