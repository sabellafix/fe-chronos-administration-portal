export class Company {
    id: number;
    companyName: string;
    legalName: string;
    industry: string;
    headquartersAddress: string;
    website: string;
    email: string;
    phone: string;
    contactPersonName: string;
    contactPersonEmail: string;
    contactPersonPhone: string;
    subscriptionPlan: string;
    subscriptionStartDate: string;
    subscriptionEndDate: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;

    constructor() {
        this.id = 0;
        this.companyName = "";
        this.legalName = "";
        this.industry = "";
        this.headquartersAddress = "";
        this.website = "";
        this.email = "";
        this.phone = "";
        this.contactPersonName = "";
        this.contactPersonEmail = "";
        this.contactPersonPhone = "";
        this.subscriptionPlan = "Basic";
        this.subscriptionStartDate = "";
        this.subscriptionEndDate = "";
        this.isActive = false;
        this.createdAt = "";
        this.updatedAt = "";
    }
} 