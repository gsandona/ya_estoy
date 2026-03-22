import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'mesa/:id/:token',
    loadComponent: () => import('./features/client/mesa/mesa.component').then(m => m.MesaComponent)
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: 'admin',
    pathMatch: 'full'
  }
];
