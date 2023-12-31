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

@Entity(name = "snapshot")
public class Snapshot {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Getter @Setter
    private Long id;

    @Getter @Setter
    @Column(length = 45)
    private String ref;

    /** Page title of this capture at the moment when capture was created. */
    @Getter @Setter
    @Column(length = 1024)
    private String pageTitle;

    /** Page URL of this capture at the moment when capture was created. */
    @Getter @Setter
    @Column(length = 2048)
    private String pageUrl;

    /** User privided title of this capture. */
    @Getter @Setter
    @Column(length = 1024)
    private String title;

    /** User privided description of this capture. */
    @Getter @Setter
    @Column
    private String description;

    /** Is true if user has annotated the screenshot.  */
    @Getter @Setter
    @Column(name="has_annotations")
    private boolean hasAnnotations = false;

    @Getter
    private Date created;

    public Snapshot() {
    }

    public Snapshot(String ref, String pageTitle, String pageUrl) {
        this.ref = ref;
        this.pageTitle = pageTitle;
        this.pageUrl = pageUrl;
    }

    @PrePersist
    protected void onCreate() {
      created = new Date();
    }

}