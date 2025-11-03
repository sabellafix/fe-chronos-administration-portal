import { Component, Input} from '@angular/core';

@Component({
  selector: 'app-skelleton-card',
  templateUrl: './skelleton-card.component.html',
  styleUrl: './skelleton-card.component.scss'
})
export class SkelletonCardComponent {

  @Input() showHeader: boolean = true;
  @Input() headerLines: number = 1;
  @Input() contentLines: number = 3;
  @Input() showFooter: boolean = false;
  @Input() footerLines: number = 1;
  @Input() height: string = 'auto';
  @Input() borderRadius: string = '16px';

}
