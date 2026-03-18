package com.hlrattor.entity;

public enum ProjectStatus {
    DRAFT,
    BIA,
    PROJECT,
    CANCELED,
    CLOSED;

    public boolean isReadOnly() {
        return this == CANCELED || this == CLOSED;
    }
}
