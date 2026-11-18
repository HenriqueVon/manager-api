// Month by month from the first date, never from the previous one: a due date on the 31st falls on the last
// day of the shorter months and returns to the 31st afterwards (31/01, 28/02, 31/03).
export function addMonths(firstDate: Date, months: number): Date {
  const year = firstDate.getUTCFullYear();
  const month = firstDate.getUTCMonth() + months;
  const lastDayOfMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

  return new Date(Date.UTC(year, month, Math.min(firstDate.getUTCDate(), lastDayOfMonth)));
}
