import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  userCambio = new Subject<any[]>();
  mensajeCambio = new Subject<string>();
  constructor() { }
}
