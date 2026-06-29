import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SwPush } from '@angular/service-worker';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
  private http = inject(HttpClient);
  private swPush = inject(SwPush);

  public readonly isSubscribed = signal<boolean>(false);
  public readonly isSupported = signal<boolean>(false);

  constructor() {
    this.isSupported.set(this.swPush.isEnabled);
    if (this.swPush.isEnabled) {
      this.swPush.subscription.subscribe(sub => {
        this.isSubscribed.set(sub !== null);
      });
    }
  }

  public async subscribeToNotifications(): Promise<void> {
    if (!this.swPush.isEnabled) {
      console.warn('Web Push is not enabled or supported in this browser/environment.');
      return;
    }

    try {
      // 1. Obtener la clave pública VAPID del backend
      const res = await firstValueFrom(
        this.http.get<{ publicKey: string }>(`${environment.apiUrl}/api/push-notifications/public-key`)
      );
      
      const serverPublicKey = res.publicKey;

      // 2. Solicitar suscripción al navegador (esto mostrará el prompt nativo de permisos)
      const subscription = await this.swPush.requestSubscription({
        serverPublicKey: serverPublicKey
      });

      // 3. Convertir a DTO y enviar al backend
      const subJson = subscription.toJSON();
      const subDto = {
        endpoint: subJson.endpoint,
        p256dh: subJson.keys?.['p256dh'] || '',
        auth: subJson.keys?.['auth'] || ''
      };

      await firstValueFrom(
        this.http.post(`${environment.apiUrl}/api/push-notifications/subscribe`, subDto)
      );

      this.isSubscribed.set(true);
      console.log('Successfully subscribed to Web Push notifications.');
    } catch (err) {
      console.error('Could not subscribe to Web Push notifications:', err);
      throw err;
    }
  }

  public async unsubscribeFromNotifications(): Promise<void> {
    if (!this.swPush.isEnabled) return;

    try {
      const currentSubscription = await firstValueFrom(this.swPush.subscription);
      if (currentSubscription) {
        const subJson = currentSubscription.toJSON();
        const subDto = {
          endpoint: subJson.endpoint,
          p256dh: subJson.keys?.['p256dh'] || '',
          auth: subJson.keys?.['auth'] || ''
        };

        // 1. Avisar al backend para eliminarla de la base de datos
        try {
          await firstValueFrom(
            this.http.post(`${environment.apiUrl}/api/push-notifications/unsubscribe`, subDto)
          );
        } catch (e) {
          console.warn('Could not notify backend of unsubscription', e);
        }

        // 2. Desuscribir en el navegador
        await this.swPush.unsubscribe();
      }
      this.isSubscribed.set(false);
      console.log('Successfully unsubscribed from Web Push.');
    } catch (err) {
      console.error('Could not unsubscribe from Web Push:', err);
    }
  }
}
