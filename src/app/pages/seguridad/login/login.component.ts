import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import swal from 'sweetalert2'
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { SeguridadService } from '../../../core/_service/seguridad.service';
import { LoginRequest } from '../../../core/_model/login-request'
import { UserService } from '../../../core/_service/user.service';
import * as CryptoJS from 'crypto-js';
import {ConstanteService} from 'src/app/core/_service/administracion/constante.service'
import {ETipoConstante} from 'src/app/core/_model/general/ETipoConstante'
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  public frm: FormGroup;
  public isLoadingResults = false;
  _LoginRequest?: LoginRequest

  //@ViewChild('recaptcha', { static: false }) recaptchaElement: ElementRef;

  tokenGoogle: string = '';
  isValidToken: boolean;
  hide = true;
  keyCaptcha:string=''

  constructor(
     private seguridadService: SeguridadService,
     private router: Router,
     private userService: UserService,
     private constanteService: ConstanteService
     ) {
    this.frm = new FormGroup({
      Username: new FormControl('', Validators.required),
      Password: new FormControl('', Validators.required)
     // captchaGoogle: new FormControl(''),
    });
    this.isValidToken = false;
   // this.keyCaptcha = "abcdef";
    this.keyCaptcha=`${environment.keyCaptcha}`
  }

  ngOnInit(): void {

    // setTimeout(() => {
    //   this.addRecaptchaScript();
    // }, 1000);
  }

  Login() {
    this.isLoadingResults=true
    // if (this.tokenGoogle == '' || this.tokenGoogle == null) {
    //   swal.fire('Validación', 'Debe hacer click en la casilla de verificación', 'info')
    //   this.isLoadingResults=false
    //   return;
    // }
    // else {
     // this.frm.value.captchaGoogle = this.tokenGoogle
      this._LoginRequest = new LoginRequest;
      this._LoginRequest.Username=this.frm.value['Username']
      this._LoginRequest.Password=this.frm.value['Password']
      //this._LoginRequest.captchaGoogle=this.tokenGoogle

      this.seguridadService.login(this._LoginRequest).subscribe(result => {
        this.isLoadingResults=false
        if (result.success) {
          console.log('result: ',result.menu);
          this.seguridadService.getmenu(result.menu)
          var ciphertext = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(result.token), environment.keyCaptcha).toString();
          localStorage.setItem(environment.TOKEN_NAME, ciphertext);
          localStorage.setItem("username",result.usuario.login)
          localStorage.setItem("listado_menu",JSON.stringify(result.menu))
          // Consultar configuraciones para el sistema
          this.constanteService.listarControlId(ETipoConstante.ConfiguracionSistema).subscribe(result => {
            localStorage.setItem("configuracion",JSON.stringify(result.Items))
          })
          this.router.navigate(['/home/inicio']);
          // location.reload();
        }
        else {
          swal.fire('Validación', result.mensaje, 'info')
        }
      }, error =>{
        this.isLoadingResults=false
      })

    //}
  }

  hasError(nombreControl: string, validacion: string) {
    const control = this.frm.get(nombreControl);
    return this.frm.get(nombreControl)
  }

  resolved(captchaResponse: string) {
    this.tokenGoogle=captchaResponse
  }
}
