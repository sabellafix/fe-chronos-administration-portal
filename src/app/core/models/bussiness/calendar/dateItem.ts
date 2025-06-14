export class DateItem {
    date: Date;
    isActive: boolean;
    isToday: boolean;
    isSelected: boolean;
    isDisabled: boolean;


    constructor(){
        this.date = new Date();
        this.isActive = false;
        this.isToday = false;
        this.isSelected = false;
        this.isDisabled = false;
    }


}