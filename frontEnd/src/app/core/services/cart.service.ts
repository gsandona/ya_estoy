import { Injectable, signal, computed } from '@angular/core';

export interface MenuItem { id: string; categoria: string; nombre: string; precio: number; descripcion: string; activo: boolean; }
export interface CartItem extends MenuItem { quantity: number; }

@Injectable({ providedIn: 'root' })
export class CartService {
  private _items = signal<CartItem[]>([]);
  
  public items = computed(() => this._items());
  public totalItems = computed(() => this._items().reduce((acc, curr) => acc + curr.quantity, 0));
  public totalPrice = computed(() => this._items().reduce((acc, curr) => acc + (curr.precio * curr.quantity), 0));

  addToCart(menuItem: MenuItem) {
    this._items.update(items => {
      const existing = items.find(i => i.id === menuItem.id);
      if (existing) {
        return items.map(i => i.id === menuItem.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...items, { ...menuItem, quantity: 1 }];
    });
  }

  removeFromCart(id: string) {
    this._items.update(items => items.filter(i => i.id !== id));
  }
  
  decreaseQuantity(id: string) {
    this._items.update(items => {
      const existing = items.find(i => i.id === id);
      if (existing && existing.quantity > 1) {
        return items.map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i);
      } else {
        return items.filter(i => i.id !== id);
      }
    });
  }

  clearCart() {
    this._items.set([]);
  }
}
