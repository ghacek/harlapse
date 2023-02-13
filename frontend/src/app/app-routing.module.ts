import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HarViewPageComponent } from './components/har-view-page/har-view-page.component';

const routes: Routes = [
    { path: 'view', component: HarViewPageComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
