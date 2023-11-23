import { MatPaginatorIntl } from '@angular/material/paginator';
import { Injectable } from '@angular/core';

@Injectable() //> v9
export class MatPaginatorImpl extends MatPaginatorIntl{

    itemsPerPageLabel = 'Página'; 
    previousPageLabel = 'Anterior';
    nextPageLabel  = 'Siguiente';  
    firstPageLabel = "Primera Página";
    lastPageLabel = "Última Página"

    getRangeLabel = function (page : number, pageSize : number , length : number) {
        if (length === 0 || pageSize === 0) {
            return '0 de ' + length;
        }
        length = Math.max(length, 0);
        const startIndex = page * pageSize;

        const endIndex = startIndex < length ?
            Math.min(startIndex + pageSize, length) :
            startIndex + pageSize;
        return startIndex + 1 + ' - ' + endIndex + ' de ' + length;
    };

}