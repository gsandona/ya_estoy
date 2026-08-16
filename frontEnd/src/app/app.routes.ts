import { Routes } from '@angular/router';
import { authGuard, roleGuard, featureGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'mozo-select',
    loadComponent: () => import('./features/auth/mozo-select/mozo-select.component').then(m => m.MozoSelectComponent),
    canActivate: [authGuard]
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
        loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
        canActivate: [featureGuard],
        data: { feature: 'MesasTareas' }
      },
      {
        path: 'configuracion',
        loadComponent: () => import('./features/admin/config/config.component').then(m => m.ConfigComponent),
        canActivate: [featureGuard],
        data: { feature: 'ConfigPersonal' }
      },
      {
        path: 'sistema',
        loadComponent: () => import('./features/admin/superadmin-dashboard.component').then(m => m.SuperAdminDashboardComponent),
        canActivate: [featureGuard],
        data: { feature: 'Sistema' }
      },
      {
        path: 'inicio',
        loadComponent: () => import('./features/admin/dashboard/admin-inicio.component').then(m => m.AdminInicioComponent),
        canActivate: [featureGuard],
        data: { feature: 'Metricas' }
      },
      {
        path: 'cocina',
        loadComponent: () => import('./features/admin/dashboard/admin-cocina.component').then(m => m.AdminCocinaComponent),
        canActivate: [featureGuard],
        data: { feature: 'Cocina' }
      },
      {
        path: 'ventas',
        loadComponent: () => import('./features/admin/dashboard/admin-ventas.component').then(m => m.AdminVentasComponent),
        canActivate: [featureGuard],
        data: { feature: 'Ventas' }
      },
      {
        path: 'metricas-menu',
        loadComponent: () => import('./features/admin/dashboard/admin-menu-metrics.component').then(m => m.AdminMenuMetricsComponent),
        canActivate: [featureGuard],
        data: { feature: 'MetricasMenu' }
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
