export interface MesaTask {
  id: string;
  tableId: number;
  type: 'Llamado' | 'Pedido' | 'Cuenta' | 'Pedido Listo';
  timestamp: Date;
  status: 'Pending' | 'Completed';
  details?: string;
  assignedMozoId?: string;
  pedidoEstado?: string;
}
