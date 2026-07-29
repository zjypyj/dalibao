import { describe, expect, it } from "vitest";
import {
  calculateCompensation,
  calculateNCoefficient,
  HANGZHOU_PRIVATE_MONTHLY_AVERAGE_WAGE_2025,
  type CalculationInput,
} from "./calculator";

const baseInput: CalculationInput = {
  monthlyAverageSalary: 10_000,
  startDate: "2024-01-01",
  endDate: "2025-01-01",
  minimumMonthlyWage: 2_660,
  mode: "n",
};

describe("calculateNCoefficient", () => {
  it("不足六个月按 0.5N 计算", () => {
    expect(calculateNCoefficient("2024-01-01", "2024-06-01")).toBe(0.5);
  });

  it("满六个月不满一年按 1N 计算", () => {
    expect(calculateNCoefficient("2024-01-01", "2024-07-01")).toBe(1);
  });

  it("一年五个月按 1.5N 计算", () => {
    expect(calculateNCoefficient("2024-01-01", "2025-06-01")).toBe(1.5);
  });

  it("一年六个月按 2N 计算", () => {
    expect(calculateNCoefficient("2024-01-01", "2025-07-01")).toBe(2);
  });

  it("起算与结算同日按不足六个月的 0.5N 估算", () => {
    expect(calculateNCoefficient("2024-01-01", "2024-01-01")).toBe(0.5);
  });
});

describe("calculateCompensation", () => {
  it("工资低于最低工资时使用最低工资基数", () => {
    const result = calculateCompensation({
      ...baseInput,
      monthlyAverageSalary: 2_000,
    });
    expect(result.compensationBase).toBe(2_660);
    expect(result.usedMinimumWage).toBe(true);
  });

  it("超过三倍社平工资时封顶工资基数", () => {
    const result = calculateCompensation({
      ...baseInput,
      monthlyAverageSalary: 40_000,
      localAverageMonthlyWage: 10_000,
    });
    expect(result.compensationBase).toBe(30_000);
    expect(result.usedThreeTimesCap).toBe(true);
  });

  it("月薪三万时默认按杭州私营单位 2025 年工资口径封顶", () => {
    const result = calculateCompensation({
      ...baseInput,
      monthlyAverageSalary: 30_000,
      localAverageMonthlyWage: HANGZHOU_PRIVATE_MONTHLY_AVERAGE_WAGE_2025,
    });
    expect(result.compensationBase).toBeCloseTo(23_886.25, 2);
    expect(result.usedThreeTimesCap).toBe(true);
  });

  it("高工资且超过十二年时同时封顶年限", () => {
    const result = calculateCompensation({
      ...baseInput,
      startDate: "2009-01-01",
      endDate: "2025-01-01",
      monthlyAverageSalary: 40_000,
      localAverageMonthlyWage: 10_000,
    });
    expect(result.nCoefficient).toBe(12);
    expect(result.usedTwelveYearCap).toBe(true);
  });

  it("N+1 使用结算前一个月工资作为加一", () => {
    const result = calculateCompensation({
      ...baseInput,
      lastMonthSalary: 12_000,
      mode: "n+1",
    });
    expect(result.total).toBe(22_000);
    expect(result.lastMonthSalary).toBe(12_000);
    expect(result.formula).toContain("上一个月工资 12,000");
  });

  it("2N 是 N 结果的两倍", () => {
    const result = calculateCompensation({ ...baseInput, mode: "2n" });
    expect(result.total).toBe(20_000);
  });

  it("2008 年前工龄只估算 2008 年后部分并给出标记", () => {
    const result = calculateCompensation({
      ...baseInput,
      startDate: "2005-01-01",
      endDate: "2010-01-01",
    });
    expect(result.effectiveStartDate).toBe("2008-01-01");
    expect(result.nCoefficient).toBe(2);
    expect(result.hasPre2008Service).toBe(true);
  });
});
