import { Injectable} from '@angular/core';
import { Workbook } from 'exceljs/dist/exceljs.min.js';
import * as fs from 'file-saver';
import { IColumnaPersonalizada } from 'src/app/core/_model/general/IColumnaPersonalizada';
import { IFiltroListado } from '../../_model/general/IFiltroListado';
const EXCEL_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const EXCEL_EXTENSION = '.xlsx';

@Injectable({
  providedIn: 'root',
})
export class ExcelService {
  constructor() {}

  public exportAsExcelFile(
    reportHeading: string,
    reportSubHeading: string,
    headersArray: IColumnaPersonalizada[],
    filterArray: IFiltroListado[],
    data: any[],
    footerData: any,
    excelFileName: string,
    sheetName: string,
    creator: string
  ): void {
    const header = headersArray.map((x) => x.name);
    /** Creacion de Libro y Hoja */
    const workbook = new Workbook();
    workbook.creator = creator;
    workbook.lastModifiedBy = creator;
    workbook.created = new Date();
    workbook.modified = new Date();
    const worksheet = workbook.addWorksheet(sheetName);
    /** Agregando Fila Cabecera */
    worksheet.addRow([]);
    worksheet.mergeCells(
      'A1:' + this.numToAlpha(headersArray.length - 1) + '1'
    );
    worksheet.getCell('A1').value = reportHeading;
    worksheet.getCell('A1').alignment = { horizontal: 'center' };
    worksheet.getCell('A1').font = { size: 15, bold: true };
    if (reportSubHeading !== '') {
      worksheet.addRow([]);
      worksheet.mergeCells('A2:' + this.numToAlpha(header.length - 1) + '2');
      worksheet.getCell('A2').value = reportHeading;
      worksheet.getCell('A2').alignment = { horizontal: 'center' };
      worksheet.getCell('A2').font = { size: 12, bold: false };
    }
    worksheet.addRow([]);
    // Criterios de Busqueda
    const criterioBusquedaFila = worksheet.addRow(['Criterios de Busqueda', '']);
    criterioBusquedaFila.font = {size: 12, bold: true };
    filterArray.forEach((x) => {
      worksheet.addRow([x.filtro, x.valorFiltro]);
    });
    worksheet.addRow([]);
    /** Agregando Fila Cabecera */
    const headerRow = worksheet.addRow(header);
    /** Estilo de Cabecera: Fill and Border */
    headerRow.eachCell((cell, index) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '00D2D2D2' },
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
      cell.font = { size: 12, bold: true };
      worksheet.getColumn(index).width =
        header[index - 1].length < 20 ? 20 : header[index - 1].length;
    });
    // Add Data and Conditional Formatting
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
            eachRow.push(d);
          } else {
            eachRow.push(element[objHeader.key]);
          }
        }
      });
      worksheet.addRow(eachRow);
    });

    // Footer Data Row
    if (footerData != null) {
      footerData.forEach((element: any) => {
        const eachRow = [];
        element.array.forEach((val: any) => {
          eachRow.push(val);
        });
        const footerRow = worksheet.addRow(eachRow);
        footerRow.eachCell((cell) => {
          cell.font = { bold: true };
        });
      });
    }

    // Save Excel File
    workbook.xlsx.writeBuffer().then((datos: ArrayBuffer) => {
      const blob = new Blob([datos], { type: EXCEL_TYPE });
      fs.saveAs(blob, excelFileName + EXCEL_EXTENSION);
    });
  }

  private numToAlpha(num: number): string {
    let alpha = '';
    for (; num >= 0; num = parseInt((num / 26).toString(), 10) - 1) {
      alpha = String.fromCharCode((num % 26) + 0x41) + alpha;
    }
    return alpha;
  }
}
