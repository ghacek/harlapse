import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HarViewPageComponent } from './components/har-view-page/har-view-page.component';
import { FileSizePipe } from './pipes/file-size.pipe';
import { MillisToHrPipe } from './pipes/millis-to-hr';
import { HarEntryViewComponent } from './components/har-entry-view/har-entry-view.component';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { FormsModule } from '@angular/forms';
import { DrawerComponent } from './components/drawer/drawer.component';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { ConsoleViewComponent } from './components/console-view/console-view.component';
import { IndexPageComponent } from './components/index-page/index-page.component';
import { CaptureSuccessfulPageComponent } from './components/capture-successful-page/capture-successful-page.component';
import { ApiModule } from 'src/api/api.module';
import { environment } from 'src/environments/environment';
import { ImageAnnotateComponent } from './components/image-annotate/image-annotate.component';
import { TimezoneOffsetPipe } from './pipes/timezone-offset.pipe';

@NgModule({
  declarations: [
    AppComponent,
    HarViewPageComponent,
    HarEntryViewComponent,
    DrawerComponent,
    FileSizePipe,
    MillisToHrPipe,
    TimezoneOffsetPipe,
    ConsoleViewComponent,
    IndexPageComponent,
    CaptureSuccessfulPageComponent,
    ImageAnnotateComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule,
    CodemirrorModule,
    NgxJsonViewerModule,
    ApiModule.forRoot({ rootUrl: environment.apiRootUrl }),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
