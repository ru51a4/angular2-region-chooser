import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject, combineLatest, map, shareReplay, takeUntil } from 'rxjs';
import { RegionService } from './region.service';
import { HttpClient } from '@angular/common/http';
import { JsonRegion, RegionItem } from './interfaces/Interfaces';
@Component({
  selector: 'region-chooser',
  templateUrl: './region-chooser.component.html',
  styleUrls: ['./region-chooser.component.scss']
})
export class RegionChooserComponent implements OnInit, OnDestroy {

  constructor(public service: RegionService, public http: HttpClient) {

  }
  public ddata: any = {};
  public markers: any = {};
  public regions: RegionItem[] = [];
  private destroy$ = new Subject<void>();


  ngOnInit(): void {
    this.service.init();
    this.service.regionDictionary
      .pipe(takeUntil(this.destroy$))
      .subscribe((ddata: any) => {
        this.ddata = ddata;
      })
    this.service.markers
      .pipe(takeUntil(this.destroy$))
      .subscribe((markers: any) => {
        this.markers = markers;
      });
    this.service._regions
      .pipe(takeUntil(this.destroy$))
      .subscribe((_regions: any) => {
        this.regions = _regions;
      });
  }

  change(e: any) {
    let ch = e.target.value;
    this.service.typingEvent(ch);
  }

  ngOnDestroy(): void {
    this.service._destroy();
    this.destroy$.next();
    this.destroy$.complete();
  }

}
