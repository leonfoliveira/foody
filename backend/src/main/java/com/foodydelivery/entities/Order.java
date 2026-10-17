package com.foodydelivery.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    @Column(nullable = false)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    private String customer;

    private String items;

    private String address;

    private Status status = Status.RECEBIDO;

    public enum Status {
        RECEBIDO,
        EM_PREPARO,
        SAIU_PARA_ENTREGA,
        ENTREGUE,
        CANCELADO
    }
}
