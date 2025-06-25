import { Component } from '@angular/core';
import { Pagination } from '@app/core/models/interfaces/pagination.interface';

import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-wrapper',
  templateUrl: './wrapper.component.html',
  styleUrl: './wrapper.component.scss'
})
export class WrapperComponent {

  pagLocalization: Pagination = { offset: 0, limit: 1000, items: 0, filters: '', sort: 'id,desc', };
  snackBar: any;
  loading: boolean = false;;

  constructor() {
  }

  ngOnInit(){
  }

 



}
