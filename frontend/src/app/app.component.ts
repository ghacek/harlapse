import { HttpClient } from '@angular/common/http';
import { Component, HostListener } from '@angular/core';
import { EscKeyScopeService } from './services/esc-key-scope.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
    title = 'harbin';

    constructor(private escKeyScopeService: EscKeyScopeService) { }

    @HostListener('document:keydown.escape')
    escKey() {
        this.escKeyScopeService.execute();
    }
}
