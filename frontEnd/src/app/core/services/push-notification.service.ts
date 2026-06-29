import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PushNotifications, ActionPerformed, PushNotificationSchema } from '@capacitor/push-notifications';
import { FCM } from '@capacitor-community/fcm';
import { Capacitor } from '@capacitor/core';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
  private http = inject(HttpClient);
  public readonly isSupported = signal<boolean>(false);
  public readonly isSubscribed = signal<boolean>(false);

  constructor() {
    const isNative = Capacitor.isNativePlatform();
    this.isSupported.set(isNative);
  }

  public async subscribeToNotifications(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      console.warn('Native Push Notifications are only supported on native mobile platforms (Android/iOS).');
      return;
    }

    try {
      let permStatus = await PushNotifications.checkPermissions();
      
      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
        throw new Error('User denied push notification permissions.');
      }

      await PushNotifications.register();
      this.setupListeners();
      this.isSubscribed.set(true);
    } catch (error) {
      console.error('Error during push notification setup:', error);
      throw error;
    }
  }

  private setupListeners() {
    PushNotifications.addListener('registration', async (token) => {
      console.log('Native push registration succeeded.');
      
      try {
        const fcmTokenResponse = await FCM.getToken();
        const fcmToken = fcmTokenResponse.token;
        console.log('Unified FCM Token obtained:', fcmToken);

        const deviceType = Capacitor.getPlatform(); // "android" o "ios"
        
        await firstValueFrom(
          this.http.post(`${environment.apiUrl}/api/devices/register`, {
            token: fcmToken,
            deviceType: deviceType
          })
        );
        
        localStorage.setItem('fcm_token', fcmToken);
      } catch (err) {
        console.error('Error registering FCM token with backend:', err);
      }
    });

    PushNotifications.addListener('registrationError', (error) => {
      console.error('Push registration error:', error);
    });

    PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
      console.log('Push notification received in foreground:', notification);
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (action: ActionPerformed) => {
      console.log('Push notification action performed:', action);
    });
  }

  public async unsubscribeFromNotifications(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;

    try {
      const fcmToken = localStorage.getItem('fcm_token');
      if (fcmToken) {
        try {
          await firstValueFrom(
            this.http.post(`${environment.apiUrl}/api/devices/unregister`, {
              token: fcmToken
            })
          );
        } catch (e) {
          console.warn('Could not unregister device token from backend:', e);
        }
        localStorage.removeItem('fcm_token');
      }

      await PushNotifications.removeAllListeners();
      this.isSubscribed.set(false);
      console.log('Native push unsubscribed successfully.');
    } catch (error) {
      console.error('Error during push unsubscription:', error);
    }
  }
}
