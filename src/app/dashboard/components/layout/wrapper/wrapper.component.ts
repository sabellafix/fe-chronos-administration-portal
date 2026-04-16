import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Pagination } from '@app/core/models/interfaces/pagination.interface';
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'app-wrapper',
  templateUrl: './wrapper.component.html',
  styleUrl: './wrapper.component.scss'
})
export class WrapperComponent implements OnInit, OnDestroy {

  pagLocalization: Pagination = { offset: 0, limit: 1000, items: 0, filters: '', sort: 'id,desc', };
  snackBar: any;
  loading: boolean = false;
  chatDisabled: boolean = false;

  private routerSubscription!: Subscription;

  constructor(private router: Router) {
  }

  ngOnInit() {
    this.checkChatRoute(this.router.url);
    
    this.routerSubscription = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.checkChatRoute(event.urlAfterRedirects);
      });
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  private checkChatRoute(url: string): void {
    this.chatDisabled = url.includes('/chat');
  }

 



}
