import { DRAFT_CHANGE_ID, LIVE_CHANGE_ID, edges } from '../data/seed';
import { routeTask } from '../engine/escalate';
import { propagateById, staleIds } from '../engine/propagate';

const live = propagateById(LIVE_CHANGE_ID, edges);
const draft = propagateById(DRAFT_CHANGE_ID, edges);
const stale = staleIds(live);
const bot = routeTask('doc-bot', edges);
const checks: Array<[string, boolean]> = [
  ['live is not a draft', !live.draft],
  ['draft change does not mark stale', draft.draft && staleIds(draft).size === 0],
  ['bot is stale', stale.has('doc-bot')],
  ['AML form is stale', stale.has('doc-aml-form')],
  ['training module is stale', stale.has('adv-training')],
  ['onboarding playbook is stale', stale.has('play-onboard')],
  ['intake workflow is stale', stale.has('flow-intake')],
  ['CMS pack is procedural', live.reached.some((a) => a.node_id === 'doc-cms' && a.action === 'procedural')],
  ['FMA is exposure', live.reached.some((a) => a.node_id === 'doc-fma' && a.action === 'flag_exposure')],
  ['template is bound, not stale', live.reached.some((a) => a.node_id === 'doc-template' && a.action === 'already_bound') && !stale.has('doc-template')],
  ['allotment stayed clean', live.clean.some((c) => c.node_id === 'doc-allotment')],
  ['video is a coverage gap', live.coverage.some((c) => c.node_id === 'adv-video')],
  ['bot escalates to Marcus', bot.escalated && bot.owner_id === 'person-marcus'],
  ['draft would reach the BO memo', draft.reached.some((a) => a.node_id === 'doc-bo-memo')],
  ['funds team is isolated', live.teams.some((t) => t.node_id === 'team-funds')],
];

const failed = checks.filter(([, ok]) => !ok);
for (const [name, ok] of checks) {
  console.log(`${ok ? 'ok' : 'FAIL'}  ${name}`);
}
if (failed.length) {
  throw new Error(`${failed.length} demo checks failed`);
}
console.log(`\n${checks.length} demo checks passed`);
