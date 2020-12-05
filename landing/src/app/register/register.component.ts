import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['../login/login.component.scss']
})
export class RegisterComponent implements OnInit {

  constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router) { }

  username: String;
  password: String;
  retypePassword: String;
  secretQuestion: String = "";
  secretAnswer: String

  firstName: String;
  lastName: String;
  birthDate: Date;
  genre: String;

  phone: String;
  mobilePhone: String;

  city: String;
  state: String = "";

  addressLine1: String;
  addressLine2: String;
  zip: String;

  errorFields: Object[];
  errorMessage: String;

  step: number = 1;

  ngOnInit(): void {
  }

  checkMail(){
    this.http.post(`${environment.apiUrl}/services/signup/check-username`, {
      username: this.username
    }).subscribe(
      (result) => {
        this.step++;
      }, (e) => {
        let error = e.error;
        this.errorFields = error.errors || [];
        this.errorMessage = error.message;
    }); 
  }

  checkPersonal(){
    this.http.post(`${environment.apiUrl}/services/signup/check-personal`, {
      firstName: this.firstName,
      lastName: this.lastName,
      birthDate: this.birthDate,
      genre: this.genre
    }).subscribe(
      (result) => {
        this.step++;
      }, (e) => {
        let error = e.error;
        this.errorFields = error.errors || [];
        this.errorMessage = error.message;
    }); 
  }

  checkPhone(){
    this.http.post(`${environment.apiUrl}/services/signup/check-phone`, {
      contact_phone: this.phone,
      contact_mobilePhone: this.mobilePhone
    }).subscribe(
      (result) => {
        this.step++;
      }, (e) => {
        let error = e.error;
        this.errorFields = error.errors || [];
        this.errorMessage = error.message;
    }); 
  }

  checkAddress(){
    this.http.post(`${environment.apiUrl}/services/signup/check-address`, {
      address_city: this.city,
      address_state: this.state,
      address_addressLine1: this.addressLine1,
      address_addressLine2: this.addressLine2,
      address_zip: this.zip
    }).subscribe(
      (result) => {
        this.step++;
      }, (e) => {
        let error = e.error;
        this.errorFields = error.errors || [];
        this.errorMessage = error.message;
    }); 
  }

  signup(){

    this.clearErrors();

    if(!this.password || this.password.length == 0){
      this.errorFields = [{param: 'password', msg: ''}];
      return;
    }

    if(this.password != this.retypePassword){
      this.errorFields = [{param: 'password', msg: 'UNMATCH'},{param: 'retypePassword'}];
      return;
    }

    this.http.post(`${environment.apiUrl}/services/signup/check-password`, {
      password: this.password,
      secretQuestion: this.secretQuestion,
      secretAnswer: this.secretAnswer
    }).subscribe(
      (result) => {
        this.http.post(`${environment.apiUrl}/services/signup`, {
          username: this.username,

          firstName: this.firstName,
          lastName: this.lastName,
          birthDate: this.birthDate,
          genre: this.genre,

          contact_phone: this.phone,
          contact_mobilePhone: this.mobilePhone,

          address_city: this.city,
          address_state: this.state,
          address_addressLine1: this.addressLine1,
          address_addressLine2: this.addressLine2,
          address_zip: this.zip,

          password: this.password,
          secretQuestion: this.secretQuestion,
          secretAnswer: this.secretAnswer,
        }).subscribe(
          (result) => {
            alert('Conta castrada com sucesso! Verique sua caixa de email.');
            this.router.navigate(['/login',]);
          }, (e) => {
            let error = e.error;
            this.errorFields = error.errors || [];
            this.errorMessage = error.message;
        });
      }, (e) => {
        let error = e.error;
        this.errorFields = error.errors || [];
        this.errorMessage = error.message;
    }); 
  }

  next(){
    this.step = this.step + 1;
  }

  clearErrors(){
    this.errorFields = [];
    this.errorMessage = undefined;
  }

  getErrorField(f: String): any{
    if(! this.errorFields && !this.errorMessage) return false;
    if(this.errorMessage){
      return true;
    }
    return this.errorFields.find((e: any) => e.param == f);
  }

  getErrorMessage(f: String){
    switch(f){
      case 'password':{
        if(this.getErrorField(f).msg == 'UNMATCH'){
          return "As senhas nao coincidem";
        }
        break;
      }

      case 'username':{

        if(!this.username || this.username.length == 0) {
          return "Insira um e-mail";
        }

        if(this.getErrorField(f).msg == 'ALREADY_EXISTS'){
          return "Email ja cadastrado";
        }

        return "Email invalido"
      }
    }
  }

}
