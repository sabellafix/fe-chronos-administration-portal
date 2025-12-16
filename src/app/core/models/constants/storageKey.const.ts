const USER_LOGGED : string = "USER_LOGGED";
const TOKEN : string = "TOKEN";
const USER : string = "USER";
const EXPIRES_AT : string = "EXPIRES_AT";
const ROLE : string = "ROLE";
const SALONS : string = "SALONS";

const DASHBOARD_METRICS : string = "DASHBOARD_METRICS";
const DASHBOARD_KPI_CARDS : string = "DASHBOARD_KPI_CARDS";
const DASHBOARD_REVENUE_CHART : string = "DASHBOARD_REVENUE_CHART";
const DASHBOARD_REVENUE_ACTIVITY : string = "DASHBOARD_REVENUE_ACTIVITY";
const DASHBOARD_SALON_OCCUPANCY : string = "DASHBOARD_SALON_OCCUPANCY";

export abstract class StorageKeyConst {
    public static readonly _USER_LOGGED: string = USER_LOGGED;
    public static readonly _TOKEN: string = TOKEN;
    public static readonly _USER: string = USER;
    public static readonly _EXPIRES_AT: string = EXPIRES_AT;
    public static readonly _ROLE: string = ROLE;
    public static readonly _SALONS: string = SALONS;
    
    // Dashboard cache
    public static readonly _DASHBOARD_METRICS: string = DASHBOARD_METRICS;
    public static readonly _DASHBOARD_KPI_CARDS: string = DASHBOARD_KPI_CARDS;
    public static readonly _DASHBOARD_REVENUE_CHART: string = DASHBOARD_REVENUE_CHART;
    public static readonly _DASHBOARD_REVENUE_ACTIVITY: string = DASHBOARD_REVENUE_ACTIVITY;
    public static readonly _DASHBOARD_SALON_OCCUPANCY: string = DASHBOARD_SALON_OCCUPANCY;
}


