import { currentWorkflowText } from "./current-workflow";
import type { Session } from "./workshop";
import { currentQuestions, findAnswer } from "./workshop-guide";
export function currentStory(s: Session, caseId: string): string {
  if (s.currentWorkflows[caseId]) return currentWorkflowText(s, caseId);
  if (Object.prototype.hasOwnProperty.call(s.currentStories, caseId))
    return s.currentStories[caseId];
  return currentQuestions[caseId]
    .map((q) => {
      const a = findAnswer(s, caseId, q);
      if (!a) return "";
      const notes = [
        a.evidence,
        a.system && `Tools: ${a.system}`,
        a.owner && `People: ${a.owner}`,
        a.gap && `Friction / gaps: ${a.gap}`,
      ].filter(Boolean);
      return notes.length ? `${q.label}\n${notes.join("\n")}` : "";
    })
    .filter(Boolean)
    .join("\n\n");
}
