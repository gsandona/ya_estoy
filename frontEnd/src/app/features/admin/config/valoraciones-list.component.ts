import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export interface Valoracion {
  id: string;
  mesaNumero?: number;
  mozoNombre?: string;
  puntajeGeneral: number;
  puntajeComida: number;
  puntajeMozo: number;
  puntajeServicio: number;
  comentario?: string;
  fechaHora: string;
}

@Component({
  selector: 'app-valoraciones-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-3xl p-6 border border-gray-200/85 shadow-sm">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 class="text-2xl font-black text-gray-800 tracking-tight flex items-center gap-2">
            ⭐ Comentarios y Valoraciones
          </h2>
          <p class="text-xs text-gray-400 font-semibold mt-1">Monitorea la opinión de los comensales sobre la comida, mozos y servicio.</p>
        </div>
        <button (click)="loadValoraciones()" class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-xs font-bold border border-gray-200 transition active:scale-95">
          🔄 Actualizar
        </button>
      </div>

      <!-- Resumen de Métricas Promedio -->
      @if (valoraciones().length > 0) {
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div class="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
            <span class="text-2xl block mb-1">🌟</span>
            <span class="text-xs font-bold text-gray-500 uppercase tracking-wider block">General</span>
            <span class="text-2xl font-black text-gray-800 mt-1 block">{{ avgGeneral() | number:'1.1-1' }} / 5</span>
          </div>
          <div class="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
            <span class="text-2xl block mb-1">🍔</span>
            <span class="text-xs font-bold text-gray-500 uppercase tracking-wider block">Comida</span>
            <span class="text-2xl font-black text-gray-800 mt-1 block">{{ avgComida() | number:'1.1-1' }} / 5</span>
          </div>
          <div class="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
            <span class="text-2xl block mb-1">🧑‍💼</span>
            <span class="text-xs font-bold text-gray-500 uppercase tracking-wider block">Mozos</span>
            <span class="text-2xl font-black text-gray-800 mt-1 block">{{ avgMozo() | number:'1.1-1' }} / 5</span>
          </div>
          <div class="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
            <span class="text-2xl block mb-1">🛎️</span>
            <span class="text-xs font-bold text-gray-500 uppercase tracking-wider block">Servicio</span>
            <span class="text-2xl font-black text-gray-800 mt-1 block">{{ avgServicio() | number:'1.1-1' }} / 5</span>
          </div>
        </div>

        <!-- Listado de Valoraciones -->
        <div class="space-y-4">
          @for (val of valoraciones(); track val.id) {
            <div class="border border-gray-150 rounded-2xl p-5 hover:shadow-md hover:border-gray-300 transition-all bg-white relative">
              <div class="flex flex-wrap justify-between items-start gap-2 mb-3">
                <div class="flex items-center gap-3">
                  <div class="h-10 w-10 bg-indigo-50 text-indigo-700 rounded-xl font-bold flex items-center justify-center text-xs shadow-inner">
                    Mesa {{ val.mesaNumero || '?' }}
                  </div>
                  <div>
                    <h4 class="text-sm font-black text-gray-800">Atendido por: {{ val.mozoNombre || 'Sin mozo' }}</h4>
                    <span class="text-[10px] text-gray-400 font-semibold">{{ val.fechaHora | date:'dd/MM/yyyy HH:mm' }}</span>
                  </div>
                </div>
                
                <!-- Estrellas Promedio General -->
                <div class="flex items-center gap-1 bg-amber-50/50 border border-amber-100 px-3 py-1 rounded-full text-xs font-bold text-amber-600 select-none">
                  <span>★</span> {{ val.puntajeGeneral }}
                </div>
              </div>

              <!-- Detalles de las Calificaciones -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50/50 border border-gray-100 rounded-xl p-3 text-xs mb-3">
                <div>
                  <span class="text-gray-400 font-semibold block">General</span>
                  <span class="font-bold text-gray-700">{{ getStarsText(val.puntajeGeneral) }}</span>
                </div>
                <div>
                  <span class="text-gray-400 font-semibold block">Comida</span>
                  <span class="font-bold text-gray-700">{{ getStarsText(val.puntajeComida) }}</span>
                </div>
                <div>
                  <span class="text-gray-400 font-semibold block">Atención Mozo</span>
                  <span class="font-bold text-gray-700">{{ getStarsText(val.puntajeMozo) }}</span>
                </div>
                <div>
                  <span class="text-gray-400 font-semibold block">Servicio Local</span>
                  <span class="font-bold text-gray-700">{{ getStarsText(val.puntajeServicio) }}</span>
                </div>
              </div>

              <!-- Comentario -->
              @if (val.comentario) {
                <div class="bg-sand/10 border-l-4 border-accent p-3.5 rounded-r-xl text-xs text-gray-600 font-medium leading-relaxed">
                  "{{ val.comentario }}"
                </div>
              }
            </div>
          }
        </div>
      } @else {
        <div class="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-250 select-none">
          <span class="text-4xl block mb-2">📬</span>
          <p class="text-sm font-bold text-gray-500">Aún no hay valoraciones registradas para este restaurante.</p>
          <p class="text-xs text-gray-400 mt-1">Las opiniones que envíen los comensales aparecerán aquí.</p>
        </div>
      }
    </div>
  `
})
export class ValoracionesListComponent implements OnInit {
  private http = inject(HttpClient);
  valoraciones = signal<Valoracion[]>([]);

  // Promedios
  avgGeneral = signal<number>(0);
  avgComida = signal<number>(0);
  avgMozo = signal<number>(0);
  avgServicio = signal<number>(0);

  ngOnInit() {
    this.loadValoraciones();
  }

  loadValoraciones() {
    const token = localStorage.getItem('auth_token');
    this.http.get<Valoracion[]>(`${environment.apiUrl}/api/valoraciones`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (data) => {
        this.valoraciones.set(data);
        this.calculateAverages(data);
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  calculateAverages(data: Valoracion[]) {
    if (data.length === 0) {
      this.avgGeneral.set(0);
      this.avgComida.set(0);
      this.avgMozo.set(0);
      this.avgServicio.set(0);
      return;
    }

    const count = data.length;
    this.avgGeneral.set(data.reduce((sum, v) => sum + v.puntajeGeneral, 0) / count);
    this.avgComida.set(data.reduce((sum, v) => sum + v.puntajeComida, 0) / count);
    this.avgMozo.set(data.reduce((sum, v) => sum + v.puntajeMozo, 0) / count);
    this.avgServicio.set(data.reduce((sum, v) => sum + v.puntajeServicio, 0) / count);
  }

  getStarsText(score: number): string {
    return '★'.repeat(score) + '☆'.repeat(5 - score);
  }
}
