import { Component, HostBinding, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { AppDataService } from './app-data.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';


import {
  trigger,
  state,
  style,
  animate,
  transition,
  // ...
} from '@angular/animations'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'hackathon-lina-banfico';

  constructor(private http: HttpClient, public appData: AppDataService, private route: ActivatedRoute,
    private router: Router  ) { }

  loaded: boolean = false;
  progress = 5;

  ngOnInit(): void {
    let token = window.localStorage.getItem('token') || window.sessionStorage.getItem('token');

    if(token) {
      this.http.get(`${environment.apiUrl}/services/echo/signed`).subscribe(
        (result) => {
          this.progress = 25;
          this.loadUser(); 
        }, (e) => {
          console.log(e);
          console.error('not logged in')
          window.location.href = "../login"
      }); 
    }else{
      console.error('not logged in')
      window.location.href = "../login"
    }
  }

  loadUser(){
    this.appData.loadUser().subscribe(
      (result) => {
        
        this.progress = 50;

        this.loadBankData();
        
        
      }, (e) => {
        console.log(e);
    }); 
  }

  loadBankData(){

    this.appData.loadBank().subscribe(
      (result) => {
        
        this.progress = 100;

        if(this.appData.bankAccounts.length == 0){
          this.router.navigate(['/add-account', { }]);
        }

        setTimeout(() => {
          this.loaded = true;
        },500);
        
      }, (e) => {
        console.log(e);
    });
  }

  logout(){
    window.localStorage.removeItem('token');
    window.sessionStorage.removeItem('token');
    window.location.reload();
  }
}
