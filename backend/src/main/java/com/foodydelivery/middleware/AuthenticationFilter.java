package com.foodydelivery.middleware;

import com.foodydelivery.services.UserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.WebUtils;

import java.io.IOException;
import java.util.List;
import java.util.logging.Logger;

@Component
@RequiredArgsConstructor
public class AuthenticationFilter extends OncePerRequestFilter {
    private final UserService userService;

    private final Logger logger = Logger.getLogger(AuthenticationFilter.class.getName());

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain) throws ServletException, IOException {
        Cookie JwtCookie = WebUtils.getCookie(request, "jwt");

        if (JwtCookie == null) {
            logger.info("No JWT cookie found in request");
            filterChain.doFilter(request, response);
            return;
        }

        long userId = userService.decodeToken(JwtCookie.getValue());
        logger.info("User ID from JWT: " + userId);

        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(userId, null, List.of()));
        filterChain.doFilter(request, response);
    }
}
