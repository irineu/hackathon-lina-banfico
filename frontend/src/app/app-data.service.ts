import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import {map, tap, catchError} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AppDataService {

  constructor(private http: HttpClient) { }

  public user: any;

  loadUser(){
    return this.http.get(`${environment.apiUrl}/services/user`).pipe(
      map(result => {
        console.log('Loading User')
        this.user = result;
        return result;
      }));
  }
}
