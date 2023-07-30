import { type Quotation, type MoneyValue, SecurityTradingStatus, RealExchange, RiskLevel } from './common';

/** Список облигаций. */
export interface BondsResponse {
  /** Массив облигаций. */
  instruments: Bond[]
}

/** Объект передачи информации об облигации. */
export interface Bond {
  /** Figi-идентификатор инструмента. */
  figi: string;
  /** Тикер инструмента. */
  ticker: string;
  /** Класс-код (секция торгов). */
  classCode: string;
  /** Isin-идентификатор инструмента. */
  isin: string;
  /** Лотность инструмента. Возможно совершение операций только на количества ценной бумаги, кратные параметру *lot*. Подробнее: [лот](https://tinkoff.github.io/investAPI/glossary#lot) */
  lot: number;
  /** Валюта расчётов. */
  currency: string;
  /** Коэффициент ставки риска длинной позиции по инструменту. */
  klong?: Quotation;
  /** Коэффициент ставки риска короткой позиции по инструменту. */
  kshort?: Quotation;
  /** Ставка риска минимальной маржи в лонг. Подробнее: [ставка риска в лонг](https://help.tinkoff.ru/margin-trade/long/risk-rate/) */
  dlong?: Quotation;
  /** Ставка риска минимальной маржи в шорт. Подробнее: [ставка риска в шорт](https://help.tinkoff.ru/margin-trade/short/risk-rate/) */
  dshort?: Quotation;
  /** Ставка риска начальной маржи в лонг. Подробнее: [ставка риска в лонг](https://help.tinkoff.ru/margin-trade/long/risk-rate/) */
  dlongMin?: Quotation;
  /** Ставка риска начальной маржи в шорт. Подробнее: [ставка риска в шорт](https://help.tinkoff.ru/margin-trade/short/risk-rate/) */
  dshortMin?: Quotation;
  /** Признак доступности для операций в шорт. */
  shortEnabledFlag: boolean;
  /** Название инструмента. */
  name: string;
  /** Торговая площадка. */
  exchange: string;
  /** Количество выплат по купонам в год. */
  couponQuantityPerYear: number;
  /** Дата погашения облигации в часовом поясе UTC. */
  maturityDate?: Date;
  /** Номинал облигации. */
  nominal?: MoneyValue;
  /** Первоначальный номинал облигации. */
  initialNominal?: MoneyValue;
  /** Дата выпуска облигации в часовом поясе UTC. */
  stateRegDate?: Date;
  /** Дата размещения в часовом поясе UTC. */
  placementDate?: Date;
  /** Цена размещения. */
  placementPrice?: MoneyValue;
  /** Значение НКД (накопленного купонного дохода) на дату. */
  aciValue?: MoneyValue;
  /** Код страны риска, т.е. страны, в которой компания ведёт основной бизнес. */
  countryOfRisk: string;
  /** Наименование страны риска, т.е. страны, в которой компания ведёт основной бизнес. */
  countryOfRiskName: string;
  /** Сектор экономики. */
  sector: string;
  /** Форма выпуска. Возможные значения: </br>**documentary** — документарная; </br>**non_documentary** — бездокументарная. */
  issueKind: string;
  /** Размер выпуска. */
  issueSize: number;
  /** Плановый размер выпуска. */
  issueSizePlan: number;
  /** Текущий режим торгов инструмента. */
  tradingStatus: SecurityTradingStatus;
  /** Признак внебиржевой ценной бумаги. */
  otcFlag: boolean;
  /** Признак доступности для покупки. */
  buyAvailableFlag: boolean;
  /** Признак доступности для продажи. */
  sellAvailableFlag: boolean;
  /** Признак облигации с плавающим купоном. */
  floatingCouponFlag: boolean;
  /** Признак бессрочной облигации. */
  perpetualFlag: boolean;
  /** Признак облигации с амортизацией долга. */
  amortizationFlag: boolean;
  /** Шаг цены. */
  minPriceIncrement?: Quotation;
  /** Параметр указывает на возможность торговать инструментом через API. */
  apiTradeAvailableFlag: boolean;
  /** Уникальный идентификатор инструмента. */
  uid: string;
  /** Реальная площадка исполнения расчётов. */
  realExchange: RealExchange;
  /** Уникальный идентификатор позиции инструмента. */
  positionUid: string;
  /** Признак доступности для ИИС. */
  forIisFlag: boolean;
  /** Флаг отображающий доступность торговли инструментом только для квалифицированных инвесторов. */
  forQualInvestorFlag: boolean;
  /** Флаг отображающий доступность торговли инструментом по выходным */
  weekendFlag: boolean;
  /** Флаг заблокированного ТКС */
  blockedTcaFlag: boolean;
  /** Признак субординированной облигации. */
  subordinatedFlag: boolean;
  /** Дата первой минутной свечи. */
  first1minCandleDate?: Date;
  /** Дата первой дневной свечи. */
  first1dayCandleDate?: Date;
  /** Уровень риска. */
  riskLevel: RiskLevel;
}

