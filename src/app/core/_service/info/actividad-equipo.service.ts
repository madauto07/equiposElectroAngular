import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { GenericModel } from '../../_model/generic-model';
import { ActividadEquipoModel } from '../../_model/info/actividad-equipo-model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ActividadEquipoService {
  url = '';

  constructor(private http: HttpClient) {
    this.url = `${environment.apiURL}/infotecnica/actividadequipo`;
  }

  listar(): Observable<ActividadEquipoModel[]> {
    return this.http.get<ActividadEquipoModel[]>(`${this.url}`);
  }

  listarPageable(page: number, rows: number,  idactividad:number, idequipo:number ) {
    return this.http.get<GenericModel<ActividadEquipoModel>>(`${this.url}/page?page=${page}&rows=${rows}&idactividad=${idactividad}&idequipo=${idequipo}`);
  }

  obtener(intIdactividad: number, intIdEquipo: number): Observable<ActividadEquipoModel> {
    return this.http.get<ActividadEquipoModel>(`${this.url}/obtener?idactividad=${intIdactividad}&idequipo=${intIdEquipo}`);
  }

  registrar(actividadEquipoModel: ActividadEquipoModel): Observable<any> {
    return this.http.post<any>(`${this.url}/`, actividadEquipoModel);
  }

  actualizar(actividadEquipoModel: ActividadEquipoModel): Observable<any> {
    return this.http.put<any>(`${this.url}/`, actividadEquipoModel);
  }

 
  eliminar(intIdactividad: number, intIdEquipo: number): Observable<any> {
    return this.http.delete<any>(
      `${this.url}/?idactividad=${intIdactividad}&idequipo=${intIdEquipo}`
    );
  }

}
