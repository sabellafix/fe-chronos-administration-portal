import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '@app/core/models/bussiness/user';
import { InfoUser } from '@app/core/models/views/infoUser';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { StorageService } from '../shared/storage.service';
import { StorageKeyConst } from '@app/core/models/constants/storageKey.const';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

    private isAuthenticated = new BehaviorSubject<boolean>(this.hasToken());

    constructor(private router: Router, private storageService: StorageService) {}

    isLoggedIn() {
        return this.isAuthenticated.asObservable();
    }

    private hasToken(): boolean {
        return localStorage.getItem('token') !== null;
    }

    signIn(infoUser: InfoUser): Observable<boolean> {
        return of(true).pipe(
            delay(1000),
            tap(() => {
                let user: User = new User();
                user = new User();
                user.id = "51231a62-8bc9-42cd-b420-3fece744762f";
                user.email = "buyer@demo.com";
                user.name = "Comprador Demo";
                user.phoneNumber = "1234567890";
                user.userType = "Buyer";
                user.isActive = false;
                user.isDeleted = false;
                user.b2CId = "a66299bb-0f23-44f9-9553-d1b867174ac7";
                user.employeeId = "EMP001";
                user.isVerified = true;
                user.department = "Compras";
                user.companyName = "Comprador Demo";
                user.address = "Av. Siempre Viva 123";
                
                this.storageService.set(StorageKeyConst._USER_LOGGED, user);
                localStorage.setItem('token', 'mock-token-123');
                localStorage.setItem('user', JSON.stringify(infoUser));
                this.isAuthenticated.next(true);
            })
        );
    }

    signOut(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.isAuthenticated.next(false);
    }

    logOut(){
        this.storageService.clearAll();
        this.isAuthenticated.next(false);
        this.router.navigate(['login']);
    }

}
