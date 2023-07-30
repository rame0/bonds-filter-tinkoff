import BaseCollations from '@/data/collations/BaseCollations'

export default class IssueKind extends BaseCollations {
  protected static values = {
    documentary: 'документарная',
    non_documentary: 'бездокументарная'
  }
}
