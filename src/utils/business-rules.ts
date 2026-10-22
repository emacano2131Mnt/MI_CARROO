export type ActivityForStatus = {
  paused: number;
  due_date: string | null;
  due_mileage: number | null;
  mileage: number;
  advance_days: number;
  advance_km: number;
};

export type ActivityStatus = 'Al día' | 'Próxima' | 'Vencida' | 'Sin programación' | 'Pausada';

export function addDays(date: string, days: number) {
  const value = new Date(`${date}T12:00:00`);
  value.setDate(value.getDate() + days);
  return value.toISOString().slice(0, 10);
}

export function activityStatus(activity: ActivityForStatus, today: string): ActivityStatus {
  if (activity.paused) return 'Pausada';
  if (!activity.due_date && activity.due_mileage == null) return 'Sin programación';
  const overdueByDate = activity.due_date !== null && activity.due_date < today;
  const overdueByMileage = activity.due_mileage !== null && activity.mileage >= activity.due_mileage;
  if (overdueByDate || overdueByMileage) return 'Vencida';
  const upcomingByDate = activity.due_date !== null && activity.due_date <= addDays(today, activity.advance_days);
  const upcomingByMileage = activity.due_mileage !== null && activity.mileage >= activity.due_mileage - activity.advance_km;
  return upcomingByDate || upcomingByMileage ? 'Próxima' : 'Al día';
}

export function nextDue(date: string, mileage: number, periodDays: number | null, periodKm: number | null) {
  return {
    dueDate: periodDays === null ? null : addDays(date, periodDays),
    dueMileage: periodKm === null ? null : mileage + periodKm,
  };
}

export function serviceTotal(labor: number, parts: number, other: number) {
  if ([labor, parts, other].some(value => !Number.isFinite(value) || value < 0)) {
    throw new Error('Los costos deben ser importes no negativos.');
  }
  return labor + parts + other;
}

export function isValidISODate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function isAllowedServiceDate(value: string, today: string) {
  return isValidISODate(value) && value <= today;
}
