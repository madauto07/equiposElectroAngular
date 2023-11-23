import { AfterViewInit, Component, OnInit } from '@angular/core';
declare var $: any;

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements AfterViewInit {
  lstMenu: Array<any> = JSON.parse(localStorage.getItem('listado_menu'));
  username = localStorage.getItem('username');

  constructor() {}

  ngAfterViewInit(): void {
   // console.log(localStorage.getItem('iniciar_menu'));
    if (localStorage.getItem('iniciar_menu') != 'true') {
      //Se Agregó esto para que el menú funcione sin recargar la página
      $('[data-widget="treeview"]').Treeview('init');
      $('[data-widget="sidebar-search"]').SidebarSearch('init');
      localStorage.setItem('iniciar_menu', 'true');
    }
  }
}
