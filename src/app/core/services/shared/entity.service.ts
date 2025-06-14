import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EntityService {

  constructor() {}

  getAttributes<T>(clase: new () => T): string[] {
    const instance = new clase();  
    const nombres = Object.keys(instance as Object);
    const attributes = nombres.filter((key) =>
      typeof instance[key as keyof T] !== 'function'
    );
    return attributes;
  }

}