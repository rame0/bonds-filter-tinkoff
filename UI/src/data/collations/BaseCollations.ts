export interface Collation {
  [key: string]: string | { name: string; inverse: boolean }
}

export default class BaseCollations {
  protected static values: Collation = {}

  static asArray() {
    return Object.keys(this.values).map((key): { value: string; label: string } => {
      if (typeof this.values[key] === 'object') {
        const { name } = this.values[key] as { name: string; inverse: boolean }
        return { value: key, label: name }
      } else {
        return { value: key, label: this.getLabel(key) as string }
      }
    })
  }

  static getLabel(key: string) {
    return this.values[key] || key
  }
}
