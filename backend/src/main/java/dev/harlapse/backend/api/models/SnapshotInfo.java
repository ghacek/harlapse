package dev.harlapse.backend.api.models;

import java.util.Date;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SnapshotInfo {
    private String ref;
    private String pageTitle;
    private String pageUrl;
    private String title;
    private String description;
    private Date created;
    private String basicInfoLink;
    private String screenshotLink;
    private String harLink;
    private String consoleLink;
    private String htmlLink;
    private String annotationsSvgLink;
}
