import { Injectable, signal, computed } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { MesaTask } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {
  private hubConnection: signalR.HubConnection | null = null;
  
  private _tasks = signal<MesaTask[]>([]);
  public readonly pendingTasks = computed(() => this._tasks().filter(t => t.status === 'Pending'));

  constructor() {
    this.buildConnection();
    this.startConnection();
    this.addListeners();
  }

  private buildConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://yaestoy.onrender.com/hubs/restaurante')
      .withAutomaticReconnect()
      .build();
  }

  private startConnection() {
    if (this.hubConnection) {
      this.hubConnection
        .start()
        .then(() => console.log('SignalR connection established...'))
        .catch(err => console.log('Error while starting SignalR connection: ' + err));
    }
  }

  private addListeners() {
    if (!this.hubConnection) return;

    this.hubConnection.on('NotificarLlamadoMozo', (mesaId: string, numeroMesa: number) => {
      this.addTask({
        id: crypto.randomUUID(),
        tableId: numeroMesa,
        type: 'Llamado',
        timestamp: new Date(),
        status: 'Pending'
      });
    });

    this.hubConnection.on('NotificarNuevoPedido', (pedidoId: string, mesaId: string, numeroMesa: number) => {
      this.addTask({
        id: crypto.randomUUID(),
        tableId: numeroMesa,
        type: 'Pedido',
        timestamp: new Date(),
        status: 'Pending',
        details: 'Nuevos items solicitados'
      });
    });
    
    this.hubConnection.on('NotificarPidiendoCuenta', (mesaId: string, numeroMesa: number) => {
      this.addTask({
        id: crypto.randomUUID(),
        tableId: numeroMesa,
        type: 'Cuenta',
        timestamp: new Date(),
        status: 'Pending'
      });
    });
  }

  private addTask(task: MesaTask) {
    this._tasks.update(tasks => [...tasks, task]);
  }

  public completeTask(taskId: string) {
    this._tasks.update(tasks => tasks.map(t => 
      t.id === taskId ? { ...t, status: 'Completed' } : t
    ));
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
