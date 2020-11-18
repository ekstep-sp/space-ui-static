import { Component, Input, OnChanges } from '@angular/core'
import { NsWidgetResolver, WidgetBaseComponent } from '@ws-widget/resolver'
import { IWsTree } from './tree.model'
import { NestedTreeControl } from '@angular/cdk/tree'
import { MatTreeNestedDataSource } from '@angular/material'
import { TreeCatalogService } from '../tree-catalog/tree-catalog.service'

@Component({
  selector: 'ws-widget-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.scss'],
})
export class TreeComponent extends WidgetBaseComponent
  implements OnChanges, NsWidgetResolver.IWidgetData<IWsTree[]> {
  @Input() widgetData!: IWsTree[]
  tempExploreCatalog: any
  finalCatalogItems: any
  filteredCatalogItems: any
  nestedTreeControl: NestedTreeControl<IWsTree>
  nestedDataSource: MatTreeNestedDataSource<IWsTree>

  hasNestedChild = (_: number, nodeData: IWsTree) =>
    nodeData && nodeData.children && nodeData.children.length

  private getChildren = (node: any) => {

    return node && node.children ? node.children : []
  }

  constructor(private catalogSvc: TreeCatalogService) {
    super()
    this.nestedTreeControl = new NestedTreeControl<IWsTree>(this.getChildren)
    this.nestedDataSource = new MatTreeNestedDataSource()
  }

  ngOnChanges() {
    this.mergeCatalogNode(this.widgetData)
    if (this.widgetData) {
      this.nestedDataSource.data = this.finalCatalogItems || []
    }
  }
   mergeCatalogNode(catalogElem: any) {
    // tslint:disable-next-line:no-parameter-reassignment
   //  catalogElem =  sortBy(this.catalogItems, 'value')
    this.catalogSvc.fetchCatalog().subscribe((res: any) => {
    this.tempExploreCatalog = res.Common.child
    this.finalCatalogItems = catalogElem
        catalogElem.forEach((catalog: any) => {
           // tslint:disable-next-line:no-shadowed-variable
            this.tempExploreCatalog.forEach((parent: any, index: any) => {
           if (catalog.value === parent.name) {
             catalog.nodeId = parent.nodeId
             parent.child = parent.child.filter((v: any, i: any) => parent.child.findIndex((item: any) => item.name === v.name) === i)
             this.finalCatalogItems[index].children = parent.child
             if (catalog.children.length > 0) {
               this.mergeChildNode(parent, catalog, index)
              }
           }
 })
 })
 this.nestedDataSource.data = this.finalCatalogItems
 console.log(this.widgetData, this.finalCatalogItems)
})
// console.log(this.nestedDataSource.data)
   }
 mergeChildNode(parent: any, catalog: any, index1: any) {
   // tslint:disable-next-line:no-parameter-reassignment
   if (parent.child) {
   catalog.children.forEach((catalogChild: any) => {
     parent.child.forEach((child: any, index: any) => {
       if (catalogChild.value === child.name) {
         catalogChild.nodeId = child.nodeId
         child.child = child.child.filter((objOne: any) => {
          return catalogChild.children.some((objTwo: any) => {
              return objOne.name === objTwo.value
          })
        })
        this.finalCatalogItems[index1].children[index].children = child.child
         if (catalogChild.children.length > 0) {
           this.mergeGrandChildren(child , catalogChild, index1, index)
        }
         }
     })
   })
 }
 }
 mergeGrandChildren(firstChild: any, catalogChild: any, index1: any, index2: any) {
   // tslint:disable-next-line:max-line-length
   if (firstChild.child) {
    catalogChild.children.forEach((catalogGrandChild: any) => {
      firstChild.child.forEach((grandChild: any, index: any) => {
       if (catalogGrandChild.value === grandChild.name) {
         catalogGrandChild.nodeId = grandChild.nodeId
         this.finalCatalogItems[index1].children[index2].children[index] = grandChild.child
         }
      })
    })
   }
 }
}
