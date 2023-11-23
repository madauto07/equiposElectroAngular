import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { SeguridadService } from '../seguridad.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from '../../../../environments/environment';
import * as CryptoJS from 'crypto-js';
@Injectable({
  providedIn: 'root'
})
export class GuardServiceGuard implements CanActivate {

  constructor(
    private loginService: SeguridadService,
    private router: Router
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

       //1) VERIFICAR SI ESTA LOGUEADO
    let rpta = this.loginService.estaLogueado();
    if (!rpta) {
      this.loginService.cerrarSesion();
      return false;
    } else {
      //2) VERIFICAR SI EL TOKEN NO HA EXPIRADO
      const helper = new JwtHelperService();
      let token = localStorage.getItem(environment.TOKEN_NAME)!;
      var _toke_bytes  = CryptoJS.AES.decrypt(token, environment.keyCaptcha);
     var _token =_toke_bytes.toString(CryptoJS.enc.Utf8);


      if (!helper.isTokenExpired(_token)) {
        //3) VERIFICAR SI TIENES EL ROL NECESARIO PARA ACCEDER A ESA PAGINA
           //url -> /consulta
           let url = state.url;
           const decodedToken = helper.decodeToken(_token);

           //this.router.navigate(['not-403']);
          return true
      }
      else {
        this.loginService.cerrarSesion();
        return false;
      }
    }
  }
}
