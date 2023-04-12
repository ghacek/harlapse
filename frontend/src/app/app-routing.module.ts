import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HarListPageComponent } from './components/har-list-page/har-list-page.component';
import { HarViewPageComponent } from './components/har-view-page/har-view-page.component';
import { IndexPageComponent } from './components/index-page/index-page.component';

const routes: Routes = [
    { path: 'view', component: HarViewPageComponent },
    { path: 'list', component: HarListPageComponent },
    { path: ''    , component: IndexPageComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
