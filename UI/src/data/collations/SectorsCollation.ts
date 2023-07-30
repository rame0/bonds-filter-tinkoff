import BaseCollations, { type Collation } from '@/data/collations/BaseCollations'

export default class SectorsCollation extends BaseCollations {
  protected static values: Collation = {
    government: 'Государственный сектор',
    municipal: 'Муниципальный сектор',
    it: 'IT',
    consumer: 'Потребительский сектор',
    energy: 'Энергетика',
    financial: 'Финансы',
    health_care: 'Здравоохранение',
    industrials: 'Промышленность',
    materials: 'Материалы',
    real_estate: 'Недвижимость',
    telecom: 'Телекоммуникации',
    utilities: 'Коммунальные услуги',
    other: 'Другое'
  }
}
