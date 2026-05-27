import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbmUsuariosComponent } from './abm-usuarios.component';
import { AbmMesasComponent } from './abm-mesas.component';
import { AbmMenuComponent } from './abm-menu.component';
import { AbmRestaurantesComponent } from './abm-restaurantes.component';

@Component({
  selector: 'app-config',
  standalone: true,
  imports: [CommonModule, AbmUsuariosComponent, AbmMesasComponent, AbmMenuComponent, AbmRestaurantesComponent],
  template: `
    <div class="space-y-8 animate-fade-in">
      <div class="bg-white p-8 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-black text-gray-800 tracking-tight mb-2">Panel de Administración</h1>
          <p class="text-gray-500 font-medium">Gestiona tu equipo, espacios y oferta gastronómica</p>
        </div>
        @if (activeTab !== 'home') {
          <button (click)="setTab('home')" class="bg-surface text-primary border border-gray-200 px-6 py-2.5 rounded-xl font-bold shadow-sm hover:bg-gray-100">Volver Atrás</button>
        }
      </div>

      @if (activeTab === 'home') {
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div (click)="setTab('usuarios')" class="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition cursor-pointer hover:-translate-y-1">
            <div class="h-14 w-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl mb-4">👥</div>
            <h2 class="text-xl font-bold text-gray-800 mb-2">ABM de Usuarios</h2>
            <p class="text-sm text-gray-500 mb-4">Crea accesos para mozos, administradores y cambia contraseñas.</p>
            <button type="button" class="w-full bg-surface text-primary py-2.5 rounded-xl text-sm font-bold border border-gray-200 hover:bg-gray-100">Gestionar Staff</button>
          </div>

          <div (click)="setTab('mesas')" class="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition cursor-pointer hover:-translate-y-1">
            <div class="h-14 w-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center text-2xl mb-4">🪑</div>
            <h2 class="text-xl font-bold text-gray-800 mb-2">ABM de Mesas</h2>
            <p class="text-sm text-gray-500 mb-4">Agrega nuevas mesas, genera QR y asigna mozos específicos.</p>
            <button type="button" class="w-full bg-surface text-primary py-2.5 rounded-xl text-sm font-bold border border-gray-200 hover:bg-gray-100">Gestionar Mesas</button>
          </div>

          <div (click)="setTab('menu')" class="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition cursor-pointer hover:-translate-y-1">
            <div class="h-14 w-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center text-2xl mb-4">🍔</div>
            <h2 class="text-xl font-bold text-gray-800 mb-2">ABM de Menú</h2>
            <p class="text-sm text-gray-500 mb-4">Añade productos, configura precios, descripciones y disponibilidad.</p>
            <button type="button" class="w-full bg-surface text-primary py-2.5 rounded-xl text-sm font-bold border border-gray-200 hover:bg-gray-100">Gestionar Carta</button>
          </div>

          <div (click)="setTab('restaurantes')" class="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition cursor-pointer hover:-translate-y-1">
            <div class="h-14 w-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center text-2xl mb-4">🏪</div>
            <h2 class="text-xl font-bold text-gray-800 mb-2">ABM de Restaurantes</h2>
            <p class="text-sm text-gray-500 mb-4">Configura los datos y la identidad de los establecimientos.</p>
            <button type="button" class="w-full bg-surface text-primary py-2.5 rounded-xl text-sm font-bold border border-gray-200 hover:bg-gray-100">Gestionar Sedes</button>
          </div>
        </div>
      }

      @if (activeTab === 'usuarios') {
        <app-abm-usuarios class="block"></app-abm-usuarios>
      }
      @if (activeTab === 'mesas') {
        <app-abm-mesas class="block"></app-abm-mesas>
      }
      @if (activeTab === 'menu') {
        <app-abm-menu class="block"></app-abm-menu>
      }
      @if (activeTab === 'restaurantes') {
        <app-abm-restaurantes class="block"></app-abm-restaurantes>
      }
    </div>
  `,
  styles: [`
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fade-in 0.3s ease-out forwards;
    }
  `]
})
export class ConfigComponent {
  activeTab: 'home' | 'usuarios' | 'mesas' | 'menu' | 'restaurantes' = 'home';

  setTab(tab: 'home' | 'usuarios' | 'mesas' | 'menu' | 'restaurantes') {
    this.activeTab = tab;
  }
}
