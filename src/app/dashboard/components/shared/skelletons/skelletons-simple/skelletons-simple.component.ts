  import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skelletons-simple',
  templateUrl: './skelletons-simple.component.html',
  styleUrl: './skelletons-simple.component.scss'
})
export class SkelletonsSimpleComponent {

  @Input('row') row : number = 3;
  @Input('col') col : number = 2;
  rows : number[] = [];
  colClass = "col-md-6";
  numItems : number = 0;

  
  ngOnInit(): void {
    this.numItems = this.row * this.col;
    this.rows = Array.from({ length: this.numItems }, (_, i) => i + 1);

    switch(this.col){
      case 1 :
        this.colClass = "col-md-12";
        break;
        
      case 2 :
        this.colClass = "col-md-6";
        break;
        
      case 3 :
        this.colClass = "col-md-4";
        break;

      case 4 :
        this.colClass = "col-md-3";
        break;
    }
  }
}
