import BaseCollations, { type Collation } from '@/data/collations/BaseCollations'

export default class CurrencyCollation extends BaseCollations {
  protected static values: Collation = {
    rub: 'Рубль',
    usd: 'Доллар США',
    eur: 'Евро',
    cny: 'Китайский юань'
  }
}
