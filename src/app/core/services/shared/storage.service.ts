import { Injectable } from '@angular/core';
import { CryptographicService } from './cryptographic.service';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  
  private encryptionKey: string = environment.encryptionKey;

  constructor(private crypto: CryptographicService) {}

  set(key: string, value: any): void {
    try {
      const json = JSON.stringify(value);
      localStorage.setItem(key, json);
    } catch (error) {
      console.error('Error saving to localStorage', error);
    }
  }

  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) as T : null;
    } catch (error) {
      console.error('Error reading from localStorage', error);
      return null;
    }
  }

  setEncrypt(key: string, value: any): void {
    try {
      const json = JSON.stringify(value);
      const encryptedValue = "";//this.crypto.encrypt(json, this.encryptionKey);
      localStorage.setItem(key, encryptedValue);
    } catch (error) {
      console.error('Error saving to localStorage', error);
    }
  }

  getEncrypt<T>(key: string): T | null {
    try {
      const encryptedValue = localStorage.getItem(key);
      if (!encryptedValue) return null;
      
      const decryptedValue = "";// this.crypto.decrypt(encryptedValue, this.encryptionKey);
      return JSON.parse(decryptedValue) as T;
    } catch (error) {
      console.error('Error reading from localStorage', error);
      return null;
    }
  }

  remove(key: string): void {
    localStorage.removeItem(key);
  }

  clearAll(): void {
    localStorage.clear();
  }
}
