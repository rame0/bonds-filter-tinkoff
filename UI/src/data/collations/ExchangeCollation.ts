import BaseCollations from "@/data/collations/BaseCollations";

export default class Exchange extends BaseCollations {
  protected static values = {
    0: 'N/A',
    1: 'Московская Биржа',
    2: 'Санкт-Петербургская биржа',
    3: 'Внебиржевой инструмент',
  }
}
