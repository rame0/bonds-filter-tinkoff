import BaseCollations from '@/data/collations/BaseCollations'

export default class IssueKindCollations extends BaseCollations {
  protected static values = {
    documentary: 'док',
    non_documentary: 'бездок.'
  }
}
