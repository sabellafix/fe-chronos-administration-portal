import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CryptographicService {

  constructor() {}

  // encrypt(data: string, key: string): string {
  //   return CryptoJS.AES.encrypt(data, key).toString();
  // }

  // decrypt(data: string, key: string): string {
  //   const bytes = CryptoJS.AES.decrypt(data, key);
  //   return bytes.toString(CryptoJS.enc.Utf8);
  // }

}
