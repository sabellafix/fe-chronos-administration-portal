import { Pipe, PipeTransform } from '@angular/core';
import { ServiceTypeConst } from '../models/constants/serviceType.const';
import { Option } from '../models/interfaces/option.interface';


@Pipe({
  name: 'serviceType'
})
export class ServiceTypePipe implements PipeTransform {

  transform(value: string): unknown {
    const types: Option[] = [ 
      { name: ServiceTypeConst._SERVICE, code: "Service" },
      { name: ServiceTypeConst._CONFIG, code: "Config" },
      { name: ServiceTypeConst._DEFAULT, code: "Default" },
    ];
      
    const type = types.find(type => type.name === value)?.code;
    return type ? type : value;
  }

}
