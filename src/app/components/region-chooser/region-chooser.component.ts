import { Component, Input, OnInit } from '@angular/core';
import { combineLatest, map, shareReplay } from 'rxjs';
import { GlobalService } from 'src/app/global.service';
@Component({
  selector: 'region-chooser',
  templateUrl: './region-chooser.component.html',
  styleUrls: ['./region-chooser.component.scss']
})
export class RegionChooserComponent implements OnInit {
  public ff: any = [];
  public markers: any = [];
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
  resizedel(id: any) {
    let ff = this.service.resizeT.getValue();
    if (ff.includes(id)) {
      this.service.resizeT.next(ff.filter((c: any) => c !== id));
    } else {
    }
  }
  resize2(id: any) {
    let ff = this.service.resizeT.getValue();
    if (ff.includes(id)) {
      return;
    } else {
      this.service.resizeT.next([...ff, id]);
    }
  }
  public regions = [];
  public lvl: any = [];

  constructor(public service: GlobalService) {

  }

  public asd: any = {};

  ngOnInit(): void {
    fetch('/assets/regions.json')
      .then(response => response.json())
      .then(data => {
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
        this.service.nestedset.next(fff);
        this.asd = fff

        combineLatest([
          this.service.vote,
          this.service.voteminus,
        ]).subscribe((d: any) => {
          this.markers = [...d[0].map((c: any) => {
            return { id: c, type: '+' }
          }), ...d[1].map((c: any) => {
            return { id: c, type: '-' }
          })].sort((a, b) => a.id - b.id)
        })
      });
  }
}
