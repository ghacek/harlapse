import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-console-view',
  templateUrl: './console-view.component.html',
  styleUrls: ['./console-view.component.scss']
})
export class ConsoleViewComponent {

    @Input()
    public consoleLog: any[] = [];

}
