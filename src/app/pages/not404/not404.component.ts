import { Component, OnInit } from '@angular/core';
import { SeguridadService } from '../../core/_service/seguridad.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-not404',
  templateUrl: './not404.component.html',
  styleUrls: ['./not404.component.css']
})
export class Not404Component implements OnInit {

  constructor(public loginService: SeguridadService) { }
  ngOnInit(): void {

  }



}
