import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(private http: HttpClient) { }

  username: String;
  password: String;
  remember: Boolean = false;
  errorFields: Object[];
  errorMessage: String;

  ngOnInit(): void {

    let token = window.localStorage.getItem('token') || window.sessionStorage.getItem('token');

    if(token) {
      this.http.get(`${environment.apiUrl}/services/echo/signed`).subscribe(
        (result) => {
          window.location.href = "./members-area/dashboard"
        }, (e) => {
         //TODO
      }); 
    }
  }

  doLogin(){
    this.clearErrors();
    this.http.post(`${environment.apiUrl}/services/signin`, {
      username: this.username,
      password: this.password
    }).subscribe(
      (result) => {
        if(this.remember){
          window.localStorage.setItem('token', result as string);
        }else{
          window.sessionStorage.setItem('token', result as string);
        }
        window.location.href = "./members-area/dashboard"
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
          return "Insira uma senha";
        }

        break;
      }

      case 'username':{
        if(!this.username || this.username.length == 0) {
          return "Insira um e-mail";
        }

        if(this.errorMessage == 'INVALID_USERNAME_OR_PASSWORD'){
          return "Usuario ou senha incorreto";
        }else if(this.errorMessage == "RESET_PASSWORD_IN_PROCESS"){
          return "Senha bloqueada, verique seu email";
        } else if(this.errorMessage == 'ACCOUNT_BLOCKED'){
          return "Conta bloqueada, redefina sua senha";
        } else if(this.errorMessage == 'ACCOUNT_NOT_ACTIVE'){
          return "Ative sua conta, verifique seu email";
        }else{
          return "Usuario ou senha incorreto";
        }

        break;
      }
    }
  }

}
