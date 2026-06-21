import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as signalR from '@microsoft/signalr';
import { MesaTask } from '../models/task.model';
import { environment } from '../../../environments/environment';
import { AdminDataService } from '../../features/admin/config/admin-data.service';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {
  private hubConnection: signalR.HubConnection | null = null;
  private http = inject(HttpClient);
  private adminDataService = inject(AdminDataService);
  
  private _tasks = signal<MesaTask[]>([]);
  public readonly pendingTasks = computed(() => this._tasks().filter(t => t.status === 'Pending'));
  public readonly isConnected = signal<boolean>(false);
  public readonly taskCompleted = signal<string | null>(null);
  public readonly comandaChanged = signal<string | null>(null);
  public readonly mesaMontoConsumo = signal<{ mesaId: string, monto: number | null } | null>(null);

  constructor() {
    this.buildConnection();
    this.addListeners();
    this.startConnection();
    this.fetchPendingTasks();
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
        this.joinGroup(user.role, user.id);
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
      this.playAudioAlert();
      this.addTask({
        id: taskId,
        tableId: numeroMesa,
        type: 'Llamado',
        timestamp: new Date(),
        status: 'Pending'
      });
    });

    this.hubConnection.on('NotificarNuevoPedido', (pedidoId: string, taskId: string, numeroMesa: number, details?: string) => {
      this.playAudioAlert();
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
      this.playAudioAlert();
      this.addTask({
        id: taskId,
        tableId: numeroMesa,
        type: 'Cuenta',
        timestamp: new Date(),
        status: 'Pending'
      });
    });

    this.hubConnection.on('TareaReasignada', (taskId: string, newMozoId: string) => {
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
      this.playAudioAlert();
      this._tasks.update(tasks => tasks.map(t => 
        t.id.toLowerCase() === pedidoId.toLowerCase() ? { ...t, pedidoEstado: 'EnPreparacion' } : t
      ));
      this.comandaChanged.set(pedidoId + '_' + Date.now());
    });

    this.hubConnection.on('NotificarPedidoListo', (pedidoId: string, taskId: string, numeroMesa: number) => {
      this.playAudioAlert();
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

  public async joinGroup(role: string, userId?: string) {
    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      await this.hubConnection.invoke('JoinGroup', role, userId || '');
    }
  }

  private playAudioAlert() {
    try {
      // Si es una PC de escritorio (caja), silenciamos los sonidos para no molestar
      const isDesktop = !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isDesktop) return;

      // Vibración para celulares (patrón: vibra 200ms, pausa 100ms, vibra 200ms)
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }

      // Web Audio API para un sonido de campanilla (chime) suave y moderno
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContext();
      
      const playChime = (freq: number, startTime: number) => {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, startTime);
        
        // Ataque suave, decaimiento largo
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.8);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + 1);
      };

      // Doble campanilla (e.g., C6 y E6)
      const now = audioCtx.currentTime;
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
