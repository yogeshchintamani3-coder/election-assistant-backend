package com.election.assistant.config;

import com.election.assistant.entity.AppUser;
import com.election.assistant.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    @Bean
    public CommandLineRunner initData(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.count() == 0) {
                log.info("Initializing test data...");

                AppUser admin = new AppUser("admin@election-assistant.app", "Admin User", null, "EMAIL");
                admin.setPassword(passwordEncoder.encode("admin123"));
                userRepository.save(admin);

                AppUser demo = new AppUser("demo@election-assistant.app", "Demo User", null, "EMAIL");
                demo.setPassword(passwordEncoder.encode("demo123"));
                userRepository.save(demo);

                log.info("Test data initialized successfully.");
            }
        };
    }
}
