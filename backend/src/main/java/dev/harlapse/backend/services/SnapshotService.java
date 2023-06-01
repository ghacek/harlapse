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
import dev.harlapse.backend.api.models.SnapshotInfo;
import dev.harlapse.backend.db.entities.Snapshot;
import dev.harlapse.backend.db.entities.repository.SnapshotRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import jakarta.transaction.Transactional;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;


@ApplicationScoped
public class SnapshotService {

    private static final String BASIC_INFO_FILE_NAME = "bi.json";
    private static final String HAR_FILE_NAME = "har.json";
    private static final String SCREENSHOT_FILE_NAME = "ss.png";
    private static final String CONSOLE_FILE_NAME = "console.json";
    private static final String HTML_FILE_NAME = "doc.html";

    private static final String ANNOTATIONS_CONFIG = "-ann.json";
    private static final String ANNOTATIONS_SVG = "-ann.svg";

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
            presigneObjectPut(presigner, ref, BASIC_INFO_FILE_NAME),
            presigneObjectPut(presigner, ref, SCREENSHOT_FILE_NAME),
            presigneObjectPut(presigner, ref, HAR_FILE_NAME),
            presigneObjectPut(presigner, ref, CONSOLE_FILE_NAME),
            presigneObjectPut(presigner, ref, HTML_FILE_NAME)
        );
    }

    public SnapshotInfo getSnapshotInfo(String ref) {
        final Snapshot snapshot = snapshotRepo.findByRef(ref);

        final S3Presigner presigner = createS3Presigner();

        return new SnapshotInfo(
            ref, 
            snapshot.getPageTitle(),
            snapshot.getPageUrl(),
            snapshot.getTitle(),
            snapshot.getDescription(),
            snapshot.getCreated(),
            presigneObjectGet(presigner, ref, BASIC_INFO_FILE_NAME),
            presigneObjectGet(presigner, ref, SCREENSHOT_FILE_NAME),
            presigneObjectGet(presigner, ref, HAR_FILE_NAME),
            presigneObjectGet(presigner, ref, CONSOLE_FILE_NAME),
            presigneObjectGet(presigner, ref, HTML_FILE_NAME),
            snapshot.isHasAnnotations() ? presigneObjectGet(presigner, ref, ANNOTATIONS_SVG) : null
        );
    }

    private String generateRef() {
        return UUID.randomUUID().toString().replace("-", "");
    }

    public InputStream getAnnotationsConfig(String dropRef) throws FileNotFoundException {
        return new FileInputStream(new File(dropDir, dropRef + ANNOTATIONS_CONFIG));
    }

    public InputStream getAnnotationsSvg(String dropRef) throws FileNotFoundException {
        return new FileInputStream(new File(dropDir, dropRef + ANNOTATIONS_SVG));
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

    public String presigneObjectGet(S3Presigner presigner, String snapshotRef, String objectName) {
        final GetObjectRequest request = GetObjectRequest.builder()
            .bucket(storageBucketName)
            .key(snapshotRef + "/" + objectName)
            .build();

        final GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
            .signatureDuration(Duration.ofMinutes(60))
            .getObjectRequest(request)
            .build();

        final PresignedGetObjectRequest presigned = presigner.presignGetObject(presignRequest);
        
        return presigned.url().toString();
    }

    public String presigneObjectPut(S3Presigner presigner, String snapshotRef, String objectName) {
        final PutObjectRequest request = PutObjectRequest.builder()
            .bucket(storageBucketName)
            .key(snapshotRef + "/" + objectName)
            .build();

        final PutObjectPresignRequest resignRequest = PutObjectPresignRequest.builder()
            .signatureDuration(Duration.ofMinutes(5))
            .putObjectRequest(request)
            .build();

        final PresignedPutObjectRequest presigned = presigner.presignPutObject(resignRequest);
        
        return presigned.url().toString();
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
