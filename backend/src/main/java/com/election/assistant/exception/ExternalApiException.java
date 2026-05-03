package com.election.assistant.exception;

public class ExternalApiException extends RuntimeException {

    private final int statusCode;
    private final String serviceName;

    public ExternalApiException(String serviceName, int statusCode, String message) {
        super(String.format("External API error from %s (status %d): %s", serviceName, statusCode, message));
        this.serviceName = serviceName;
        this.statusCode = statusCode;
    }

    public ExternalApiException(String serviceName, String message, Throwable cause) {
        super(String.format("External API error from %s: %s", serviceName, message), cause);
        this.serviceName = serviceName;
        this.statusCode = 0;
    }

    public int getStatusCode() {
        return statusCode;
    }

    public String getServiceName() {
        return serviceName;
    }
}
