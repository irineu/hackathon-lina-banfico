import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse, HttpErrorResponse
} from '@angular/common/http';
import {map, tap, catchError} from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler):Observable<HttpEvent<any>> {

    let token = window.localStorage.getItem('token') || window.sessionStorage.getItem('token');
    
    if(token){
      req = req.clone({
        headers: req.headers.set('Auth-Token', token)
      });
    }
    
    return next.handle(req).pipe(
      tap((event: HttpEvent<any>) => {
        //console.log('x');
        //return event;
      }),
      catchError((error: HttpErrorResponse) => {
      if(error.status == 401){
        window.localStorage.removeItem('token');
        window.sessionStorage.removeItem('token');
        window.location.reload();
        return;
      }
      return throwError(error);
    }));
    
  }
}