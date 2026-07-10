import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Restaurante {
  id?: string;
  nombre: string;
  iconoPrincipal?: string;
  parentRestauranteId?: string;
  activo: boolean;
  logoUrl?: string;
  imagenFondoUrl?: string;
  colorPrimario?: string;
  colorSecundario?: string;
  colorFondo?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RestauranteService {
  private apiUrl = `${environment.apiUrl}/api/Restaurantes`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Restaurante[]> {
    return this.http.get<Restaurante[]>(this.apiUrl);
  }

  getById(id: string): Observable<Restaurante> {
    return this.http.get<Restaurante>(`${this.apiUrl}/${id}`);
  }

  create(restaurante: Restaurante): Observable<Restaurante> {
    return this.http.post<Restaurante>(this.apiUrl, restaurante);
  }

  update(id: string, restaurante: Restaurante): Observable<Restaurante> {
    return this.http.put<Restaurante>(`${this.apiUrl}/${id}`, restaurante);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
