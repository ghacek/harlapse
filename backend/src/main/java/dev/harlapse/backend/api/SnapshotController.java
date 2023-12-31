package dev.harlapse.backend.api;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;

import org.jboss.resteasy.reactive.RestForm;

import dev.harlapse.backend.api.models.CreateSnapshotResult;
import dev.harlapse.backend.api.models.SnapshotInfo;
import dev.harlapse.backend.db.entities.repository.SnapshotRepository;
import dev.harlapse.backend.services.SnapshotService;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;


@Path("/api/snapshot")
public class SnapshotController {

    @Inject
    SnapshotRepository dropRepo;

    @Inject
    private SnapshotService snapshotService;



    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/{ref}")
    public SnapshotInfo getShanpshotInfo(@PathParam("ref") String ref) {
        return snapshotService.getSnapshotInfo(ref);
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/{ref}/annotations-config")
    public InputStream getSnapshotAnnotationsConfig(@PathParam("ref") String dropRef) throws FileNotFoundException {
        return snapshotService.getAnnotationsConfig(dropRef);
    }

    @GET
    @Produces("image/svg+xml")
    @Path("/{ref}/annotations-svg")
    public InputStream getSnapshotAnnotationsSvg(@PathParam("ref") String dropRef) throws FileNotFoundException {
        return snapshotService.getAnnotationsSvg(dropRef);
    }



    @POST
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/")
    public CreateSnapshotResult createNewSnapshot(
            @RestForm String title,
            @RestForm String url) throws IOException {

        return snapshotService.createSnapshot(title, url);
    }

    
    @POST
    @Path("/{ref}/finalize-capture")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    public void finalizeSnapshotCapture(
            @PathParam("ref") String dropRef, 
            @RestForm String title,
            @RestForm String description,
            @RestForm("annotations-config") InputStream isConfig,
            @RestForm("annotations-svg") InputStream isSvg) throws IOException {

        snapshotService.finalizeCapture(dropRef, title, description, isConfig, isSvg);

        try { if (isConfig != null) isConfig.close();    } catch (IOException e) { e.printStackTrace(); }
        try { if (isSvg != null) isSvg.close();    } catch (IOException e) { e.printStackTrace(); }
    } 
}
