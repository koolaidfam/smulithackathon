import { formatDate } from '../lib/dates';
import type { Change } from '../types';

/**
 * The firm's own feed. The horizon feed is what regulators published. This is
 * what the firm says about it, in its own voice, to its own clients.
 *
 * The brain assembles the facts it can defend: which instrument moved, the
 * parameter delta, the commencement date, the citation, and which of the
 * firm's practice areas it reaches. It does not write the analysis. That is
 * the part clients pay for and the part a named lawyer signs.
 */
export type PublicationState = 'draft' | 'in_review' | 'client' | 'public';

export interface Publication {
  id: string;
  change_id: string;
  title: string;
  standfirst: string;
  author_id: string;
  state: PublicationState;
  updated_at: string;
  analysis: string;
}

export const STATE_LABEL: Record<PublicationState, string> = {
  draft: 'Draft',
  in_review: 'With a partner',
  client: 'Client feed',
  public: 'Public',
};

export const STATE_NOTE: Record<PublicationState, string> = {
  draft: 'Visible to the author only.',
  in_review: 'A partner has to sign this before it leaves the firm.',
  client: 'Sent to the clients subscribed to this practice area.',
  public: 'On the firm website, indexed, quotable by anyone.',
};

export function skeletonFor(change: Change, deltaLine: string, reach: string): string {
  return [
    `${change.title}.`,
    '',
    `What moved. ${deltaLine}`,
    `Commencement. ${change.instrument_ref}, in force ${formatDate(change.in_force_at)}.`,
    `Reach inside the firm. ${reach}`,
    '',
    'What this means for you.',
    '[The lawyer writes this. The brain does not draft the analysis.]',
    '',
    'What you should do now.',
    '[The lawyer writes this.]',
  ].join('\n');
}

export const seedPublications: Publication[] = [
  {
    id: 'pub-cdd',
    change_id: 'chg-mas-626',
    title: 'MAS lowers the occasional-transaction CDD threshold',
    standfirst: 'What the new figure means for onboarding and periodic review.',
    author_id: 'person-marcus',
    state: 'draft',
    updated_at: '2026-09-04T17:00:00+08:00',
    analysis: '',
  },
  {
    id: 'pub-sfo',
    change_id: 'chg-mas-626',
    title: 'Singapore makes it easier to establish a family office',
    standfirst: 'Two separate reforms explained.',
    author_id: 'person-priya',
    state: 'client',
    updated_at: '2026-08-24T09:00:00+08:00',
    analysis:
      'Published to the client feed on 24 August 2026. The working draft of this update is the one on the upload page.',
  },
];
