package dev.harlapse.backend.services;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URI;
import java.time.Duration;
import java.util.UUID;

import org.eclipse.microprofile.config.inject.ConfigProperty;

import com.google.common.base.Strings;
import com.google.common.io.ByteStreams;

import dev.harlapse.backend.api.models.CreateSnapshotResult;
import dev.harlapse.backend.db.entities.Snapshot;
import dev.harlapse.backend.db.entities.repository.SnapshotRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import jakarta.transaction.Transactional;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;


@ApplicationScoped
public class SnapshotService {

    private static final String BASIC_INFO_SUFFIX = "-basic-info.json";
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
    @ConfigProperty(name = "harlapse.storage.bucket.endpoint")
    private URI storageBucketEndpoint;

    @Inject
    @ConfigProperty(name = "harlapse.storage.bucket.name")
    private String storageBucketName;

    @Inject
    @ConfigProperty(name = "harlapse.storage.bucket.accessKeyId")
    private String storageBucketAccessKeyId;

    @Inject
    @ConfigProperty(name = "harlapse.storage.bucket.secretAccessKey")
    private String storageBucketSecretAccessKey;

    @Inject
    SnapshotRepository snapshotRepo;

    @Transactional
    public CreateSnapshotResult createSnapshot(String pageTitle, String pageUrl) throws IOException {
        final String ref = generateRef();
        final Snapshot drop = new Snapshot(ref, pageTitle, pageUrl);

        snapshotRepo.persist(drop);

        final S3Presigner presigner = createS3Presigner();

        return new CreateSnapshotResult(
            ref,
            presigneObjectPut(presigner, ref, BASIC_INFO_SUFFIX),
            presigneObjectPut(presigner, ref, SCREENSHOT_SUFFIX),
            presigneObjectPut(presigner, ref, HAR_FILE_SUFFIX),
            presigneObjectPut(presigner, ref, CONSOLE_SUFFIX),
            presigneObjectPut(presigner, ref, HTML_SUFFIX)
        );
    }

    private String generateRef() {
        return UUID.randomUUID().toString().replace("-", "");
    }

    public InputStream getBasicInfoContent(String dropRef) throws FileNotFoundException {
        return new FileInputStream(new File(dropDir, dropRef + BASIC_INFO_SUFFIX));
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
        final Snapshot snapshot = snapshotRepo.findByRef(ref);

        if (isConfig != null && isSvg != null) {
            storeUploadFile(isConfig, ref, ANNOTATIONS_CONFIG);
            storeUploadFile(isSvg   , ref, ANNOTATIONS_SVG);

            snapshot.setHasAnnotations(true);
        }

        snapshot.setTitle(Strings.emptyToNull(title));
        snapshot.setDescription(Strings.emptyToNull(desc));
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

    public String presigneObjectPut(S3Presigner presigner, String snapshotRef, String objectName) {
        final PutObjectRequest request = PutObjectRequest.builder()
            .bucket(storageBucketName)
            .key(snapshotRef + "/" + objectName)
            .build();

        final PutObjectPresignRequest getObjectPresignRequest = PutObjectPresignRequest.builder()
            .signatureDuration(Duration.ofMinutes(60))
            .putObjectRequest(request)
            .build();

        PresignedPutObjectRequest presignedGetObjectRequest = presigner.presignPutObject(getObjectPresignRequest);
        
        return presignedGetObjectRequest.url().toString();
    }

    private S3Presigner createS3Presigner() {
        return S3Presigner.builder()
            .credentialsProvider(
                StaticCredentialsProvider.create(
                    AwsBasicCredentials.create(
                        storageBucketAccessKeyId,
                        storageBucketSecretAccessKey
                    )
                )
            )
            .endpointOverride(storageBucketEndpoint)
            .region(Region.of("auto"))
            .build();
    }
}
