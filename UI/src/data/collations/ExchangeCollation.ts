import BaseCollations from "@/data/collations/BaseCollations";

export default class ExchangeCollation extends BaseCollations {
  protected static values = {
    1: 'Московская Биржа',
    2: 'Санкт-Петербургская биржа',
    3: 'Внебиржевой инструмент',
  }
}
