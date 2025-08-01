export class SiteBooking{

    id: string;
    siteId: string;
    bookingId: string;
    startDate: Date;
    endDate: Date;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
    isDeleted: boolean;
    isSystem: boolean;
    isDefault: boolean;
    isPublic: boolean;
    isPrivate: boolean;

    constructor() {
        this.id = '';
        this.siteId = '';
        this.bookingId = '';
        this.startDate = new Date();
        this.endDate = new Date();
        this.createdAt = new Date();
        this.updatedAt = new Date();
        this.isActive = true;
        this.isDeleted = false; 
        this.isSystem = false;
        this.isDefault = false;
        this.isPublic = false;
        this.isPrivate = false;
    }
}   