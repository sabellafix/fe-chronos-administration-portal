import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '@app/core/models/bussiness/user';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { StorageService } from '../shared/storage.service';
import { StorageKeyConst } from '@app/core/models/constants/storageKey.const';
import { Rol } from '@app/core/models/bussiness/rol';
import { Permission } from '@app/core/models/bussiness/permission';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

    private isAuthenticated = new BehaviorSubject<boolean>(this.hasToken());

    constructor(private router: Router, private storageService: StorageService) {}

    isLoggedIn() {
        return this.isAuthenticated.asObservable();
    }

    updateAuthenticationStatus(): void {
        const hasToken = this.hasToken();
        this.isAuthenticated.next(hasToken);
    }

    setAuthenticated(isAuthenticated: boolean): void {
        this.isAuthenticated.next(isAuthenticated);
    }

    private hasToken(): boolean {
        return localStorage.getItem(StorageKeyConst._TOKEN) !== null;
    }

    signOut(): void {
        localStorage.removeItem(StorageKeyConst._TOKEN);
        localStorage.removeItem('user');
        this.isAuthenticated.next(false);
    }

    logOut(){
        this.storageService.clearAll();
        this.setAuthenticated(false);
        this.router.navigate(['login']);
    }

    getUserLogged(): User{
        const user = JSON.parse(this.storageService.get(StorageKeyConst._USER) as string) as User;
        return user as User;
    }

    getRoleLogged(): Rol{   
        const rol = JSON.parse(this.storageService.get(StorageKeyConst._ROLE) as string) as Rol;
        return rol as Rol;
    }

    getPermissionsLogged(): Permission[]{
        const rol = this.getRoleLogged();
        const rolePermissions = rol.rolePermissions;
        const permissions = rolePermissions.map(rp => rp.permission);
        return permissions as Permission[];
    }

}
