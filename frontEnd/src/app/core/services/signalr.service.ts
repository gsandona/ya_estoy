import { Injectable, signal, computed, inject, effect } from '@angular/core';
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
  public readonly currentRestauranteId = signal<string | null>(null);

  public readonly notificationPermission = signal<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

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

    effect(() => {
      const pendingCount = this.pendingTasks().length;
      this.updateAppBadge(pendingCount);
    });

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event) => {
        if (event.key === this.getSettingsKey()) {
          this.loadSettings();
        }
      });
    }
  }

  private updateAppBadge(count: number) {
    if (typeof navigator === 'undefined') return;
    const nav = navigator as any;
    try {
      if (count > 0 && typeof nav.setAppBadge === 'function') {
        nav.setAppBadge(count).catch(() => {});
      } else if (count === 0 && typeof nav.clearAppBadge === 'function') {
        nav.clearAppBadge().catch(() => {});
      }
    } catch (e) {}
  }

  public async requestNotificationPermission(): Promise<NotificationPermission> {
    this.initAudioContext();
    this.playSilentSound();

    if (typeof Notification === 'undefined') {
      return 'default';
    }

    try {
      const permission = await Notification.requestPermission();
      this.notificationPermission.set(permission);
      return permission;
    } catch (e) {
      console.warn('Error requesting notification permission:', e);
      return this.notificationPermission();
    }
  }

  public showNativeNotification(title: string, body: string, tag?: string, force = false) {
    if (typeof Notification === 'undefined') return;
    this.notificationPermission.set(Notification.permission);
    if (Notification.permission !== 'granted') return;
    if (!force && this.notificationSettings().muteAll) return;

    const options: NotificationOptions = {
      body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: tag || 'mozogo-alert-' + Date.now(),
      requireInteraction: false
    };

    try {
      const notif = new Notification(title, options);
      notif.onclick = () => {
        window.focus();
        notif.close();
      };
    } catch (e) {
      // Fallback for mobile browsers (e.g., Android Chrome) that require ServiceWorkerRegistration
      if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration().then(reg => {
          if (reg && typeof reg.showNotification === 'function') {
            reg.showNotification(title, options).catch(() => {});
          }
        }).catch(() => {});
      }
    }
  }

  public async testAlert() {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      await this.requestNotificationPermission();
    } else {
      this.initAudioContext();
    }

    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([300, 100, 300]);
      }
    } catch (e) {}

    this.playChimeSequence();
    this.showNativeNotification(
      '🔔 Prueba de Alerta MozoGo',
      '¡Las notificaciones y el sonido funcionan correctamente en tu dispositivo!',
      'mozogo-test-alert',
      true
    );
  }

  private setupAudioUnlock() {
    const unlockAudio = () => {
      this.initAudioContext();
      this.playSilentSound();
      if (typeof Notification !== 'undefined') {
        this.notificationPermission.set(Notification.permission);
      }
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
    window.addEventListener('click', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);

    // Auto-resumir en iOS Safari / macOS cuando la pestaña vuelve al primer plano
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        if (this.audioCtx) {
          this.audioCtx.resume().catch(e => console.warn('Could not resume AudioContext on visibilitychange:', e));
        }
        if (typeof Notification !== 'undefined') {
          this.notificationPermission.set(Notification.permission);
        }
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
    const currentRest = this.currentRestauranteId();
    if (currentRest) {
      this.joinGroup('Comensal', '', currentRest);
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

    this.hubConnection.on('NotificarLlamadoMozo', (taskId: string, numeroMesa: number, details?: string) => {
      this.playAudioAlert('tasks');
      if (this.notificationSettings().tasks) {
        this.showNativeNotification(
          `🔔 Mesa ${numeroMesa} llama al mozo`,
          details || 'Solicita asistencia en la mesa',
          `task-${taskId}`
        );
      }
      this.addTask({
        id: taskId,
        tableId: numeroMesa,
        type: 'Llamado',
        timestamp: new Date(),
        status: 'Pending',
        details: details || 'Solicita asistencia'
      });
    });

    this.hubConnection.on('NotificarNuevoPedido', (pedidoId: string, taskId: string, numeroMesa: number, details?: string) => {
      this.playAudioAlert('tasks');
      if (this.notificationSettings().tasks) {
        this.showNativeNotification(
          `🍽️ Nuevo Pedido - Mesa ${numeroMesa}`,
          details || 'Nuevos productos solicitados',
          `pedido-${pedidoId}`
        );
      }
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

    this.hubConnection.on('NotificarPidiendoCuenta', (taskId: string, numeroMesa: number, details?: string) => {
      this.playAudioAlert('tasks');
      if (this.notificationSettings().tasks) {
        this.showNativeNotification(
          `💳 Mesa ${numeroMesa} pide la cuenta`,
          details || 'Solicita la cuenta',
          `cuenta-${taskId}`
        );
      }
      this.addTask({
        id: taskId,
        tableId: numeroMesa,
        type: 'Cuenta',
        timestamp: new Date(),
        status: 'Pending',
        details: details || 'Solicita la cuenta'
      });
    });

    this.hubConnection.on('TareaReasignada', (taskId: string, newMozoId: string) => {
      this.playAudioAlert('reassignments');
      if (this.notificationSettings().reassignments) {
        this.showNativeNotification(
          '🔄 Tarea Reasignada',
          'Se ha actualizado la asignación de una mesa',
          `reassign-${taskId}`
        );
      }
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
      if (this.notificationSettings().orderStatus) {
        this.showNativeNotification(
          `✅ Pedido Listo - Mesa ${numeroMesa}`,
          '¡Pedido listo en cocina para retirar y entregar!',
          `listo-${pedidoId}`
        );
      }
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
    if (restauranteId) {
      this.currentRestauranteId.set(restauranteId);
    }
    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      try {
        await this.hubConnection.invoke('JoinGroup', role, userId || '', restauranteId || '');
      } catch (err) {
        console.error('Error invoking JoinGroup:', err);
      }
    }
  }

  private playChimeSequence() {
    try {
      this.initAudioContext();
      if (!this.audioCtx) return;

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const playBellNote = (freq: number, startTime: number, duration = 0.9) => {
        if (!this.audioCtx) return;
        const oscMain = this.audioCtx.createOscillator();
        const oscHarmonic = this.audioCtx.createOscillator();
        const gainMain = this.audioCtx.createGain();
        const gainHarmonic = this.audioCtx.createGain();

        oscMain.type = 'sine';
        oscMain.frequency.setValueAtTime(freq, startTime);

        oscHarmonic.type = 'triangle';
        oscHarmonic.frequency.setValueAtTime(freq * 2, startTime);

        // Louder, clearer attack and bell decay
        gainMain.gain.setValueAtTime(0.001, startTime);
        gainMain.gain.linearRampToValueAtTime(0.55, startTime + 0.025);
        gainMain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        gainHarmonic.gain.setValueAtTime(0.001, startTime);
        gainHarmonic.gain.linearRampToValueAtTime(0.18, startTime + 0.015);
        gainHarmonic.gain.exponentialRampToValueAtTime(0.001, startTime + duration * 0.6);

        oscMain.connect(gainMain);
        oscHarmonic.connect(gainHarmonic);
        gainMain.connect(this.audioCtx.destination);
        gainHarmonic.connect(this.audioCtx.destination);

        oscMain.start(startTime);
        oscHarmonic.start(startTime);
        oscMain.stop(startTime + duration + 0.05);
        oscHarmonic.stop(startTime + duration + 0.05);
      };

      // 3-note ascending bell chime (C6 -> E6 -> G6)
      const now = this.audioCtx.currentTime;
      playBellNote(1046.50, now, 0.85);        // C6
      playBellNote(1318.51, now + 0.14, 0.85); // E6
      playBellNote(1567.98, now + 0.28, 1.1);  // G6
    } catch (e) {
      console.warn('Audio playChimeSequence failed:', e);
    }
  }

  private playAudioAlert(type: 'tasks' | 'orderStatus' | 'reassignments') {
    const settings = this.notificationSettings();
    if (settings.muteAll) {
      return;
    }
    if (!settings[type]) {
      return;
    }

    try {
      // Vibración para celulares (patrón: vibra 300ms, pausa 100ms, vibra 300ms)
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([300, 100, 300]);
      }
      this.playChimeSequence();
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

  public async sendLlamarMozo(mesaId: string, details?: string): Promise<string> {
    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      return await this.hubConnection.invoke<string>('LlamarMozo', mesaId, details || '');
    } else {
      console.warn('SignalR not connected, mock send locally.');
      const taskId = crypto.randomUUID();
      this.addTask({
        id: taskId,
        tableId: 0,
        type: 'Llamado',
        timestamp: new Date(),
        status: 'Pending',
        details: details || 'Solicita asistencia'
      });
      return taskId;
    }
  }

  public async sendPedirCuenta(mesaId: string, details?: string): Promise<string> {
    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      return await this.hubConnection.invoke<string>('PedirCuenta', mesaId, details || '');
    } else {
      console.warn('SignalR not connected, mock send locally.');
      const taskId = crypto.randomUUID();
      this.addTask({
        id: taskId,
        tableId: 0,
        type: 'Cuenta',
        timestamp: new Date(),
        status: 'Pending',
        details: details || 'Solicita la cuenta'
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
