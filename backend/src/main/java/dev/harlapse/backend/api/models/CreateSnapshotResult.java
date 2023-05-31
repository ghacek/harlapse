package dev.harlapse.backend.api.models;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CreateSnapshotResult {
    private String ref;
    private String uploadBasicInfoLink;
    private String uploadScreenshotLink;
    private String uploadHarLink;
    private String uploadConsoleLink;
    private String uploadHtmlLink;

    
}
