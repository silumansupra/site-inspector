// src/lib/lookups/index.ts
export { checkHeaders } from "./headers";
export { checkDns } from "./dns";
export { checkSsl } from "./ssl";
export { checkWhois } from "./whois";
export { checkPorts } from "./ports";
export { checkRobots } from "./robots";
export { checkSecurityHeaders } from "./security-headers";
export { checkSocialTags } from "./social-tags";
export { checkEmailSecurity } from "./email-security";

import { checkHeaders } from "./headers";
import { checkDns } from "./dns";
import { checkSsl } from "./ssl";
import { checkWhois } from "./whois";
import { checkPorts } from "./ports";
import { checkRobots } from "./robots";
import { checkSecurityHeaders } from "./security-headers";
import { checkSocialTags } from "./social-tags";
import { checkEmailSecurity } from "./email-security";

export const ALL_LOOKUPS = [checkHeaders, checkDns, checkSsl, checkWhois, checkPorts, checkRobots, checkSecurityHeaders, checkSocialTags, checkEmailSecurity] as const;

export type LookupFn = (typeof ALL_LOOKUPS)[number];
