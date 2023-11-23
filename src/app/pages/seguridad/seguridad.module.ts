
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { Routes, RouterModule } from '@angular/router';
import { MaterialModule } from '../../core/material/material.module'
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
//import { RecaptchaModule } from 'ng-recaptcha';

export const routes: Routes = [
  {
    path: 'login', component: LoginComponent
  },

]

@NgModule({
  declarations: [LoginComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    MaterialModule
   // RecaptchaModule
  ],
  exports:[
    RouterModule
  ]
})
export class SeguridadModule { }
