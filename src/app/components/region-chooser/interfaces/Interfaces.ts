export interface RegionItem {
    RegionID: Number;
    RegionName: String;
    ParentID: Number;
}
export interface JsonRegion {
    type: String;
    data: RegionItem[];
}

export interface RegionItemInfo {
    title: string;
    lvl: number;
    left: number;
    right: number;
}

export interface RegionDictionary {
    [regionId: string]: RegionItemInfo;
}

export interface HasChild {
    [regionId: string]: any;
}
