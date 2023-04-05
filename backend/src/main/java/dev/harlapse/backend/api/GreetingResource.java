package dev.harlapse.backend.api;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.HashMap;
import java.util.UUID;

import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.resteasy.reactive.RestForm;

import com.google.common.io.ByteStreams;

import dev.harlapse.backend.api.models.HarListItem;
import dev.harlapse.backend.api.models.NewHarResponse;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;


@Path("/api")
public class GreetingResource {

    private static final String HAR_FILE_SUFFIX = "-har.json";
    private static final String SCREENSHOT_SUFFIX = "-ss.json";

    @Inject
    @ConfigProperty(name = "harlapse.drop-dir")
    private String dropDir;

    @GET
    @Produces(MediaType.TEXT_PLAIN)
    @Path("/hello")
    public String hello() {
        return "Hello from RESTEasy Reactive";
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/har")
    public InputStream har(@QueryParam("id") String dropId) throws FileNotFoundException {
        return new FileInputStream(new File(dropDir, dropId + HAR_FILE_SUFFIX));
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/screenshot")
    public InputStream screenshot(@QueryParam("id") String dropId) throws FileNotFoundException {
        return new FileInputStream(new File(dropDir, dropId + SCREENSHOT_SUFFIX));
    }
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/list")
    public HarListItem[] list() throws IOException {
        final var folder = Paths.get(dropDir);

        final var hashMap = new HashMap<String, HarListItem>();

        Files.list(folder)
            .filter(Files::isRegularFile)
            .forEach(file -> {
                final String dropId = removeFileSuffix(file.getFileName().toString());

                if (hashMap.get(dropId) == null) {
                    long createdMilis = 0;
                    try {
                        BasicFileAttributes attr = Files.readAttributes(file, BasicFileAttributes.class);
                        createdMilis = attr.creationTime().toMillis();
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                    
                    hashMap.put(dropId, new HarListItem(dropId, createdMilis));
                }
            });

        return hashMap.values().toArray(new HarListItem[0]);
    }

    

    @POST
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/new-har")
    public NewHarResponse postFormData(@RestForm("ss") InputStream screenshot, @RestForm("har") InputStream harFile) throws IOException {
        final String dropId = this.generateId();

        System.out.println("uuid " + dropId);
        System.out.println("DDDData harFile: " + harFile);
        System.out.println("DDDData screenshot: " + screenshot);

        storeUploadFile(screenshot, dropId, SCREENSHOT_SUFFIX);
        storeUploadFile(harFile   , dropId, HAR_FILE_SUFFIX);

        //ByteStreams.copy(screenshot, null)
        
        return new NewHarResponse(dropId);
    }

    private void storeUploadFile(InputStream input, String dropId, String fileSuffiex) throws IOException {
        final String fileName = dropId + fileSuffiex;
        final OutputStream os = new FileOutputStream(new File(dropDir, fileName));

        try {
            ByteStreams.copy(input, os);
        } finally {
            os.close();
        }
    }

    private String generateId() {
        return UUID.randomUUID().toString().replace("-", "");
    }

    private String removeFileSuffix(String fileName) {
        final String[] parts = fileName.split("-");

        if (parts.length > 1) {
            return parts[0];
        }
        else {
            return fileName;
        }


    }
}
