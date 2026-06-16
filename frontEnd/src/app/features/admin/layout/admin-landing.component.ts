import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  standalone: true,
  template: ''
})
export class AdminLandingComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    const role = this.auth.currentUser()?.role;
    if (role === 'Admin' || role === 'SuperAdmin') {
      this.router.navigate(['/admin/inicio']);
    } else if (role === 'Cocina') {
      this.router.navigate(['/admin/cocina']);
    } else {
      this.router.navigate(['/admin/dashboard']);
    }
  }
}
