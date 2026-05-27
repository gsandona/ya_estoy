import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TenantContextService {
  private tenantIdSubject = new BehaviorSubject<string | null>(this.getInitialTenantId());

  constructor() {}

  private getInitialTenantId(): string | null {
    return localStorage.getItem('active_tenant_id');
  }

  get tenantId$(): Observable<string | null> {
    return this.tenantIdSubject.asObservable();
  }

  get currentTenantId(): string | null {
    return this.tenantIdSubject.getValue();
  }

  setTenantId(id: string | null): void {
    if (id) {
      localStorage.setItem('active_tenant_id', id);
    } else {
      localStorage.removeItem('active_tenant_id');
    }
    this.tenantIdSubject.next(id);
  }
}
