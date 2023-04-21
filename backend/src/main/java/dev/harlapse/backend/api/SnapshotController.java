package dev.harlapse.backend.api;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;

import org.eclipse.microprofile.openapi.annotations.enums.SchemaType;
import org.eclipse.microprofile.openapi.annotations.media.Content;
import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.jboss.resteasy.reactive.RestForm;

import dev.harlapse.backend.api.models.NewHarResponse;
import dev.harlapse.backend.db.entities.Snapshot;
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
    private SnapshotService dropService;

    @GET
    @Produces(MediaType.TEXT_PLAIN)
    @Path("/hello")
    public String hello() {
        return "Hello from RESTEasy Reactive";
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/{ref}")
    public Snapshot getShanpshotInfo(@PathParam("ref") String dropRef) {
        final Snapshot drop = dropRepo.findByRef(dropRef);

        return drop;
    }

    /** Returns network activity of the snapshot */
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/{ref}/network")
    @APIResponse(
        content = @Content(
            mediaType = "application/json",
            schema = @Schema(type = SchemaType.OBJECT)
        )
    )
    public InputStream getSnapshotNetwork(@PathParam("ref") String dropRef) throws FileNotFoundException {
        return dropService.getHarContent(dropRef);
    }

    @GET
    @Produces("image/png")
    @Path("/{ref}/screenshot")
    public InputStream getSnapshotScreenshot(@PathParam("ref") String dropRef) throws FileNotFoundException {
        return dropService.getScreenshotContent(dropRef);
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/{ref}/annotations-config")
    public InputStream getSnapshotAnnotationsConfig(@PathParam("ref") String dropRef) throws FileNotFoundException {
        return dropService.getAnnotationsConfig(dropRef);
    }

    @GET
    @Produces("image/svg+xml")
    @Path("/{ref}/annotations-svg")
    public InputStream getSnapshotAnnotationsSvg(@PathParam("ref") String dropRef) throws FileNotFoundException {
        return dropService.getAnnotationsSvg(dropRef);
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/{ref}/console")
    @APIResponse(
        content = @Content(
            mediaType = "application/json",
            schema = @Schema(type = SchemaType.OBJECT)
        )
    )
    public InputStream getSnapshotConsoleLog(@PathParam("ref") String dropRef) throws FileNotFoundException {
        return dropService.getConsoleContent(dropRef);
    }

    @GET
    @Produces(MediaType.TEXT_HTML)
    @Path("/{ref}/html")
    @APIResponse(
        content = @Content(
            mediaType = "text/html",
            schema = @Schema(type = SchemaType.STRING)
        )
    )
    public InputStream getSnapshotHtml(@PathParam("ref") String dropRef) throws FileNotFoundException {
        return dropService.getHtml(dropRef);
    }

    @POST
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/")
    public NewHarResponse createNewSnapshot(
            @RestForm String title,
            @RestForm String url,
            @RestForm("ss") InputStream screenshot, 
            @RestForm("har") InputStream harFile, 
            @RestForm        InputStream console, 
            @RestForm        InputStream html) throws IOException {

        final Snapshot drop = dropService.createDrop(title, url, screenshot, harFile, console, html);

        try { screenshot.close(); } catch (IOException e) { e.printStackTrace(); }
        try { harFile.close();    } catch (IOException e) { e.printStackTrace(); }
        try { console.close();    } catch (IOException e) { e.printStackTrace(); }
        try { html.close();       } catch (IOException e) { e.printStackTrace(); }
        
        return new NewHarResponse(drop.getRef());
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

        dropService.finalizeCapture(dropRef, title, description, isConfig, isSvg);

        try { if (isConfig != null) isConfig.close();    } catch (IOException e) { e.printStackTrace(); }
        try { if (isSvg != null) isSvg.close();    } catch (IOException e) { e.printStackTrace(); }
    } 
}
