import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { JwtModule } from '@auth0/angular-jwt';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import * as CryptoJS from 'crypto-js';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from './core/material/material.module';
import { NavigationComponent } from './pages/navigation/navigation.component';
import { Not403Component } from './pages/not403/not403.component';
import { Not404Component } from './pages/not404/not404.component';
import { environment } from '../environments/environment';
import { ControlTreeComponent } from './pages/control-tree/control-tree.component';
import { MatTreeModule } from '@angular/material/tree';
import { SeguridadModule } from './pages/seguridad/seguridad.module';
import { ModalSharedModule } from './pages/modal-shared/modal-shared.module';
import { HeaderComponent } from './pages/shared/header/header.component';
import { SidebarComponent } from './pages/shared/sidebar/sidebar.component';
import { FooterComponent } from './pages/shared/footer/footer.component';
import { LayoutComponent } from './pages/layout/layout.component';
import { ControlSidebarComponent } from './pages/shared/control-sidebar/control-sidebar.component';
import { ProgramacionModule } from './pages/prog/programacion.module';

export function tokenGetter() {
  var token = localStorage.getItem(environment.TOKEN_NAME);
  if (token != null) {
    var _toke_bytes = CryptoJS.AES.decrypt(token, environment.keyCaptcha);
    var _token = _toke_bytes.toString(CryptoJS.enc.Utf8);
    return _token;
  }
  return localStorage.getItem(environment.TOKEN_NAME);
}

@NgModule({
  declarations: [
    AppComponent,
    NavigationComponent,
    ControlTreeComponent,
    Not403Component,
    Not404Component,
    HeaderComponent,
    SidebarComponent,
    FooterComponent,
    LayoutComponent,
    ControlSidebarComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatTreeModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        allowedDomains: [environment.ALLOWD_HOST],
      },
    }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
