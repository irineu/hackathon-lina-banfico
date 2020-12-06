import { Component, OnInit } from '@angular/core';
import { AppDataService } from '../app-data.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

@Component({
  selector: 'app-get-credit',
  templateUrl: './get-credit.component.html',
  styleUrls: ['./get-credit.component.scss']
})
export class GetCreditComponent implements OnInit {

  constructor(public appData: AppDataService, private http: HttpClient,private route: ActivatedRoute,
    private router: Router) { }

  howMuch: number;
  parcels: number = 12;
  codeSent = false;
  code = "";
  countDown = 30;
  cdInterval;

  ngOnInit(): void {
    this.howMuch = this.getMax() /2;
  }

  getMin(){
    return Math.round(this.appData.bankAccounts[0].inMedia) / 2;
  }

  getMax(){
    return Math.round(this.appData.bankAccounts[0].inMedia) * 10;
  }

  getTax(): number{
    let tax = 0;

    if(this.appData.bankAccounts[0].lastBalance < 0){
      tax = .30;
    }else{
      tax = .05;
    }

    if(this.parcels > 3){
      tax -= .005;
    }

    if(this.parcels > 6){
      tax -= .005;
    }

    if(this.parcels > 10){
      tax -= .005;
    }

    if(this.parcels > 15){
      tax -= .0025;
    }

    if(this.parcels > 30){
      tax -= .0025;
    }
    return tax;
  }

  confirmDeal(){
    this.http.post(`${environment.apiUrl}/services/deal/confirm`, {code: this.code}).subscribe(
      (result) => {
        alert("Parabens! Sua solicitacao foi enviada e embreve o valor sera creditado em sua conta");
        this.router.navigate(['']);
      }, (e) => {
        console.log(e);
        alert("Codigo invalido");
    });
  }

  doDeal(){
    this.http.post(`${environment.apiUrl}/services/deal`, {amount: this.howMuch, parcels: this.parcels}).subscribe(
      (result) => {
        this.codeSent = true;
        this.countDown = 30;

        this.cdInterval = setInterval(() => {
          this.countDown--;
          if(this.countDown == 0){
            clearInterval(this.cdInterval);
            this.codeSent = false;
          }
        }, 1000);
      }, (e) => {
        console.log(e);
        alert("Erro desconhecido");
    });
  }

}
