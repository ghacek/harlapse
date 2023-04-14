package dev.harlapse.backend.api;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;

import org.jboss.resteasy.reactive.RestForm;

import dev.harlapse.backend.api.models.NewHarResponse;
import dev.harlapse.backend.api.models.TitleAndDesc;
import dev.harlapse.backend.db.entities.Snapshot;
import dev.harlapse.backend.db.entities.repository.DropRepository;
import dev.harlapse.backend.services.DropService;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;


@Path("/api/snapshot")
public class SnapshotController {

    @Inject
    DropRepository dropRepo;

    @Inject
    private DropService dropService;

    @GET
    @Produces(MediaType.TEXT_PLAIN)
    @Path("/hello")
    public String hello() {
        return "Hello from RESTEasy Reactive";
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/{ref}")
    public Response getShanpshotInfo(@PathParam("ref") String dropRef) {
        final Snapshot drop = dropRepo.findByRef(dropRef);

        if (drop == null) {
            return Response.status(404).build();
        }

        return Response.ok(drop).build();
    }

    /** Returns network activity of the snapshot */
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/{ref}/network")
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
    @Path("/{ref}/console")
    public InputStream getSnapshotConsoleLog(@PathParam("ref") String dropRef) throws FileNotFoundException {
        return dropService.getConsoleContent(dropRef);
    }

    
    @POST
    @Path("/{ref}/title-and-desc")
    @Consumes(MediaType.APPLICATION_JSON)
    public void updateSnapshotTitleAndDesc(@PathParam("ref") String dropRef, TitleAndDesc body) {
        dropService.updateTitleAndDesc(dropRef, body.getTitle(), body.getDescription());
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
            @RestForm        InputStream console) throws IOException {

        final Snapshot drop = dropService.createDrop(title, url, screenshot, harFile, console);

        try { screenshot.close(); } catch (IOException e) { e.printStackTrace(); }
        try { harFile.close();    } catch (IOException e) { e.printStackTrace(); }
        try { console.close();    } catch (IOException e) { e.printStackTrace(); }
        
        return new NewHarResponse(drop.getRef());
    }
}
