package com.election.assistant.service;

import com.election.assistant.config.GoogleTokenVerifier;
import com.election.assistant.dto.AuthResponse;
import com.election.assistant.entity.AppUser;
import com.election.assistant.repository.UserRepository;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final GoogleTokenVerifier googleTokenVerifier;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthService(GoogleTokenVerifier googleTokenVerifier,
                       UserRepository userRepository,
                       JwtService jwtService,
                       PasswordEncoder passwordEncoder) {
        this.googleTokenVerifier = googleTokenVerifier;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    public AuthResponse authenticateGoogleUser(String idToken) {
        Optional<GoogleIdToken.Payload> payloadOpt = googleTokenVerifier.verify(idToken);

        if (payloadOpt.isEmpty()) {
            throw new IllegalArgumentException("Invalid Google ID token");
        }

        GoogleIdToken.Payload payload = payloadOpt.get();
        String email = payload.getEmail();
        String name = (String) payload.get("name");
        String picture = (String) payload.get("picture");

        AppUser user = userRepository.findByEmail(email)
                .map(existing -> {
                    existing.setName(name != null ? name : existing.getName());
                    existing.setPicture(picture);
                    existing.setLastLoginAt(LocalDateTime.now());
                    return userRepository.save(existing);
                })
                .orElseGet(() -> {
                    log.info("Creating new user for email: {}", email);
                    AppUser newUser = new AppUser(
                            email,
                            name != null ? name : email,
                            picture,
                            "GOOGLE"
                    );
                    return userRepository.save(newUser);
                });

        String appToken = jwtService.generateToken(user);

        return new AuthResponse(
                appToken,
                user.getEmail(),
                user.getName(),
                user.getPicture()
        );
    }

    public AuthResponse registerWithEmail(String name, String email, String password) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("An account with this email already exists. Please sign in instead.");
        }

        AppUser newUser = new AppUser(email, name, null, "EMAIL");
        newUser.setPassword(passwordEncoder.encode(password));
        AppUser saved = userRepository.save(newUser);
        log.info("New email user registered: {}", email);

        String appToken = jwtService.generateToken(saved);
        return new AuthResponse(appToken, saved.getEmail(), saved.getName(), saved.getPicture());
    }

    public AuthResponse loginWithEmail(String email, String password) {
        AppUser user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("No account found with this email. Please register first."));

        if (!"EMAIL".equals(user.getProvider())) {
            throw new IllegalArgumentException("This email is registered with Google. Please use Google Sign-In.");
        }

        if (user.getPassword() == null || !passwordEncoder.matches(password, user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password.");
        }

        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        String appToken = jwtService.generateToken(user);
        return new AuthResponse(appToken, user.getEmail(), user.getName(), user.getPicture());
    }
}
