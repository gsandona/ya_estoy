import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'mesa/:restaurante/:numero',
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
        data: { roles: ['Admin', 'SuperAdmin'] }
      },
      {
        path: 'sistema',
        loadComponent: () => import('./features/admin/superadmin-dashboard.component').then(m => m.SuperAdminDashboardComponent),
        canActivate: [roleGuard],
        data: { roles: ['SuperAdmin'] }
      },
      {
        path: 'inicio',
        loadComponent: () => import('./features/admin/dashboard/admin-inicio.component').then(m => m.AdminInicioComponent),
        canActivate: [roleGuard],
        data: { roles: ['Admin', 'SuperAdmin'] }
      },
      {
        path: 'cocina',
        loadComponent: () => import('./features/admin/dashboard/admin-cocina.component').then(m => m.AdminCocinaComponent),
        canActivate: [roleGuard],
        data: { roles: ['Admin', 'SuperAdmin', 'Cocina'] }
      },
      {
        path: '',
        loadComponent: () => import('./features/admin/layout/admin-landing.component').then(m => m.AdminLandingComponent),
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
