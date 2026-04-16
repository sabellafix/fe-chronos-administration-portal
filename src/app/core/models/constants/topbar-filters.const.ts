
export class TopbarFiltersConst {
    public static readonly _DATE_RANGE: string = "dateRange";
    
    public static readonly _STYLIST: string = "stylist";
    
    public static readonly _SALON: string = "salon";
}

export interface RouteFilterConfig {
    route: string;
    enabledFilters: string[];
}

export const ROUTE_FILTER_CONFIGURATIONS: RouteFilterConfig[] = [
    {
        route: '/dashboard',
        enabledFilters: [
            TopbarFiltersConst._DATE_RANGE,
            TopbarFiltersConst._STYLIST,
            TopbarFiltersConst._SALON
        ]
    },
    {
        route: '/calendar',
        enabledFilters: [
            TopbarFiltersConst._SALON
        ]
    },
    {
        route: '/bookings',
        enabledFilters: [
            TopbarFiltersConst._SALON
        ]
    },
    {
        route: '/chat',
        enabledFilters: [
            TopbarFiltersConst._SALON
        ]
    },
    {
        route: '/users',
        enabledFilters: [
            TopbarFiltersConst._SALON
        ]
    },
    {
        route: '/services',
        enabledFilters: [
            TopbarFiltersConst._SALON
        ]
    },
    {
        route: '/salons',
        enabledFilters: [
            TopbarFiltersConst._SALON
        ]
    }
,];
