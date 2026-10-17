package com.foodydelivery.middleware;

import com.foodydelivery.exception.UnauthorizedException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.jspecify.annotations.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.WebUtils;

import java.io.IOException;
import java.util.List;

@Component
public class AuthenticationFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain) throws ServletException, IOException {
        Cookie nullableUserId = WebUtils.getCookie(request, "userId");

        if (nullableUserId == null) {
            filterChain.doFilter(request, response);
            return;
        }

        long userId;
        try {
            userId = Long.parseLong(String.valueOf(nullableUserId.getValue()));
        } catch (Exception e) {
            throw new UnauthorizedException("Invalid userId cookie value");
        }

        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(userId, null, List.of()));
        filterChain.doFilter(request, response);
    }
}
