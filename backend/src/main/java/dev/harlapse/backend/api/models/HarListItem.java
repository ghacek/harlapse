package dev.harlapse.backend.api.models;

import java.util.Date;

public class HarListItem {
    public String id;
    public long created;


    public HarListItem(String id, long created) {
        this.id = id;
        this.created = created;
    }

    
}
