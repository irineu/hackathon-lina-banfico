import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import {MatSliderModule} from '@angular/material/slider';
import { MatInputModule } from '@angular/material/input';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatFormFieldModule} from '@angular/material/form-field';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { httpInterceptorProviders } from './interceptors';
import { AddAccountComponent } from './add-account/add-account.component';
import { GetCreditComponent } from './get-credit/get-credit.component';

@NgModule({
  declarations: [
    AppComponent,
    AddAccountComponent,
    GetCreditComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatDividerModule,
    MatSliderModule,
    MatFormFieldModule,
    MatInputModule,
    MatSidenavModule
  ],
  providers: [
    httpInterceptorProviders,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
