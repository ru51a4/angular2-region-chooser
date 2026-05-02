import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { GlobalService } from 'src/app/global.service';
@Component({
  selector: 'city',
  templateUrl: './city.component.html',
  styleUrls: ['./city.component.scss']
})
export class CityComponent implements OnInit, OnChanges {
  @Input() data = [];
  @Input() id = 1;
  public cities: any = [];
  public childCities: any = [];
  constructor(public service: GlobalService) {

  }
  oopen(id: any, _ff: any = null) {
    let nestedset = this.service.nestedset.getValue();
    let vv = _ff ?? this.service.vote.getValue();
    let f = [];
    let cur = nestedset[id];
    for (let i = 0; i <= vv.length - 1; i++) {
      if (nestedset[vv[i]].left < cur.left && nestedset[vv[i]].right > cur.right) {
        f.push(nestedset[vv[i]].lvl)
      }
    }
    return f.length ? Math.max(...f) : null;
  }
  close(id: any, _ff: any = null) {
    let nestedset = this.service.nestedset.getValue();
    let vv = _ff ?? this.service.voteminus.getValue()
    let f = [];
    let cur = nestedset[id];
    for (let i = 0; i <= vv.length - 1; i++) {
      if (nestedset[vv[i]].left < cur.left && nestedset[vv[i]].right > cur.right) {
        f.push(nestedset[vv[i]].lvl)
      }
    }
    return f.length ? Math.max(...f) : null;
  }
  open(id: any) {

    return this.service.resize.getValue().includes(id) || this.service.vote.getValue().includes(id) || this.service.resizeT.getValue().includes(id)

  }
  hasChild(id: any) {
    return this.service.hasChild.getValue()[id]?.length ?? null;
  }
  hasTyping(id: any) {
    return this.service.typing.getValue().includes(id);
  }
  resize(id: any) {
    let ff = this.service.resize.getValue();
    if (ff.includes(id)) {
      this.service.resize.next(ff.filter((c: any) => c !== id))
    } else {
      this.service.resize.next([...ff, id]);
    }

  }
  vvote(id: any) {

    let ff = this.service.vote.getValue();

    let o = this.oopen(id) ?? 1;
    let c = this.close(id) ?? -1

    return ff.includes(id) || (this.oopen(id) && c < o)
  }
  vote(id: any) {
    let open = this.oopen(id);
    let closed = this.close(id);
    if (!open && !closed) {
      let ff = this.service.vote.getValue();
      if (ff.includes(id)) {
        this.service.vote.next(ff.filter((c: any) => c !== id))
      } else {
        this.service.vote.next([...ff, id]);
      }
    }
    if (open && !closed) {
      let ff = this.service.voteminus.getValue();
      if (ff.includes(id)) {
        this.service.voteminus.next(ff.filter((c: any) => c !== id))
      } else {
        this.service.voteminus.next([...ff, id]);
      }
    }
    if (open && closed && open > closed) {
      let ff = this.service.voteminus.getValue();
      if (ff.includes(id)) {
        this.service.voteminus.next(ff.filter((c: any) => c !== id))
      } else {
        this.service.voteminus.next([...ff, id]);
      }
    }
    if (open && closed && open < closed) {
      let ff = this.service.vote.getValue();
      if (ff.includes(id)) {
        this.service.vote.next(ff.filter((c: any) => c !== id))
      } else {
        this.service.vote.next([...ff, id]);
      }
    }


    let nestedset = this.service.nestedset.getValue();

    let clearv = this.service.vote.getValue();



    clearv = clearv.filter((c: any) => {
      return !(nestedset[id].left < nestedset[c].left && nestedset[id].right > nestedset[c].right) || String(c) == String(id)
    })
    this.service.vote.next(clearv)
    let clearminus = this.service.voteminus.getValue();
    clearminus = clearminus.filter((c: any) => {
      return !(nestedset[id].left < nestedset[c].left && nestedset[id].right > nestedset[c].right) || String(c) == String(id)
    })
    this.service.voteminus.next(clearminus)



  }
  ngOnInit(): void {
  }
  ngOnChanges() {
    this.cities = this.data.filter((c: any) => {
      return c.RegionID === this.id
    })
    this.childCities = this.data.filter((c: any) => {
      return c.ParentID === this.id
    })

  }
}
