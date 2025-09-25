import { Rol } from "./rol";

export class User{
    id: string;
    roleId: number;
    email: string;
    userRole: string; // 'client' | 'serviceProvider'
    firstName: string;
    lastName: string;
    phone: string;
    photo: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    lastLoginAt: string;
    
    // Campos adicionales del sistema interno (mantenidos para compatibilidad)
    name: string;
    phoneNumber: string;
    entraId: string;
    b2CId: string;
    
    userType: string;
    department: string;
    employeeId: string;
    companyName: string;
    address: string;
    role : Rol;
    isVerified: boolean;
    isDeleted: boolean;
    
    constructor() {
        this.id = "";
        this.roleId = 0;
        this.email = "";
        this.userRole = "client";
        this.firstName = "";
        this.lastName = "";
        this.phone = "";
        this.photo = "";
        this.isActive = false;
        this.createdAt = "";
        this.updatedAt = "";
        this.lastLoginAt = "";
        this.role = new Rol();
        // Campos adicionales del sistema interno
        this.name = "";
        this.phoneNumber = "";
        this.entraId = "";
        this.b2CId = "";
        this.userType = "";
        this.department = "";
        this.employeeId = "";
        this.companyName = "";
        this.address = "";
        this.isVerified = false;
        this.isDeleted = false;
    }
}