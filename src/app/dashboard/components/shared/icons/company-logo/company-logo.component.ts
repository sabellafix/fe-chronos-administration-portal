import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-company-logo',
  templateUrl: './company-logo.component.html',
  styleUrl: './company-logo.component.scss'
})
export class CompanyLogoComponent {

  @Input() type: 'default' | 'collapse' = 'default';
  @Input() mode: 'dark' | 'light' = 'dark';

  logo : string = '';

  logoDark = 'assets/images/chronos-dark.png';
  logoLight = 'assets/images/chronos-light.png';
  logoDarkCollapse = 'assets/images/chronos-collapse.png';
  logoLightCollapse = 'assets/images/chronos-collapse.png';

  ngOnInit(): void {
    if(this.type === 'default') {
      this.logo = this.mode === 'dark' ? this.logoDark : this.logoLight;
    } else {
      this.logo = this.mode === 'dark' ? this.logoDarkCollapse : this.logoLightCollapse;
    }
  }
}
