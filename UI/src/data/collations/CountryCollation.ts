import BaseCollations, { type Collation } from '@/data/collations/BaseCollations'

export default class CountryCollation extends BaseCollations {
  protected static values: Collation = {
    RU: 'Россия',
    IE: 'Ирландия',
    KZ: 'Казахстан',
    LU: 'Люксембург',
    TR: 'Турция',
    GB: 'Великобритания',
  }
}
