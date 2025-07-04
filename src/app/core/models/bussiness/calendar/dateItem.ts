export class DateItem {
    date: Date;
    isActive: boolean;
    isToday: boolean;
    isSelected: boolean;
    isDisabled: boolean;
    isCurrentMonth: boolean;
    isPreviousMonth: boolean;
    isNextMonth: boolean;

    constructor(){
        this.date = new Date();
        this.isActive = false;
        this.isToday = false;
        this.isSelected = false;
        this.isDisabled = false;
        this.isCurrentMonth = true;
        this.isPreviousMonth = false;
        this.isNextMonth = false;
    }
}