import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { GenericModel } from '../../_model/generic-model';
import { ActividadTrabajadorModel } from '../../_model/info/actividad-trabajador-model';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class ActividadTrabajadorService {
  url = '';

  constructor(private http: HttpClient) {
    this.url = `${environment.apiURL}/infotecnica/actividadtrabajador`;
  }

  listar(): Observable<ActividadTrabajadorModel[]> {
    return this.http.get<ActividadTrabajadorModel[]>(`${this.url}`);
  }

  listarPageable(page: number, rows: number, idactividad: number ) {
    return this.http.get<GenericModel<ActividadTrabajadorModel>>(`${this.url}/page?page=${page}&rows=${rows}&idactividad=${idactividad}`);
  }



  obtener(intId: number): Observable<ActividadTrabajadorModel> {
    return this.http.get<ActividadTrabajadorModel>(`${this.url}/${intId}`);
  }

  registrar(ActTrabModel: ActividadTrabajadorModel): Observable<any> {
    return this.http.post<any>(`${this.url}/`, ActTrabModel);
  }

  actualizar(equipoModel: ActividadTrabajadorModel): Observable<any> {
    return this.http.put<any>(`${this.url}/`, equipoModel);
  }

 
  eliminar(intIdactividad: number, intIdTrabajador: number): Observable<any> {
    return this.http.delete<any>(
      `${this.url}/?idactividad=${intIdactividad}&idtrabajador=${intIdTrabajador}`
    );
  }

}
