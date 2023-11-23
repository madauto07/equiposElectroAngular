import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { GenericModel } from '../../_model/generic-model';
import { Observable } from 'rxjs';
import { ActividadModel } from '../../_model/info/actividad-model';
@Injectable({
  providedIn: 'root',
})
export class ActividadService {
  url = '';

  constructor(private http: HttpClient) {
    this.url = `${environment.apiURL}/infotecnica/actividad`;
  }

  listar(): Observable<ActividadModel[]> {
    return this.http.get<ActividadModel[]>(`${this.url}`);
  }

  listarPagina(
    page: number,
    rows: number,
    titulo: string,
    codigoactividad: string,
     idobjeto: number,
    idtipoactivo: number,
    responsable: string,
    ubicacionTecnica: string,
    codigoEquipo: string,
     idparte : number,
     idsubparte : number,
     codigomantto : any ) {
    return this.http.get<GenericModel<ActividadModel>>(`${this.url}/page?page=${page}&rows=${rows}&titulo=${titulo}&codigoactividad=${codigoactividad}&idobjeto=${idobjeto}&idtipoactivo=${idtipoactivo}&responsable=${responsable}&ubicacionTecnica=${ubicacionTecnica}&codigoEquipo=${codigoEquipo}&idparte=${idparte}&idsubparte=${idsubparte}&codigomantto=${codigomantto}`);
  }

  listarPageable(
    page: number,
    rows: number,
    titulo: string,
    codigoactividad: string,
    codigomantto: string,
    idobjeto: number,
    idtipoactivo: number,
    responsable: string,
    ubicacionTecnica: string,
    codigoEquipo: string,
     idparte : number,
     idsubparte : number 
  ): Observable<GenericModel<ActividadModel>> {
    var params = new HttpParams()
      .set('page', page.toString())
      .set('rows', rows.toString())
      .set('titulo', titulo)
      .set('codigoactividad', codigoactividad)
      .set('codigomantto', JSON.stringify(codigomantto) )
      .set('idobjeto', idobjeto)
      .set('idtipoactivo', idtipoactivo)
      .set('responsable', responsable)
      .set('ubicaciontecnica', ubicacionTecnica)
      .set('codigoequipo', codigoEquipo)
      .set('idparte', idparte)
      .set('idsubparte', idsubparte)
      ;
    return this.http.get<GenericModel<ActividadModel>>(`${this.url}/page`, {
      params,
    });
  }

  obtener(intId: number): Observable<ActividadModel> {
    return this.http.get<ActividadModel>(`${this.url}/${intId}`);
  }

  registrar(actividadModel: ActividadModel): Observable<any> {
    return this.http.post<any>(`${this.url}/`, actividadModel);
  }

  actualizar(actividadModel: ActividadModel): Observable<any> {
    return this.http.put<any>(`${this.url}/`, actividadModel);
  }

  eliminar(intIdActividad: number): Observable<any> {
    return this.http.delete<any>(`${this.url}/${intIdActividad}`);
  }
}
