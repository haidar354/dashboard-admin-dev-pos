import type { Rule } from './ability'
import { can } from '@layouts/plugins/casl'

export const isCanAccessRoute = (rules: Rule[]): boolean => {
  return rules?.some(element => can(element.action, element.subject)) ?? true
}
