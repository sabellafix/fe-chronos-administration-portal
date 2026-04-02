export enum BookingStatus {
    Pending = 1,
    Confirmed = 2,
    InProgress = 3,
    Completed = 4,
    Cancelled = 5,
    NoShow = 6,
    Rescheduled = 7,
    InBaske = 8,
}

export const BookingStatusNames = {
    Pending: "pending",
    Confirmed: "confirmed",
    InProgress: "inProgress",
    Completed: "completed",
    Cancelled: "cancelled",
    NoShow: "noShow",
        Rescheduled: "rescheduled",
    InBaske: "inBaske",
}


export enum UserRole {
    Client = "Client",
    ServiceProvider = "ServiceProvider"
}

export enum DayOfWeek {
    Sunday = 0,
    Monday = 1,
    Tuesday = 2,
    Wednesday = 3,
    Thursday = 4,
    Friday = 5,
    Saturday = 6
} 