package com.foodydelivery.exception;

public class UnauthorizedException extends BusinessException {
    public UnauthorizedException(String message) {
        super(message);
    }
}
