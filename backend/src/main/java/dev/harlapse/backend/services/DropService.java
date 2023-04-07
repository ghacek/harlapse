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

import com.google.common.io.ByteStreams;

import dev.harlapse.backend.db.entities.Drop;
import dev.harlapse.backend.db.entities.repository.DropRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import jakarta.transaction.Transactional;


@ApplicationScoped
public class DropService {

    private static final String HAR_FILE_SUFFIX = "-har.json";
    private static final String SCREENSHOT_SUFFIX = "-ss.json";

    @Inject
    @ConfigProperty(name = "harlapse.drop-dir")
    private String dropDir;

    @Inject
    DropRepository dropRepo;

    @Transactional 
    public Drop createDrop(String title, String url, InputStream screenshot, InputStream harFile) throws IOException {
        final String ref = generateRef();
        final Drop drop = new Drop(ref, title, url);

        dropRepo.persist(drop);

        storeUploadFile(screenshot, ref, SCREENSHOT_SUFFIX);
        storeUploadFile(harFile   , ref, HAR_FILE_SUFFIX);

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
