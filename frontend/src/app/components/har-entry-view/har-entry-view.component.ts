import { Component, Input } from '@angular/core';
import { EntryView } from '../har-view-page/har-view-page.component';

@Component({
  selector: 'app-har-entry-view',
  templateUrl: './har-entry-view.component.html',
  styleUrls: ['./har-entry-view.component.scss']
})
export class HarEntryViewComponent {

    @Input()
    public entry!: EntryView;

    tab = 0;
}
