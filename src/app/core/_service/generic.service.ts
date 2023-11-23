import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GenericModel } from '../_model/generic-model';

@Injectable({
  providedIn: 'root'
})
export class GenericService<T> {
  constructor(
    protected http: HttpClient,
    @Inject(String) protected url: string
  ) {}

  listar() {
    return this.http.get<T>(`${this.url}/lista`);
  }

  listarPorId(id: number) {
    return this.http.get<T>(`${this.url}/listarPorId?id=${id}`);
  }

  registrar(t: T) {
    return this.http.post(`${this.url}/registrar`, t);
  }

  modificar(t: T) {
    return this.http.put(`${this.url}/modificar`, t);
  }

  eliminar(id: number) {
    return this.http.delete(`${this.url}/eliminar/${id}`);
  }


}
