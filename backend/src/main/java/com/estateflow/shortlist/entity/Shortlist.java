package com.estateflow.shortlist.entity;

import java.time.LocalDateTime;

import com.estateflow.property.entity.Property;
import com.estateflow.user.entity.User;

import jakarta.persistence.*;

@Entity
@Table(
        name = "shortlists",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_shortlists_user_property",
                        columnNames = {"user_id", "property_id"}
                )
        }
)
public class Shortlist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @Column(
            name = "created_at",
            nullable = false,
            insertable = false,
            updatable = false
    )
    private LocalDateTime createdAt;

    public Shortlist() {
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Property getProperty() {
        return property;
    }

    public void setProperty(Property property) {
        this.property = property;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}