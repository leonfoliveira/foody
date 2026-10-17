package com.foodydelivery;

import com.foodydelivery.exception.BusinessException;
import com.foodydelivery.exception.ConflictException;
import com.foodydelivery.exception.ForbiddenException;
import com.foodydelivery.exception.NotFoundException;
import com.foodydelivery.exception.UnauthorizedException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {
    private final Map<Class<? extends BusinessException>, HttpStatus> codesByBusinessException = Map.of(
                    NotFoundException.class, HttpStatus.NOT_FOUND,
                    UnauthorizedException.class, HttpStatus.UNAUTHORIZED,
                    ForbiddenException.class, HttpStatus.FORBIDDEN,
                    ConflictException.class, HttpStatus.CONFLICT
            );

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<Map<String, String>> handleBusinessException(BusinessException ex) {
        HttpStatus status = codesByBusinessException.getOrDefault(ex.getClass(), HttpStatus.INTERNAL_SERVER_ERROR);
        return ResponseEntity.status(status).body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleException(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "An unexpected error occurred"));
    }
}
