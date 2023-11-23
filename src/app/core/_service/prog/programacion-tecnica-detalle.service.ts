import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { GenericModel } from '../../_model/generic-model';
import { ProgramacionTecnicaDetalleModel } from '../../_model/prog/programacion-tecnica-detalle-model';
import { Observable } from 'rxjs';
import { ProgramacionTecnicaDetalleIndispModel } from '../../_model/prog/programacion-tecnica-detalle-indisp-Model';
import { ProgramacionAnualModel } from 'src/app/core/_model/prog/programacion-anual-model';
import {ProgramacionTecnicaDetalleAnualModel} from '../../_model/prog/programacion-tecnica-detalle-anual-Model';

@Injectable({
  providedIn: 'root',
})
export class ProgramacionTecnicaDetalleService {
  url = '';

  constructor(private http: HttpClient) {
    this.url = `${environment.apiURL}/protecnica/programaciondet`;
  }

  listar(): Observable<ProgramacionTecnicaDetalleModel[]> {
    return this.http.get<ProgramacionTecnicaDetalleModel[]>(`${this.url}`);
  }

  listarPageable(page: number, rows: number, titulo: string, fechaInic:Date, fechaFin:Date ) {
    return this.http.get<GenericModel<ProgramacionTecnicaDetalleModel>>(`${this.url}/page?page=${page}&rows=${rows}&titulo=${titulo}&fechaInic=${fechaInic}&fechaFin=${fechaFin}`);
  }

  listarPageDetallexId( page: number, rows: number, id : number, opc: number ) : Observable<GenericModel<ProgramacionTecnicaDetalleIndispModel>> {
    var params = new HttpParams()
    
      .set('page', page.toString())
      .set('rows', rows.toString())
      .set('idprog', id)
      .set('opc', opc)
      ;
      

      return this.http.get<GenericModel<ProgramacionTecnicaDetalleIndispModel>>(`${this.url}/opcion?`,{params});
   
  }

  listarPageDetalle(anho:number, mes:number, sem:number, page: number, rows: number, id : number,idActividad : number,
    idTipoMant : number,nombreActividad:string, nombreEquipo:string, UbicacionTecnica:string, CodigoEquipo:string, opc: number ) : Observable<GenericModel<ProgramacionTecnicaDetalleAnualModel>> {
    var params = new HttpParams()
    .set('anho', anho)
    .set('mes', mes)
    .set('sem', sem)
      .set('page', page.toString())
      .set('rows', rows.toString())
      .set('idprog', id)
      .set('idActividad', idActividad)
      .set('idTipoMant', idTipoMant)
      .set('nombreActividad', nombreActividad)
      .set('nombreEquipo', nombreEquipo)
      .set('UbicacionTecnica', UbicacionTecnica)
      .set('CodigoEquipo', CodigoEquipo)
      ;
      let pagevar="";
      if(opc==1)
      pagevar ="pageanual";
      if(opc==2)
      pagevar ="pagemes";
      if(opc==3)
      pagevar ="pagesem";
      if(opc==4)
      pagevar ="reporte";
     

      return this.http.get<GenericModel<ProgramacionTecnicaDetalleAnualModel>>(`${this.url}/${pagevar}`,{params});
   
  }

  listarPageMes(page: number, rows: number, id : number,idActividad : number,
    idTipoMant : number,nombreActividad:string, nombreEquipo:string,
     UbicacionTecnica:string, CodigoEquipo:string ) : Observable<GenericModel<ProgramacionTecnicaDetalleIndispModel>> {
    var params = new HttpParams()
      .set('page', page.toString())
      .set('rows', rows.toString())
      .set('idprog', id)
      .set('idActividad', idActividad)
      .set('idTipoMant', idTipoMant)
      .set('nombreActividad', nombreActividad)
      .set('nombreEquipo', nombreEquipo)
      .set('UbicacionTecnica', UbicacionTecnica)
      .set('CodigoEquipo', CodigoEquipo)
      ;

    return this.http.get<GenericModel<ProgramacionTecnicaDetalleIndispModel>>(`${this.url}/pagemes`,{params});
  }


  obtener(intId: number): Observable<ProgramacionTecnicaDetalleModel> {
    return this.http.get<ProgramacionTecnicaDetalleModel>(`${this.url}/${intId}`);
  }

  registrar(programacionModel: ProgramacionTecnicaDetalleModel): Observable<any> {
    return this.http.post<any>(`${this.url}/`, programacionModel);
  }

  actualizar(programacionModel: ProgramacionTecnicaDetalleModel): Observable<any> {
    return this.http.put<any>(`${this.url}/`, programacionModel);
  }

  eliminar(intId: number) {
    return this.http.delete<any>(`${this.url}/${intId}`);
  }

}
