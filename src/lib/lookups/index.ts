// src/lib/lookups/index.ts
export { checkHeaders }         from './headers'
export { checkDns }             from './dns'
export { checkSsl }             from './ssl'
export { checkWhois }           from './whois'
export { checkPorts }           from './ports'
export { checkRobots }          from './robots'
export { checkSecurityHeaders } from './security-headers'

import { checkHeaders }         from './headers'
import { checkDns }             from './dns'
import { checkSsl }             from './ssl'
import { checkWhois }           from './whois'
import { checkPorts }           from './ports'
import { checkRobots }          from './robots'
import { checkSecurityHeaders } from './security-headers'

export const ALL_LOOKUPS = [
  checkHeaders,
  checkDns,
  checkSsl,
  checkWhois,
  checkPorts,
  checkRobots,
  checkSecurityHeaders,
] as const

export type LookupFn = typeof ALL_LOOKUPS[number]
