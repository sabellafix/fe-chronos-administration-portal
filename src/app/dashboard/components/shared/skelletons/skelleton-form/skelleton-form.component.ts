import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skelleton-form',
  templateUrl: './skelleton-form.component.html',
  styleUrl: './skelleton-form.component.scss'
})
export class SkelletonFormComponent {
  @Input('title') title : string = "";
  // @Input('title') title : string = "";
  // @Input('rows') rows : number = 0;
  // @Input('cols') cols : number = 0;
}
