package com.election.assistant;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class ElectionAssistantApplication {

    public static void main(String[] args) {
        SpringApplication.run(ElectionAssistantApplication.class, args);
    }
}
