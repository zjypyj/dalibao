import { useMemo, useState } from "react";
import {
  calculateCompensation,
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
    label: "经济补偿",
    short: "N",
    description: "常见于协商解除、合同终止等法定应补偿情形",
  },
  {
    value: "n+1",
    label: "补偿 + 代通知",
    short: "N+1",
    description: "仅适用于特定解除情形且未提前 30 日书面通知",
  },
  {
    value: "2n",
    label: "违法解除赔偿",
    short: "2N",
    description: "违法解除或终止且不继续履行劳动合同等情形",
  },
];

const legalReferences = [
  {
    index: "01",
    title: "《劳动法》第二十八条",
    body: "用人单位依法解除劳动合同时，应依照国家有关规定给予经济补偿。",
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
    body: "用人单位违法解除或终止劳动合同，应按第四十七条标准的二倍支付赔偿金。",
    href: "https://www.mohrss.gov.cn/xxgk2020/fdzdgknr/zcfg/fl/202011/t20201102_394622.html?eqid=d37e118e0008f0b400000006643e9540",
  },
  {
    index: "04",
    title: "实施条例第二十、二十七条",
    body: "代通知金按劳动者上一个月工资确定；经济补偿月工资按应得工资计算。",
    href: "https://know.12348.gov.cn/s/relate/?qid=5a1243e236aec5079b0aa3ef",
  },
];

function App() {
  const [monthlyAverageSalary, setMonthlyAverageSalary] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState(getToday());
  const [lastMonthSalary, setLastMonthSalary] = useState("");
  const [minimumMonthlyWage, setMinimumMonthlyWage] = useState("2660");
  const [localAverageMonthlyWage, setLocalAverageMonthlyWage] = useState("");
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
      localAverageMonthlyWage: localAverageMonthlyWage
        ? Number(localAverageMonthlyWage)
        : undefined,
      mode,
    }),
    [
      numericAverageSalary,
      startDate,
      endDate,
      lastMonthSalary,
      minimumMonthlyWage,
      localAverageMonthlyWage,
      mode,
    ],
  );

  const validation = validateCalculationInput(input);
  const result = validation.valid ? calculateCompensation(input) : null;
  const selectedMode = modes.find((item) => item.value === mode)!;
  const futureEndDate = endDate > getToday();

  return (
    <>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="杭州离职大礼包计算器首页">
          <span className="brand-seal" aria-hidden="true">杭</span>
          <span>
            杭州离职大礼包
            <small>Compensation Estimator</small>
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
              数据只在你的浏览器里计算
            </div>
            <h1>
              离职这笔账，
              <br />
              <em>先算清楚。</em>
            </h1>
            <p>
              输入工资和在职时间，一次看懂 N、N+1、2N。
              不替你做法律判断，只帮你把数字说明白。
            </p>
            <a className="hero-cta" href="#calculator">
              免费开始计算
              <span aria-hidden="true">↓</span>
            </a>
          </div>
          <div className="hero-visual" aria-hidden="true">
            <div className="sun" />
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
            <div className="hero-stamp">清楚<br />有数</div>
          </div>
        </section>

        <section className="calculator-section" id="calculator">
          <div className="section-intro">
            <span>01 / CALCULATOR</span>
            <h2>算算你的“大礼包”</h2>
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

              <div className="date-grid">
                <label className="field">
                  <span className="field-label">入职日期</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(event) => setStartDate(event.target.value)}
                  />
                </label>
                <span className="date-connector" aria-hidden="true">至</span>
                <label className="field">
                  <span className="field-label">离职 / 预计离职日期</span>
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
                    <small>提高 N+1 和高工资封顶计算精度</small>
                  </span>
                  <b aria-hidden="true">＋</b>
                </summary>
                <div className="advanced-content">
                  <label className="field">
                    <span className="field-label">
                      解除前一个月工资
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
                      上年度杭州职工月平均工资
                      <small>不同年度与案件口径可能不同，请以官方数据或专业意见为准</small>
                    </span>
                    <span className="compact-money-input">
                      <span>¥</span>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        placeholder="留空则不核验三倍封顶"
                        value={localAverageMonthlyWage}
                        onChange={(event) =>
                          setLocalAverageMonthlyWage(event.target.value)
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
                  <p className="result-label">{selectedMode.label}参考金额</p>
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
                        已应用当地职工月平均工资三倍封顶
                      </p>
                    )}
                    {!result.capChecked && (
                      <p className="status warning">
                        <span>!</span>
                        尚未核验三倍封顶；高工资用户请填写高级设置
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
                        离职日期在未来，本结果为预计金额
                      </p>
                    )}
                  </div>

                  <div className="scenario-note">
                    <span>适用提醒</span>
                    <p>{selectedMode.description}。是否适用须结合解除原因、程序和证据判断。</p>
                  </div>
                </>
              ) : (
                <div className="empty-result">
                  <div className="empty-coin" aria-hidden="true">¥</div>
                  <h3>填完信息，金额就会出现在这里</h3>
                  <p>{validation.message}</p>
                  <ol>
                    <li><span>1</span>填写平均工资</li>
                    <li><span>2</span>选择在职时间</li>
                    <li><span>3</span>查看三种结果</li>
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
              法条决定计算框架，但解除原因、通知程序、证据材料会决定你是否真的适用。
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
              杭州市人社局：经济补偿标准 ↗
            </a>
            <a
              href="https://zfgb.hangzhou.gov.cn/ShiShuJuZiYuanJu/144/102220263/t113220263024/530201.shtml"
              target="_blank"
              rel="noreferrer"
            >
              杭州市区 2026 年最低工资通知 ↗
            </a>
          </div>
        </section>

        <section className="disclaimer">
          <span className="disclaimer-mark" aria-hidden="true">知</span>
          <div>
            <h2>计算器不是裁判书</h2>
            <p>
              本工具仅根据你输入的信息做数学估算，不判断解除是否合法，不构成法律意见。
              如涉及违法解除、2008 年前工龄、竞业限制、年终奖或复杂工资构成，建议携带劳动合同、
              工资流水和解除通知咨询劳动仲裁机构、工会或专业律师。
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
          <strong>杭州离职大礼包计算器</strong>
          <p>愿每一份劳动，都被认真对待。</p>
        </div>
        <p>纯前端本地计算 · 不收集个人信息 · 结果仅供参考</p>
      </footer>
    </>
  );
}

export default App;
