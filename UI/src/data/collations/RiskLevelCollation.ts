import BaseCollations from '@/data/collations/BaseCollations'

export default class RiskLevel extends BaseCollations {
  protected static values = {
    '1': 'Низкий',
    '2': 'Средний',
    '3': 'Высокий'
  }

  static getLabel(key: string) {
    if (key === '0') return '—'
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
