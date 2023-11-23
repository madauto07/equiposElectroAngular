import { Component, OnInit, ElementRef, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styles: [
  ]
})
export class InicioComponent implements OnInit {

  constructor(private elementRef: ElementRef,@Inject(DOCUMENT) private doc) { }

  ngOnInit(): void {
    // let link1: HTMLLinkElement = this.doc.createElement('link');
    // link1.setAttribute('rel', 'amphtml');
    // link1.setAttribute('href', '../../../../assets/plugins/fontawesome-free/css/all.min.css');
    // this.doc.head.appendChild(link1);

    // let link: HTMLLinkElement = this.doc.createElement('link');
    // link.setAttribute('rel', 'amphtml');
    // link.setAttribute('href', '../../../../assets/dist/css/adminlte.min.css');
    // this.doc.head.appendChild(link);


    // var s14 = document.createElement("script");
    // s14.type = "text/javascript";
    // s14.src = "../../../../assets/plugins/jquery/jquery.min.js";
    // console.log('s14',s14);
    // this.elementRef.nativeElement.appendChild(s14);

    // var s1 = document.createElement("script");
    // s1.type = "text/javascript";
    // s1.src = "../../../../assets/plugins/bootstrap/js/bootstrap.bundle.min.js";
    // this.elementRef.nativeElement.appendChild(s1);

    // var s2 = document.createElement("script");
    // s2.type = "text/javascript";
    // s2.src = "../../../../assets/dist/js/adminlte.js";
    // this.elementRef.nativeElement.appendChild(s2);
  }

}
