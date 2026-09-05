/**
 * Issuers of the instruments the firm watches.
 *
 * The badge is a monogram drawn from the issuer's short name, not the
 * regulator's mark. Reproducing an official logo inside a product screen can
 * read as endorsement, which none of these bodies have given. If the team
 * decides to use real marks, drop the file into public/logos and set `logo`
 * below. Everything renders the image instead of the monogram from then on.
 */
export interface Issuer {
  code: string;
  label: string;
  accent: string;
  logo?: string;
}

export const ISSUERS: Record<string, Issuer> = {
  MAS: {
    code: 'MAS',
    label: 'Monetary Authority of Singapore',
    accent: '#1B2021',
    logo: '/logos/mas.png',
  },
  ACRA: {
    code: 'ACRA',
    label: 'Accounting and Corporate Regulatory Authority',
    accent: '#2F6B4F',
    logo: '/logos/acra.png',
  },
  SGX: { code: 'SGX', label: 'Singapore Exchange', accent: '#A67A16', logo: '/logos/sgx.png' },
  MinLaw: {
    code: 'MinLaw',
    label: 'Ministry of Law',
    accent: '#5A625F',
    logo: '/logos/minlaw.png',
  },
  Parliament: {
    code: 'PARL',
    label: 'Parliament of Singapore',
    accent: '#5A625F',
    logo: '/logos/parliament.png',
  },
  'AUSTRAC / ASIC': {
    code: 'ASIC',
    label: 'AUSTRAC and ASIC',
    accent: '#B4331F',
    logo: '/logos/austrac.png',
  },
};

export function issuerOf(name: unknown): Issuer | null {
  if (typeof name !== 'string') return null;
  return ISSUERS[name] ?? { code: name.slice(0, 4).toUpperCase(), label: name, accent: '#5A625F' };
}
