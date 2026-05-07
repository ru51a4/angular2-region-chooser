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
  public ff: any = [];
  public markers: any = [];
  private destroy$ = new Subject<void>();
  public regions: RegionItem[] = [];
  public ddata: any = {};

  constructor(public service: RegionService, public http: HttpClient) {

  }


  ngOnInit(): void {
    this.http.get<JsonRegion>('/assets/regions.json').subscribe((data: JsonRegion) => {
      this.regions = data.data;
      let arr = this.regions
      let hasChild: any = {};
      let counter = 1;
      let lvl = 1;
      let fff: any = {}
      let getLvl = (item: any) => {
        item.left = counter++;
        item.lvl = lvl
        if (!hasChild[item.ParentID]) {
          hasChild[item.ParentID] = []
        }
        hasChild[item.ParentID].push(item.RegionID)
        let childs = arr.filter((c) => c["ParentID"] === item["RegionID"]);

        childs.forEach((item) => {
          lvl++
          getLvl(item);
          lvl--
        });
        item.right = counter++

        fff[item.RegionID] = { title: item.RegionName, lvl: item.lvl, left: item.left, right: item.right }
      };
      getLvl(arr.find((c) => c["ParentID"] === null))
      this.service.hasChild.next(hasChild)
      this.service.regionDictionary.next(fff);
      this.ddata = fff

      combineLatest([
        this.service.vote,
        this.service.voteminus,
      ]).
        pipe(takeUntil(this.destroy$))
        .subscribe((d: any) => {
          this.markers = [...d[0].map((c: any) => {
            return { id: c, type: '+' }
          }), ...d[1].map((c: any) => {
            return { id: c, type: '-' }
          })].sort((a, b) => a.id - b.id)
        })
    })
  }

  change(e: any) {
    let ch = e.target.value;
    //
    let step2 = [];
    let lvl1 = this.regions.filter((item: any) => {
      return (ch.length > 2) ? (item["RegionName"].toLowerCase().includes(ch.toLowerCase())) : false;
    })
    this.service.typing.next(lvl1.map((c: any) => c.RegionID))
    let checkboxvote = this.service.vote.getValue();
    step2 = [...lvl1, ...checkboxvote.map((id: any) => this.regions.find((c) => c["RegionID"] == id))];
    let mergeres: any = [];
    let tmp: any = [];
    let merge = (item: any) => {
      if (tmp.map((c: any) => c["id"]).includes(item["RegionID"])) {
        return;
      } else {
        mergeres.push(item);
        tmp.push({ "id": item["RegionID"] });
      }

      let deep = (d: any) => {
        if (tmp.map((c: any) => c["id"]).includes(d["RegionID"])) {
          return;
        } else {
          mergeres.push(d);
          tmp.push({ "id": d["RegionID"] });
          if (d["ParentID"] !== null || d["ParentID"] === 0) {
            deep(this.regions.find((c) => c["RegionID"] === d["ParentID"]));
          }
        }
      }
      if (item["ParentID"] !== null || item["ParentID"] === 0) {
        deep(this.regions.find((c) => c["RegionID"] === item["ParentID"]));
      }
    }
    [...step2].forEach((item) => {
      merge(item);
    })
    step2 = mergeres;
    this.ff.forEach((id: any) => {
      this.resizedel(id);

    })
    this.ff = mergeres.map((c: any) => c.RegionID)
    this.ff.forEach((id: any) => {
      this.resize2(id);
    });
    //
  }

  resizedel(id: Number) {
    let arr = this.service.resizeT.getValue();
    this.service.resizeT.next(arr.filter((c: any) => c !== id));
  }

  resize2(id: Number) {
    let arr = this.service.resizeT.getValue();
    this.service.resizeT.next([...arr, id]);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
