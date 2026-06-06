import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ActiveSessionService, TableSession } from '../../../core/services/active-session.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-scan',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-surface flex flex-col items-center justify-center p-6 animate-fade-in relative overflow-hidden">
      <!-- Fondo estéticamente superior -->
      <div class="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5"></div>
      
      @if (status() === 'loading') {
        <div class="h-20 w-20 flex items-center justify-center mb-6 relative p-2 z-10">
          <span class="animate-spin absolute h-16 w-16 border-4 border-accent border-t-transparent rounded-full"></span>
          <div class="w-12 h-12 flex items-center justify-center">
            <img src="logo.png" class="w-full h-full object-contain" />
          </div>
        </div>
        <h2 class="text-xl font-bold text-gray-800 tracking-tight z-10">Conectando con tu Mesa...</h2>
        <p class="text-gray-500 text-sm mt-3 font-medium z-10">Estableciendo canal encriptado</p>
      }

      @if (status() === 'error') {
        <div class="z-10 flex flex-col items-center text-center px-4">
          <div class="h-28 w-28 bg-white text-red-500 rounded-full shadow-[0_10px_40px_rgba(239,68,68,0.2)] flex items-center justify-center text-5xl mb-8 border-4 border-red-50 animate-[shake_0.5s_ease-out]">
            🛑
          </div>
          <h1 class="text-4xl font-black text-gray-900 mb-4 tracking-tight drop-shadow-sm">QR Inválido</h1>
          <p class="text-lg text-gray-600 font-medium mb-8 max-w-sm">
            La mesa requerida no existe o el código QR escaneado ha sido adulterado.
          </p>
          <div class="bg-white px-6 py-4 rounded-2xl shadow-xl text-sm font-bold text-red-600 border border-red-100 flex items-center justify-center w-full max-w-xs gap-3 active:scale-95 transition-transform" (click)="reintentar()">
            <span class="text-xl">🔄</span> Reintentar Escaneo
          </div>
          <p class="mt-6 text-xs text-gray-400 font-bold uppercase tracking-wider">Por favor, avise al mozo</p>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-6px) rotate(-3deg); }
      75% { transform: translateX(6px) rotate(3deg); }
    }
    .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
  `]
})
export class ScanComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  private sessionService = inject(ActiveSessionService);

  status = signal<'loading' | 'error'>('loading');

  ngOnInit() {
    // Analizamos los parámetros clásicos de la URL: /mesa/:numero/:token
    this.route.paramMap.subscribe(params => {
      const numeroMesa = params.get('numero');
      const tokenMesa = params.get('token');
      
      if (!numeroMesa || !tokenMesa) {
        this.status.set('error');
        return;
      }

      // Validamos llamando a la ruta original solicitada por el Arquitecto de Backend
      this.http.get<TableSession>(`${environment.apiUrl}/api/mesas/verify?mesaId=${numeroMesa}&token=${tokenMesa}`).subscribe({
        next: (mesaData) => {
          // El backend dice OK. Guardamos en el estado y avanzamos al Menú
          this.sessionService.setSession(mesaData);
          this.router.navigate(['/pedido']);
        },
        error: (err) => {
          console.error('El código QR ha expirado o es inválido', err);
          setTimeout(() => this.status.set('error'), 800);
        }
      });
    });
  }

  reintentar() {
    this.status.set('loading');
    this.ngOnInit();
  }
}
