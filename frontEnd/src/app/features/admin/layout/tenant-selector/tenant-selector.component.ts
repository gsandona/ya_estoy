import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RestauranteService, Restaurante } from '../../../../core/services/restaurante.service';
import { TenantContextService } from '../../../../core/services/tenant-context.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-tenant-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tenant-selector" *ngIf="isSuperAdmin">
      <label for="tenantSelect" class="form-label mb-0 me-2 text-white">Restaurante Activo:</label>
      <select 
        id="tenantSelect" 
        class="form-select form-select-sm" 
        style="width: 200px; display: inline-block;"
        [ngModel]="selectedTenantId"
        (ngModelChange)="onTenantChange($event)">
        <option [ngValue]="null">Todos (Global)</option>
        <option *ngFor="let rest of restaurantes" [ngValue]="rest.id">{{ rest.nombre }}</option>
      </select>
    </div>
  `,
  styles: [`
    .tenant-selector {
      display: flex;
      align-items: center;
      background-color: rgba(255, 255, 255, 0.1);
      padding: 0.25rem 0.5rem;
      border-radius: 6px;
      margin-right: 1rem;
    }
  `]
})
export class TenantSelectorComponent implements OnInit {
  isSuperAdmin = false;
  restaurantes: Restaurante[] = [];
  selectedTenantId: string | null = null;

  constructor(
    private authService: AuthService,
    private restauranteService: RestauranteService,
    private tenantContext: TenantContextService
  ) {}

  ngOnInit(): void {
    this.isSuperAdmin = this.authService.isSuperAdmin();

    if (this.isSuperAdmin) {
      this.loadRestaurantes();
      this.tenantContext.tenantId$.subscribe(id => {
        this.selectedTenantId = id;
      });
    }
  }

  loadRestaurantes(): void {
    this.restauranteService.getAll().subscribe({
      next: (data) => this.restaurantes = data,
      error: (err) => console.error('Error loading restaurantes:', err)
    });
  }

  onTenantChange(id: string | null): void {
    this.tenantContext.setTenantId(id);
    // Reload page to refresh all data globally with the new context
    window.location.reload();
  }
}
