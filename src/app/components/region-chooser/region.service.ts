import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, combineLatest, takeUntil, } from "rxjs";
import { HasChild, JsonRegion, RegionDictionary, RegionItem } from './interfaces/Interfaces';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class RegionService {

    public hasChild: BehaviorSubject<HasChild> = new BehaviorSubject<HasChild>({})
    public resize: BehaviorSubject<Number[]> = new BehaviorSubject<Number[]>([0]);
    public resizeT: BehaviorSubject<Number[]> = new BehaviorSubject<Number[]>([0]);
    public typing: BehaviorSubject<Number[]> = new BehaviorSubject<Number[]>([]);

    public vote: BehaviorSubject<Number[]> = new BehaviorSubject<Number[]>([]);
    public voteminus: BehaviorSubject<Number[]> = new BehaviorSubject<Number[]>([]);

    public regionDictionary: BehaviorSubject<RegionDictionary> = new BehaviorSubject<RegionDictionary>({});

    //
    public ff: any = [];
    public markers: BehaviorSubject<any> = new BehaviorSubject<any>([]);
    public regions: RegionItem[] = [];
    public _regions: BehaviorSubject<any> = new BehaviorSubject<any>([]);

    private destroy$ = new Subject<void>();

    constructor(public http: HttpClient) {

    }

    /**
     * Инициализация
     * */
    init() {
        this.http.get<JsonRegion>('/assets/regions.json').subscribe((data: JsonRegion) => {
            this.regions = data.data;
            let arr = this.regions
            this._regions.next(this.regions);
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
            this.hasChild.next(hasChild)
            this.regionDictionary.next(fff);

            combineLatest([
                this.vote,
                this.voteminus,
            ]).
                pipe(takeUntil(this.destroy$))
                .subscribe((d: any) => {
                    this.markers.next([...d[0].map((c: any) => {
                        return { id: c, type: '+' }
                    }), ...d[1].map((c: any) => {
                        return { id: c, type: '-' }
                    })].sort((a, b) => a.id - b.id))
                })
        })
    }

    /**
    * Обработка ввода поиска
    */
    typingEvent(ch: String) {
        let step2 = [];
        let lvl1 = this.regions.filter((item: any) => {
            return (ch.length > 2) ? (item["RegionName"].toLowerCase().includes(ch.toLowerCase())) : false;
        })
        this.typing.next(lvl1.map((c: any) => c.RegionID))
        let checkboxvote = this.vote.getValue();
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
        let resizedel = (id: any) => {
            let arr = this.resizeT.getValue();
            this.resizeT.next(arr.filter((c: any) => c !== id));
        }
        let resize2 = (id: any) => {
            let arr = this.resizeT.getValue();
            this.resizeT.next([...arr, id]);
        }
        this.ff.forEach((id: any) => {
            resizedel(id);

        })
        this.ff = mergeres.map((c: any) => c.RegionID)
        this.ff.forEach((id: any) => {
            resize2(id);
        });
        //
    }

    /**
    * Определение состояния чекбокса региона
    */
    vvote(id: Number) {

        let arrVote = this.vote.getValue();

        let arrMinus = this.voteminus.getValue();

        let open = this.getUpOpenLvl(id) ?? 1;
        let close = this.getUpClosedLvl(id) ?? -1

        return (arrVote.includes(id) || (this.getUpOpenLvl(id) && close < open)) && !arrMinus.includes(id)
    }

    /**
    * Переключение состояния чекбокса
    */
    voteEvent(id: Number) {

        let open = this.getUpOpenLvl(id);
        let closed = this.getUpClosedLvl(id);

        if (!open && !closed) {
            this.toggle(this.vote, id)
        }
        if (open && !closed) {
            this.toggle(this.voteminus, id)
        }
        if (open && closed && open > closed) {
            this.toggle(this.voteminus, id)
        }
        if (open && closed && open < closed) {
            this.toggle(this.vote, id)
        }

        //Удалить все "выбранные" дети текущего vote
        let clearv = this.vote.getValue();
        clearv = clearv.filter((c: Number) => {
            return !this.isChild(c, [id]);
        })
        this.vote.next(clearv)

        let clearminus = this.voteminus.getValue();
        clearminus = clearminus.filter((c: Number) => {
            return !this.isChild(c, [id]);
        })
        this.voteminus.next(clearminus)
    }


    // ========== UTILS ==========

    /**
     * Проверка, является ли регион дочерним для одного из родителей
     */
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

    _destroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
}