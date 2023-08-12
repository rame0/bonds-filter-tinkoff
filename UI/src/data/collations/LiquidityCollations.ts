import BaseCollations from '@/data/collations/BaseCollations'

export default class LiquidityCollations extends BaseCollations {
  protected static values = {
    0: '—',
    1: 'Низкая',
    2: 'Высокая'
  }

  static getLabel(key: string | number): string {
    switch (Number(key)) {
      case 1:
        return '⮋'
      case 2:
        return '⮉'
      default:
        return '—'
    }
  }

  static getColorCode(key: number) {
    switch (key) {
      case 1:
        return 'danger'
      case 2:
        return 'success'
      default:
        return 'primary'
    }
  }
}
