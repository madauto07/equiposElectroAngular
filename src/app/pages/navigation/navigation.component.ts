import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
} from '@angular/core';
import { Router } from '@angular/router';

import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MediaObserver, MediaChange } from '@angular/flex-layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Subscription } from 'rxjs';
//import { EventEmitter } from 'stream';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
/** control treeview */
import { FlatTreeControl } from '@angular/cdk/tree';
import { BehaviorSubject } from 'rxjs';
import {
  MatTreeFlatDataSource,
  MatTreeFlattener,
} from '@angular/material/tree';
import { SelectionModel } from '@angular/cdk/collections';
import { SeguridadService } from '../../core/_service/seguridad.service';
import { OverlayContainer } from '@angular/cdk/overlay';
import { ThemeService } from 'src/app/core/_service/theme.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from '../../../environments/environment';
import * as CryptoJS from 'crypto-js';

/** crear clases tree **/
export class TreeItemNode {
  children: TreeItemNode[] = [];
  item: string = '';
  code: string = '';
  link: string = '';
  icon: string = '';
}

/** Flat to-do item node with expandable and level information */
export class TreeItemFlatNode {
  item: string = '';
  level: number = 0;
  expandable: boolean = true;
  code: string = '';
  link: string = '';
  icon: string = '';
}

interface codigo {
  name: string;
}

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigationComponent implements OnInit {
  /** control modedark */
  @Output()
  readonly darkModeSwitched = new EventEmitter<boolean>();
  public mode: any;
  mediaSub: Subscription;
  deviceXs: boolean;
  public username: string = '';
  public nombreModo: string = '';
  public uniquename: string = '';
  public mitoken: string = '';
  myArray: any[];
  // @Output() open: EventEmitter<> = new EventEmitter();

  isDarkMode: boolean = false;
  /*** control treeview **********************************************/

  public menuItems: Array<any>;
  dataChange = new BehaviorSubject<TreeItemNode[]>([]);
  treeData: any[];
  get data(): TreeItemNode[] {
    return this.dataChange.value;
  }
  // codigo treeview
  flatNodeMap = new Map<TreeItemFlatNode, TreeItemNode>();
  /** Map from nested node to flattened node. This helps us to keep the same object for selection */
  nestedNodeMap = new Map<TreeItemNode, TreeItemFlatNode>();
  /** A selected parent node to be inserted */
  selectedParent: TreeItemFlatNode | null = null;
  /** The new item's name */
  newItemName = '';
  treeControl: FlatTreeControl<TreeItemFlatNode>;
  treeFlattener: MatTreeFlattener<TreeItemNode, TreeItemFlatNode>;
  dataSource: MatTreeFlatDataSource<TreeItemNode, TreeItemFlatNode>;
  /** The selection for checklist */
  checklistSelection = new SelectionModel<TreeItemFlatNode>(
    false /* multiple */
  );

  /************************************************ */
  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  constructor(
    private routers: Router,
    private breakpointObserver: BreakpointObserver,
    public mediaObserver: MediaObserver,
    public loginService: SeguridadService,
    private themeService: ThemeService
  ) {
    /*** LOGIN ***/
    const helper = new JwtHelperService();
    let token = localStorage.getItem(environment.TOKEN_NAME)!;
    var _toke_bytes = CryptoJS.AES.decrypt(token, environment.keyCaptcha);
    var _token = _toke_bytes.toString(CryptoJS.enc.Utf8);
    // let token = sessionStorage.getItem(environment.TOKEN_NAME)!;
    this.mitoken = _token;
    const decodedToken = helper.decodeToken(_token);
    this.username = decodedToken.family_name;
    this.uniquename = decodedToken.unique_name;
    this.menuItems = this.loginService.menu;
    this.nombreModo = 'CAMBIAR DE MODO';
    // console.log(this.username);

    /** inicio de tema dark*/

    this.themeService.initTheme();
    this.isDarkMode = this.themeService.isDarkMode();
    /** inicio de  treecontrol */

    this.initialize();
    this.treeFlattener = new MatTreeFlattener(
      this.transformer,
      this.getLevel,
      this.isExpandable,
      this.getChildren
    );
    this.treeControl = new FlatTreeControl<TreeItemFlatNode>(
      this.getLevel,
      this.isExpandable
    );
    this.dataSource = new MatTreeFlatDataSource(
      this.treeControl,
      this.treeFlattener
    );
    this.dataChange.subscribe((data) => {
      this.dataSource.data = data;
    });
  }

  getLevel = (node: TreeItemFlatNode) => node.level;
  isExpandable = (node: TreeItemFlatNode) => node.expandable;
  getChildren = (node: TreeItemNode): TreeItemNode[] => node.children;
  hasChild = (_: number, _nodeData: TreeItemFlatNode) => _nodeData.expandable;
  transformer = (node: TreeItemNode, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode =
      existingNode && existingNode.item === node.item
        ? existingNode
        : new TreeItemFlatNode();
    flatNode.item = node.item;
    flatNode.level = level;
    flatNode.code = node.code;
    flatNode.link = node.link;
    flatNode.icon = node.icon;
    flatNode.expandable = node.children && node.children.length > 0;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  };

  ngOnInit(): void {
    //this.toggleLightDark();

    this.mediaSub = this.mediaObserver.media$.subscribe((res: MediaChange) => {
      this.mode = res.mqAlias === 'xs' ? 'over' : 'side';
      this.deviceXs = res.mqAlias === 'xs' ? true : false;

      this.myArray = this.uniquename.split('|');
      this.username = this.myArray[0];
     // console.log(this.myArray[0]);
    });
  }

  /** inicio metodos control treeview */

  initialize() {
    //this.treeData = this.loginService.menu;
    this.treeData = this.loginService.menu;
    //console.log(this.treeData);
    //console.log(this.loginService.menu);
    //     file node as children.
    const data = this.buildFileTree(this.loginService.menu, '0');
    // Notify the change.
    this.dataChange.next(data);
    // console.log(this.treeData);
  }

  buildFileTree(obj: any[] = [], level: string): TreeItemNode[] {
    return obj
      .filter(
        (o) =>
          (<string>o.code).startsWith(level + '.') &&
          (o.code.match(/\./g) || []).length ===
            (level.match(/\./g) || []).length + 1
      )
      .map((o) => {
        const node = new TreeItemNode();
        node.item = o.text;
        node.code = o.code;
        node.link = o.link;
        node.icon = o.icon;
        const children = obj.filter((so) =>
          (<string>so.code).startsWith(level + '.')
        );
        if (children && children.length > 0) {
          node.children = this.buildFileTree(children, o.code);
        }
        return node;
      });
  }

  //NUEVO filter data
  public filter(filterText: string) {
    let filteredTreeData;
    if (filterText) {
      filteredTreeData = this.treeData.filter(
        (d) =>
          d.text.toLocaleLowerCase().indexOf(filterText.toLocaleLowerCase()) >
          -1
      );
      Object.assign([], filteredTreeData).forEach((ftd) => {
        let str = <string>ftd.code;
        while (str.lastIndexOf('.') > -1) {
          const index = str.lastIndexOf('.');
          str = str.substring(0, index);
          if (filteredTreeData.findIndex((t) => t.code === str) === -1) {
            const obj = this.treeData.find((d) => d.code === str);
            if (obj) {
              filteredTreeData.push(obj);
            }
          }
        }
      });
    } else {
      filteredTreeData = this.treeData;
    }

    // Build the tree nodes from Json object. The result is a list of `TodoItemNode` with nested
    // file node as children.
    const data = this.buildFileTree(filteredTreeData, '0');
    // Notify the change.
    this.dataChange.next(data);
 //   console.log(data);

    // let menutree: any[];
    // menutree=this.treeData;

    // let filteredTreeData;
    // if (filterText) {
    // let  filteredTreeData1 = menutree.filter(d => d.text.toLocaleLowerCase().indexOf(filterText.toLocaleLowerCase()) > -1);
    //   Object.assign([], filteredTreeData1).forEach( (ftd:any) => {
    //    // let _code :
    //     let str = (<string>ftd.code);
    //     //console.log(ftd);
    //     console.log(str);

    //     while (str.lastIndexOf('.') > -1) {
    //       const index = str.lastIndexOf('.');
    //       str = str.substring(0, index);
    //       if (filteredTreeData1.findIndex(t => t.code === str) === -1) {
    //         const obj = this.treeData.find(d => d.code === str);
    //         if (obj) {
    //           filteredTreeData1.push(obj);
    //         }
    //       }
    //     }
    //     // fin while
    //   });
    //   filteredTreeData=filteredTreeData1;

    // } else {
    //   filteredTreeData = this.treeData;
    // }
    // // Build the tree nodes from Json object. The result is a list of `TodoItemNode` with nested
    // // file node as children.
    //  const data = this.buildFileTree(filteredTreeData, '0');
    //   // Notify the change.
    //   this.dataChange.next(data);
    //   console.log(data);
  }

  filterChanged(event: Event) {
    //console.log(event);
    let filterText = (event.target as HTMLInputElement).value;
   // console.log(filterText);
    this.filter(filterText);
    if (filterText) {
      this.treeControl.expandAll();
    } else {
      this.treeControl.collapseAll();
    }
  }

  /** fin metodos control treeview */

  onDarkModeSwitched({ checked }: MatSlideToggleChange) {
   // console.log(checked);
    this.darkModeSwitched.emit(checked);
  }

  /***toggle dark */
  toggleDarkMode() {
    this.isDarkMode = this.themeService.isDarkMode();
    if (this.isDarkMode) {
      this.nombreModo = 'CAMBIAR A MODO DARK';
      this.themeService.update('light-mode');
    } else {
      this.nombreModo = 'CAMBIAR A MODO LIGHT';
      this.themeService.update('dark-mode');
    }
    // this.isDarkMode
    //   ?this.themeService.update('light-mode')
    //   :this.themeService.update('dark-mode');
  }
}
