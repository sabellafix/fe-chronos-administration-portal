import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-top-products',
  templateUrl: './top-products.component.html',
  styleUrl: './top-products.component.scss'
})
export class TopProductsComponent {

  @Input() loading: boolean = false;
  
  constructor() {
  }

  ngOnInit() {
   
  }
}
