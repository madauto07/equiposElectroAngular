export class GenericModel<T> {
    HasItems  : boolean = false;
    Items  : T[] = [];
    Obj?  : T ;
    Total : number = 0;
    Page : number = 0;
    Pages : number = 0;
}
