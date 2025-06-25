import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Booking } from '@app/core/models/bussiness/booking';
import { Pagination } from '@app/core/models/interfaces/pagination.interface';
import { StorageService } from '../shared/storage.service';

@Injectable({
    providedIn: 'root'
})
export class MockBookingService {
    private readonly STORAGE_KEY = 'MOCK_BOOKINGS';
    private readonly DELAY_MS = 500;
    private readonly NUM_BOOKINGS = 20;

    constructor(private storageService: StorageService) {
        this.initializeMockData();
    }

    private initializeMockData(): void {
        const existingBookings = this.storageService.get<Booking[]>(this.STORAGE_KEY);
        if (!existingBookings || existingBookings.length === 0) {
            const mockBookings: Booking[] = [];
            const statuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled', 'NoShow', 'Rescheduled'];
            const currencies = ['USD', 'EUR', 'COP'];
            
            for (let i = 1; i <= this.NUM_BOOKINGS; i++) {
                const booking = new Booking();
                booking.id = `booking-${i.toString().padStart(3, '0')}`;
                booking.customerId = `customer-${((i % 10) + 1).toString().padStart(3, '0')}`;
                booking.supplierId = `supplier-${((i % 12) + 1).toString().padStart(3, '0')}`;
                booking.serviceId = `service-${((i % 15) + 1).toString().padStart(3, '0')}`;
                
                const bookingDate = new Date(Date.now() + (i - 10) * 24 * 60 * 60 * 1000);
                booking.bookingDate = bookingDate.toISOString().split('T')[0];
                
                const startHour = 8 + (i % 10);
                booking.startTime = `${startHour.toString().padStart(2, '0')}:00`;
                const endHour = startHour + Math.ceil(Math.random() * 3);
                booking.endTime = `${endHour.toString().padStart(2, '0')}:00`;
                
                booking.durationMinutes = (endHour - startHour) * 60;
                booking.totalPrice = Math.round((100 + Math.random() * 400) * 100) / 100;
                booking.currency = currencies[i % currencies.length];
                booking.status = statuses[i % statuses.length];
                booking.clientNotes = `Notas del cliente para la reserva ${i}`;
                booking.providerNotes = i % 3 === 0 ? `Notas del proveedor para la reserva ${i}` : '';
                booking.bookingReference = `REF-${Date.now()}-${i}`;
                
                booking.createdAt = new Date(Date.now() - i * 96 * 60 * 60 * 1000).toISOString();
                booking.updatedAt = new Date(Date.now() - i * 48 * 60 * 60 * 1000).toISOString();
                
                if (booking.status === 'Confirmed') {
                    booking.confirmedAt = new Date(Date.now() - i * 36 * 60 * 60 * 1000).toISOString();
                }
                if (booking.status === 'Completed') {
                    booking.completedAt = new Date(Date.now() - i * 12 * 60 * 60 * 1000).toISOString();
                }
                if (booking.status === 'Cancelled') {
                    booking.cancelledAt = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString();
                    booking.cancellationReason = `Razón de cancelación ${i}`;
                }

                mockBookings.push(booking);
            }
            this.storageService.set(this.STORAGE_KEY, mockBookings);
        }
    }

    private getBookingsFromStorage(): Booking[] {
        return this.storageService.get<Booking[]>(this.STORAGE_KEY) || [];
    }

    getBookings(pagination: Pagination): Observable<{ data: Booking[], count: number }> {
        let filteredBookings = [...this.getBookingsFromStorage()];
        if (pagination.filters) {
            const filters = pagination.filters.split('&');
            filters.forEach((filter: string) => {
                const [key, value] = filter.split('=');
                if (key && value) {
                    if (key === 'fromDate') {
                        filteredBookings = filteredBookings.filter(booking => 
                            booking.bookingDate >= value
                        );
                    } else if (key === 'toDate') {
                        filteredBookings = filteredBookings.filter(booking => 
                            booking.bookingDate <= value
                        );
                    } else {
                        filteredBookings = filteredBookings.filter(booking => 
                            booking[key as keyof Booking]?.toString() === value
                        );
                    }
                }
            });
        }

        if (pagination.sort) {
            const [field, direction] = pagination.sort.split(',');
            filteredBookings.sort((a, b) => {
                const aValue = a[field as keyof Booking];
                const bValue = b[field as keyof Booking];
                return direction === 'desc' 
                    ? bValue > aValue ? 1 : -1 
                    : aValue > bValue ? 1 : -1;
            });
        }

        const start = pagination.offset * pagination.limit;
        const end = start + pagination.limit;
        const paginatedBookings = filteredBookings.slice(start, end);

        return of({
            data: paginatedBookings,
            count: filteredBookings.length
        }).pipe(delay(this.DELAY_MS));
    }

    get(id: string): Observable<Booking> {
        const bookings = this.getBookingsFromStorage();
        const booking = bookings.find(b => b.id === id);
        return of(booking ? booking : new Booking()).pipe(delay(this.DELAY_MS));
    }

    post(entity: any): Observable<any> {
        const bookings = this.getBookingsFromStorage();
        const newId = `booking-${(bookings.length + 1).toString().padStart(3, '0')}`;
        const newBooking = { 
            ...entity, 
            id: newId,
            bookingReference: `REF-${Date.now()}-${bookings.length + 1}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        bookings.push(newBooking);
        this.storageService.set(this.STORAGE_KEY, bookings);
        return of(newBooking).pipe(delay(this.DELAY_MS));
    }

    put(entity: any, id: string): Observable<any> {
        const bookings = this.getBookingsFromStorage();
        const index = bookings.findIndex(b => b.id === id);
        if (index !== -1) {
            bookings[index] = { ...entity, id, updatedAt: new Date().toISOString() };
            this.storageService.set(this.STORAGE_KEY, bookings);
            return of(bookings[index]).pipe(delay(this.DELAY_MS));
        }
        return of(entity).pipe(delay(this.DELAY_MS));
    }

    patch(entity: Partial<any>, id: string): Observable<any> {
        const bookings = this.getBookingsFromStorage();
        const index = bookings.findIndex(b => b.id === id);
        if (index !== -1) {
            bookings[index] = { ...bookings[index], ...entity, updatedAt: new Date().toISOString() };
            this.storageService.set(this.STORAGE_KEY, bookings);
            return of(bookings[index]).pipe(delay(this.DELAY_MS));
        }
        return of(entity as Booking).pipe(delay(this.DELAY_MS));
    }

    delete(id: string): Observable<any> {
        const bookings = this.getBookingsFromStorage();
        const index = bookings.findIndex(b => b.id === id);
        if (index !== -1) {
            bookings.splice(index, 1);
            this.storageService.set(this.STORAGE_KEY, bookings);
        }
        return of({ success: true }).pipe(delay(this.DELAY_MS));
    }
} 