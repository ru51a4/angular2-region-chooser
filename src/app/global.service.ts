import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { BehaviorSubject, Subject, forkJoin, switchMap } from "rxjs";
import { tick } from '@angular/core/testing';

@Injectable({
    providedIn: 'root'
})
export class GlobalService {
    service: any;
    public hasChild: any = new BehaviorSubject({})
    public resize: any = new BehaviorSubject([0]);
    public resizeT: any = new BehaviorSubject([0]);
    public typing: any = new BehaviorSubject([]);

    public vote: any = new BehaviorSubject([]);
    public voteminus: any = new BehaviorSubject([]);

    public nestedset: any = new BehaviorSubject([]);

    constructor(public http: HttpClient) {
    }


    findChilds = (findId: any, vw: any, full = false) => {
    }

}