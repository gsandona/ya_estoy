import { Injectable, signal, computed } from '@angular/core';

export interface TableSession {
  mesaId: string; // El Guid secreto de la mesa en BD
  numero: number; // El numero lindo de la mesa que el backend le informa
}

@Injectable({ providedIn: 'root' })
export class ActiveSessionService {
  private _session = signal<TableSession | null>(null);
  public session = computed(() => this._session());

  setSession(data: TableSession) {
    // Persistimos en sessionStorage para que el comensal no se desconecte si accidentalmente recarga "F5" su celular
    sessionStorage.setItem('comensal_session', JSON.stringify(data));
    this._session.set(data);
  }

  clearSession() {
    sessionStorage.removeItem('comensal_session');
    this._session.set(null);
  }

  restoreSession(): boolean {
    const data = sessionStorage.getItem('comensal_session');
    if (data) {
      this._session.set(JSON.parse(data));
      return true;
    }
    return false;
  }
}
