// An inclusive range of dates, either end may be missing. Dates are stored at midnight UTC, so the range
// compares whole days.
export interface DateRangeDto {
  from?: Date;
  to?: Date;
}
