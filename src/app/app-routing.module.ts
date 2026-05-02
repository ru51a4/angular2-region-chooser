import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ContentLayoutComponent } from './layouts/content-layout/content-layout.component';
import { UrlSegment, UrlMatchResult } from '@angular/router';



const routes: Routes = [{
  path: '',
  component: ContentLayoutComponent,
  children: [
    {
      path: '**',
      loadChildren: () => import('./pages/dashboard/dashboard.module').then(m => m.DashboardModule),
      canActivate: []
    },]
}];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    initialNavigation: 'enabledBlocking'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
