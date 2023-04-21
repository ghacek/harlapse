package dev.harlapse.backend.services;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.UUID;

import org.eclipse.microprofile.config.inject.ConfigProperty;

import com.google.common.base.Strings;
import com.google.common.io.ByteStreams;

import dev.harlapse.backend.db.entities.Snapshot;
import dev.harlapse.backend.db.entities.repository.SnapshotRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import jakarta.transaction.Transactional;


@ApplicationScoped
public class SnapshotService {

    private static final String HAR_FILE_SUFFIX = "-har.json";
    private static final String SCREENSHOT_SUFFIX = "-ss.png";
    private static final String CONSOLE_SUFFIX = "-console.json";
    private static final String ANNOTATIONS_CONFIG = "-ann.json";
    private static final String ANNOTATIONS_SVG = "-ann.svg";
    private static final String HTML_SUFFIX = ".html";

    @Inject
    @ConfigProperty(name = "harlapse.drop-dir")
    private String dropDir;

    @Inject
    SnapshotRepository dropRepo;

    @Transactional
    public Snapshot createDrop(String pageTitle, String pageUrl, InputStream screenshot, InputStream harFile, InputStream console, InputStream html) throws IOException {
        final String ref = generateRef();
        final Snapshot drop = new Snapshot(ref, pageTitle, pageUrl);

        dropRepo.persist(drop);

        storeUploadFile(screenshot, ref, SCREENSHOT_SUFFIX);
        storeUploadFile(harFile   , ref, HAR_FILE_SUFFIX);
        storeUploadFile(console   , ref, CONSOLE_SUFFIX);
        storeUploadFile(html      , ref, HTML_SUFFIX);

        return drop;
    }

    private String generateRef() {
        return UUID.randomUUID().toString().replace("-", "");
    }

    public InputStream getHarContent(String dropRef) throws FileNotFoundException {
        return new FileInputStream(new File(dropDir, dropRef + HAR_FILE_SUFFIX));
    }

    public InputStream getScreenshotContent(String dropRef) throws FileNotFoundException {
        return new FileInputStream(new File(dropDir, dropRef + SCREENSHOT_SUFFIX));
    }

    public InputStream getConsoleContent(String dropRef) throws FileNotFoundException {
        return new FileInputStream(new File(dropDir, dropRef + CONSOLE_SUFFIX));
    }

    public InputStream getAnnotationsConfig(String dropRef) throws FileNotFoundException {
        return new FileInputStream(new File(dropDir, dropRef + ANNOTATIONS_CONFIG));
    }

    public InputStream getAnnotationsSvg(String dropRef) throws FileNotFoundException {
        return new FileInputStream(new File(dropDir, dropRef + ANNOTATIONS_SVG));
    }
    public InputStream getHtml(String dropRef) throws FileNotFoundException {
        return new FileInputStream(new File(dropDir, dropRef + HTML_SUFFIX));
    }

    @Transactional
    public void finalizeCapture(String ref, String title, String desc, InputStream isConfig, InputStream isSvg) throws IOException {
        final Snapshot drop = dropRepo.findByRef(ref);

        storeUploadFile(isConfig, ref, ANNOTATIONS_CONFIG);
        storeUploadFile(isSvg   , ref, ANNOTATIONS_SVG);

        drop.setTitle(Strings.emptyToNull(title));
        drop.setDescription(Strings.emptyToNull(desc));
    }

    private void storeUploadFile(InputStream input, String dropRef, String fileSuffiex) throws IOException {
        final String fileName = dropRef + fileSuffiex;
        final OutputStream os = new FileOutputStream(new File(dropDir, fileName));

        try {
            ByteStreams.copy(input, os);
        } finally {
            os.close();
        }
    }
}
