package com.hlrattor.service;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

public final class ProjectExceptions {

    private ProjectExceptions() {}

    @ResponseStatus(HttpStatus.CONFLICT)
    public static class DuplicateReferenceException extends RuntimeException {
        public DuplicateReferenceException(String reference) {
            super("Project reference already exists: " + reference);
        }
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public static class InvalidProjectManagerException extends RuntimeException {
        public InvalidProjectManagerException() {
            super("The selected user is not a project manager");
        }
    }

    @ResponseStatus(HttpStatus.FORBIDDEN)
    public static class ProjectReadOnlyException extends RuntimeException {
        public ProjectReadOnlyException() {
            super("This project is closed or canceled. Change its status to edit it.");
        }
    }

    @ResponseStatus(HttpStatus.FORBIDDEN)
    public static class UnauthorizedProjectAccessException extends RuntimeException {
        public UnauthorizedProjectAccessException() {
            super("You are not authorized to modify this project");
        }
    }

    @ResponseStatus(HttpStatus.NOT_FOUND)
    public static class ProjectNotFoundException extends RuntimeException {
        public ProjectNotFoundException(java.util.UUID id) {
            super("Project not found: " + id);
        }
    }

    @ResponseStatus(HttpStatus.NOT_FOUND)
    public static class BudgetLineNotFoundException extends RuntimeException {
        public BudgetLineNotFoundException(java.util.UUID id) {
            super("Budget line not found: " + id);
        }
    }
}
