package dev.harlapse.backend.db.entities.repository;

import dev.harlapse.backend.db.entities.Snapshot;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class DropRepository implements PanacheRepository<Snapshot> {

    public Snapshot findByRef(String ref) {
        return find("ref", ref).firstResult();
    }
}
