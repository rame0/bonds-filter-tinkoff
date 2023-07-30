import BaseCollations, { type Collation } from '@/data/collations/BaseCollations'

export default class CurrencyCollation extends BaseCollations {
  protected static values: Collation = {
    rub: '₽',
    usd: '$',
    eur: '€',
    cny: '¥',
  }
}
