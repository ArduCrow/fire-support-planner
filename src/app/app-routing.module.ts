import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)},
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then( m => m.AuthPageModule)
  },
  {
    path: 'fire-missions',
    loadChildren: () => import('./fire-missions/fire-missions.module').then( m => m.FireMissionsPageModule)
  },
  {
    path: 'fire-plans',
    loadChildren: () => import('./fire-plans/fire-plans.module').then( m => m.FirePlansPageModule)
  },
  {
    path: 'targets',
    loadChildren: () => import('./targets/targets.module').then( m => m.TargetsPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
