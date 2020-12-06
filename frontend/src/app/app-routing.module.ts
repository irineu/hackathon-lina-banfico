import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AddAccountComponent } from './add-account/add-account.component';
import { GetCreditComponent } from './get-credit/get-credit.component';

const routes: Routes = [
  { path: 'add-account', component: AddAccountComponent },
  { path: 'get-credit', component: GetCreditComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
