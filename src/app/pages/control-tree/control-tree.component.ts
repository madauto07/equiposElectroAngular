import { Component, OnInit } from '@angular/core';
import {FlatTreeControl} from '@angular/cdk/tree';
import { BehaviorSubject } from 'rxjs';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import { SelectionModel } from '@angular/cdk/collections';
import { SeguridadService } from '../../core/_service/seguridad.service';
import { Subscription } from 'rxjs';
import { MediaObserver, MediaChange } from '@angular/flex-layout';

export class TreeItemNode {
  children: TreeItemNode[]  = [];
  item: string = '';
  code: string = '';
  link: string = '';
}

/** Flat to-do item node with expandable and level information */
export class TreeItemFlatNode {
  item: string = '';
  level: number = 0;
  expandable : boolean = true;
  code: string = '';
  link: string = '';
}

@Component({
  selector: 'app-control-tree',
  templateUrl: './control-tree.component.html',
  styles: [
  ]
})
export class ControlTreeComponent implements OnInit {

  public menuItems: Array<any>;
  dataChange = new BehaviorSubject<TreeItemNode[]>([]);
  treeData: any[]=[];
  get data(): TreeItemNode[] { return this.dataChange.value; }
   // codigo treeview
flatNodeMap = new Map<TreeItemFlatNode, TreeItemNode>();
/** Map from nested node to flattened node. This helps us to keep the same object for selection */
nestedNodeMap = new Map<TreeItemNode, TreeItemFlatNode>();
/** A selected parent node to be inserted */
selectedParent: TreeItemFlatNode | null = null;
/** The new item's name */
newItemName = '';
 treeControl?: FlatTreeControl<TreeItemFlatNode>;
treeFlattener: MatTreeFlattener<TreeItemNode, TreeItemFlatNode>;
dataSource: MatTreeFlatDataSource<TreeItemNode, TreeItemFlatNode>;
/** The selection for checklist */
checklistSelection = new SelectionModel<TreeItemFlatNode>(false /* multiple */);


  constructor( public loginService:SeguridadService,) { 
    this.initialize();

    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel,
      this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<TreeItemFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    this.dataChange.subscribe(data => {
      this.dataSource.data = data;
    });

    this.menuItems = this.loginService.menu;


  }

  getLevel = (node: TreeItemFlatNode) => node.level;
  isExpandable = (node: TreeItemFlatNode) => node.expandable;
  getChildren = (node: TreeItemNode): TreeItemNode[] => node.children;
  hasChild = (_: number, _nodeData: TreeItemFlatNode) => _nodeData.expandable;
  transformer = (node: TreeItemNode, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode = existingNode && existingNode.item === node.item
      ? existingNode
      : new TreeItemFlatNode();
    flatNode.item = node.item;
    flatNode.level = level;
    flatNode.code = node.code;
    flatNode.link = node.link;
    flatNode.expandable = node.children && node.children.length > 0;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  }

  ngOnInit(): void {

  }

  initialize() {
    this.treeData = this.loginService.menu;
     //     file node as children.
     const data = this.buildFileTree(this.loginService.menu, '0');
     // Notify the change.
     this.dataChange.next(data); 
   // console.log(this.treeData);
   }


  buildFileTree(obj: any[]=[], level: string): TreeItemNode[] {
    return obj.filter(o =>
      (<string>o.code).startsWith(level + '.')
      && (o.code.match(/\./g) || []).length === (level.match(/\./g) || []).length + 1
    )
      .map(o => {
        const node = new TreeItemNode();
        node.item = o.text;
        node.code = o.code;
        node.link = o.link;
        const children = obj.filter(so => (<string>so.code).startsWith(level + '.'));
        if (children && children.length > 0) {
          node.children = this.buildFileTree(children, o.code);
        }
        return node;
      });
  }
  
  //NUEVO filter data
  public filter(filterText: string) {
  
    let menutree: any[];
    menutree=this.treeData;
    
    let filteredTreeData;
    if (filterText) {
    let  filteredTreeData1 = menutree.filter(d => d.text.toLocaleLowerCase().indexOf(filterText.toLocaleLowerCase()) > -1);
      Object.assign([], filteredTreeData1).forEach(ftd => {
        let str = (<string>ftd);
       // console.log(ftd);
       // console.log(str);

        // while (str.lastIndexOf('.') > -1) {
        //   const index = str.lastIndexOf('.');
        //   str = str.substring(0, index);
        //   if (filteredTreeData1.findIndex(t => t.code === str) === -1) {
        //     const obj = this.treeData.find(d => d.code === str);
        //     if (obj) {
        //       filteredTreeData1.push(obj);
        //     }
        //   }
        // }
        // fin while
      });
      filteredTreeData=filteredTreeData1;

    } else {
      filteredTreeData = this.treeData;
    }
  
    // Build the tree nodes from Json object. The result is a list of `TodoItemNode` with nested
      // file node as children.
      const data = this.buildFileTree(filteredTreeData, '0');
       // Notify the change.
      this.dataChange.next(data);
     // console.log(data);

  }
  

}
