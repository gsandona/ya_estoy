import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';

export interface SystemSetting {
  key: string;
  value: string;
}

@Component({
  selector: 'app-superadmin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <span class="text-3xl">👑</span> Configuración de Sistema
        </h2>
      </div>

      <div class="bg-surface p-6 rounded-2xl mb-6 border border-gray-200">
        <h3 class="text-lg font-bold text-gray-800 mb-4">Mantenimiento de Base de Datos</h3>
        <p class="text-sm text-gray-500 mb-4">Configura la frecuencia con la que el servidor eliminará automáticamente las notificaciones y alertas antiguas (Llamados al mozo, Pedidos de cuenta). Mantener este valor bajo ayuda a que la base de datos sea más rápida y gratuita.</p>

        <form class="flex flex-col gap-4 items-start" (submit)="saveSettings($event)">
          <div class="w-full max-w-md">
            <label class="block text-xs font-semibold text-gray-500 mb-1">Intervalo de Limpieza Automática</label>
            <div class="flex items-center gap-2">
              <input type="number" [(ngModel)]="cleanupHours" name="cleanupHours" min="1" max="720" class="w-32 px-4 py-3 rounded-xl border border-gray-300 font-bold text-gray-800" required>
              <span class="text-gray-600 font-medium">Horas</span>
            </div>
          </div>
          
          <div class="w-full max-w-md">
            <label class="block text-xs font-semibold text-gray-500 mb-1">Hora de Ejecución (ej: 04:00)</label>
            <div class="flex items-center gap-2">
              <input type="time" [(ngModel)]="cleanupTime" name="cleanupTime" class="w-40 px-4 py-3 rounded-xl border border-gray-300 font-bold text-gray-800" required>
            </div>
          </div>
          
          <div class="flex items-center gap-3 mt-4">
             <button type="submit" [disabled]="isSaving()" class="bg-accent text-white px-8 py-3 rounded-xl font-bold shadow-sm hover:bg-opacity-90 transition-all flex items-center gap-2 disabled:opacity-50">
                @if (isSaving()) {
                  <span class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span> Guardando...
                } @else {
                  💾 Guardar Cambios
                }
             </button>
             @if (saveSuccess()) {
               <span class="text-green-500 font-bold text-sm bg-green-50 px-4 py-2 rounded-xl">✅ Configuración Actualizada</span>
             }
          </div>
        </form>
      </div>
    </div>
  `
})
export class SuperadminSettingsComponent implements OnInit {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  cleanupHours = signal<number>(24);
  cleanupTime = signal<string>('04:00');
  isSaving = signal(false);
  saveSuccess = signal(false);

  ngOnInit() {
    this.http.get<SystemSetting[]>(`${environment.apiUrl}/api/settings`, {
      headers: { 'Authorization': `Bearer ${this.auth.getToken()}` }
    }).subscribe({
      next: (settings) => {
        const cleanupSetting = settings.find(s => s.key === 'CleanupJobIntervalHours');
        if (cleanupSetting && cleanupSetting.value) {
          this.cleanupHours.set(parseInt(cleanupSetting.value, 10) || 24);
        }
        
        const timeSetting = settings.find(s => s.key === 'CleanupJobTimeOfDay');
        if (timeSetting && timeSetting.value) {
          this.cleanupTime.set(timeSetting.value);
        }
      },
      error: (err) => console.error('Error fetching settings:', err)
    });
  }

  saveSettings(e: Event) {
    e.preventDefault();
    this.isSaving.set(true);

    const updateHoursPayload: SystemSetting = {
      key: 'CleanupJobIntervalHours',
      value: this.cleanupHours().toString()
    };
    
    const updateTimePayload: SystemSetting = {
      key: 'CleanupJobTimeOfDay',
      value: this.cleanupTime()
    };

    // Guardamos ambas configuraciones de forma asíncrona
    Promise.all([
      this.http.post(`${environment.apiUrl}/api/settings`, updateHoursPayload, { headers: { 'Authorization': `Bearer ${this.auth.getToken()}` } }).toPromise(),
      this.http.post(`${environment.apiUrl}/api/settings`, updateTimePayload, { headers: { 'Authorization': `Bearer ${this.auth.getToken()}` } }).toPromise()
    ]).then(() => {
        this.isSaving.set(false);
        this.saveSuccess.set(true);
        setTimeout(() => this.saveSuccess.set(false), 3000);
    }).catch(err => {
        this.isSaving.set(false);
        alert('❌ Error al guardar la configuración.');
        console.error(err);
    });
  }
}
