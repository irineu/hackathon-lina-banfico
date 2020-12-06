import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AppDataService } from '../app-data.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

@Component({
  selector: 'app-add-account',
  templateUrl: './add-account.component.html',
  styleUrls: ['./add-account.component.scss']
})
export class AddAccountComponent implements OnInit {

  constructor(private http: HttpClient, public appData: AppDataService,private route: ActivatedRoute,
    private router: Router) { }
  cc: String;

  ngOnInit(): void {
    if(this.appData.bankAccounts.length > 0){
      this.router.navigate(['/get-credit', { }]);
    }
  }

  addBank(){
    this.http.post(`${environment.apiUrl}/services/bank`, {cc: this.cc}).subscribe(
      (result) => {
        alert("Conta Cadastrada com sucesso!");
        this.router.navigate(['/get-credit', { }]);
      }, (e) => {
        console.log(e);
        switch(e.status){
          case 403:
            alert("Conta em uso, por favor contate o administrador!");
            break;
          case 404:
            alert("Conta nao encontrada, por favor contate o seu banco!");
            break;
          default:
            alert("Erro desconhecido");
            break;
        }
    });
  }

}
