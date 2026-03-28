import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'scan',
    loadComponent: () => import('./features/client/scan/scan.component').then(m => m.ScanComponent)
  },
  {
    path: 'pedido',
    loadComponent: () => import('./features/client/pedido/pedido.component').then(m => m.PedidoComponent)
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'configuracion',
        loadComponent: () => import('./features/admin/config/config.component').then(m => m.ConfigComponent),
        canActivate: [roleGuard],
        data: { roles: ['Admin'] }
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
    redirectTo: 'login',
    pathMatch: 'full'
  }
];
