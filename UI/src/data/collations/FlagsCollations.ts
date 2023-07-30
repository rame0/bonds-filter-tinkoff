import BaseCollations from '@/data/collations/BaseCollations'

export default class IssueKindCollations extends BaseCollations {
  protected static values = {
    indexedNominalFlag: {
      name: 'Индексация ном.',
      inverse: false
    },
    collateralFlag: {
      name: 'Обеспечение',
      inverse: false
    },
    taxFreeFlag: {
      name: 'Без налога',
      inverse: false
    },
    shortEnabledFlag: {
      name: 'Доступен шорт',
      inverse: false
    },
    otcFlag: {
      name: 'Внебиржевая',
      inverse: true
    },
    buyAvailableFlag: {
      name: 'Можно купить',
      inverse: false
    },
    sellAvailableFlag: {
      name: 'Можно продать',
      inverse: false
    },
    floatingCouponFlag: {
      name: 'Плав. купон',
      inverse: false
    },
    perpetualFlag: {
      name: 'Бессрочная',
      inverse: false
    },
    amortizationFlag: {
      name: 'Амортизация',
      inverse: false
    },
    apiTradeAvailableFlag: {
      name: 'API',
      inverse: false
    },
    forIisFlag: {
      name: 'ИИС',
      inverse: false
    },
    forQualInvestorFlag: {
      name: 'Квал',
      inverse: true
    },
    weekendFlag: {
      name: 'Торг. на вых.',
      inverse: false
    },
    blockedTcaFlag: {
      name: 'Нет блока ТКС',
      inverse: true
    },
    subordinatedFlag: {
      name: 'Суборд.',
      inverse: false
    }
  }

  static isInverse(key: string) {
    return (this.values[key] as { name: string; inverse: boolean }).inverse
  }

  static getLabel(key: string) {
    return this.values[key] ? (this.values[key] as { name: string; inverse: boolean }).name : key
  }
}
