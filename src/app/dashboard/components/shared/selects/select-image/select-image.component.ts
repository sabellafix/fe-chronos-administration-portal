import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { VisualOption } from '@app/core/models/interfaces/option.interface';

@Component({
  selector: 'app-select-image',
  templateUrl: './select-image.component.html',
  styleUrl: './select-image.component.scss'
})
export class SelectImageComponent implements OnChanges {
  
  @Input("options") options: VisualOption[] = [];
  @Input("placeholder") placeholder: string = 'Select elements';
  @Input("disabled") disabled: boolean = false;
  @Input("multiSelect") multiSelect: boolean = true;
  @Input("showAllOption") showAllOption: boolean = true;
  @Input("allOptionText") allOptionText: string = 'All';
  @Input("noneOptionText") noneOptionText: string = 'None';
  @Input("showImages") showImages: boolean = true;
  @Input("showColors") showColors: boolean = true;
  @Input("cardBackgroundClass") cardBackgroundClass: string = 'bg-light';
  
  @Input("defaultValue") defaultValue: string | string[] | null = null; // ID o array de IDs
  @Input("autoSelectFirst") autoSelectFirst: boolean = false; // Auto-seleccionar el primer elemento
  @Input("selectAllByDefault") selectAllByDefault: boolean = false; // Seleccionar todos por defecto (solo multiSelect)
  @Input("noInitialSelection") noInitialSelection: boolean = false; // Cargar opciones sin selección inicial
  
  @Output() selectionChange = new EventEmitter<VisualOption[]>();
  @Output() singleSelectionChange = new EventEmitter<VisualOption | null>();

  selectedOptions: VisualOption[] = [];
  isDropdownOpen: boolean = false;
  displayText: string = '';
  private hasSetDefaults: boolean = false;

  constructor() {}

  ngOnChanges(): void {
    this.initializeOptions();
    this.setDefaultValues();
    this.updateDisplayText();
  }

  private initializeOptions(): void {
    this.options.forEach(option => {
      if (option.selected === undefined) {
        option.selected = false;
      }
    });

    
    this.selectedOptions = this.options.filter(option => option.selected);
  }

  private setDefaultValues(): void {
    if (this.hasSetDefaults || this.options.length === 0) {
      return;
    }

    if (this.noInitialSelection) {
      this.clearAllSelections();
      this.updateSelectedOptions();
      this.hasSetDefaults = true;
      return;
    }

    let hasDefaults = false;

    const alreadySelected = this.options.some(option => option.selected === true);
    if (alreadySelected) {
      this.hasSetDefaults = true;
      return;
    }

    if (this.defaultValue !== null) {
      hasDefaults = this.applyDefaultValue();
    }
    
    if (!hasDefaults) {
      if (this.selectAllByDefault && this.multiSelect) {
        hasDefaults = this.applySelectAllDefault();
      } else if (this.autoSelectFirst) {
        hasDefaults = this.applyAutoSelectFirst();
      }
    }

    if (hasDefaults) {
      this.updateSelectedOptions();
      this.emitSelectionChange();
      this.hasSetDefaults = true;
    }
  }

  private applyDefaultValue(): boolean {
    if (this.defaultValue === null) {
      return false;
    }

    let hasApplied = false;

    if (Array.isArray(this.defaultValue)) {
      // Array de IDs para selección múltiple
      if (this.multiSelect) {
        this.defaultValue.forEach(id => {
          const option = this.options.find(opt => opt.id === id);
          if (option) {
            option.selected = true;
            hasApplied = true;
          }
        });
      } else {
        // En selección única, tomar solo el primer elemento del array
        const firstId = this.defaultValue[0];
        const option = this.options.find(opt => opt.id === firstId);
        if (option) {
          this.clearAllSelections();
          option.selected = true;
          hasApplied = true;
        }
      }
    } else {
      // ID único para selección única o múltiple
      const option = this.options.find(opt => opt.id === this.defaultValue);
      if (option) {
        if (!this.multiSelect) {
          this.clearAllSelections();
        }
        option.selected = true;
        hasApplied = true;
      }
    }

    return hasApplied;
  }

  private applySelectAllDefault(): boolean {
    if (!this.multiSelect || this.options.length === 0) {
      return false;
    }

    this.options.forEach(option => {
      option.selected = true;
    });

    return true;
  }

  private applyAutoSelectFirst(): boolean {
    if (this.options.length === 0) {
      return false;
    }

    if (!this.multiSelect) {
      this.clearAllSelections();
    }

    this.options[0].selected = true;
    return true;
  }

  private clearAllSelections(): void {
    this.options.forEach(option => {
      option.selected = false;
    });
  }

  private updateSelectedOptions(): void {
    this.selectedOptions = this.options.filter(option => option.selected);
  }

  // Método público para establecer valores programáticamente
  public setSelectedValues(ids: string | string[]): void {
    this.clearAllSelections();
    
    const idsArray = Array.isArray(ids) ? ids : [ids];
    
    idsArray.forEach(id => {
      const option = this.options.find(opt => opt.id === id);
      if (option) {
        if (!this.multiSelect) {
          this.clearAllSelections();
        }
        option.selected = true;
      }
    });

    this.updateSelectedOptions();
    this.updateDisplayText();
    this.emitSelectionChange();
  }

  // Método público para resetear a valores por defecto
  public resetToDefaults(): void {
    this.hasSetDefaults = false;
    this.clearAllSelections();
    this.selectedOptions = [];
    this.setDefaultValues();
    this.updateDisplayText();
  }

  toggleDropdown(): void {
    if (!this.disabled) {
      this.isDropdownOpen = !this.isDropdownOpen;
    }
  }

  closeDropdown(): void {
    setTimeout(() => {
      this.isDropdownOpen = false;
    }, 200);
  }

  onComponentBlur(event: FocusEvent): void {
    // Verificar si el elemento que recibe el foco está dentro del componente
    const relatedTarget = event.relatedTarget as HTMLElement;
    const currentTarget = event.currentTarget as HTMLElement;
    
    // Si no hay relatedTarget o el nuevo foco está fuera del componente, cerrar dropdown
    if (!relatedTarget || !currentTarget.contains(relatedTarget)) {
      this.closeDropdown();
    }
  }

  onOptionClick(option: VisualOption, event: Event): void {
    event.stopPropagation();
    
    if (this.multiSelect) {
      this.toggleMultipleSelection(option);
    } else {
      this.setSingleSelection(option);
    }
    
    this.updateDisplayText();
    this.emitSelectionChange();
  }

  onAllOptionsClick(): void {
    if (this.areAllSelected()) {
      // Deseleccionar todos
      this.options.forEach(option => option.selected = false);
      this.selectedOptions = [];
    } else {
      // Seleccionar todos
      this.options.forEach(option => option.selected = true);
      this.selectedOptions = [...this.options];
    }
    
    this.updateDisplayText();
    this.emitSelectionChange();
  }

  private toggleMultipleSelection(option: VisualOption): void {
    option.selected = !option.selected;
    
    if (option.selected) {
      this.selectedOptions.push(option);
    } else {
      this.selectedOptions = this.selectedOptions.filter(selected => selected.id !== option.id);
    }
  }

  private setSingleSelection(option: VisualOption): void {
    // Si la opción ya está seleccionada, deseleccionarla (toggle)
    if (option.selected) {
      option.selected = false;
      this.selectedOptions = [];
    } else {
      // Deseleccionar todas las otras opciones
      this.options.forEach(opt => opt.selected = false);
      
      // Seleccionar la opción clickeada
      option.selected = true;
      this.selectedOptions = [option];
    }
    
    // Cerrar dropdown en modo single select
    this.isDropdownOpen = false;
  }

  private updateDisplayText(): void {
    if (this.selectedOptions.length === 0) {
      this.displayText = this.placeholder;
    } else if (this.selectedOptions.length === 1) {
      this.displayText = this.selectedOptions[0].name || '';
    } else if (this.selectedOptions.length === this.options.length) {
      this.displayText = this.allOptionText;
    } else {
      this.displayText = `${this.selectedOptions.length} selected elements`;
    }
  }

  private emitSelectionChange(): void {
    this.selectionChange.emit([...this.selectedOptions]);
    
    if (!this.multiSelect) {
      // Emitir el elemento seleccionado o null si no hay selección
      this.singleSelectionChange.emit(this.selectedOptions.length > 0 ? this.selectedOptions[0] : null);
    }
  }

  areAllSelected(): boolean {
    return this.options.length > 0 && this.selectedOptions.length === this.options.length;
  }

  areSomeSelected(): boolean {
    return this.selectedOptions.length > 0 && this.selectedOptions.length < this.options.length;
  }

  getSelectedCount(): number {
    return this.selectedOptions.length;
  }

  hasVisualIndicator(option: VisualOption): boolean {
    return (this.showColors && !!option.color) || (this.showImages && !!option.imageUrl);
  }
}
