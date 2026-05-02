
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DEFAULT_OPTIONS, MatDialogModule } from '@angular/material/dialog';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { NgxGalleryModule } from '@kolkov/ngx-gallery';
import { RegionChooserComponent } from './components/region-chooser/region-chooser.component';
import { CityComponent } from './components/region-chooser/city/city.component';

import { MatCheckboxModule } from '@angular/material/checkbox';



@NgModule({
    declarations: [RegionChooserComponent, CityComponent],
    imports: [
        CommonModule,
        FormsModule,
        MatDialogModule,
        ReactiveFormsModule,
        NgxMaskDirective,
        MatCheckboxModule
    ],
    providers: [
        provideNgxMask(),
        { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { hasBackdrop: true } }
    ],
    exports: [RegionChooserComponent]
})
export class SharedModule {
}
