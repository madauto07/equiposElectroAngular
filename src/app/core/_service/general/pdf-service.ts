import { Injectable, Inject, LOCALE_ID } from '@angular/core';
import { IColumnaPersonalizada } from 'src/app/core/_model/general/IColumnaPersonalizada';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import { formatDate } from '@angular/common';
import { ModuloModel } from '../../_model/administracion/modulo-model';
@Injectable({
  providedIn: 'root',
})
export class PFDService {
  constructor(@Inject(LOCALE_ID) private locale: string) {}

  public exportAsPDFFile(
    headerString: string,
    headersArray: IColumnaPersonalizada[],
    data: any[]
  ): void {
    const cabecera = headersArray.map((x) => x.name);
    const docDefinition = {
      header: '',
      content: [
        {
          text: headerString,
          fontSize: 12,
          alignment: 'center',
          color: '#047886',
          margin: [0, 10],
        },
        {
          table: {
            headerRows: 1,
            widths: cabecera.map((x) => 'auto'),
            body: [cabecera, ...this.getData(data, headersArray).map((x) => x)],
          },
          fontSize: 10,
        },
      ],
      styles: {},
    };
    pdfMake.createPdf(docDefinition).download();
  }

  getData(data: any[], headersArray: any[]): any[] {
    const contenido = [];
    data.forEach((element: any) => {
      const eachRow = [];
      headersArray.forEach((objHeader) => {
        if (typeof element[objHeader.key] === 'object') {
          eachRow.push(element[objHeader.key][objHeader.subkey]);
        } else {
          if (objHeader.key === 'intEstado') {
            if (element[objHeader.key] === 1) {
              eachRow.push('activo');
            } else {
              eachRow.push('inactivo');
            }
          } else if (objHeader.key.includes('dtFecha')) {
            const d: Date = new Date(element[objHeader.key] + 'Z');
            eachRow.push(formatDate(d, 'dd/MM/yyyy hh:mm:ss a', this.locale));
          } else {
            eachRow.push(element[objHeader.key]);
          }
        }
      });
      contenido.push(eachRow);
    });
    return contenido;
  }
}
