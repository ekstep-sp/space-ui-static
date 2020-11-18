import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatButtonModule, MatIconModule, MatMenuModule } from '@angular/material'

import { BtnCatalogComponent } from './btn-catalog.component'
import { TreeCatalogModule } from '../tree-catalog/tree-catalog.module'
import { UploadService } from '@ws/author/src/lib/routing/modules/editor/shared/services/upload.service'

@NgModule({
  declarations: [BtnCatalogComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    TreeCatalogModule,
  ],
  entryComponents: [BtnCatalogComponent],
  providers: [UploadService],
})
export class BtnCatalogModule { }
