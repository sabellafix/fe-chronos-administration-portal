// DTOs para Dashboard
export interface DashboardMetricsDto {
    kpiCards?: KpiCardsDto;
    revenueChart?: RevenueChartDto;
    revenueActivity?: RevenueActivityDto;
    orderStats?: OrderStatsDto;
    topServices?: TopServiceDto[];
}

export interface KpiCardsDto {
    actualOperation: number;
    actualOperationChange: number;
    dailyRevenue: number;
    dailyRevenueChange: number;
    ongoingBookings: number;
    ongoingBookingsChange: number;
}

export interface RevenueChartDto {
    revenueThisMonth: number;
    revenueChangePercentage: number;
    orders: number;
    sales: number;
    orderValue: number;
    customers: number;
    income: number;
    expenses: number;
    monthlyData?: MonthlyRevenueDto[];
}

export interface MonthlyRevenueDto {
    month?: string;
    currentYearRevenue: number;
    previousYearRevenue: number;
}

export interface RevenueActivityDto {
    thisWeekTotal: number;
    weeklyData?: DailyRevenueDto[];
}

export interface DailyRevenueDto {
    dayOfWeek?: string;
    date: Date;
    currentWeekRevenue: number;
    previousWeekRevenue: number;
}

export interface OrderStatsDto {
    completed: number;
    pending: number;
    cancelled: number;
    total: number;
    completedPercentage: number;
    pendingPercentage: number;
    cancelledPercentage: number;
}

export interface TopServiceDto {
    rank: number;
    serviceId: string;
    serviceName?: string;
    price: number;
    bookingsCount: number;
    totalRevenue: number;
    formattedRevenue?: string;
}

export interface SalonOccupancyDto {
    occupancyThisMonth: number;
    occupancyChangePercentage: number;
    totalHoursWorked: number;
    totalAvailableHours: number;
    activeStylists: number;
    workingDays: number;
    monthlyData?: MonthlyOccupancyDto[];
}

export interface MonthlyOccupancyDto {
    month?: string;
    currentYearOccupancy: number;
    previousYearOccupancy: number;
    hoursWorked: number;
    activeStylists: number;
}
