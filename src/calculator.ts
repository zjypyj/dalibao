export type CalculationMode = "n" | "n+1" | "2n";

export const HANGZHOU_PRIVATE_ANNUAL_AVERAGE_WAGE_2025 = 95_545;
export const HANGZHOU_PRIVATE_MONTHLY_AVERAGE_WAGE_2025 =
  HANGZHOU_PRIVATE_ANNUAL_AVERAGE_WAGE_2025 / 12;

export interface CalculationInput {
  monthlyAverageSalary: number;
  startDate: string;
  endDate: string;
  lastMonthSalary?: number;
  minimumMonthlyWage: number;
  localAverageMonthlyWage?: number;
  mode: CalculationMode;
}

export interface CalendarDuration {
  years: number;
  months: number;
  days: number;
}

export interface CalculationResult {
  mode: CalculationMode;
  total: number;
  nAmount: number;
  nCoefficient: number;
  rawNCoefficient: number;
  compensationBase: number;
  lastMonthSalary: number;
  duration: CalendarDuration;
  effectiveStartDate: string;
  usedMinimumWage: boolean;
  usedThreeTimesCap: boolean;
  usedTwelveYearCap: boolean;
  capChecked: boolean;
  hasPre2008Service: boolean;
  formula: string;
}

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

interface DateParts {
  year: number;
  month: number;
  day: number;
}

const LAW_EFFECTIVE_DATE = "2008-01-01";

const parseDate = (value: string): DateParts => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    throw new Error("日期格式无效");
  }

  const parts = {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  if (
    date.getUTCFullYear() !== parts.year ||
    date.getUTCMonth() + 1 !== parts.month ||
    date.getUTCDate() !== parts.day
  ) {
    throw new Error("日期无效");
  }
  return parts;
};

const toDateString = ({ year, month, day }: DateParts) =>
  `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

const compareDates = (left: DateParts, right: DateParts) => {
  const leftValue = left.year * 10000 + left.month * 100 + left.day;
  const rightValue = right.year * 10000 + right.month * 100 + right.day;
  return Math.sign(leftValue - rightValue);
};

const daysInMonth = (year: number, month: number) =>
  new Date(Date.UTC(year, month, 0)).getUTCDate();

const addYears = (date: DateParts, years: number): DateParts => ({
  year: date.year + years,
  month: date.month,
  day: Math.min(date.day, daysInMonth(date.year + years, date.month)),
});

const addMonths = (date: DateParts, months: number): DateParts => {
  const zeroBasedMonth = date.month - 1 + months;
  const year = date.year + Math.floor(zeroBasedMonth / 12);
  const month = ((zeroBasedMonth % 12) + 12) % 12 + 1;
  return {
    year,
    month,
    day: Math.min(date.day, daysInMonth(year, month)),
  };
};

const toUtcDate = (date: DateParts) =>
  new Date(Date.UTC(date.year, date.month - 1, date.day));

export const validateCalculationInput = (
  input: CalculationInput,
): ValidationResult => {
  if (!Number.isFinite(input.monthlyAverageSalary) || input.monthlyAverageSalary <= 0) {
    return { valid: false, message: "请输入大于 0 的前 12 个月平均工资" };
  }
  if (!input.startDate || !input.endDate) {
    return { valid: false, message: "请选择起算日期和礼包结算日期" };
  }
  if (!Number.isFinite(input.minimumMonthlyWage) || input.minimumMonthlyWage < 0) {
    return { valid: false, message: "最低工资不能小于 0" };
  }
  if (
    input.lastMonthSalary !== undefined &&
    (!Number.isFinite(input.lastMonthSalary) || input.lastMonthSalary < 0)
  ) {
    return { valid: false, message: "结算前一个月工资不能小于 0" };
  }
  if (
    input.localAverageMonthlyWage !== undefined &&
    (!Number.isFinite(input.localAverageMonthlyWage) ||
      input.localAverageMonthlyWage <= 0)
  ) {
    return { valid: false, message: "杭州职工月平均工资必须大于 0" };
  }

  try {
    const start = parseDate(input.startDate);
    const end = parseDate(input.endDate);
    if (compareDates(start, end) > 0) {
      return { valid: false, message: "礼包结算日期不能早于起算日期" };
    }
    if (compareDates(end, parseDate(LAW_EFFECTIVE_DATE)) < 0) {
      return {
        valid: false,
        message: "礼包结算日期早于 2008 年，本工具无法按现行规则估算",
      };
    }
  } catch {
    return { valid: false, message: "请输入有效日期" };
  }

  return { valid: true };
};

export const getCalendarDuration = (
  startDate: string,
  endDate: string,
): CalendarDuration => {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  let years = end.year - start.year;
  let anniversary = addYears(start, years);
  if (compareDates(anniversary, end) > 0) {
    years -= 1;
    anniversary = addYears(start, years);
  }

  let months = 0;
  while (months < 11 && compareDates(addMonths(anniversary, months + 1), end) <= 0) {
    months += 1;
  }

  const monthAnniversary = addMonths(anniversary, months);
  const days = Math.max(
    0,
    Math.round(
      (toUtcDate(end).getTime() - toUtcDate(monthAnniversary).getTime()) /
        86_400_000,
    ),
  );

  return { years, months, days };
};

export const calculateNCoefficient = (
  startDate: string,
  endDate: string,
): number => {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  let fullYears = end.year - start.year;
  let anniversary = addYears(start, fullYears);

  if (compareDates(anniversary, end) > 0) {
    fullYears -= 1;
    anniversary = addYears(start, fullYears);
  }

  if (compareDates(start, end) === 0) {
    return 0.5;
  }
  if (compareDates(anniversary, end) === 0) {
    return fullYears;
  }

  const sixMonthAnniversary = addMonths(anniversary, 6);
  return fullYears + (compareDates(end, sixMonthAnniversary) >= 0 ? 1 : 0.5);
};

const formatFormulaAmount = (amount: number) =>
  new Intl.NumberFormat("zh-CN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);

export const calculateCompensation = (
  input: CalculationInput,
): CalculationResult => {
  const validation = validateCalculationInput(input);
  if (!validation.valid) {
    throw new Error(validation.message);
  }

  const originalStart = parseDate(input.startDate);
  const lawStart = parseDate(LAW_EFFECTIVE_DATE);
  const hasPre2008Service = compareDates(originalStart, lawStart) < 0;
  const effectiveStartDate = hasPre2008Service
    ? LAW_EFFECTIVE_DATE
    : input.startDate;

  const rawNCoefficient = calculateNCoefficient(effectiveStartDate, input.endDate);
  const duration = getCalendarDuration(effectiveStartDate, input.endDate);
  const usedMinimumWage =
    input.monthlyAverageSalary < input.minimumMonthlyWage;

  let compensationBase = Math.max(
    input.monthlyAverageSalary,
    input.minimumMonthlyWage,
  );
  let usedThreeTimesCap = false;

  if (input.localAverageMonthlyWage) {
    const maximumBase = input.localAverageMonthlyWage * 3;
    if (input.monthlyAverageSalary > maximumBase) {
      compensationBase = maximumBase;
      usedThreeTimesCap = true;
    }
  }

  const nCoefficient = usedThreeTimesCap
    ? Math.min(rawNCoefficient, 12)
    : rawNCoefficient;
  const usedTwelveYearCap =
    usedThreeTimesCap && rawNCoefficient > nCoefficient;
  const nAmount = compensationBase * nCoefficient;
  const lastMonthSalary =
    input.lastMonthSalary ?? input.monthlyAverageSalary;

  let total = nAmount;
  let formula = `${formatFormulaAmount(compensationBase)} × ${nCoefficient}N`;
  if (input.mode === "n+1") {
    total += lastMonthSalary;
    formula += ` + ${formatFormulaAmount(lastMonthSalary)}`;
  } else if (input.mode === "2n") {
    total *= 2;
    formula = `(${formula}) × 2`;
  }

  return {
    mode: input.mode,
    total,
    nAmount,
    nCoefficient,
    rawNCoefficient,
    compensationBase,
    lastMonthSalary,
    duration,
    effectiveStartDate,
    usedMinimumWage,
    usedThreeTimesCap,
    usedTwelveYearCap,
    capChecked: Boolean(input.localAverageMonthlyWage),
    hasPre2008Service,
    formula,
  };
};
