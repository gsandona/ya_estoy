import { Component, Output, EventEmitter, signal } from '@angular/core';

interface MenuItem { id: number; name: string; price: number; description: string; }

@Component({
  selector: 'app-menu',
  standalone: true,
  template: `
    <div class="bg-white rounded-3xl shadow-xl p-6">
      <h2 class="text-2xl font-bold text-primary mb-4">Nuestro Menú</h2>
      
      <div class="space-y-4">
        @for (item of items(); track item.id) {
          <div class="flex justify-between items-center p-3 hover:bg-surface rounded-xl transition">
            <div class="flex-1 pr-4">
              <h3 class="font-semibold text-gray-800">{{ item.name }}</h3>
              <p class="text-sm text-gray-500">{{ item.description }}</p>
            </div>
            <div class="flex flex-col items-end">
              <span class="font-bold text-primary mb-2">\${{ item.price }}</span>
              <button class="bg-accent text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-opacity-90 transition active:scale-95 shadow-sm">
                Agregar
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class MenuComponent {
  @Output() orderPlaced = new EventEmitter<string>();

  items = signal<MenuItem[]>([
    { id: 1, name: 'Burger Clásica', price: 12, description: 'Carne, queso, lechuga y tomate confitado' },
    { id: 2, name: 'Pizza Margarita', price: 15, description: 'Salsa, mozzarella y albahaca fresca de huerto' },
    { id: 3, name: 'Cerveza Artesanal', price: 5, description: 'IPA, Extra fría de barril' }
  ]);
}
