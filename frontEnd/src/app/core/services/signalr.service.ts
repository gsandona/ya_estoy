import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as signalR from '@microsoft/signalr';
import { MesaTask } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {
  private hubConnection: signalR.HubConnection | null = null;
  private http = inject(HttpClient);
  
  private _tasks = signal<MesaTask[]>([]);
  public readonly pendingTasks = computed(() => this._tasks().filter(t => t.status === 'Pending'));
  public readonly isConnected = signal<boolean>(false);

  constructor() {
    this.buildConnection();
    this.startConnection();
    this.addListeners();
    this.fetchPendingTasks();
  }

  private fetchPendingTasks() {
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    this.http.get<any[]>('https://yaestoy.onrender.com/api/tareas/pendientes', {
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
          assignedMozoId: t.assignedMozoId
        })));
      },
      error: (e) => console.error('Error fetching tasks on load', e)
    });
  }

  private buildConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://yaestoy.onrender.com/hubs/restaurante')
      .withAutomaticReconnect()
      .build();
      
    this.hubConnection.onreconnecting(() => this.isConnected.set(false));
    this.hubConnection.onreconnected(() => {
      this.isConnected.set(true);
      this.fetchPendingTasks(); // Refetch en caso de que hayamos perdido algo
    });
    this.hubConnection.onclose(() => this.isConnected.set(false));
  }

  private startConnection() {
    if (this.hubConnection) {
      this.hubConnection
        .start()
        .then(() => {
          console.log('SignalR connection established...');
          this.isConnected.set(true);
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
        details: details || 'Nuevos items solicitados'
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
        t.id === taskId ? { ...t, assignedMozoId: newMozoId } : t
      ));
    });

    this.hubConnection.on('TareaCompletada', (taskId: string) => {
      this._tasks.update(tasks => tasks.map(t => 
        t.id === taskId ? { ...t, status: 'Completed' } : t
      ));
    });
  }

  public async joinGroup(role: string, userId?: string) {
    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      await this.hubConnection.invoke('JoinGroup', role, userId || '');
    }
  }

  private playAudioAlert() {
    try {
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
    this._tasks.update(tasks => [...tasks, task]);
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

  public async sendLlamarMozo(tableId: number) {
    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      await this.hubConnection.invoke('LlamarMozo', tableId);
    } else {
      console.warn('SignalR not connected, mock send locally.');
      this.addTask({
        id: crypto.randomUUID(),
        tableId,
        type: 'Llamado',
        timestamp: new Date(),
        status: 'Pending'
      });
    }
  }

  public async sendPedirCuenta(tableId: number) {
    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      await this.hubConnection.invoke('PedirCuenta', tableId);
    } else {
      console.warn('SignalR not connected, mock send locally.');
      this.addTask({
        id: crypto.randomUUID(),
        tableId,
        type: 'Cuenta',
        timestamp: new Date(),
        status: 'Pending'
      });
    }
  }

  public async sendNuevoPedido(tableId: number, details: string) {
    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      await this.hubConnection.invoke('NuevoPedido', tableId, details);
    } else {
      console.warn('SignalR not connected, mock send locally.');
      this.addTask({
        id: crypto.randomUUID(),
        tableId,
        type: 'Pedido',
        timestamp: new Date(),
        status: 'Pending',
        details
      });
    }
  }
}
