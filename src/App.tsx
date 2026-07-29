import { useMemo, useState } from "react";
import {
  calculateCompensation,
  HANGZHOU_PRIVATE_ANNUAL_AVERAGE_WAGE_2025,
  validateCalculationInput,
  type CalculationMode,
} from "./calculator";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);

const getToday = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
};

const modes: Array<{
  value: CalculationMode;
  label: string;
  short: string;
  description: string;
}> = [
  {
    value: "n",
    label: "标准礼包",
    short: "N",
    description: "稳稳当当的基础档，先把该有的好彩头算清楚",
  },
  {
    value: "n+1",
    label: "加码礼包",
    short: "N+1",
    description: "在标准档上再添一份，具体适用请核对实际情况",
  },
  {
    value: "2n",
    label: "双倍礼包",
    short: "2N",
    description: "好事成双的高配档，是否适用需结合材料判断",
  },
];

const legalReferences = [
  {
    index: "01",
    title: "《劳动法》第二十八条",
    body: "明确相关法定情形应依照国家规定执行对应的给付标准。",
    href: "https://fgw.sh.gov.cn/cmsres/1a/1a050de6d8f645c7806f08a9aefd5f7b/b97cf0f12b558f73992cbf4fd7ffe547.pdf",
  },
  {
    index: "02",
    title: "《劳动合同法》第四十七条",
    body: "每满一年支付一个月工资；六个月以上不满一年按一年，不满六个月按半个月。",
    href: "https://www.mohrss.gov.cn/xxgk2020/fdzdgknr/zcfg/fl/202011/t20201102_394622.html?eqid=d37e118e0008f0b400000006643e9540",
  },
  {
    index: "03",
    title: "《劳动合同法》第八十七条",
    body: "明确特定情形下按第四十七条计算标准的二倍执行。",
    href: "https://www.mohrss.gov.cn/xxgk2020/fdzdgknr/zcfg/fl/202011/t20201102_394622.html?eqid=d37e118e0008f0b400000006643e9540",
  },
  {
    index: "04",
    title: "实施条例第二十、二十七条",
    body: "明确加一部分按上一个月工资确定，N 的月工资按应得工资计算。",
    href: "https://know.12348.gov.cn/s/relate/?qid=5a1243e236aec5079b0aa3ef",
  },
];

function App() {
  const [monthlyAverageSalary, setMonthlyAverageSalary] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState(getToday());
  const [lastMonthSalary, setLastMonthSalary] = useState("");
  const [minimumMonthlyWage, setMinimumMonthlyWage] = useState("2660");
  const [localAverageAnnualWage, setLocalAverageAnnualWage] = useState(
    String(HANGZHOU_PRIVATE_ANNUAL_AVERAGE_WAGE_2025),
  );
  const [mode, setMode] = useState<CalculationMode>("n");

  const numericAverageSalary = Number(monthlyAverageSalary);
  const input = useMemo(
    () => ({
      monthlyAverageSalary: numericAverageSalary,
      startDate,
      endDate,
      lastMonthSalary: lastMonthSalary
        ? Number(lastMonthSalary)
        : numericAverageSalary,
      minimumMonthlyWage: Number(minimumMonthlyWage),
      localAverageMonthlyWage: localAverageAnnualWage
        ? Number(localAverageAnnualWage) / 12
        : undefined,
      mode,
    }),
    [
      numericAverageSalary,
      startDate,
      endDate,
      lastMonthSalary,
      minimumMonthlyWage,
      localAverageAnnualWage,
      mode,
    ],
  );

  const validation = validateCalculationInput(input);
  const result = validation.valid ? calculateCompensation(input) : null;
  const selectedMode = modes.find((item) => item.value === mode)!;
  const futureEndDate = endDate > getToday();
  const threeTimesMonthlyCap = localAverageAnnualWage
    ? Number(localAverageAnnualWage) / 4
    : 0;

  return (
    <>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="杭州大礼包计算器首页">
          <span className="brand-seal" aria-hidden="true">杭</span>
          <span>
            杭州大礼包计算器
            <small>GOOD FORTUNE ESTIMATOR</small>
          </span>
        </a>
        <nav aria-label="页面导航">
          <a href="#calculator">开始计算</a>
          <a href="#law">法律依据</a>
        </nav>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="pulse-dot" aria-hidden="true" />
              红红火火算礼包 · 数据只留在本地
            </div>
            <h1>
              好日子到了，
              <br />
              <em>先沾沾喜气。</em>
            </h1>
            <p>
              输入月薪和一路走来的时间，一次看懂标准、加码、双倍三档礼包。
              数字算得明明白白，新篇章开得红红火火。
            </p>
            <a className="hero-cta" href="#calculator">
              开始接礼包
              <span aria-hidden="true">↓</span>
            </a>
          </div>
          <div className="hero-visual" aria-hidden="true">
            <div className="sun" />
            <div className="lantern lantern-one"><span>喜</span></div>
            <div className="lantern lantern-two"><span>福</span></div>
            <i className="confetti confetti-one" />
            <i className="confetti confetti-two" />
            <i className="confetti confetti-three" />
            <div className="pagoda">
              <span />
              <span />
              <span />
              <span />
            </div>
            <div className="mountain mountain-back" />
            <div className="mountain mountain-front" />
            <div className="lake-line lake-line-one" />
            <div className="lake-line lake-line-two" />
            <div className="hero-stamp">好事<br />成双</div>
          </div>
        </section>

        <section className="calculator-section" id="calculator">
          <div className="section-intro">
            <span>01 / CALCULATOR</span>
            <h2>算算你的好彩头</h2>
            <p>工资请填写税前应得工资，而不是到手工资或社保缴费基数。</p>
          </div>

          <div className="calculator-grid">
            <form className="input-panel" onSubmit={(event) => event.preventDefault()}>
              <div className="panel-heading">
                <div>
                  <span className="step-number">第一步</span>
                  <h3>填写基础信息</h3>
                </div>
                <span className="privacy-chip">不上传 · 不保存</span>
              </div>

              <label className="field field-prominent">
                <span className="field-label">
                  前 12 个月月平均应得工资
                  <small>税前，含奖金、津贴、补贴等货币性收入</small>
                </span>
                <span className="money-input">
                  <b>¥</b>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="100"
                    placeholder="例如 20000"
                    value={monthlyAverageSalary}
                    onChange={(event) => setMonthlyAverageSalary(event.target.value)}
                    aria-describedby="salary-help"
                  />
                  <i>元 / 月</i>
                </span>
                <span id="salary-help" className="field-hint">
                  工作不满 12 个月的，按实际工作月数计算平均工资
                </span>
              </label>

              <div className="benchmark-strip">
                <div>
                  <span>杭州私企基准已自动启用</span>
                  <strong>
                    2025 年均 {formatCurrency(HANGZHOU_PRIVATE_ANNUAL_AVERAGE_WAGE_2025)}
                  </strong>
                </div>
                <div>
                  <span>三倍月上限</span>
                  <strong>{formatCurrency(HANGZHOU_PRIVATE_ANNUAL_AVERAGE_WAGE_2025 / 4)}</strong>
                </div>
                <a
                  href="https://www.hangzhou.gov.cn/col/col1229063404/art/2026/art_3374a0ffce8f43119c6b6f8fd68ae431.html"
                  target="_blank"
                  rel="noreferrer"
                >
                  官方数据 ↗
                </a>
              </div>

              <div className="date-grid">
                <label className="field">
                  <span className="field-label">起算日期</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(event) => setStartDate(event.target.value)}
                  />
                </label>
                <span className="date-connector" aria-hidden="true">至</span>
                <label className="field">
                  <span className="field-label">礼包结算日期</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(event) => setEndDate(event.target.value)}
                  />
                </label>
              </div>

              <fieldset className="mode-fieldset">
                <legend>
                  <span className="step-number">第二步</span>
                  选择估算情形
                </legend>
                <div className="mode-list">
                  {modes.map((item) => (
                    <label
                      className={`mode-option ${mode === item.value ? "active" : ""}`}
                      key={item.value}
                    >
                      <input
                        type="radio"
                        name="mode"
                        value={item.value}
                        checked={mode === item.value}
                        onChange={() => setMode(item.value)}
                      />
                      <b>{item.short}</b>
                      <span>
                        <strong>{item.label}</strong>
                        <small>{item.description}</small>
                      </span>
                      <i aria-hidden="true" />
                    </label>
                  ))}
                </div>
              </fieldset>

              <details className="advanced-settings">
                <summary>
                  <span>
                    高级设置
                    <small>杭州私企基准已预设，也可按实际口径调整</small>
                  </span>
                  <b aria-hidden="true">＋</b>
                </summary>
                <div className="advanced-content">
                  <label className="field">
                    <span className="field-label">
                      结算前一个月工资
                      <small>留空时按前 12 个月平均工资估算</small>
                    </span>
                    <span className="compact-money-input">
                      <span>¥</span>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        placeholder={monthlyAverageSalary || "例如 20000"}
                        value={lastMonthSalary}
                        onChange={(event) => setLastMonthSalary(event.target.value)}
                      />
                    </span>
                  </label>
                  <label className="field">
                    <span className="field-label">
                      杭州市区最低月工资
                      <small>默认 2660 元，自 2026-01-01 起执行</small>
                    </span>
                    <span className="compact-money-input">
                      <span>¥</span>
                      <input
                        type="number"
                        min="0"
                        step="10"
                        value={minimumMonthlyWage}
                        onChange={(event) => setMinimumMonthlyWage(event.target.value)}
                      />
                    </span>
                  </label>
                  <label className="field advanced-wide">
                    <span className="field-label">
                      杭州单位就业人员年平均工资
                      <small>默认 2025 年私营单位 95545 元；其他单位或年度可据实修改</small>
                    </span>
                    <span className="compact-money-input">
                      <span>¥</span>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        placeholder="留空则不核验三倍月上限"
                        value={localAverageAnnualWage}
                        onChange={(event) =>
                          setLocalAverageAnnualWage(event.target.value)
                        }
                      />
                    </span>
                  </label>
                </div>
              </details>
            </form>

            <aside className="result-panel" aria-live="polite">
              <div className="result-topline">
                <span>估算结果</span>
                <b>{selectedMode.short}</b>
              </div>

              {result ? (
                <>
                  <p className="result-label">{selectedMode.label}喜庆参考金额</p>
                  <div className="result-amount">{formatCurrency(result.total)}</div>
                  <p className="result-caption">
                    按税前金额估算，实际支付与税务处理以具体情况为准
                  </p>

                  <div className="formula-box">
                    <span>计算公式</span>
                    <strong>{result.formula}</strong>
                  </div>

                  <dl className="result-breakdown">
                    <div>
                      <dt>现行法计入工龄</dt>
                      <dd>
                        {result.duration.years} 年 {result.duration.months} 个月
                        {result.duration.days > 0 ? ` ${result.duration.days} 天` : ""}
                      </dd>
                    </div>
                    <div>
                      <dt>折算补偿年限</dt>
                      <dd>
                        {result.nCoefficient}N
                        {result.usedTwelveYearCap && (
                          <small>原始 {result.rawNCoefficient}N，已封顶</small>
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt>实际计算基数</dt>
                      <dd>{formatCurrency(result.compensationBase)} / 月</dd>
                    </div>
                    <div>
                      <dt>N 部分金额</dt>
                      <dd>{formatCurrency(result.nAmount)}</dd>
                    </div>
                  </dl>

                  <div className="status-list">
                    {result.usedMinimumWage && (
                      <p className="status success">
                        <span>✓</span>
                        工资低于最低工资，已按最低工资保底
                      </p>
                    )}
                    {result.usedThreeTimesCap && (
                      <p className="status success">
                        <span>✓</span>
                        已应用杭州私企三倍月上限 {formatCurrency(threeTimesMonthlyCap)}
                      </p>
                    )}
                    {result.capChecked && !result.usedThreeTimesCap && (
                      <p className="status success">
                        <span>✓</span>
                        已核验杭州私企三倍月上限 {formatCurrency(threeTimesMonthlyCap)}
                      </p>
                    )}
                    {!result.capChecked && (
                      <p className="status warning">
                        <span>!</span>
                        尚未核验三倍月上限；请在高级设置填写适用口径
                      </p>
                    )}
                    {result.hasPre2008Service && (
                      <p className="status warning">
                        <span>!</span>
                        本结果仅含 2008-01-01 后部分，之前工龄需分段核算
                      </p>
                    )}
                    {futureEndDate && (
                      <p className="status neutral">
                        <span>i</span>
                        礼包结算日期在未来，本结果为预计金额
                      </p>
                    )}
                  </div>

                  <div className="scenario-note">
                    <span>适用提醒</span>
                    <p>{selectedMode.description}。最终适用档位仍需结合具体材料判断。</p>
                  </div>
                </>
              ) : (
                <div className="empty-result">
                  <div className="empty-coin" aria-hidden="true">¥</div>
                  <h3>填完信息，喜庆数字马上揭晓</h3>
                  <p>{validation.message}</p>
                  <ol>
                    <li><span>1</span>填写平均工资</li>
                    <li><span>2</span>选择在职时间</li>
                    <li><span>3</span>接住三档礼包</li>
                  </ol>
                </div>
              )}
            </aside>
          </div>
        </section>

        <section className="explanation-section">
          <div className="section-intro compact">
            <span>02 / HOW IT WORKS</span>
            <h2>为什么是这个数？</h2>
          </div>
          <div className="rule-strip">
            <article>
              <span>不足 6 个月</span>
              <strong>0.5N</strong>
              <p>按半个月工资计算</p>
            </article>
            <article>
              <span>满 6 个月，不满 1 年</span>
              <strong>1N</strong>
              <p>按一个月工资计算</p>
            </article>
            <article>
              <span>每满 1 年</span>
              <strong>+1N</strong>
              <p>增加一个月工资</p>
            </article>
            <article className="rule-example">
              <span>举个例子</span>
              <p>工作 3 年 7 个月</p>
              <strong>折算为 4N</strong>
            </article>
          </div>
        </section>

        <section className="law-section" id="law">
          <div className="law-heading">
            <div className="section-intro compact">
              <span>03 / LEGAL BASIS</span>
              <h2>有法可依，也要具体分析</h2>
            </div>
            <p>
              法条给出计算框架，实际档位仍要结合通知程序和证据材料综合判断。
            </p>
          </div>
          <div className="legal-list">
            {legalReferences.map((item) => (
              <a
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="legal-item"
                key={item.index}
              >
                <span>{item.index}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
                <b aria-hidden="true">↗</b>
              </a>
            ))}
          </div>
          <div className="source-links">
            <span>杭州本地口径</span>
            <a
              href="https://hrss.hangzhou.gov.cn/art/2019/9/4/art_1587970_28279241.html"
              target="_blank"
              rel="noreferrer"
            >
              杭州市人社局：相关计算口径 ↗
            </a>
            <a
              href="https://zfgb.hangzhou.gov.cn/ShiShuJuZiYuanJu/144/102220263/t113220263024/530201.shtml"
              target="_blank"
              rel="noreferrer"
            >
              杭州市区 2026 年最低工资通知 ↗
            </a>
            <a
              href="https://www.hangzhou.gov.cn/col/col1229063404/art/2026/art_3374a0ffce8f43119c6b6f8fd68ae431.html"
              target="_blank"
              rel="noreferrer"
            >
              杭州 2025 年单位平均工资 ↗
            </a>
          </div>
        </section>

        <section className="disclaimer">
          <span className="disclaimer-mark" aria-hidden="true">知</span>
          <div>
            <h2>喜庆归喜庆，依据也要看清</h2>
            <p>
              本工具仅根据你输入的信息做数学估算，不判断具体情形，不构成法律意见。
              如涉及 2008 年前工龄、竞业限制、年终奖或复杂工资构成，建议携带合同、
              工资流水和相关通知咨询劳动仲裁机构、工会或专业律师。
            </p>
          </div>
          <div className="disclaimer-meta">
            <span>规则校对</span>
            <strong>2026.07</strong>
          </div>
        </section>
      </main>

      <footer>
        <div>
          <strong>杭州大礼包计算器</strong>
          <p>愿一路有收获，下一程更红火。</p>
        </div>
        <p>纯前端本地计算 · 不收集个人信息 · 结果仅供参考</p>
      </footer>
    </>
  );
}

export default App;
