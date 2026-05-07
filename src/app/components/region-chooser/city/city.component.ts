import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { RegionService } from '../region.service';
import { RegionItem } from '../interfaces/Interfaces';
@Component({
  selector: 'city',
  templateUrl: './city.component.html',
  styleUrls: ['./city.component.scss']
})
export class CityComponent implements OnInit, OnChanges {
  @Input() data: RegionItem[] = [];
  @Input() id: Number = 1;
  public cities: RegionItem[] = [];
  public childCities: RegionItem[] = [];
  constructor(public service: RegionService) {

  }

  open(id: Number) {
    return this.service.resize.getValue().includes(id) || this.service.vote.getValue().includes(id) || this.service.resizeT.getValue().includes(id)
  }

  hasChild(id: any) {
    return this.service.hasChild.getValue()[id]?.length ?? null;
  }

  hasTyping(id: Number) {
    return this.service.typing.getValue().includes(id);
  }

  resize(id: Number) {
    this.service.toggle(this.service.resize, id)
  }

  vvote(id: Number) {

    let arrVote = this.service.vote.getValue();

    let arrMinus = this.service.voteminus.getValue();

    let open = this.service.getUpOpenLvl(id) ?? 1;
    let close = this.service.getUpClosedLvl(id) ?? -1

    return (arrVote.includes(id) || (this.service.getUpOpenLvl(id) && close < open)) && !arrMinus.includes(id)
  }

  vote(id: Number) {

    let open = this.service.getUpOpenLvl(id);
    let closed = this.service.getUpClosedLvl(id);

    if (!open && !closed) {
      this.service.toggle(this.service.vote, id)
    }
    if (open && !closed) {
      this.service.toggle(this.service.voteminus, id)
    }
    if (open && closed && open > closed) {
      this.service.toggle(this.service.voteminus, id)
    }
    if (open && closed && open < closed) {
      this.service.toggle(this.service.vote, id)
    }

    //Удалить все "выбранные" дети текущего vote
    let clearv = this.service.vote.getValue();
    clearv = clearv.filter((c: Number) => {
      return !this.service.isChild(c, [id]);
    })
    this.service.vote.next(clearv)

    let clearminus = this.service.voteminus.getValue();
    clearminus = clearminus.filter((c: Number) => {
      return !this.service.isChild(c, [id]);
    })
    this.service.voteminus.next(clearminus)
  }

  ngOnInit(): void {
  }

  ngOnChanges() {
    this.cities = this.data.filter((c: RegionItem) => {
      return c.RegionID === this.id
    })
    this.childCities = this.data.filter((c: RegionItem) => {
      return c.ParentID === this.id
    })

  }
}
