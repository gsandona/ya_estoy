export interface MesaTask {
  id: string;
  tableId: number;
  type: 'Llamado' | 'Pedido' | 'Cuenta';
  timestamp: Date;
  status: 'Pending' | 'Completed';
  details?: string;
}
