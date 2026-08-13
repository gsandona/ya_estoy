import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as signalR from '@microsoft/signalr';
import { MesaTask } from '../models/task.model';
import { environment } from '../../../environments/environment';
import { AdminDataService } from '../../features/admin/config/admin-data.service';

export interface NotificationSettings {
  muteAll: boolean;
  tasks: boolean;
  orderStatus: boolean;
  reassignments: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SignalrService {
  private hubConnection: signalR.HubConnection | null = null;
  private http = inject(HttpClient);
  private adminDataService = inject(AdminDataService);
  private audioCtx: AudioContext | null = null;
  
  private _tasks = signal<MesaTask[]>([]);
  public readonly pendingTasks = computed(() => this._tasks().filter(t => t.status === 'Pending'));
  public readonly isConnected = signal<boolean>(false);
  public readonly taskCompleted = signal<string | null>(null);
  public readonly comandaChanged = signal<string | null>(null);
  public readonly mesaMontoConsumo = signal<{ mesaId: string, monto: number | null } | null>(null);

  // Notification settings signal
  public readonly notificationSettings = signal<NotificationSettings>({
    muteAll: false,
    tasks: true,
    orderStatus: true,
    reassignments: true
  });

  constructor() {
    this.loadSettings();
    this.buildConnection();
    this.addListeners();
    this.startConnection();
    this.fetchPendingTasks();
    this.setupAudioUnlock();

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event) => {
        if (event.key === this.getSettingsKey()) {
          this.loadSettings();
        }
      });
    }
  }

  private setupAudioUnlock() {
    const unlockAudio = () => {
      this.initAudioContext();
      this.playSilentSound();
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
    window.addEventListener('click', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);

    // Auto-resumir en iOS Safari cuando la pestaña vuelve al primer plano
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.audioCtx) {
        this.audioCtx.resume().catch(e => console.warn('Could not resume AudioContext on visibilitychange:', e));
      }
    });
  }

  private playSilentSound() {
    if (!this.audioCtx) return;
    try {
      const buffer = this.audioCtx.createBuffer(1, 1, 22050);
      const source = this.audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(this.audioCtx.destination);
      // Iniciar el buffer de silencio para desbloquear el motor de audio de iOS
      source.start(0);
    } catch (e) {
      console.warn('Silent sound play failed:', e);
    }
  }

  private initAudioContext() {
    if (this.audioCtx) {
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }
      return;
    }
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    } catch (e) {
      console.warn('Could not initialize AudioContext:', e);
    }
  }

  private getSettingsKey(): string {
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        if (user && user.id) {
          return `notification_settings_${user.id}`;
        }
      } catch (e) {}
    }
    return 'notification_settings';
  }

  public loadSettings() {
    const key = this.getSettingsKey();
    const savedSettings = localStorage.getItem(key);
    if (savedSettings) {
      try {
        this.notificationSettings.set(JSON.parse(savedSettings));
      } catch (e) {
        this.resetDefaultSettings();
      }
    } else {
      this.resetDefaultSettings();
    }
  }

  private resetDefaultSettings() {
    this.notificationSettings.set({
      muteAll: false,
      tasks: true,
      orderStatus: true,
      reassignments: true
    });
  }

  public updateNotificationSettings(settings: Partial<NotificationSettings>) {
    const updated = { ...this.notificationSettings(), ...settings };
    this.notificationSettings.set(updated);
    const key = this.getSettingsKey();
    localStorage.setItem(key, JSON.stringify(updated));
  }

  private fetchPendingTasks() {
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    this.http.get<any[]>(`${environment.apiUrl}/api/tareas/pendientes`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).subscribe({
      next: (tasks) => {
        this._tasks.set(tasks.map(t => ({
          id: t.id,
          tableId: t.tableId,
          type: t.type,
          details: t.details,
          status: t.status,
          timestamp: new Date(t.timestamp),
          assignedMozoId: t.assignedMozoId,
          pedidoEstado: t.pedidoEstado
        })));
      },
      error: (e) => console.error('Error fetching tasks on load', e)
    });
  }

  private buildConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.apiUrl}/hubs/restaurante`)
      .withAutomaticReconnect()
      .build();
      
    this.hubConnection.onreconnecting(() => this.isConnected.set(false));
    this.hubConnection.onreconnected(() => {
      this.isConnected.set(true);
      this.fetchPendingTasks(); // Refetch en caso de que hayamos perdido algo
      this.autoJoinGroup();
    });
    this.hubConnection.onclose(() => this.isConnected.set(false));
  }

  private autoJoinGroup() {
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        this.joinGroup(user.role, user.id, user.restauranteId);
      } catch (e) {}
    }
  }

  private startConnection() {
    if (this.hubConnection) {
      this.hubConnection
        .start()
        .then(() => {
          console.log('SignalR connection established...');
          this.isConnected.set(true);
          this.autoJoinGroup();
        })
        .catch(err => console.log('Error while starting SignalR connection: ' + err));
    }
  }

  private addListeners() {
    if (!this.hubConnection) return;

    this.hubConnection.on('NotificarLlamadoMozo', (taskId: string, numeroMesa: number) => {
      this.playAudioAlert('tasks');
      this.addTask({
        id: taskId,
        tableId: numeroMesa,
        type: 'Llamado',
        timestamp: new Date(),
        status: 'Pending'
      });
    });

    this.hubConnection.on('NotificarNuevoPedido', (pedidoId: string, taskId: string, numeroMesa: number, details?: string) => {
      this.playAudioAlert('tasks');
      this.addTask({
        id: taskId,
        tableId: numeroMesa,
        type: 'Pedido',
        timestamp: new Date(),
        status: 'Pending',
        details: details || 'Nuevos items solicitados',
        pedidoEstado: 'Recibido'
      });
    });

    this.hubConnection.on('NotificarPidiendoCuenta', (taskId: string, numeroMesa: number) => {
      this.playAudioAlert('tasks');
      this.addTask({
        id: taskId,
        tableId: numeroMesa,
        type: 'Cuenta',
        timestamp: new Date(),
        status: 'Pending'
      });
    });

    this.hubConnection.on('TareaReasignada', (taskId: string, newMozoId: string) => {
      this.playAudioAlert('reassignments');
      this._tasks.update(tasks => tasks.map(t => 
        t.id.toLowerCase() === taskId.toLowerCase() ? { ...t, assignedMozoId: newMozoId } : t
      ));
      // Update the local waiter assignment for this table
      const task = this._tasks().find(t => t.id.toLowerCase() === taskId.toLowerCase());
      if (task) {
        this.adminDataService.mesas.update(mesas => mesas.map(m => 
          m.numero === task.tableId ? { ...m, mozoId: newMozoId } : m
        ));
      }
    });

    this.hubConnection.on('TareaCompletada', (taskId: string) => {
      this._tasks.update(tasks => tasks.map(t => 
        t.id.toLowerCase() === taskId.toLowerCase() ? { ...t, status: 'Completed' } : t
      ));
      this.taskCompleted.set(taskId.toLowerCase());
    });

    this.hubConnection.on('NotificarPedidoAprobado', (pedidoId: string, numeroMesa: number, details: string) => {
      this.playAudioAlert('orderStatus');
      this._tasks.update(tasks => tasks.map(t => 
        t.id.toLowerCase() === pedidoId.toLowerCase() ? { ...t, pedidoEstado: 'EnPreparacion' } : t
      ));
      this.comandaChanged.set(pedidoId + '_' + Date.now());
    });

    this.hubConnection.on('NotificarPedidoListo', (pedidoId: string, taskId: string, numeroMesa: number) => {
      this.playAudioAlert('orderStatus');
      const exists = this._tasks().some(t => t.id.toLowerCase() === pedidoId.toLowerCase());
      if (exists) {
        this._tasks.update(tasks => tasks.map(t => 
          t.id.toLowerCase() === pedidoId.toLowerCase() ? { ...t, pedidoEstado: 'Listo' } : t
        ));
      } else {
        this.addTask({
          id: pedidoId,
          tableId: numeroMesa,
          type: 'Pedido',
          timestamp: new Date(),
          status: 'Pending',
          details: '¡Pedido listo para retirar y entregar!',
          pedidoEstado: 'Listo'
        });
      }
      this.comandaChanged.set(pedidoId + '_' + Date.now());
    });

    this.hubConnection.on('NotificarMontoConsumoActualizado', (mesaId: string, monto: number | null) => {
      this.mesaMontoConsumo.set({ mesaId, monto });
    });
  }

  public async joinGroup(role: string, userId?: string, restauranteId?: string) {
    if (userId) {
      this.loadSettings();
    }
    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      await this.hubConnection.invoke('JoinGroup', role, userId || '', restauranteId || '');
    }
  }

  private playAudioAlert(type: 'tasks' | 'orderStatus' | 'reassignments') {
    const settings = this.notificationSettings();
    console.log('playAudioAlert check:', { type, settings });
    if (settings.muteAll) {
      console.log('playAudioAlert: Mute All is active. Skip audio.');
      return;
    }
    if (!settings[type]) {
      console.log(`playAudioAlert: Setting for ${type} is disabled. Skip audio.`);
      return;
    }

    try {
      // Vibración para celulares (patrón: vibra 200ms, pausa 100ms, vibra 200ms)
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }

      // Asegurar que el AudioContext esté inicializado y activo
      this.initAudioContext();

      if (!this.audioCtx) return;

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      
      const playChime = (freq: number, startTime: number) => {
        if (!this.audioCtx) return;
        const oscillator = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, startTime);
        
        // Ataque suave, decaimiento largo
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.8);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + 1);
      };

      // Doble campanilla (e.g., C6 y E6)
      const now = this.audioCtx.currentTime;
      playChime(1046.50, now);        // C6
      playChime(1318.51, now + 0.15); // E6

    } catch (e) {
      console.warn('Audio/Vibrate play failed (maybe no user interaction yet):', e);
    }
  }

  private addTask(task: MesaTask) {
    this._tasks.update(tasks => {
      if (tasks.some(t => t.id.toLowerCase() === task.id.toLowerCase())) {
        return tasks;
      }
      return [...tasks, task];
    });
  }

  public async completeTask(taskId: string) {
    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      await this.hubConnection.invoke('CompletarTarea', taskId);
    } else {
      console.warn('SignalR not connected, cannot complete task locally in V1 persistency mode.');
    }
  }

  public async sendReasignarTarea(taskId: string, newMozoId: string) {
    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      await this.hubConnection.invoke('ReasignarTarea', taskId, newMozoId);
    }
  }

  public async sendLlamarMozo(mesaId: string): Promise<string> {
    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      return await this.hubConnection.invoke<string>('LlamarMozo', mesaId);
    } else {
      console.warn('SignalR not connected, mock send locally.');
      const taskId = crypto.randomUUID();
      this.addTask({
        id: taskId,
        tableId: 0,
        type: 'Llamado',
        timestamp: new Date(),
        status: 'Pending'
      });
      return taskId;
    }
  }

  public async sendPedirCuenta(mesaId: string): Promise<string> {
    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      return await this.hubConnection.invoke<string>('PedirCuenta', mesaId);
    } else {
      console.warn('SignalR not connected, mock send locally.');
      const taskId = crypto.randomUUID();
      this.addTask({
        id: taskId,
        tableId: 0,
        type: 'Cuenta',
        timestamp: new Date(),
        status: 'Pending'
      });
      return taskId;
    }
  }

  public async sendNuevoPedido(mesaId: string, details: string): Promise<string> {
    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      return await this.hubConnection.invoke<string>('NuevoPedido', mesaId, details);
    } else {
      console.warn('SignalR not connected, mock send locally.');
      const taskId = crypto.randomUUID();
      this.addTask({
        id: taskId,
        tableId: 0,
        type: 'Pedido',
        timestamp: new Date(),
        status: 'Pending',
        details
      });
      return taskId;
    }
  }

  public async cancelTask(taskId: string): Promise<void> {
    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      await this.hubConnection.invoke('CancelarTarea', taskId);
    } else {
      console.warn('SignalR not connected, mock cancel locally.');
      this._tasks.update(tasks => tasks.map(t => 
        t.id.toLowerCase() === taskId.toLowerCase() ? { ...t, status: 'Completed' } : t
      ));
      this.taskCompleted.set(taskId.toLowerCase());
    }
  }
}
