import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['../login/login.component.scss']
})
export class ResetPasswordComponent implements OnInit {

  constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.code = this.route.snapshot.queryParamMap.get('code');

    this.http.post(`${environment.apiUrl}/services/account-password/isvalid`, {
      code: this.code
    }).subscribe(
      (result) => {
        this.isValid = true;
      }, (e) => {
        alert('Este link nao e mais valido, favor refaca o processo.');
        this.router.navigate(['/forgot-password',]);
    }); 
  }

  isValid: boolean = false;
  code: String;
  password: String;
  retypePassword: String;
  errorFields: Object[];
  errorMessage: String;

  resetPassword(){
    this.clearErrors();
    if(this.password != this.retypePassword){
      this.errorFields = [{param: 'password', message: 'UNMATCH'},{param: 'retypePassword'}];
      return;
    }
    this.http.post(`${environment.apiUrl}/services/account-password/reset`, {
      code: this.code,
      password: this.password
    }).subscribe(
      (result) => {
        alert('Senha alterada com sucesso! Agora voce pode logar em sua conta.');
        this.router.navigate(['/login',]);
      }, (e) => {
        let error = e.error;
        this.errorFields = error.errors || [];
        this.errorMessage = error.message;
    }); 
  }

  clearErrors(){
    this.errorFields = [];
    this.errorMessage = undefined;
  }

  getErrorField(f: String){
    if(! this.errorFields && !this.errorMessage) return false;
    if(this.errorMessage){
      return true;
    }
    return this.errorFields.find((e: any) => e.param == f);
  }

  getErrorMessage(f: String){
    switch(f){
      case 'password':{
        if(!this.password || this.password.length == 0) {
          return "Insira uma senha valida";
        }

        if( this.errorFields.find((e: any) => e.message == 'UNMATCH')) {
          return "";
        }

        return "Insira uma senha valida";
        break;
      }
      case 'retypePassword':{
        return "As senhas nao coincidem";
        break;
      }
    }
  }

}
