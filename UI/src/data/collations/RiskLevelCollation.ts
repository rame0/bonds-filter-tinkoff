import BaseCollations from '@/data/collations/BaseCollations'

export default class RiskLevelCollation extends BaseCollations {
  protected static values = {
    0: '—',
    1: 'Низкий',
    2: 'Средний',
    3: 'Высокий'
  }

  static getLabel(key: string | number) {
    if (Number(key) === 0) return '—'
    /** return stars based in key value */
    return '★'.repeat(Number(key))
  }

  static getColorCode(key: number) {
    switch (key) {
      case 1:
        return 'success'
      case 2:
        return 'warning'
      case 3:
        return 'danger'
      default:
        return 'primary'
    }
  }
}
