import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HarViewPageComponent } from './components/har-view-page/har-view-page.component';
import { HarListPageComponent } from './components/har-list-page/har-list-page.component';
import { FileSizePipe } from './pipes/file-size.pipe';
import { HarEntryViewComponent } from './components/har-entry-view/har-entry-view.component';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { FormsModule } from '@angular/forms';
import { DrawerComponent } from './components/drawer/drawer.component';

@NgModule({
  declarations: [
    AppComponent,
    HarViewPageComponent,
    HarListPageComponent,
    FileSizePipe,
    HarEntryViewComponent,
    DrawerComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule,
    CodemirrorModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
