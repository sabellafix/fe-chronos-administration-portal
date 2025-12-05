import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { MainComponent } from './components/main/main.component';
import { WrapperComponent } from './components/layout/wrapper/wrapper.component';
import { NavigationComponent } from './components/layout/navigation/navigation.component';
import { TopbarComponent } from './components/layout/topbar/topbar.component';
import { UsersListComponent } from './components/users/users-list/users-list.component';
import { MatSliderModule } from '@angular/material/slider';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { DialogConfirmComponent } from './components/shared/dialogs/dialog-confirm/dialog-confirm.component';
import { DialogCreateBookingComponent } from './components/shared/dialogs/dialog-create-booking/dialog-create-booking.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { UsersCreateComponent } from './components/users/users-create/users-create.component';
import { UsersUpdateComponent } from './components/users/users-update/users-update.component';
import { UsersDetailComponent } from './components/users/users-detail/users-detail.component';
import { CommonModule } from '@angular/common';
import { SkelletonUserInfoComponent } from './components/shared/skelletons/skelleton-user-info/skelleton-user-info.component';
import { SkelletonFormComponent } from './components/shared/skelletons/skelleton-form/skelleton-form.component';
import { SkelletonIconComponent } from './components/shared/skelletons/skelleton-icon/skelleton-icon.component';
import { SkelletonTableComponent } from './components/shared/skelletons/skelleton-table/skelleton-table.component';
import { CompanyLogoComponent } from './components/shared/icons/company-logo/company-logo.component';
import { ServicesListComponent } from './components/services/services-list/services-list.component';
import { ServicesCreateComponent } from './components/services/services-create/services-create.component';
import { ServicesUpdateComponent } from './components/services/services-update/services-update.component';
import { ServicesDetailComponent } from './components/services/services-detail/services-detail.component';
import { SuppliersListComponent } from './components/suppliers/suppliers-list/suppliers-list.component';
import { SuppliersCreateComponent } from './components/suppliers/suppliers-create/suppliers-create.component';
import { SuppliersUpdateComponent } from './components/suppliers/suppliers-update/suppliers-update.component';
import { SuppliersDetailComponent } from './components/suppliers/suppliers-detail/suppliers-detail.component';
import { CategoriesListComponent } from './components/categories/categories-list/categories-list.component';
import { CategoriesCreateComponent } from './components/categories/categories-create/categories-create.component';
import { CategoriesUpdateComponent } from './components/categories/categories-update/categories-update.component';
import { CategoriesDetailComponent } from './components/categories/categories-detail/categories-detail.component';
import { CompaniesListComponent } from './components/companies/companies-list/companies-list.component';
import { CompaniesCreateComponent } from './components/companies/companies-create/companies-create.component';
import { CompaniesUpdateComponent } from './components/companies/companies-update/companies-update.component';
import { CompaniesDetailComponent } from './components/companies/companies-detail/companies-detail.component';
import { BookingsCalendarComponent } from './components/booking/bookings-calendar/bookings-calendar.component';
import { CalendarDailyComponent } from './components/booking/bookingsCalendar/calendar-daily/calendar-daily.component';
import { CalendarWeeklyComponent } from './components/booking/bookingsCalendar/calendar-weekly/calendar-weekly.component';
import { CalendarMonthlyComponent } from './components/booking/bookingsCalendar/calendar-monthly/calendar-monthly.component';
import { ChatComponent } from './components/chat/chat.component';
import { SkelletonsSimpleComponent } from './components/shared/skelletons/skelletons-simple/skelletons-simple.component';
import { OffcanvasCreateBookingComponent } from './components/shared/offcanvas/offcanvas-create-booking/offcanvas-create-booking.component';
import { OffcanvasUpdateBookingComponent } from './components/shared/offcanvas/offcanvas-update-booking/offcanvas-update-booking.component';
import { CustomersListComponent } from './components/customers/customers-list/customers-list.component';
import { CustomersCreateComponent } from './components/customers/customers-create/customers-create.component';
import { BookingsFloorComponent } from './components/booking/bookingsCalendar/bookings-floor/bookings-floor.component';
import { BookingsSupplierComponent } from './components/booking/bookingsCalendar/bookings-supplier/bookings-supplier.component';
import { TimeOnlyPipe } from '../core/pipes/time-only.pipe';
import { MonthNamePipe } from '../core/pipes/month-name.pipe';
import { DayNumberPipe } from '../core/pipes/day-number.pipe';
import { ServiceTypePipe } from '../core/pipes/service-type.pipe';
import { AutocompleteComponent } from './components/shared/autocomplete/autocomplete.component';
import { SelectImageComponent } from './components/shared/selects/select-image/select-image.component';
import { CardBookingComponent } from './components/shared/cards/card-booking/card-booking.component';
import { CalendarFloorComponent } from './components/booking/bookingsCalendar/calendar-floor/calendar-floor.component';
import { FLOOR_MOCK_SERVICES } from '@app/core/services/mock/floor-services.index';
import { CustomersUpdateComponent } from './components/customers/customers-update/customers-update.component';
import { CustomersDetailComponent } from './components/customers/customers-detail/customers-detail.component';
import { OffcanvasDetailBookingComponent } from './components/shared/offcanvas/offcanvas-detail-booking/offcanvas-detail-booking.component';
import { DashboardInitializerService } from './services/dashboard-initializer.service';
import { UsersAvailabilityComponent } from './components/users/users-availability/users-availability.component';
import { RolesListComponent } from './components/roles/roles-list/roles-list.component';
import { RolesCreateComponent } from './components/roles/roles-create/roles-create.component';
import { PermissionsSearchComponent } from './components/permissions/permissions-search/permissions-search.component';
import { RolesUpdateComponent } from './components/roles/roles-update/roles-update.component';
import { SkelletonRolComponent } from './components/shared/skelletons/skelleton-rol/skelleton-rol.component';
import { RolesDetailComponent } from './components/roles/roles-detail/roles-detail.component';
import { ListServicesComponent } from './components/shared/lists/list-services/list-services.component';
import { ListBookingsComponent } from './components/shared/lists/list-bookings/list-bookings.component';
import { ListTimeLnBookingsComponent } from './components/shared/lists/list-time-ln-bookings/list-time-ln-bookings.component';
import { ListCardServicesComponent } from './components/shared/lists/list-card-services/list-card-services.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { KpiCardComponent } from './components/dashboard/kpi-card/kpi-card.component';
import { DashboardHeaderComponent } from './components/dashboard/dashboard-header/dashboard-header.component';
import { WeeklyCalendarComponent } from './components/dashboard/weekly-calendar/weekly-calendar.component';
import { TodayAppointmentsComponent } from './components/dashboard/today-appointments/today-appointments.component';
import { StylistsStatusComponent } from './components/dashboard/stylists-status/stylists-status.component';
import { NgApexchartsModule } from 'ng-apexcharts';
import { BookingStatsComponent } from './components/dashboard/booking-stats/booking-stats.component';
import { BarRevenueChartComponent } from './components/dashboard/bar-revenue-chart/bar-revenue-chart.component';
import { DonnutPopServicesChartComponent } from './components/shared/charts/donnut-pop-services-chart/donnut-pop-services-chart.component';
import { TopProductsComponent } from './components/dashboard/top-products/top-products.component';
import { RevenueActivityComponent } from './components/dashboard/revenue-activity/revenue-activity.component';
import { StylistResumeComponent } from './components/dashboard/stylist-resume/stylist-resume.component';
import { SkelletonCardComponent } from './components/shared/skelletons/skelleton-card/skelleton-card.component';
import { PaymentsListComponent } from './components/dashboard/payments-list/payments-list.component';
import { BarOcupationChartComponent } from './components/dashboard/bar-ocupation-chart/bar-ocupation-chart.component';
import { AuthGuard } from '@app/core/guards/auth.guard';
import { SkelletonBarRevenueChartComponent } from './components/shared/skelletons/skelleton-bar-revenue-chart/skelleton-bar-revenue-chart.component';
import { SkelletonStylistResumeComponent } from './components/shared/skelletons/skelleton-stylist-resume/skelleton-stylist-resume.component';
import { ProductsListComponent } from './components/ecomerce/products-list/products-list.component';
import { ProductsDetailComponent } from './components/ecomerce/products-detail/products-detail.component';
import { ProductsCreateComponent } from './components/ecomerce/products-create/products-create.component';


const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    canActivate: [AuthGuard],
    children: [
      { 
        path: 'dashboard',
        children: [
          { path: '', component: DashboardComponent, pathMatch: 'full' },
        ]
      },
      { 
        path: 'users',
        children: [
          { path: '', component: UsersListComponent, pathMatch: 'full' },
          { path: 'create', component: UsersCreateComponent },
          { path: ':id/update', component: UsersUpdateComponent },
          { path: ':id/detail', component: UsersDetailComponent },
          { path: ':id/availability', component: UsersAvailabilityComponent },
          { path: '**', redirectTo: '' }
        ]
      },
      {
        path: 'services',
        children: [
          { path: '', component: ServicesListComponent, pathMatch: 'full' },
          { path: 'create', component: ServicesCreateComponent },
          { path: ':id/update', component: ServicesUpdateComponent },
          { path: ':id/detail', component: ServicesDetailComponent },
          { path: '**', redirectTo: '' }
        ]
      },
      {
        path: 'suppliers',
        children: [
          { path: '', component: SuppliersListComponent, pathMatch: 'full' },
          { path: 'create', component: SuppliersCreateComponent },
          { path: ':id/update', component: SuppliersUpdateComponent },
          { path: ':id/detail', component: SuppliersDetailComponent },
          { path: '**', redirectTo: '' }
        ]
      },
      {
        path: 'categories',
        children: [
          { path: '', component: CategoriesListComponent, pathMatch: 'full' },
          { path: 'create', component: CategoriesCreateComponent },
          { path: ':id/update', component: CategoriesUpdateComponent },
          { path: ':id/detail', component: CategoriesDetailComponent },
          { path: '**', redirectTo: '' }
        ]
      },
      {
        path: 'companies',
        children: [
          { path: '', component: CompaniesListComponent, pathMatch: 'full' },
          { path: 'create', component: CompaniesCreateComponent },
          { path: ':id/update', component: CompaniesUpdateComponent },
          { path: ':id/detail', component: CompaniesDetailComponent },
          { path: '**', redirectTo: '' }
        ]
      },
      {
        path: 'bookings',
        children: [
          { path: '', component: BookingsCalendarComponent, pathMatch: 'full' },
          { path: 'daily', component: CalendarDailyComponent },
          { path: 'weekly', component: CalendarWeeklyComponent },
          { path: 'monthly', component: CalendarMonthlyComponent },
          { path: '**', redirectTo: '' }
        ]
      },
      {
        path: 'products',
        children: [
          { path: '', component: ProductsListComponent, pathMatch: 'full' },
          { path: 'create', component: ProductsCreateComponent },
          { path: ':id/detail', component: ProductsDetailComponent },
          { path: '**', redirectTo: '' }
        ]
      },
      {
        path: 'customers',
        children: [
          { path: '', component: CustomersListComponent, pathMatch: 'full' },
          { path: 'create', component: CustomersCreateComponent },
          { path: ':id/update', component: CustomersUpdateComponent },
          { path: ':id/detail', component: CustomersDetailComponent },
          { path: '**', redirectTo: '' }
        ]
      },
      {
        path: 'roles',
        children: [
          { path: '', component: RolesListComponent, pathMatch: 'full' },
          { path: 'create', component: RolesCreateComponent },
          { path: ':id/update', component: RolesUpdateComponent },
          { path: ':id/detail', component: RolesDetailComponent },
          { path: '**', redirectTo: '' }
        ]
      },
      {
        path: 'chat',
        children: [
          { path: '', component: ChatComponent, pathMatch: 'full' },
        ]
      }
    ]
  }
];



@NgModule({
  declarations: [
    MainComponent,
    WrapperComponent,
    TopbarComponent,
    NavigationComponent,
    UsersListComponent,
    UsersCreateComponent,
    UsersUpdateComponent,
    UsersDetailComponent,
    DialogConfirmComponent,
    DialogCreateBookingComponent,
    SkelletonUserInfoComponent,
    SkelletonFormComponent,
    SkelletonIconComponent,
    SkelletonTableComponent,
    SkelletonsSimpleComponent,
    CompanyLogoComponent,
    ServicesListComponent,
    ServicesCreateComponent,
    ServicesUpdateComponent,
    ServicesDetailComponent,
    SuppliersListComponent,
    SuppliersCreateComponent,
    SuppliersUpdateComponent,
    SuppliersDetailComponent,
    CategoriesListComponent,
    CategoriesCreateComponent,
    CategoriesUpdateComponent,
    CategoriesDetailComponent,
    CompaniesListComponent,
    CompaniesCreateComponent,
    CompaniesUpdateComponent,
    CompaniesDetailComponent,
    BookingsCalendarComponent,
    CalendarDailyComponent,
    CalendarWeeklyComponent,
    CalendarMonthlyComponent,
    ChatComponent,
    OffcanvasCreateBookingComponent,
    OffcanvasUpdateBookingComponent,
    CustomersListComponent,
    CustomersCreateComponent,
    BookingsFloorComponent,
    BookingsSupplierComponent,
    TimeOnlyPipe,
    MonthNamePipe,
    DayNumberPipe,
    ServiceTypePipe,
    AutocompleteComponent,
    SelectImageComponent,
    CardBookingComponent,
    CalendarFloorComponent,
    CustomersUpdateComponent,
    CustomersDetailComponent,
    OffcanvasDetailBookingComponent,
    UsersAvailabilityComponent,
    RolesListComponent,
    RolesCreateComponent,
    PermissionsSearchComponent,
    RolesUpdateComponent,
    SkelletonRolComponent,
    RolesDetailComponent,
    ListServicesComponent,
    ListBookingsComponent,
    ListTimeLnBookingsComponent,
    ListCardServicesComponent,
    DashboardComponent,
    KpiCardComponent,
    DashboardHeaderComponent,
    WeeklyCalendarComponent,
    TodayAppointmentsComponent,
    StylistsStatusComponent,
    BarRevenueChartComponent,
    DonnutPopServicesChartComponent,
    TopProductsComponent,
    BookingStatsComponent,
    RevenueActivityComponent,
    StylistResumeComponent,
    SkelletonCardComponent,
    PaymentsListComponent,
    BarOcupationChartComponent,
    SkelletonBarRevenueChartComponent,
    SkelletonStylistResumeComponent,
    ProductsListComponent,
    ProductsDetailComponent,
    ProductsCreateComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatSliderModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatProgressBarModule,
    MatPaginatorModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatBadgeModule,
    MatSnackBarModule,
    NgxSkeletonLoaderModule,
    NgApexchartsModule,
  ],
  providers: [
    ...FLOOR_MOCK_SERVICES,
    {
      provide: APP_INITIALIZER,
      useFactory: DashboardInitializerService.initializeFactory,
      deps: [DashboardInitializerService],
      multi: true
    }
  ]
})
export class DashboardModule { }
