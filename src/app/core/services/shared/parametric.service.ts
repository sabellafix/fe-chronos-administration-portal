import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, zip } from 'rxjs';
import { map } from 'rxjs/operators';
import { Option } from '@app/core/models/interfaces/option.interface';

@Injectable({
  providedIn: 'root'
})
export class ParametricService {

    optionsMap: { [key: string]: Option[] } = {};
    private codephonesUrl = 'assets/static/codephones.json';

  constructor(private http: HttpClient) {
    this.getOptions().subscribe();
  }

   getOptions(): Observable<any> {
    const codephones$ = this.getCodephones();

    return zip(codephones$ ).pipe(
      map(([codephones]) => {
        const mappedCodephones = codephones.map((codephone: Option) => ({ id: codephone.id, name: codephone.name, code: codephone.code }));
        this.optionsMap['codephones'] = mappedCodephones;
        return {
          codephones: mappedCodephones,
        };
      })
    );
  }

  getCodephones(): Observable<any> {
    return this.http.get(this.codephonesUrl);
  }

}