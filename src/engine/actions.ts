import { documentParameters, parameters } from '../data/seed';
import type { ActionKind, AffectedAsset, DocClass } from '../types';
import { getNode } from './graph';

export function actionLabel(action: ActionKind): string {
  switch (action) {
    case 'propose_edit':
      return 'Proposed edit and owner sign-off';
    case 'procedural':
      return 'Procedural task. No redline.';
    case 'flag_exposure':
      return 'Flagged exposure. No edit.';
    case 'already_bound':
      return 'Already bound to the parameter';
    case 'not_affected':
      return 'Not affected';
  }
}

export function actionWhy(action: ActionKind, _docClass?: DocClass): string {
  if (action === 'procedural') {
    return 'This is a formal instrument. Changing it needs a resolution and a lodgement. The brain will not draft a redline.';
  }
  if (action === 'flag_exposure') {
    return 'This is an executed contract. No party can amend it unilaterally. The brain flags the exposure and any change-in-law clause.';
  }
  if (action === 'already_bound') {
    return 'This document already points at the parameter. Republish so rendered copies pick up the new value. There is no hardcoded figure to replace.';
  }
  if (action === 'propose_edit') {
    return 'If the edit is mechanical, the brain proposes replacement text with a citation. If it is substantive, a named lawyer decides the wording. Step five is a hard gate.';
  }
  return 'Document class determines the action.';
}

export function parameterDelta(parameterId: string) {
  const next = parameters.find((p) => p.id === parameterId);
  if (!next) return null;
  return {
    name: next.name,
    from: next.previous_value ?? 'n/a',
    to: next.value,
    unit: next.unit,
    citation: next.citation,
    effective_from: next.effective_from,
  };
}

export function bindingFor(documentId: string, parameterId: string) {
  return documentParameters.find(
    (b) => b.document_id === documentId && b.parameter_id === parameterId,
  );
}

export function classVerb(docClass?: DocClass): string {
  if (docClass === 'formal') return 'Lodge a change';
  if (docClass === 'bilateral') return 'Record the exposure';
  return 'Dispose of the task';
}

export function silentFailureCopy(asset: AffectedAsset): string | null {
  if (!asset.silent_failure) return null;
  const node = getNode(asset.node_id);
  return (node?.props.silent_failure_why as string | undefined) ?? null;
}
