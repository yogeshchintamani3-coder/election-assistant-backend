package com.election.assistant.config;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.Optional;

@Component
public class GoogleTokenVerifier {

    private static final Logger log = LoggerFactory.getLogger(GoogleTokenVerifier.class);

    private final GoogleIdTokenVerifier verifier;
    private final boolean configured;

    public GoogleTokenVerifier(@Value("${google.oauth.client-id:}") String clientId) {
        this.configured = clientId != null && !clientId.isBlank();
        if (configured) {
            this.verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(clientId))
                    .build();
        } else {
            this.verifier = null;
            log.warn("Google OAuth client ID not configured. Authentication will be disabled.");
        }
    }

    public boolean isConfigured() {
        return configured;
    }

    public Optional<GoogleIdToken.Payload> verify(String idTokenString) {
        if (!configured || verifier == null) {
            return Optional.empty();
        }
        try {
            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken != null) {
                return Optional.of(idToken.getPayload());
            }
        } catch (Exception e) {
            log.error("Error verifying Google ID token: {}", e.getMessage());
        }
        return Optional.empty();
    }
}
