import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { DateItem } from '@app/core/models/bussiness/calendar/dateItem';
import { Booking } from '@app/core/models/bussiness/booking';
import { BookingStatus } from '@app/core/models/bussiness/enums';
import { OffcanvasCreateBookingComponent } from '../../../shared/offcanvas/offcanvas-create-booking/offcanvas-create-booking.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Service } from '@app/core/models/bussiness/service';
import { Space } from '@app/core/models/bussiness/space';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

@Component({
  selector: 'app-bookings-floor',
  templateUrl: './bookings-floor.component.html',
  styleUrl: './bookings-floor.component.scss'
})
export class BookingsFloorComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild(OffcanvasCreateBookingComponent) offcanvasCreateBooking!: OffcanvasCreateBookingComponent;
  @ViewChild('threejsContainer', { static: false }) threejsContainer!: ElementRef;

  dateNow : Date = new Date();
  dates: DateItem[] = [];
  activeDate: DateItem = new DateItem();
  bookings: Booking[] = [];
  spaces: any[] = [];
  private scrollListener?: () => void;
  chairImg : string = '../../assets/images/chair.png';

  // Propiedades para Three.js
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private chair3DModel: THREE.Group | null = null;
  private animationId: number = 0;

  // Constantes para la celda central
  readonly CENTRAL_SPACE_ID = 7; // Espacio central (de 0-19)
  readonly CENTRAL_HOUR = 7; // Hora central (de 6-22)

  constructor(private snackBar: MatSnackBar){
    this.spaces = this.getSpaces();
    this.getStaticBookings();
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    // this.init3DScene();
    // this.load3DModel();
  }

  ngOnDestroy(): void {
    if (this.scrollListener) {
      window.removeEventListener("scroll", this.scrollListener);
    }
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  getSpaces(){
    const spaces: any[] = [];
    
    const today = new Date(this.dateNow);
    const dayOfWeek = today.getDay();
    const daysToMonday = dayOfWeek === 0 ? -6 : -(dayOfWeek - 1);
    
    const monday = new Date(today);
    monday.setDate(today.getDate() + daysToMonday);
    
    
    for (let i = 0; i < 15; i++) {
      const space = new Space();
      space.id = i; 
      space.name = 'Space ' + i;
      space.description = 'Description ' + i;
      space.isActive = false;
      
      spaces.push(space);
    }
    
    return spaces;
  } 

  setActiveDate(date: DateItem = new DateItem()   ){
    this.dates.forEach(date => date.isActive = false);
    date.isActive = true;
    this.activeDate = date;
  }

  getHoursRange(): number[] {
    const hours: number[] = [];
    for (let i = 0; i <= 15; i++) {
      hours.push(i);
    }
    return hours;
  }

  itsCentralSpace(space: any, hour: number): boolean {
    return space.id === this.CENTRAL_SPACE_ID && hour === this.CENTRAL_HOUR;
  }

  formatHour(hour: number): string {
    if (hour === 0) {
      return '12 am';
    } else if (hour < 12) {
      return `${hour} am`;
    } else if (hour === 12) {
      return '12 pm';
    } else {
      return `${hour} pm`;
    }
  }

  openBookingModal(date: Date, hour?: number): void {
    this.offcanvasCreateBooking.selectedDate = date;
    this.offcanvasCreateBooking.selectedHour = hour;
    
    this.offcanvasCreateBooking.show();
  }

  onBookingCreated(booking: Booking): void {
    this.bookings.push(booking);
    this.snackBar.open('Booking created successfully', 'Cerrar', {
      duration: 3000,
     
      panelClass: 'snackbar-success'
    });
  
  }

  onBookingCancelled(): void {
    console.log('Creación de cita cancelada');
  }

  getStaticBookings(){

  }

  
  getBookingsForDateTime(date: Date, hour: number): Booking[] {
    return this.bookings.filter(booking => {
      const bookingDate = new Date(booking.bookingDate.year, booking.bookingDate.month - 1, booking.bookingDate.day);
      const bookingHour = booking.startTime.hour;
      
      return bookingDate.toString() === date.toString() && bookingHour === hour;
    });
  }

  getBookingsForDate(date: Date): Booking[] {
    return this.bookings.filter(booking => {
      const bookingDate = new Date(booking.bookingDate.year, booking.bookingDate.month - 1, booking.bookingDate.day);
      return bookingDate.toString() === date.toString();
    });
  }

  hasBookings(date: Date, hour: number): boolean {
    return this.getBookingsForDateTime(date, hour).length > 0;
  }

 


}
