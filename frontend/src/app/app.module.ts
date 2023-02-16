import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HarViewPageComponent } from './components/har-view-page/har-view-page.component';
import { HarListPageComponent } from './components/har-list-page/har-list-page.component';
import { FileSizePipe } from './pipes/file-size.pipe';

@NgModule({
  declarations: [
    AppComponent,
    HarViewPageComponent,
    HarListPageComponent,
    FileSizePipe
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }