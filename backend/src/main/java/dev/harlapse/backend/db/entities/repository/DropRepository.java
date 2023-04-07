package dev.harlapse.backend.db.entities.repository;

import dev.harlapse.backend.db.entities.Drop;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class DropRepository implements PanacheRepository<Drop> {

    public Drop findByRef(String ref) {
        return find("ref", ref).firstResult();
    }
}
