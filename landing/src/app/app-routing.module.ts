import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RegisterComponent} from './register/register.component';
import { ForgotPasswordComponent} from './forgot-password/forgot-password.component';
import { ActivateAccountComponent} from './activate-account/activate-account.component';
import { LoginComponent} from './login/login.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { UnblockAccountComponent } from './unblock-account/unblock-account.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'activate-account', component: ActivateAccountComponent },
  { path: 'unblock-account', component: UnblockAccountComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
