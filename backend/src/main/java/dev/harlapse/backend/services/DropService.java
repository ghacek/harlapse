package dev.harlapse.backend.services;

import java.util.UUID;

import dev.harlapse.backend.db.entities.Drop;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;


@ApplicationScoped
public class DropService {
    @Inject
    EntityManager em; 

    @Transactional 
    public Drop createDrop(String title, String url) {
        final String ref = generateRef();
        final Drop drop = new Drop(ref, title, url);

        em.persist(drop);

        return drop;
    }

    private String generateRef() {
        return UUID.randomUUID().toString().replace("-", "");
    }
}
