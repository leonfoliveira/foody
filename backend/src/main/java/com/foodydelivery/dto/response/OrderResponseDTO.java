package com.foodydelivery.dto.response;

import com.foodydelivery.entities.Order;

public record OrderResponseDTO(
    Long id,
    String customer,
    String items,
    String address,
    Order.Status status
) {
}
