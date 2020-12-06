import { Component, OnInit } from '@angular/core';
import { AppDataService } from '../app-data.service';

@Component({
  selector: 'app-get-credit',
  templateUrl: './get-credit.component.html',
  styleUrls: ['./get-credit.component.scss']
})
export class GetCreditComponent implements OnInit {

  constructor(public appData: AppDataService) { }

  howMuch: number;
  parcels: number = 12;

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

}
