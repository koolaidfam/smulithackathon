export type JurisdictionCode = 'SG' | 'AU' | 'UK' | 'HK' | 'EU';

export interface SiteOption {
  id: string;
  label: string;
  url: string;
  issuer: string;
}

export interface TrackedSite {
  id: string;
  jurisdiction: JurisdictionCode;
  label: string;
  url: string;
  issuer: string;
  custom: boolean;
}

export const JURISDICTIONS: { code: JurisdictionCode; name: string }[] = [
  { code: 'SG', name: 'Singapore' },
  { code: 'AU', name: 'Australia' },
  { code: 'UK', name: 'United Kingdom' },
  { code: 'HK', name: 'Hong Kong' },
  { code: 'EU', name: 'European Union' },
];

/** Official pages that actually publish rules and guidance. Kept short on purpose. */
export const SITES_BY_JURISDICTION: Record<JurisdictionCode, SiteOption[]> = {
  SG: [
    {
      id: 'sg-mas',
      label: 'MAS regulation and guidance',
      url: 'https://www.mas.gov.sg/regulation',
      issuer: 'Monetary Authority of Singapore',
    },
    {
      id: 'sg-sso',
      label: 'Singapore Statutes Online',
      url: 'https://sso.agc.gov.sg',
      issuer: "Attorney-General's Chambers",
    },
    {
      id: 'sg-acra',
      label: 'ACRA guidance',
      url: 'https://www.acra.gov.sg',
      issuer: 'Accounting and Corporate Regulatory Authority',
    },
    {
      id: 'sg-sgx',
      label: 'SGX Rulebook',
      url: 'https://rulebook.sgx.com',
      issuer: 'Singapore Exchange',
    },
  ],
  AU: [
    {
      id: 'au-asic',
      label: 'ASIC regulatory resources',
      url: 'https://asic.gov.au/regulatory-resources',
      issuer: 'Australian Securities and Investments Commission',
    },
    {
      id: 'au-austrac',
      label: 'AUSTRAC guidance',
      url: 'https://www.austrac.gov.au',
      issuer: 'AUSTRAC',
    },
    {
      id: 'au-leg',
      label: 'Federal Register of Legislation',
      url: 'https://www.legislation.gov.au',
      issuer: 'Office of Parliamentary Counsel',
    },
  ],
  UK: [
    {
      id: 'uk-fca',
      label: 'FCA handbook and guidance',
      url: 'https://www.fca.org.uk',
      issuer: 'Financial Conduct Authority',
    },
    {
      id: 'uk-leg',
      label: 'legislation.gov.uk',
      url: 'https://www.legislation.gov.uk',
      issuer: 'The National Archives',
    },
    {
      id: 'uk-pra',
      label: 'Bank of England prudential regulation',
      url: 'https://www.bankofengland.co.uk/prudential-regulation',
      issuer: 'Prudential Regulation Authority',
    },
  ],
  HK: [
    {
      id: 'hk-sfc',
      label: 'SFC rules and circulars',
      url: 'https://www.sfc.hk',
      issuer: 'Securities and Futures Commission',
    },
    {
      id: 'hk-hkex',
      label: 'HKEX listing rules',
      url: 'https://www.hkex.com.hk',
      issuer: 'Hong Kong Exchanges and Clearing',
    },
  ],
  EU: [
    {
      id: 'eu-esma',
      label: 'ESMA documents',
      url: 'https://www.esma.europa.eu',
      issuer: 'European Securities and Markets Authority',
    },
    {
      id: 'eu-lex',
      label: 'EUR-Lex',
      url: 'https://eur-lex.europa.eu',
      issuer: 'Publications Office of the European Union',
    },
  ],
};

export const CUSTOM_SITE_VALUE = 'custom';

export function jurisdictionName(code: JurisdictionCode): string {
  return JURISDICTIONS.find((j) => j.code === code)?.name ?? code;
}

export function normalizeUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withProtocol);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    if (!url.hostname.includes('.')) return null;
    return url.toString();
  } catch {
    return null;
  }
}
