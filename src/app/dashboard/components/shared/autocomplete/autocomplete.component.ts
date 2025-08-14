import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { Option } from '@app/core/models/interfaces/option.interface';

@Component({
  selector: 'app-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrl: './autocomplete.component.scss'
})
export class AutocompleteComponent implements OnChanges{
  
  @Input("value") value : string | undefined = '';
  @Input("id") id : number | undefined = 0;
  @Input("mode") mode : boolean = false;
  @Input("options") options : Option[] = [];
  @Input("placeholder") placeholder : string = '';
  @Input("disabled") disabled : boolean = false;
  @Output() result = new EventEmitter<Option>();
  filteredOptions: Option[] = [];
  searchTerm: string = '';
  showOptions: boolean = false;

  constructor() {
  }

  ngOnInit(): void {
    this.filteredOptions = [...this.options];
    this.searchTerm = (this.value! != '') ? this.value! : '';
  }
  
  ngOnChanges(): void {
    this.filteredOptions = [...this.options];
    if(this.mode && this.id != 0){
      const option = this.options.find(x => x.id == this.id);
      this.searchTerm = option?.name!;
    }else{
      this.searchTerm = (this.value! != '') ? this.value! : '';
    }
  }

  filterOptions(): void {
    const filterValue = this.searchTerm.toLowerCase();
    this.filteredOptions = this.options.filter((option: Option) =>
      option.name?.toLowerCase().includes(filterValue)
    );
  }

  selectOption(option: Option): void {
    this.searchTerm = (this.mode) ? option.name! : option.code! ;
    this.showOptions = false;
    this.result.emit(option);
  }

  onBlur(): void {
    setTimeout(() => (this.showOptions = false), 200);
  }
}