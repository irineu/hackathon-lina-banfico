import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-unblock-account',
  templateUrl: './unblock-account.component.html',
  styleUrls: ['../login/login.component.scss']
})
export class UnblockAccountComponent implements OnInit {

  constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router) { }

  errorFields: Object[];
  errorMessage: String;
  code: String;
  done: boolean = false;

  ngOnInit(): void {
    this.code = this.route.snapshot.queryParamMap.get('code');

    this.http.post(`${environment.apiUrl}/services/account-unblock`, {
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
