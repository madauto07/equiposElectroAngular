import { Injectable } from '@angular/core';
import { GenericService } from './generic.service';
import { LoginRequest } from '../_model/login-request';
import { Subject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import * as CryptoJS from 'crypto-js';
@Injectable({
  providedIn: 'root'
})

export class SeguridadService {
  private url: string = `${environment.apiURL}/usuario`;
  menu: any = [];
  constructor(protected http: HttpClient, private router: Router) {
    var _menu_key = localStorage.getItem(environment.menu)
    if(_menu_key != null){
      var bytes  = CryptoJS.AES.decrypt(_menu_key, environment.keyCaptcha);
      this.menu =JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    }
  }

  login(usuario: LoginRequest) {
    return this.http.post<any>(`${this.url}/login`, usuario);
  }

  estaLogueado() {
    let token = localStorage.getItem(environment.TOKEN_NAME);
    return token != null;
  }

  cerrarSesion() {
    let token = localStorage.getItem(environment.TOKEN_NAME);
    localStorage.clear();
    // localStorage.clear();
    this.router.navigate(['seg/login']);
  }

  getmenu(menu: any) {
    var ciphertext = CryptoJS.AES.encrypt(JSON.stringify(menu), environment.keyCaptcha).toString();
    localStorage.setItem(environment.menu, ciphertext);
    this.menu = menu;
  }
}
