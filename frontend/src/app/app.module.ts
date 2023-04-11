import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HarViewPageComponent } from './components/har-view-page/har-view-page.component';
import { HarListPageComponent } from './components/har-list-page/har-list-page.component';
import { FileSizePipe } from './pipes/file-size.pipe';
import { MillisToHrPipe } from './pipes/millis-to-hr';
import { HarEntryViewComponent } from './components/har-entry-view/har-entry-view.component';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { FormsModule } from '@angular/forms';
import { DrawerComponent } from './components/drawer/drawer.component';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { ConsoleViewComponent } from './components/console-view/console-view.component';

@NgModule({
  declarations: [
    AppComponent,
    HarViewPageComponent,
    HarListPageComponent,
    HarEntryViewComponent,
    DrawerComponent,
    FileSizePipe,
    MillisToHrPipe,
    ConsoleViewComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule,
    CodemirrorModule,
    NgxJsonViewerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
