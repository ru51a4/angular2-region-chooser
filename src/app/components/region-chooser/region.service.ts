import { Injectable } from '@angular/core';
import { BehaviorSubject, } from "rxjs";
import { HasChild, RegionDictionary } from './interfaces/Interfaces';

@Injectable({
    providedIn: 'root'
})
export class RegionService {
    service: any;
    public hasChild: BehaviorSubject<HasChild> = new BehaviorSubject<HasChild>({})
    public resize: BehaviorSubject<Number[]> = new BehaviorSubject<Number[]>([0]);
    public resizeT: BehaviorSubject<Number[]> = new BehaviorSubject<Number[]>([0]);
    public typing: BehaviorSubject<Number[]> = new BehaviorSubject<Number[]>([]);

    public vote: BehaviorSubject<Number[]> = new BehaviorSubject<Number[]>([]);
    public voteminus: BehaviorSubject<Number[]> = new BehaviorSubject<Number[]>([]);

    public regionDictionary: BehaviorSubject<RegionDictionary> = new BehaviorSubject<RegionDictionary>({});

    isChild(id: any, parents: any[]): Number | null {
        let regionDictionary = this.regionDictionary.getValue();
        let arrParents = parents
        let lvls = [];
        let cur = regionDictionary[id];
        for (let i = 0; i <= arrParents.length - 1; i++) {
            if (regionDictionary[arrParents[i]].left < cur.left && regionDictionary[arrParents[i]].right > cur.right) {
                lvls.push(regionDictionary[arrParents[i]].lvl)
            }
        }
        return lvls.length ? Math.max(...lvls) : null;
    }

    getUpOpenLvl(id: any) {
        let arr = this.vote.getValue()
        return this.isChild(id, arr)
    }

    getUpClosedLvl(id: any) {
        let arr = this.voteminus.getValue()
        return this.isChild(id, arr)
    }

    toggle(Subject: BehaviorSubject<any>, item: any) {
        let arr = Subject.getValue();
        if (arr.includes(item)) {
            Subject.next(arr.filter((c: any) => c !== item))
        } else {
            Subject.next([...arr, item]);
        }

    }
}