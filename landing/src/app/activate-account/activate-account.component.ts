import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-activate-account',
  templateUrl: './activate-account.component.html',
  styleUrls: ['../login/login.component.scss']
})
export class ActivateAccountComponent implements OnInit {

  constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router) { }

  errorFields: Object[];
  errorMessage: String;
  code: String;
  done: boolean = false;

  ngOnInit(): void {
    this.code = this.route.snapshot.queryParamMap.get('code');

    this.http.post(`${environment.apiUrl}/services/account-activation`, {
      code: this.code
    }).subscribe(
      (result) => {
        this.done = true;
      }, (e) => {
        alert('Este link nao e mais valido, favor refaca o processo.');
        this.router.navigate(['/login',]);
    }); 
  }

}
