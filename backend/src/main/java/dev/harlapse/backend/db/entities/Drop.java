package dev.harlapse.backend.db.entities;

import java.util.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import lombok.Getter;
import lombok.Setter;

@Entity(name = "`drop`")
public class Drop {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Getter @Setter
    private Long id;

    @Getter @Setter
    @Column(length = 45)
    private String ref;

    @Getter @Setter
    @Column(length = 1024)
    private String title;

    @Getter @Setter
    @Column(length = 2048)
    private String url;

    @Getter
    private Date created;

    public Drop() {
    }

    public Drop(String ref, String title, String url) {
        this.ref = ref;
        this.title = title;
        this.url = url;
    }

    @PrePersist
    protected void onCreate() {
      created = new Date();
    }

}