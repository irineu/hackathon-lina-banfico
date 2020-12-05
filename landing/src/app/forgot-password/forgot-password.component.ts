import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['../login/login.component.scss']
})
export class ForgotPasswordComponent implements OnInit {

  constructor(private http: HttpClient) { }

  username: String;
  errorFields: Object[];
  errorMessage: String;
  sent:Boolean = false;

  ngOnInit(): void {
  }

  sendMail(){
    this.clearErrors();
    this.http.post(`${environment.apiUrl}/services/account-password/forgot`, {
      username: this.username
    }).subscribe(
      (result) => {
        this.sent = true;
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
      case 'username':{
        if(!this.username || this.username.length == 0) {
          return "Insira um e-mail valido";
        }

        if(this.errorMessage == "USER_NOT_FOUND"){
          return "Usuario nao cadastrado";
        }

        return "Email invalido";
        break;
      }
    }
  }

}
