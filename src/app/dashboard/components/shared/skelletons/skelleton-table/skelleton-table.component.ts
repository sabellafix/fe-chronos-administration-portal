import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skelleton-table',
  templateUrl: './skelleton-table.component.html',
  styleUrl: './skelleton-table.component.scss'
})
export class SkelletonTableComponent {
  @Input('rows') rows : number = 0;
  @Input('columns') columns : number = 0;
}
