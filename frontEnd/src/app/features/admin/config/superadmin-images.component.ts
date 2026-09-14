import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface ImageFile {
  name: string;
  url: string;
  sizeBytes: number;
  createdAt: string;
}

@Component({
  selector: 'app-superadmin-images',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 max-w-7xl mx-auto animate-fade-in">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-black text-gray-900 tracking-tight">Gestor de Imágenes</h1>
          <p class="text-gray-500 mt-1">Administra todas las imágenes almacenadas en el servidor</p>
        </div>
        
        <div>
          <input type="file" #fileInput class="hidden" accept="image/*" (change)="onFileSelected($event)">
          <button (click)="fileInput.click()" 
                  [disabled]="uploading()"
                  class="bg-black text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-colors">
            @if (uploading()) {
              <span class="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full"></span>
              Subiendo...
            } @else {
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
              Subir Imagen
            }
          </button>
        </div>
      </div>

      @if (loading()) {
        <div class="flex justify-center items-center py-20">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        </div>
      } @else if (error()) {
        <div class="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          {{ error() }}
        </div>
      } @else {
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          @for (img of images(); track img.name) {
            <div class="group relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
              <div class="aspect-square bg-gray-50 p-4 flex items-center justify-center">
                <img [src]="environment.apiUrl + img.url" [alt]="img.name" class="max-w-full max-h-full object-contain">
              </div>
              <div class="p-3 bg-white border-t border-gray-50">
                <p class="text-xs font-medium text-gray-900 truncate" [title]="img.name">{{ img.name }}</p>
                <p class="text-[10px] text-gray-500 mt-0.5">{{ formatBytes(img.sizeBytes) }}</p>
              </div>
              
              <!-- Hover Overlay -->
              <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                <button (click)="deleteImage(img.name)" 
                        [disabled]="deleting() === img.name"
                        class="bg-white text-red-600 p-2.5 rounded-full hover:scale-110 active:scale-95 transition-all shadow-lg">
                  @if (deleting() === img.name) {
                    <span class="animate-spin h-5 w-5 border-2 border-red-600/30 border-t-red-600 rounded-full block"></span>
                  } @else {
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  }
                </button>
              </div>
            </div>
          }
        </div>
        
        @if (images().length === 0) {
          <div class="text-center py-20 text-gray-500">
            <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            <p>No hay imágenes almacenadas.</p>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
  `]
})
export class SuperadminImagesComponent implements OnInit {
  private http = inject(HttpClient);
  environment = environment;
  
  images = signal<ImageFile[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  uploading = signal(false);
  deleting = signal<string | null>(null);

  ngOnInit() {
    this.loadImages();
  }

  loadImages() {
    this.loading.set(true);
    this.error.set(null);
    this.http.get<ImageFile[]>(`${environment.apiUrl}/api/images`).subscribe({
      next: (data) => {
        this.images.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading images', err);
        this.error.set('No se pudieron cargar las imágenes.');
        this.loading.set(false);
      }
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.uploadImage(file);
    }
  }

  uploadImage(file: File) {
    this.uploading.set(true);
    const formData = new FormData();
    formData.append('file', file);

    this.http.post<ImageFile>(`${environment.apiUrl}/api/images/upload`, formData).subscribe({
      next: (newImg) => {
        this.images.update(imgs => [newImg, ...imgs]);
        this.uploading.set(false);
      },
      error: (err) => {
        console.error('Error uploading image', err);
        alert(err.error?.message || 'Error al subir la imagen');
        this.uploading.set(false);
      }
    });
  }

  deleteImage(filename: string) {
    if (!confirm(`¿Estás seguro de eliminar la imagen ${filename}?`)) return;
    
    this.deleting.set(filename);
    this.http.delete(`${environment.apiUrl}/api/images/${filename}`).subscribe({
      next: () => {
        this.images.update(imgs => imgs.filter(img => img.name !== filename));
        this.deleting.set(null);
      },
      error: (err) => {
        console.error('Error deleting image', err);
        alert(err.error?.message || 'Error al eliminar la imagen');
        this.deleting.set(null);
      }
    });
  }

  formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  }
}
