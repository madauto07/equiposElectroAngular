import { Component, OnInit } from '@angular/core';
import { SeguridadService } from 'src/app/core/_service/seguridad.service';
import { ThemeService } from 'src/app/core/_service/theme.service';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  isDarkMode: boolean = false;
  public nombreModo: string = '';

  constructor(
    private seguridadService: SeguridadService,
    private themeService: ThemeService
  ) {
    this.nombreModo = 'CAMBIAR DE MODO';
    this.themeService.initTheme();
    this.isDarkMode = this.themeService.isDarkMode();
   }


  ngOnInit(): void {

  }

  closeSession(){
    this.seguridadService.cerrarSesion()
  }

  /***toggle dark */
  toggleDarkMode() {
    this.isDarkMode = this.themeService.isDarkMode();
    if (this.isDarkMode) {
      this.nombreModo = 'CAMBIAR A MODO DARK';
      this.themeService.update('light-mode');
    } else {
      this.nombreModo = 'CAMBIAR A MODO LIGHT';
      this.themeService.update('dark-mode');
    }
    // this.isDarkMode
    //   ?this.themeService.update('light-mode')
    //   :this.themeService.update('dark-mode');
  }

}
