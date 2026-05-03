package com.election.assistant.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

@Configuration
public class CacheConfig {

    @Value("${cache.election-ttl-minutes}")
    private long electionTtl;

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager("elections", "representatives", "voterInfo");
        cacheManager.setCaffeine(Caffeine.newBuilder()
                .expireAfterWrite(electionTtl, TimeUnit.MINUTES)
                .maximumSize(500));
        return cacheManager;
    }
}
