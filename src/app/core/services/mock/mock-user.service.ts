import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { User } from '@app/core/models/bussiness/user';
import { Pagination } from '@app/core/models/interfaces/pagination.interface';
import { StorageService } from '../shared/storage.service';

@Injectable({
    providedIn: 'root'
})
export class MockUserService {
    private readonly STORAGE_KEY = 'MOCK_USERS';
    private readonly DELAY_MS = 500;
    private readonly NUM_USERS = 8;

    constructor(private storageService: StorageService) {
        this.initializeMockData();
    }

    private initializeMockData(): void {
        const existingUsers = this.storageService.get<User[]>(this.STORAGE_KEY);
        if (!existingUsers || existingUsers.length === 0) {
            const mockUsers: User[] = [];
            for (let i = 1; i <= this.NUM_USERS; i++) {
                const user = new User();
                user.id = i.toString();
                user.name = `Usuario${i}`;
                user.email = `usuario${i}@example.com`;
                user.phoneNumber = `600${i.toString().padStart(6, '0')}`;
                user.userType = ['Buyer', 'Supplier', 'Admin'][i % 3];
                user.isActive = i % 2 === 0;
                user.isVerified = i % 2 === 0;
                user.isDeleted = i % 2 === 0;
                user.b2CId = `b2c${i}`;
                user.employeeId = `emp${i}`;
                user.department = `dep${i}`;
                user.companyName = `company${i}`;
                user.address = `address${i}`;

                mockUsers.push(user);
            }
            this.storageService.set(this.STORAGE_KEY, mockUsers);
        }
    }

    private getUsersFromStorage(): User[] {
        return this.storageService.get<User[]>(this.STORAGE_KEY) || [];
    }

    getUsers(pagination: Pagination): Observable<{ data: User[], count: number }> {
        let filteredUsers = [...this.getUsersFromStorage()];
        if (pagination.filters) {
            const filters = pagination.filters.split('&');
            filters.forEach((filter: string) => {
                const [key, value] = filter.split('=');
                if (key && value) {
                    filteredUsers = filteredUsers.filter(user => 
                        user[key as keyof User]?.toString() === value
                    );
                }
            });
        }

        if (pagination.sort) {
            const [field, direction] = pagination.sort.split(',');
            filteredUsers.sort((a, b) => {
                const aValue = a[field as keyof User];
                const bValue = b[field as keyof User];
                return direction === 'desc' 
                    ? bValue > aValue ? 1 : -1 
                    : aValue > bValue ? 1 : -1;
            });
        }

        const start = pagination.offset * pagination.limit;
        const end = start + pagination.limit;
        const paginatedUsers = filteredUsers.slice(start, end);

        return of({
            data: paginatedUsers,
            count: filteredUsers.length
        }).pipe(delay(this.DELAY_MS));
    }

    get(id: string): Observable<User> {
        const users = this.getUsersFromStorage();
        const user = users.find(u => u.id == id);
        return of(user ? user : new User()).pipe(delay(this.DELAY_MS));
    }

    post(entity: any): Observable<any> {
        const users = this.getUsersFromStorage();
        const newId = Math.max(...users.map(u => parseInt(u.id)));
        const newUser = { ...entity, id: (newId + 1).toString() };
        users.push(newUser);
        this.storageService.set(this.STORAGE_KEY, users);
        return of(newUser).pipe(delay(this.DELAY_MS));
    }

    put(entity: any, id: string): Observable<any> {
        const users = this.getUsersFromStorage();
        const index = users.findIndex(u => u.id === id);
        if (index !== -1) {
            users[index] = { ...entity, id };
            this.storageService.set(this.STORAGE_KEY, users);
            return of(users[index]).pipe(delay(this.DELAY_MS));
        }
        return of(entity).pipe(delay(this.DELAY_MS));
    }

    patch(entity: Partial<any>, id: string): Observable<any> {
        const users = this.getUsersFromStorage();
        const index = users.findIndex(u => u.id === id);
        if (index !== -1) {
            users[index] = { ...users[index], ...entity };
            this.storageService.set(this.STORAGE_KEY, users);
            return of(users[index]).pipe(delay(this.DELAY_MS));
        }
        return of(entity as User).pipe(delay(this.DELAY_MS));
    }

    delete(id: string): Observable<any> {
        const users = this.getUsersFromStorage();
        const index = users.findIndex(u => u.id === id);
        if (index !== -1) {
            users.splice(index, 1);
            this.storageService.set(this.STORAGE_KEY, users);
        }
        return of({ success: true }).pipe(delay(this.DELAY_MS));
    }
} 