import type {
  Change,
  DocumentParameter,
  FirmEdge,
  FirmNode,
  NodeKind,
  Parameter,
  Relation,
} from '../types';

export const FIRM_NAME = 'Hale & Tan LLP';

function n(
  id: string,
  kind: NodeKind,
  title: string,
  subtitle: string,
  cluster: string,
  extra: Partial<FirmNode> = {},
): FirmNode {
  return { id, kind, title, subtitle, cluster, props: {}, ...extra };
}

export const nodes: FirmNode[] = [
  n('src-mas-626', 'source', 'MAS Notice 626', 'AML and CFT for banks', 'aml', {
    jurisdiction: 'SG',
    props: { issuer: 'MAS', watched_default: true },
  }),
  n('src-sfa04-n02', 'source', 'MAS Notice SFA04-N02', 'CMS licence conduct', 'funds', {
    jurisdiction: 'SG',
    props: { issuer: 'MAS', watched_default: true },
  }),
  n('src-sfa04-g05', 'source', 'MAS Guidelines SFA04-G05', 'Fund management guidelines', 'funds', {
    jurisdiction: 'SG',
    props: { issuer: 'MAS', watched_default: true },
  }),
  n('src-vcc-act', 'source', 'VCC Act 2018', 'Variable capital companies', 'funds', {
    jurisdiction: 'SG',
    props: { issuer: 'Parliament', watched_default: true },
  }),
  n('src-vcc-reg', 'source', 'VCC Regulations', 'Implementation regulations', 'funds', {
    jurisdiction: 'SG',
    props: { issuer: 'MAS', watched_default: true },
  }),
  n('src-sgx-ch7', 'source', 'SGX Listing Rules Ch 7', 'Continuing obligations', 'markets', {
    jurisdiction: 'SG',
    props: { issuer: 'SGX', watched_default: true },
  }),
  n('src-acra-pd', 'source', 'ACRA Practice Direction', 'Filing and capital', 'corp', {
    jurisdiction: 'SG',
    props: { issuer: 'ACRA', watched_default: true },
  }),
  n('src-psn01', 'source', 'PS Act Notice PSN01', 'Payment services AML', 'aml', {
    jurisdiction: 'SG',
    props: { issuer: 'MAS', watched_default: true },
  }),
  n('src-sfoi', 'source', 'SF (Offers of Investments) Regs', 'Offers to investors', 'funds', {
    jurisdiction: 'SG',
    props: { issuer: 'MAS', watched_default: true },
  }),
  n('src-consult-bo', 'source', 'Consultation: beneficial ownership', 'MinLaw paper. Not in force.', 'corp', {
    jurisdiction: 'SG',
    props: { issuer: 'MinLaw', draft: true, watched_default: false },
  }),
  n('src-asic-aml', 'source', 'ASIC AML/CTF Rules', 'Australian parallel standard', 'aml', {
    jurisdiction: 'AU',
    props: { issuer: 'AUSTRAC / ASIC', watched_default: false },
  }),

  n('doc-vcc-const', 'document', 'VCC constitution template', 'Precedent · formal instrument', 'funds', {
    doc_class: 'formal',
    jurisdiction: 'SG',
    props: { of_record: 'knowledge://funds/vcc-constitution', lodgement: 'ACRA' },
  }),
  n('doc-side-letter', 'document', 'Sub-fund side letter', 'Template clause bank', 'funds', {
    doc_class: 'internal',
    jurisdiction: 'SG',
  }),
  n('doc-fma', 'document', 'Fund management agreement', 'Executed form used as house style', 'funds', {
    doc_class: 'bilateral',
    jurisdiction: 'SG',
    props: {
      change_in_law_clause: '18.3',
      change_in_law_text:
        'If a regulatory requirement applicable to the Services changes, the Manager will notify the Fund. Neither party may amend this agreement except in writing signed by both parties.',
    },
  }),
  n('doc-sub', 'document', 'Subscription agreement', 'Template', 'funds', {
    doc_class: 'internal',
    jurisdiction: 'SG',
  }),
  n('doc-ppm', 'document', 'Private placement memorandum', 'VCC information memorandum', 'funds', {
    doc_class: 'internal',
    jurisdiction: 'SG',
    props: {
      source_of_truth: 'VCC Act + MAS circulars on implementation',
    },
  }),
  n('doc-aml-form', 'document', 'AML and CFT onboarding form', 'Checklist · knowledge bank', 'aml', {
    doc_class: 'internal',
    jurisdiction: 'SG',
  }),
  n('doc-lpa', 'document', 'Limited partnership agreement', 'Template', 'funds', {
    doc_class: 'internal',
    jurisdiction: 'SG',
  }),
  n('doc-mandate', 'document', 'Investment mandate schedule', 'Template clause', 'funds', {
    doc_class: 'internal',
    jurisdiction: 'SG',
  }),
  n('doc-redemption', 'document', 'Redemption notice', 'Template', 'funds', {
    doc_class: 'internal',
    jurisdiction: 'SG',
  }),
  n('doc-resolutions', 'document', "Directors' resolutions set", 'Formal pack', 'corp', {
    doc_class: 'formal',
    jurisdiction: 'SG',
    props: { lodgement: 'ACRA' },
  }),
  n('doc-cms', 'document', 'CMS licence application pack', 'Regulatory filing pack', 'funds', {
    doc_class: 'formal',
    jurisdiction: 'SG',
  }),
  n('doc-custody', 'document', 'Custody arrangement clause', 'Clause bank', 'funds', {
    doc_class: 'internal',
    jurisdiction: 'SG',
  }),
  n('doc-vcc-check', 'document', 'VCC incorporation checklist', 'Internal checklist', 'funds', {
    doc_class: 'internal',
    jurisdiction: 'SG',
  }),
  n('doc-annual-check', 'document', 'Annual compliance checklist', 'Internal checklist', 'aml', {
    doc_class: 'internal',
    jurisdiction: 'SG',
  }),
  n('doc-bot', 'document', 'KYC gate automation', 'kyc-gate.rules.json · production', 'aml', {
    doc_class: 'internal',
    jurisdiction: 'SG',
    props: {
      silent_failure: true,
      production_automation: true,
      of_record: 'git://intake-bot/rules/kyc-gate.rules.json',
      silent_failure_why:
        'The bot skips CDD when the amount is below the hardcoded threshold. There is no alert, no exception queue, and no log line a partner would see. Matters between S$5,000 and S$20,000 will open without CDD and nobody is told.',
    },
  }),
  n('doc-template', 'document', 'Engagement letter precedent', 'Already bound to CDD-OCCASIONAL', 'aml', {
    doc_class: 'internal',
    jurisdiction: 'SG',
    props: { bound_to_parameter: true },
  }),
  n('doc-allotment', 'document', 'Share allotment checklist', 'Corporate · v3.1', 'corp', {
    doc_class: 'internal',
    jurisdiction: 'SG',
    props: {
      keyword_hit: 'S$20,000',
      clean_reason:
        'The figure S$20,000 appears as the Companies Act paid-up capital floor, not as a CDD threshold. No stored edge connects this checklist to MAS Notice 626. A keyword sweep on 20,000 would have flagged it. The brain did not.',
    },
  }),
  n('doc-bo-memo', 'document', 'Beneficial ownership working memo', 'Mapped to the consultation paper', 'corp', {
    doc_class: 'internal',
    jurisdiction: 'SG',
    props: { maps_draft: true },
  }),

  n('play-launch', 'playbook', 'Fund launch playbook', 'Working practice · funds', 'funds', {
    doc_class: 'internal',
    jurisdiction: 'SG',
  }),
  n('play-onboard', 'playbook', 'Client onboarding playbook', 'Working practice · AML', 'aml', {
    doc_class: 'internal',
    jurisdiction: 'SG',
  }),
  n('play-kyc', 'playbook', 'KYC risk rating playbook', 'Working practice · AML', 'aml', {
    doc_class: 'internal',
    jurisdiction: 'SG',
  }),
  n('play-listing', 'playbook', 'Listing sponsor playbook', 'Working practice · markets', 'markets', {
    doc_class: 'internal',
    jurisdiction: 'SG',
  }),

  n('flow-intake', 'workflow', 'New client intake', 'Matter opening sequence', 'aml', {
    doc_class: 'internal',
    jurisdiction: 'SG',
  }),
  n('flow-launch', 'workflow', 'Sub-fund launch', 'Transaction project', 'funds', {
    doc_class: 'internal',
    jurisdiction: 'SG',
  }),
  n('flow-filing', 'workflow', 'Annual regulatory filing', 'Compliance project', 'aml', {
    doc_class: 'internal',
    jurisdiction: 'SG',
  }),
  n('flow-conflicts', 'workflow', 'Matter opening and conflicts', 'Intake project', 'corp', {
    doc_class: 'internal',
    jurisdiction: 'SG',
  }),
  n('flow-kyc', 'workflow', 'Periodic KYC refresh', 'Ongoing AML project', 'aml', {
    doc_class: 'internal',
    jurisdiction: 'SG',
  }),
  // Workflows this amendment does not touch. A firm is always running more
  // work than any one circular reaches, and a blast radius that covers
  // everything is a blast radius nobody believes.
  n('flow-ipo', 'workflow', 'IPO readiness review', 'Listing project', 'markets', {
    doc_class: 'internal',
    jurisdiction: 'SG',
  }),
  n('flow-vcc', 'workflow', 'VCC incorporation', 'Fund formation project', 'funds', {
    doc_class: 'internal',
    jurisdiction: 'SG',
  }),
  n('flow-secretarial', 'workflow', 'Board and secretarial calendar', 'Corporate housekeeping', 'corp', {
    doc_class: 'internal',
    jurisdiction: 'SG',
  }),
  n('flow-distrib', 'workflow', 'Subscription and redemption', 'Fund operations project', 'funds', {
    doc_class: 'internal',
    jurisdiction: 'SG',
  }),

  n('adv-vcc', 'advisory', 'Advisory: VCC re-domiciliation', 'Client-facing note, Q1 2026', 'funds', {
    doc_class: 'internal',
    jurisdiction: 'SG',
    props: { outward: true },
  }),
  n('adv-aml', 'advisory', 'Advisory: AML tightening', 'Client-facing note, Nov 2025', 'aml', {
    doc_class: 'internal',
    jurisdiction: 'SG',
    props: { outward: true },
  }),
  n('adv-training', 'advisory', 'Associate training module', 'Internal publication · 2025 intake', 'aml', {
    doc_class: 'internal',
    jurisdiction: 'SG',
    props: { training: true },
  }),
  n('adv-precedent', 'advisory', 'Precedent bank entry', 'Internal knowledge note', 'funds', {
    doc_class: 'internal',
    jurisdiction: 'SG',
  }),
  n('adv-news', 'advisory', 'Funds team newsletter', 'Internal publication', 'funds', {
    doc_class: 'internal',
    jurisdiction: 'SG',
  }),
  n('adv-video', 'advisory', 'AML refresh lunch-and-learn', 'Recording, 18 Nov 2025 · unmapped', 'aml', {
    doc_class: 'internal',
    jurisdiction: 'SG',
    props: {
      unmapped: true,
      embedding_hint:
        'The transcript discusses occasional-transaction CDD and the S$20,000 figure. An embedding suggested a feeds edge from MAS Notice 626. No one has confirmed it. Until that happens, the brain will not flag this recording.',
    },
  }),

  n('team-funds', 'team', 'Investment Funds', 'Practice group', 'people', { jurisdiction: 'SG' }),
  n('team-markets', 'team', 'Corporate and Capital Markets', 'Practice group', 'people', {
    jurisdiction: 'SG',
  }),
  n('team-reg', 'team', 'Regulatory and Compliance', 'Practice group', 'people', { jurisdiction: 'SG' }),
  n('team-bank', 'team', 'Banking', 'Practice group', 'people', { jurisdiction: 'SG' }),

  n('person-chen', 'person', 'Chen Wei Ling', 'Senior Partner, Regulatory', 'people', {
    props: { rank: 'senior', practice: 'Regulatory', team: 'team-reg' },
  }),
  n('person-marcus', 'person', 'Marcus Hale', 'Partner, Financial Crime', 'people', {
    props: { rank: 'partner', practice: 'Financial Crime', team: 'team-reg' },
  }),
  n('person-priya', 'person', 'Priya Nair', 'Senior Associate, Funds', 'people', {
    props: { rank: 'associate', practice: 'Investment Funds', team: 'team-funds' },
  }),
  n('person-tomoko', 'person', 'Tomoko Sato', 'Associate, Knowledge', 'people', {
    props: { rank: 'associate', practice: 'Knowledge', team: 'team-reg' },
  }),
  n('person-jamie', 'person', 'Jamie Koh', 'Intern, Technology', 'people', {
    props: { rank: 'intern', practice: 'Technology', team: 'team-reg' },
  }),
];

function edge(
  id: string,
  src: string,
  dst: string,
  relation: Relation,
  opts: Partial<FirmEdge> = {},
): FirmEdge {
  return {
    id,
    src,
    dst,
    relation,
    confidence: opts.confidence ?? 1,
    source_system: opts.source_system ?? 'import:knowledge',
    created_at: opts.created_at ?? '2025-01-14T00:00:00+08:00',
    confirmed_by: opts.confirmed_by === undefined ? 'Marcus Hale' : opts.confirmed_by,
    confirmed_at: opts.confirmed_at === undefined ? '2025-01-14T00:00:00+08:00' : opts.confirmed_at,
  };
}

const FEEDS: Array<[string, string, string]> = [
  ['src-mas-626', 'doc-aml-form', 'e-626-aml'],
  ['src-mas-626', 'doc-annual-check', 'e-626-ann'],
  ['src-mas-626', 'play-onboard', 'e-626-pon'],
  ['src-mas-626', 'play-kyc', 'e-626-pkyc'],
  ['src-mas-626', 'adv-aml', 'e-626-adv'],
  ['src-mas-626', 'doc-sub', 'e-626-sub'],
  ['src-mas-626', 'doc-cms', 'e-626-cms'],
  ['src-mas-626', 'play-launch', 'e-626-pl'],
  ['src-mas-626', 'adv-training', 'e-626-train'],
  ['src-mas-626', 'doc-bot', 'e-626-bot'],
  ['src-mas-626', 'doc-template', 'e-626-tpl'],
  ['src-mas-626', 'doc-fma', 'e-626-fma'],
  ['src-sfa04-n02', 'doc-fma', 'e-n02-fma'],
  ['src-sfa04-n02', 'doc-mandate', 'e-n02-man'],
  ['src-sfa04-n02', 'doc-cms', 'e-n02-cms'],
  ['src-sfa04-n02', 'play-launch', 'e-n02-pl'],
  ['src-sfa04-n02', 'doc-custody', 'e-n02-cus'],
  ['src-sfa04-n02', 'adv-training', 'e-n02-tr'],
  ['src-sfa04-g05', 'doc-fma', 'e-g05-fma'],
  ['src-sfa04-g05', 'doc-ppm', 'e-g05-ppm'],
  ['src-sfa04-g05', 'play-launch', 'e-g05-pl'],
  ['src-sfa04-g05', 'doc-cms', 'e-g05-cms'],
  ['src-sfa04-g05', 'doc-lpa', 'e-g05-lpa'],
  ['src-sfa04-g05', 'doc-custody', 'e-g05-cus'],
  ['src-sfa04-g05', 'adv-precedent', 'e-g05-pr'],
  ['src-vcc-act', 'doc-vcc-const', 'e-va-const'],
  ['src-vcc-act', 'doc-resolutions', 'e-va-res'],
  ['src-vcc-act', 'doc-vcc-check', 'e-va-chk'],
  ['src-vcc-act', 'play-launch', 'e-va-pl'],
  ['src-vcc-act', 'adv-vcc', 'e-va-adv'],
  ['src-vcc-reg', 'doc-vcc-const', 'e-vr-const'],
  ['src-vcc-reg', 'doc-vcc-check', 'e-vr-chk'],
  ['src-vcc-reg', 'doc-side-letter', 'e-vr-sl'],
  ['src-vcc-reg', 'adv-vcc', 'e-vr-adv'],
  ['src-sgx-ch7', 'doc-sub', 'e-sgx-sub'],
  ['src-sgx-ch7', 'play-listing', 'e-sgx-pl'],
  ['src-sgx-ch7', 'doc-ppm', 'e-sgx-ppm'],
  ['src-sgx-ch7', 'adv-news', 'e-sgx-news'],
  ['src-acra-pd', 'doc-resolutions', 'e-ac-res'],
  ['src-acra-pd', 'doc-vcc-check', 'e-ac-chk'],
  ['src-acra-pd', 'doc-annual-check', 'e-ac-ann'],
  ['src-acra-pd', 'doc-allotment', 'e-ac-allot'],
  ['src-psn01', 'doc-aml-form', 'e-ps-aml'],
  ['src-psn01', 'play-kyc', 'e-ps-kyc'],
  ['src-psn01', 'adv-aml', 'e-ps-adv'],
  ['src-sfoi', 'doc-sub', 'e-sf-sub'],
  ['src-sfoi', 'doc-ppm', 'e-sf-ppm'],
  ['src-sfoi', 'doc-redemption', 'e-sf-red'],
  ['src-consult-bo', 'doc-bo-memo', 'e-bo-memo'],
  ['src-asic-aml', 'doc-aml-form', 'e-asic-aml'],
  ['doc-aml-form', 'flow-intake', 'e-aml-in'],
  ['doc-aml-form', 'flow-kyc', 'e-aml-kyc'],
  ['doc-aml-form', 'flow-conflicts', 'e-aml-cf'],
  ['doc-bot', 'flow-intake', 'e-bot-in'],
  ['doc-annual-check', 'flow-filing', 'e-ann-fil'],
  ['play-onboard', 'flow-intake', 'e-pon-in'],
  ['play-onboard', 'flow-conflicts', 'e-pon-cf'],
  ['play-kyc', 'flow-kyc', 'e-pk-kyc'],
  ['doc-vcc-const', 'flow-launch', 'e-vc-la'],
  ['doc-vcc-check', 'flow-launch', 'e-vck-la'],
  ['doc-side-letter', 'flow-launch', 'e-sl-la'],
  ['doc-fma', 'flow-launch', 'e-fma-la'],
  ['doc-ppm', 'flow-launch', 'e-ppm-la'],
  ['doc-sub', 'flow-launch', 'e-sub-la'],
  ['doc-resolutions', 'flow-filing', 'e-res-fil'],
  ['doc-cms', 'flow-filing', 'e-cms-fil'],
  ['doc-mandate', 'flow-launch', 'e-man-la'],
  ['doc-redemption', 'flow-filing', 'e-red-fil'],
  ['doc-lpa', 'flow-launch', 'e-lpa-la'],
  ['doc-custody', 'flow-launch', 'e-cus-la'],
  ['play-launch', 'flow-launch', 'e-pl-la'],
  ['play-listing', 'flow-launch', 'e-plist-la'],
  ['play-launch', 'adv-training', 'e-pl-tr'],
  ['flow-intake', 'team-funds', 'e-in-tf'],
  ['flow-intake', 'team-reg', 'e-in-tr'],
  ['flow-launch', 'team-funds', 'e-la-tf'],
  ['flow-filing', 'team-reg', 'e-fil-tr'],
  ['flow-filing', 'team-markets', 'e-fil-tm'],
  ['flow-conflicts', 'team-funds', 'e-cf-tf'],
  ['flow-conflicts', 'team-markets', 'e-cf-tm'],
  ['flow-kyc', 'team-reg', 'e-kyc-tr'],
  ['flow-kyc', 'team-bank', 'e-kyc-tb'],
  // Feeders for the untouched workflows. None of these sit downstream of
  // MAS Notice 626, so publishing that amendment leaves them alone.
  ['play-listing', 'flow-ipo', 'e-pl-ipo'],
  ['doc-allotment', 'flow-ipo', 'e-al-ipo'],
  ['doc-resolutions', 'flow-ipo', 'e-rs-ipo'],
  ['flow-ipo', 'team-markets', 'e-ipo-tm'],
  ['doc-vcc-const', 'flow-vcc', 'e-vc-vcc'],
  ['doc-vcc-check', 'flow-vcc', 'e-vk-vcc'],
  ['flow-vcc', 'team-funds', 'e-vcc-tf'],
  ['doc-resolutions', 'flow-secretarial', 'e-rs-sec'],
  ['doc-allotment', 'flow-secretarial', 'e-al-sec'],
  ['flow-secretarial', 'team-markets', 'e-sec-tm'],
  ['doc-ppm', 'flow-distrib', 'e-ppm-ds'],
  ['doc-redemption', 'flow-distrib', 'e-rd-ds'],
  ['doc-mandate', 'flow-distrib', 'e-md-ds'],
  ['doc-side-letter', 'flow-distrib', 'e-sl-ds'],
  ['flow-distrib', 'team-funds', 'e-ds-tf'],
  ['adv-vcc', 'team-funds', 'e-av-tf'],
  ['adv-aml', 'team-reg', 'e-aa-tr'],
  ['adv-aml', 'team-bank', 'e-aa-tb'],
  ['adv-training', 'team-funds', 'e-at-tf'],
  ['adv-precedent', 'team-funds', 'e-ap-tf'],
  ['adv-news', 'team-funds', 'e-an-tf'],
];

const OWN: Array<[string, string]> = [
  ['doc-aml-form', 'person-priya'],
  ['doc-bot', 'person-jamie'],
  ['adv-training', 'person-tomoko'],
  ['doc-annual-check', 'person-priya'],
  ['play-onboard', 'person-priya'],
  ['play-kyc', 'person-marcus'],
  ['play-launch', 'person-priya'],
  ['doc-vcc-const', 'person-priya'],
  ['doc-fma', 'person-marcus'],
  ['doc-ppm', 'person-priya'],
  ['doc-template', 'person-priya'],
  ['doc-allotment', 'person-priya'],
  ['adv-aml', 'person-marcus'],
  ['adv-video', 'person-tomoko'],
  ['doc-bo-memo', 'person-chen'],
  ['flow-intake', 'person-priya'],
  ['flow-kyc', 'person-jamie'],
  ['flow-launch', 'person-priya'],
];

export const edges: FirmEdge[] = [
  ...FEEDS.map(([src, dst, id]) =>
    edge(id, src, dst, 'feeds', {
      source_system: src.startsWith('src-asic') ? 'import:parallel' : 'import:knowledge',
      confirmed_by: src === 'src-consult-bo' ? 'Chen Wei Ling' : 'Marcus Hale',
    }),
  ),
  edge('e-video-proposed', 'src-mas-626', 'adv-video', 'feeds', {
    source_system: 'suggest:embedding',
    confidence: 0.74,
    created_at: '2026-08-16T00:00:00+08:00',
    confirmed_by: null,
    confirmed_at: null,
  }),
  ...OWN.map(([src, dst]) =>
    edge(`e-own-${src}`, src, dst, 'owned_by', { source_system: 'import:matter' }),
  ),
  edge('e-sup-jamie', 'person-jamie', 'person-priya', 'supervised_by', {
    source_system: 'import:practice-directory',
  }),
  edge('e-sup-priya', 'person-priya', 'person-marcus', 'supervised_by', {
    source_system: 'import:practice-directory',
  }),
  edge('e-sup-tomoko', 'person-tomoko', 'person-marcus', 'supervised_by', {
    source_system: 'import:practice-directory',
  }),
  edge('e-sup-marcus', 'person-marcus', 'person-chen', 'supervised_by', {
    source_system: 'import:practice-directory',
  }),
  edge('e-staff-funds-priya', 'team-funds', 'person-priya', 'staffed_by', {
    source_system: 'import:practice-directory',
  }),
  edge('e-staff-reg-marcus', 'team-reg', 'person-marcus', 'staffed_by', {
    source_system: 'import:practice-directory',
  }),
  edge('e-staff-reg-chen', 'team-reg', 'person-chen', 'staffed_by', {
    source_system: 'import:practice-directory',
  }),
  edge('e-staff-reg-tomoko', 'team-reg', 'person-tomoko', 'staffed_by', {
    source_system: 'import:practice-directory',
  }),
  edge('e-staff-reg-jamie', 'team-reg', 'person-jamie', 'staffed_by', {
    source_system: 'import:practice-directory',
  }),
];

export const parameters: Parameter[] = [
  {
    id: 'param-cdd',
    name: 'Occasional-transaction CDD threshold',
    value: '5000',
    previous_value: '20000',
    unit: 'SGD',
    effective_from: '2026-10-01',
    effective_to: null,
    citation: 'MAS Notice 626 para. 7.3, as amended 15 Aug 2026',
  },
  {
    id: 'param-cdd-prior',
    name: 'Occasional-transaction CDD threshold (prior)',
    value: '20000',
    unit: 'SGD',
    effective_from: '2015-07-01',
    effective_to: '2026-09-30',
    citation: 'MAS Notice 626 para. 7.3 (prior)',
  },
  {
    id: 'param-str',
    name: 'Suspicious transaction report window',
    value: '15',
    unit: 'business days',
    effective_from: '2015-07-01',
    effective_to: null,
    citation: 'MAS Notice 626 para. 15',
  },
];

const WHY_CDD =
  'This artifact hardcodes the occasional-transaction CDD threshold taken from MAS Notice 626 para. 7.3. The amendment replaces S$20,000 with S$5,000. That is the source of truth this file still assumes.';

export const documentParameters: DocumentParameter[] = [
  {
    document_id: 'doc-aml-form',
    parameter_id: 'param-cdd',
    location: 'Section C, item 4',
    hardcoded: true,
    excerpt: 'If the occasional transaction is below S$20,000, simplified CDD may be applied.',
    edit_kind: 'mechanical',
    mechanical_edit: 'If the occasional transaction is below S$5,000, simplified CDD may be applied.',
    why: WHY_CDD,
  },
  {
    document_id: 'doc-bot',
    parameter_id: 'param-cdd',
    location: 'rule skip_cdd.threshold',
    hardcoded: true,
    excerpt: 'if (amountSgd < 20000) { skipCdd = true; }',
    edit_kind: 'mechanical',
    mechanical_edit: 'if (amountSgd < 5000) { skipCdd = true; }',
    why: WHY_CDD,
  },
  {
    document_id: 'adv-training',
    parameter_id: 'param-cdd',
    location: 'Module 3, speaker note',
    hardcoded: true,
    excerpt:
      'Associates should consider whether occasional-transaction CDD is still warranted below S$20,000 when the client is in a high-risk sector.',
    edit_kind: 'substantive',
    why: WHY_CDD,
  },
  {
    document_id: 'play-onboard',
    parameter_id: 'param-cdd',
    location: 'Step 4',
    hardcoded: true,
    excerpt: 'Apply simplified CDD under S$20,000 unless other risk factors apply.',
    edit_kind: 'mechanical',
    mechanical_edit: 'Apply simplified CDD under S$5,000 unless other risk factors apply.',
    why: WHY_CDD,
  },
  {
    document_id: 'play-kyc',
    parameter_id: 'param-cdd',
    location: 'Risk table',
    hardcoded: true,
    excerpt: 'Band A: occasional transaction under S$20,000.',
    edit_kind: 'mechanical',
    mechanical_edit: 'Band A: occasional transaction under S$5,000.',
    why: WHY_CDD,
  },
  {
    document_id: 'adv-aml',
    parameter_id: 'param-cdd',
    location: 'Second paragraph',
    hardcoded: true,
    excerpt: 'Singapore still permits simplified CDD below S$20,000 for occasional transactions.',
    edit_kind: 'substantive',
    why: 'This client advisory states the old threshold as current law. The house voice can be drafted. A partner decides whether to publish.',
  },
  {
    document_id: 'doc-annual-check',
    parameter_id: 'param-cdd',
    location: 'Item 7',
    hardcoded: true,
    excerpt: 'Confirm simplified-CDD files are all under S$20,000.',
    edit_kind: 'mechanical',
    mechanical_edit: 'Confirm simplified-CDD files are all under S$5,000.',
    why: WHY_CDD,
  },
  {
    document_id: 'doc-template',
    parameter_id: 'param-cdd',
    location: 'Schedule B · {{CDD-OCCASIONAL}}',
    hardcoded: false,
    excerpt:
      'The Firm will apply simplified CDD to occasional transactions below {{CDD-OCCASIONAL}} unless the Client instructs otherwise.',
    edit_kind: 'none',
    why: 'This precedent already points at the parameter. Republish so rendered copies pick up S$5,000. There is no hardcoded figure to replace.',
  },
  {
    document_id: 'doc-cms',
    parameter_id: 'param-cdd',
    location: 'Annex B',
    hardcoded: true,
    excerpt: 'The applicant applies simplified CDD below S$20,000.',
    edit_kind: 'none',
    why: 'This is a formal filing pack. Changing it needs a review and a lodgement. The brain will not draft a redline.',
  },
];

export const changes: Change[] = [
  {
    id: 'chg-mas-626',
    source_node: 'src-mas-626',
    instrument_ref: 'MAS Notice 626 / 2026',
    title: 'MAS Notice 626 amendment',
    summary:
      'The occasional-transaction CDD threshold moves from S$20,000 to S$5,000. The textual delta is the figure in para. 7.3. Classification of that delta is the only model job.',
    parameter_id: 'param-cdd',
    gazetted_at: '2026-08-15T00:00:00+08:00',
    in_force_at: '2026-10-01T00:00:00+08:00',
  },
  {
    id: 'chg-consult-bo',
    source_node: 'src-consult-bo',
    instrument_ref: 'MinLaw CP 07/2026',
    title: 'Consultation: beneficial ownership register',
    summary:
      'Mapped so the firm can see what a future instrument would reach. Nothing downstream is marked flagged. A system that redlines on drafts trains people to ignore redlines.',
    parameter_id: 'param-cdd',
    gazetted_at: '2026-07-01T00:00:00+08:00',
    in_force_at: '2027-04-01T00:00:00+08:00',
  },
  {
    id: 'chg-asic-aml',
    source_node: 'src-asic-aml',
    instrument_ref: 'AUSTRAC Rules 2026',
    title: 'ASIC / AUSTRAC AML tightening',
    summary:
      'A parallel jurisdiction moved. This source is off the horizon until a lawyer adds Australia to the watch list and publishes the amendment by hand.',
    parameter_id: 'param-cdd',
    gazetted_at: '2026-08-20T00:00:00+10:00',
    in_force_at: '2026-11-01T00:00:00+10:00',
  },
];

export const LIVE_CHANGE_ID = 'chg-mas-626';
export const DRAFT_CHANGE_ID = 'chg-consult-bo';
export const PARALLEL_CHANGE_ID = 'chg-asic-aml';

export const DEFAULT_WATCHED = nodes
  .filter((node) => node.kind === 'source' && node.props.watched_default)
  .map((node) => node.id);
