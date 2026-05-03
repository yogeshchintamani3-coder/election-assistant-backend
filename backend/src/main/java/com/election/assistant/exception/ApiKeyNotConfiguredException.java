package com.election.assistant.exception;

public class ApiKeyNotConfiguredException extends RuntimeException {

    private final String serviceName;

    public ApiKeyNotConfiguredException(String serviceName) {
        super(String.format("API key is not configured for %s. This feature is unavailable.", serviceName));
        this.serviceName = serviceName;
    }

    public String getServiceName() {
        return serviceName;
    }
}
