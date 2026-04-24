# Bookings List

## 1. General Description

The **Bookings List** module allows administration portal users to query, filter, and manage all system bookings. This list is **segmented by salon**, meaning the user only views bookings corresponding to the currently selected salon in the application context.

### 1.1 Business Objective

- Provide a centralized view of all salon bookings
- Facilitate quick search and location of specific bookings
- Enable booking status tracking
- Optimize salon operational management

### 1.2 Target Users

- **Salon Administrators**: Complete booking management
- **Receptionists**: Query and status updates
- **Stylists/Service Providers**: View their own bookings

---

## 2. Data Structure

### 2.1 Main Entity: Booking

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique booking identifier |
| `bookingReference` | string | Reference code visible to customer |
| `customerId` | string | Customer ID |
| `customer` | Customer | Object with customer data |
| `supplierId` | string | Provider/stylist ID |
| `user` | User | Object with provider data |
| `serviceId` | string | Main service ID |
| `services` | Service[] | List of included services |
| `bookingDate` | DateOnly | Booking date |
| `startTime` | TimeOnly | Start time |
| `endTime` | TimeOnly | End time |
| `durationMinutes` | number | Total duration in minutes |
| `totalPrice` | number | Total price |
| `currency` | string | Currency (e.g.: EUR, USD) |
| `status` | BookingStatus | Booking status |
| `clientNotes` | string | Customer notes |
| `providerNotes` | string | Provider notes |
| `createdAt` | datetime | Creation date |
| `updatedAt` | datetime | Last update |
| `confirmedAt` | datetime | Confirmation date |
| `completedAt` | datetime | Completion date |
| `cancelledAt` | datetime | Cancellation date |
| `cancellationReason` | string | Cancellation reason |

### 2.2 Booking Status (BookingStatus)

| Value | Code | Label | Badge Color | Description |
|-------|------|-------|-------------|-------------|
| 0 | Pending | Pending | `warning` (#FFC107) | Booking created, pending confirmation |
| 1 | Confirmed | Confirmed | `info` (#17A2B8) | Booking confirmed by salon |
| 2 | InProgress | In Progress | `primary` (#007BFF) | Service in progress |
| 3 | Completed | Completed | `success` (#28A745) | Service finished |
| 4 | Cancelled | Cancelled | `danger` (#DC3545) | Booking cancelled |
| 5 | NoShow | No Show | `dark` (#343A40) | Customer did not show up |

---

## 3. Interface Design

### 3.1 General Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│  HEADER: Title + Salon Selector + Global Actions                        │
├─────────────────────────────────────────────────────────────────────────┤
│  FILTERS: Collapsible/expandable filter bar                             │
├─────────────────────────────────────────────────────────────────────────┤
│  TABLE: Booking list with configurable columns                          │
├─────────────────────────────────────────────────────────────────────────┤
│  FOOTER: Pagination + Record information                                │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Header

| Element | Description |
|---------|-------------|
| **Title** | "Bookings" with calendar icon |
| **Salon Indicator** | Badge showing active salon (read-only, changed from global navigation) |
| **New Booking Button** | Primary action to create new booking |
| **Export Button** | Dropdown with options: Excel, CSV, PDF |
| **Refresh Button** | Update list data |

### 3.3 Column Configuration

#### Default Visible Columns

| # | Column | Field | Width | Sortable | Description |
|---|--------|-------|-------|----------|-------------|
| 1 | **Reference** | `bookingReference` | 120px | ✅ | Unique booking code |
| 2 | **Customer** | `customer.firstName + lastName` | 180px | ✅ | Customer full name |
| 3 | **Phone** | `customer.phoneNumber` | 120px | ❌ | Contact phone |
| 4 | **Date** | `bookingDate` | 110px | ✅ | Appointment date |
| 5 | **Time** | `startTime - endTime` | 120px | ✅ | Time range |
| 6 | **Service(s)** | `services[].serviceName` | 200px | ❌ | Service list (chips) |
| 7 | **Professional** | `user.firstName + lastName` | 150px | ✅ | Assigned stylist |
| 8 | **Duration** | `durationMinutes` | 90px | ✅ | Total time (format: 1h 30m) |
| 9 | **Price** | `totalPrice + currency` | 100px | ✅ | Formatted total amount |
| 10 | **Status** | `status` | 130px | ✅ | Badge with color by status |
| 11 | **Actions** | - | 100px | ❌ | Actions menu |


### 3.4 Actions Column

The contextual actions menu (three vertical dots) includes:

| Action | Icon | Condition | Description |
|--------|------|-----------|-------------|
| View Details | 👁️ | Always | Opens modal/panel with complete information |
| Edit | ✏️ | Status ≠ Completed, Cancelled | Modify booking data |
| Cancel | ✗ | Status ≠ Completed, Cancelled | Cancel with reason |

---

## 4. Filter System

### 4.1 Main Filters (Always Visible)

| Filter | Type | Options/Format | Behavior |
|--------|------|----------------|----------|
| **Global Search** | Text Input | Placeholder: "Search by reference, customer, phone..." | Multi-field search |
| **Date Range** | Date Range Picker | From - To | Filters by `bookingDate` |
| **Status** | Multi-select Dropdown | All BookingStatus | Allows multiple selection |

### 4.2 Advanced Filters (Expandable Panel)

| Filter | Type | Options | Behavior |
|--------|------|---------|----------|
| **Professional** | Dropdown with search | Salon user list | Filters by `supplierId` |
| **Service** | Multi-select | Active services list | Filters by included services |
| **Price Range** | Dual slider / Inputs | Min - Max | Filters by `totalPrice` |
| **Customer** | Autocomplete | Customer search | Filters by `customerId` |
| **Created Between** | Date Range | From - To | Filters by `createdAt` |
| **With Notes** | Checkbox | Yes/No | Bookings with `clientNotes` or `providerNotes` |

### 4.3 Quick Filters

Chips/quick access buttons for common filters:

| Chip | Applied Filter |
|------|----------------|
| 📅 Today | `bookingDate` = current date |
| 📅 Tomorrow | `bookingDate` = current date + 1 |
| 📅 This Week | `bookingDate` in current week |
| 📅 This Month | `bookingDate` in current month |
| ⏳ Pending | `status` = Pending |
| ✅ Confirmed | `status` = Confirmed |
| 🔄 In Progress | `status` = InProgress |

### 4.4 Filter Persistence

- Selected filters are saved in `localStorage` per user
- When returning to the screen, last used filters are restored
- "Clear Filters" button to reset to default values

---

## 5. Sorting

### 5.1 Sorting Configuration

| Aspect | Specification |
|--------|---------------|
| **Default order** | `bookingDate` DESC, `startTime` ASC |
| **Multiple sorting** | Supported (up to 3 columns) |
| **Visual indicator** | Arrow ↑↓ in column header |
| **Click behavior** | 1st click: ASC, 2nd click: DESC, 3rd click: No order |

### 5.2 Sortable Columns

- Reference (`bookingReference`)
- Customer (`customer.lastName, customer.firstName`)
- Date (`bookingDate`)
- Time (`startTime`)
- Professional (`user.lastName, user.firstName`)
- Duration (`durationMinutes`)
- Price (`totalPrice`)
- Status (`status`)
- Created Date (`createdAt`)

---

## 6. Pagination

### 6.1 Configuration

| Parameter | Value | Description |
|-----------|-------|-------------|
| **Default page size** | 25 | Initial records per page |
| **Size options** | 10, 25, 50, 100 | Records per page selector |
| **Pagination type** | Server-side | On-demand loading from API |

| Element | Description |
|---------|-------------|
| **Counter** | "Showing X-Y of Z bookings" |
| **Size selector** | Dropdown with records per page options |
| **Navigation** | First, Previous, Numeric pages, Next, Last |
| **Direct input** | "Go to page: [___]" for quick navigation |

---

## 7. Additional Features

### 7.1 Multiple Selection

| Feature | Description |
|---------|-------------|
| **Row checkbox** | Allows selecting individual bookings |
| **Header checkbox** | Selects/deselects all visible |
| **Selection counter** | "X bookings selected" |
| **Bulk actions** | Confirm, Cancel, Export selected |

### 7.3 Detail View (Side Panel / Modal)

When clicking on a booking or "View Details":

```
┌─────────────────────────────────────────┐
│ BOOKING #REF-2024-001234                │
├─────────────────────────────────────────┤
│ Status: [Confirmed Badge]               │
│                                         │
│ 📅 Date and Time                        │
│    Mar 15, 2024, 10:00 AM - 11:30 AM    │
│                                         │
│ 👤 Customer                             │
│    Maria Garcia Lopez                   │
│    📞 +34 612 345 678                   │
│    ✉️ maria@email.com                   │
│                                         │
│ 💇 Services                             │
│    • Haircut (45 min) - €25             │
│    • Root color (45 min) - €35          │
│                                         │
│ 👨‍💼 Professional                         │
│    Carlos Martinez                      │
│                                         │
│ 💰 Total: €60.00                        │
│                                         │
│ 📝 Customer Notes                       │
│    "I prefer warm tones"                │
│                                         │
│ 📋 History                              │
│    • Created: Mar 10, 2024, 3:30 PM     │
│    • Confirmed: Mar 10, 2024, 4:00 PM   │
├─────────────────────────────────────────┤
│ [Edit] [Cancel] [Close]                 │
└─────────────────────────────────────────┘
```


### 13.1 Loading States

| State | Representation |
|-------|----------------|
| **Initial loading** | Skeleton loaders in table |
| **Loading more** | Spinner in pagination |
| **Refreshing** | Subtle indicator without blocking UI |

### 13.2 Empty States

| Condition | Message |
|-----------|---------|
| No bookings | "No bookings to display. Create your first one!" |
| No filter results | "No bookings found with the applied filters" |
| Load error | "Error loading bookings. [Retry]" |
