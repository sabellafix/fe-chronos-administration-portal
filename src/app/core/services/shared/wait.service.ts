import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WaitService {
    
  constructor() {
  }

  async waitAndReturnValue(value: any, time : number): Promise<any> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(value);
      }, time);
    });
  }

}