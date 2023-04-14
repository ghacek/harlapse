package dev.harlapse.backend.api;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;

import org.jboss.resteasy.reactive.RestForm;

import dev.harlapse.backend.api.models.HarListItem;
import dev.harlapse.backend.api.models.NewHarResponse;
import dev.harlapse.backend.api.models.TitleAndDesc;
import dev.harlapse.backend.db.entities.Drop;
import dev.harlapse.backend.db.entities.repository.DropRepository;
import dev.harlapse.backend.services.DropService;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;


@Path("/api")
public class DropController {

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
    @Path("/drop")
    public Response drop(@QueryParam("ref") String dropRef) {
        final Drop drop = dropRepo.findByRef(dropRef);

        if (drop == null) {
            return Response.status(404).build();
        }

        return Response.ok(drop).build();
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/har")
    public InputStream har(@QueryParam("ref") String dropRef) throws FileNotFoundException {
        return dropService.getHarContent(dropRef);
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/screenshot")
    public InputStream screenshot(@QueryParam("ref") String dropRef) throws FileNotFoundException {
        return dropService.getScreenshotContent(dropRef);
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/console")
    public InputStream console(@QueryParam("ref") String dropRef) throws FileNotFoundException {
        return dropService.getConsoleContent(dropRef);
    }

    
    @POST
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/capture/{ref}/title-and-desc")
    public void updateCaptureTitleAndDesc(@PathParam("ref") String dropRef, TitleAndDesc body) {
        dropService.updateTitleAndDesc(dropRef, body.getTitle(), body.getDescription());
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/list")
    public HarListItem[] list() throws IOException {
        /*final var folder = Paths.get(dropDir);

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

        return hashMap.values().toArray(new HarListItem[0]);*/
        return new HarListItem[0];
    }

    

    @POST
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/new-har")
    public NewHarResponse postFormData(
            @RestForm String title,
            @RestForm String url,
            @RestForm("ss") InputStream screenshot, 
            @RestForm("har") InputStream harFile, 
            @RestForm        InputStream console) throws IOException {

        final Drop drop = dropService.createDrop(title, url, screenshot, harFile, console);

        try { screenshot.close(); } catch (IOException e) { e.printStackTrace(); }
        try { harFile.close();    } catch (IOException e) { e.printStackTrace(); }
        try { console.close();    } catch (IOException e) { e.printStackTrace(); }
        
        return new NewHarResponse(drop.getRef());
    }
}
