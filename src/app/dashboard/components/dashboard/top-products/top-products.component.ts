import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { TopServiceDto } from '@app/core/models/bussiness/dashboard-dtos';

@Component({
  selector: 'app-top-products',
  templateUrl: './top-products.component.html',
  styleUrl: './top-products.component.scss'
})
export class TopProductsComponent implements OnChanges {

  @Input() loading: boolean = false;
  @Input() topServices: TopServiceDto[] = [];
  
  displayedServices: TopServiceDto[] = [];
  
  constructor() {
  }

  ngOnInit() {
    this.updateDisplayedServices();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['topServices'] && this.topServices) {
      this.updateDisplayedServices();
    }
  }

  private updateDisplayedServices(): void {
    if (this.topServices && this.topServices.length > 0) {
      // Tomar solo los primeros 4 servicios para mostrar
      this.displayedServices = this.topServices.slice(0, 4);
    } else {
      this.displayedServices = [];
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  }

  formatCount(value: number): string {
    if (value >= 1000) {
      return (value / 1000).toFixed(2) + 'k';
    }
    return value.toString();
  }
}
