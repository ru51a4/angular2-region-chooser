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
    this.service._resize(id)
  }

  vvote(id: Number) {
    return this.service.vvote(id);
  }

  vote(id: Number) {
    this.service.voteEvent(id)
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
