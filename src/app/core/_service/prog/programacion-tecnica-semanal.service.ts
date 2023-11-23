import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { GenericModel } from '../../_model/generic-model';
import { ProgramacionTecnicaSemanalModel } from '../../_model/prog/programacion-tecnica-semanal-model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProgramacionTecnicaSemanalService {
  url = '';

  constructor(private http: HttpClient) {
    this.url = `${environment.apiURL}/protecnica/programacionsemanal`;
  }

  listar(): Observable<ProgramacionTecnicaSemanalModel[]> {
    return this.http.get<ProgramacionTecnicaSemanalModel[]>(`${this.url}`);
  }

  listarPageable(page: number, rows: number, titulo: string, anho:number, sem:number ) {
    return this.http.get<GenericModel<ProgramacionTecnicaSemanalModel>>(`${this.url}/page?page=${page}&rows=${rows}&titulo=${titulo}&anho=${anho}&semana=${sem}`);
  }

  obtener(intId: number): Observable<ProgramacionTecnicaSemanalModel> {
    return this.http.get<ProgramacionTecnicaSemanalModel>(`${this.url}/${intId}`);
  }

  generar(programacionModel: ProgramacionTecnicaSemanalModel): Observable<any> {
    return this.http.post<any>(`${this.url}/generar`, programacionModel);
  }


  registrar(programacionModel: ProgramacionTecnicaSemanalModel): Observable<any> {
    return this.http.post<any>(`${this.url}/`, programacionModel);
  }

  actualizar(programacionModel: ProgramacionTecnicaSemanalModel): Observable<any> {
    return this.http.put<any>(`${this.url}/`, programacionModel);
  }

  eliminar(intId: number) {
    return this.http.delete<any>(`${this.url}/${intId}`);
  }

}
