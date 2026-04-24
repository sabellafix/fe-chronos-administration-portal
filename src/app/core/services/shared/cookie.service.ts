import { Injectable } from '@angular/core';
import { CryptographicService } from './cryptographic.service';
import { environment } from '@env/environment';
import { CookieService as NgxCookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class CookieService {
  
    private encryptionKey: string = environment.encryptionKey;

    constructor(
      private crypto: CryptographicService,
      private cookieService: NgxCookieService
    ) {}
  
    set(key: string, value: any): void {
      try {
        const json = JSON.stringify(value);
        this.cookieService.set(key, json);
      } catch (error) {
        console.error('Error saving cookie', error);
      }
    }
  
    get<T>(key: string): T | null {
      try {
        const item = this.cookieService.get(key);
        return item ? JSON.parse(item) as T : null;
      } catch (error) {
        console.error('Error reading cookie', error);
        return null;
      }
    }
  
    setEncrypt(key: string, value: any): void {
      try {
        const json = JSON.stringify(value);
        const encryptedValue = "";//this.crypto.encrypt(json, this.encryptionKey);
        this.cookieService.set(key, encryptedValue);
      } catch (error) {
        console.error('Error saving encrypted cookie', error);
      }
    }
  
    getEncrypt<T>(key: string): T | null {
      try {
        const encryptedValue = this.cookieService.get(key);
        if (!encryptedValue) return null;
        
        const decryptedValue = "";// this.crypto.decrypt(encryptedValue, this.encryptionKey);
        return JSON.parse(decryptedValue) as T;
      } catch (error) {
        console.error('Error reading encrypted cookie', error);
        return null;
      }
    }
  
    remove(key: string): void {
      this.cookieService.delete(key);
    }
  
    clearAll(): void {
      this.cookieService.deleteAll();
    }

  clearAllByDomain(domain: string, path: string = '/'): void {
    if (!domain) {
      return;
    }

    const cookies = document.cookie ? document.cookie.split(';') : [];

    for (const cookie of cookies) {
      const cookieName = cookie.split('=')[0].trim();

      if (!cookieName) {
        continue;
      }

      this.cookieService.delete(cookieName, path, domain);

      if (domain.startsWith('.')) {
        this.cookieService.delete(cookieName, path, domain.substring(1));
      } else {
        this.cookieService.delete(cookieName, path, `.${domain}`);
      }

      if (path !== '/') {
        this.cookieService.delete(cookieName, '/', domain);
      }
    }
  }
}