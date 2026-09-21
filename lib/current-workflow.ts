import type { Session } from "./workshop";
type Row = { label: string; ask: string; example: string };
const row = (label: string, ask: string, example: string): Row => ({
  label,
  ask,
  example,
});
export const currentWorkflowRows: Record<string, Row[]> = {
  s1: [
    row(
      "Account and people",
      "Where do you find account contacts and buying roles?",
      "CRM holds contacts; sales adds missing roles in a shared sheet.",
    ),
    row(
      "Engagement signals",
      "Which tools bring website, product and event activity together?",
      "Analytics shows visits; event attendance is imported separately.",
    ),
    row(
      "Audience grouping",
      "Where do you group people into accounts or segments?",
      "An analyst joins contact records to the account list.",
    ),
    row(
      "Coordinated outreach",
      "How do marketing and sales share audiences and next actions?",
      "Marketing exports the segment; sales checks it in CRM.",
    ),
    row(
      "Account progress",
      "Where do you measure group engagement and progression?",
      "A dashboard combines engagement with CRM stage changes.",
    ),
  ],
  s2: [
    row(
      "Signals",
      "Which tool shows who needs attention?",
      "Analytics identifies stalled users; an analyst shares the cohort.",
    ),
    row(
      "Audience context",
      "Where do you check who they are and what they have done?",
      "CRM adds account context; product usage lives in a separate report.",
    ),
    row(
      "Recommended action",
      "Where is the next action decided, and by whom?",
      "A marketer reviews the cohort in a spreadsheet and writes a brief.",
    ),
    row(
      "Routing the work",
      "Which tool passes the decision to the delivery team?",
      "A task links the brief; MOPS rebuilds the audience in the campaign tool.",
    ),
    row(
      "Response and learning",
      "Where do you see whether the action worked?",
      "Campaign results are joined to product activity in a dashboard.",
    ),
  ],
  s3: [
    row(
      "Audience selection",
      "Where do you identify the audience—analytics, CRM or a spreadsheet?",
      "Marketo builds the list; we export it to a spreadsheet for review.",
    ),
    row(
      "Brief and source assets",
      "Where does the brief live, and where do you find approved content?",
      "The brief is in a shared document; approved assets are in a library.",
    ),
    row(
      "Creation and adaptation",
      "Which tools do the team or agency use to produce variants?",
      "The agency uses its creation tools and returns version links in the task.",
    ),
    row(
      "Review and approval",
      "Where does feedback happen, and how is approval recorded?",
      "Feedback is in email; the project owner records approval in the tracker.",
    ),
    row(
      "Delivery and measurement",
      "What sends or publishes the content? Where do results come back?",
      "The campaign platform sends email; analytics and CRM track the response.",
    ),
  ],
  s4: [
    row(
      "Launch request",
      "Where is the campaign request and brief captured?",
      "A project form creates a task with the brief attached.",
    ),
    row(
      "Audience and assets",
      "Which tools supply the audience and final creative?",
      "The audience comes from CRM; creative links come from the asset library.",
    ),
    row(
      "Build and checks",
      "Where is the campaign built and tested?",
      "MOPS builds in the campaign tool and shares a test send.",
    ),
    row(
      "Approval",
      "Where is permission to launch recorded?",
      "The campaign owner approves in the project tracker.",
    ),
    row(
      "Launch and monitoring",
      "Which tools activate and monitor delivery?",
      "The campaign platform launches; a dashboard flags delivery failures.",
    ),
  ],
  s5: [
    row(
      "Request intake",
      "Where do routine requests arrive?",
      "A shared form creates a queue item; some requests arrive in chat.",
    ),
    row(
      "Triage",
      "Which tool holds the queue, and how is work assigned?",
      "An operations lead tags and assigns tickets in the service queue.",
    ),
    row(
      "Task execution",
      "Which tools does the operator use to complete the request?",
      "The operator updates a campaign list and records the change in the ticket.",
    ),
    row(
      "Exceptions",
      "Where do unusual requests go, with what context?",
      "The ticket is assigned to a specialist; missing details are requested in chat.",
    ),
    row(
      "Completion",
      "How is completion recorded and communicated?",
      "The operator closes the ticket and sends the requester a result link.",
    ),
  ],
  s6: [
    row(
      "Detect the issue",
      "Which tool or person flags something needing intervention?",
      "A campaign alert flags an error; the operator opens a ticket.",
    ),
    row(
      "Gather context",
      "Where does the reviewer find the evidence?",
      "Logs and the campaign brief are linked manually into the ticket.",
    ),
    row(
      "Route to a person",
      "How does the right specialist receive it?",
      "The queue assigns the incident; urgent cases are escalated in chat.",
    ),
    row(
      "Approve or stop",
      "Which tools let someone approve, change or pause the work?",
      "The campaign owner pauses delivery in the platform and records the decision.",
    ),
    row(
      "Resume and learn",
      "Where is the resolution recorded and the process updated?",
      "The ticket captures the fix; the owner updates the operating guide.",
    ),
  ],
  s7: [
    row(
      "Collect results",
      "Which systems hold campaign, event, product and sales results?",
      "Campaign data and CRM stages are exported into the warehouse.",
    ),
    row(
      "Connect the journey",
      "Where are audience activity and outcomes joined?",
      "An analyst matches identifiers across the warehouse and CRM.",
    ),
    row(
      "Analyze",
      "Which tool shows progression and where it stalls?",
      "The team uses a dashboard with segment and channel filters.",
    ),
    row(
      "Decide the next test",
      "Where are findings turned into an action or experiment?",
      "The marketer writes the recommendation in a shared experiment backlog.",
    ),
    row(
      "Feed the next brief",
      "How does the learning reach the next campaign?",
      "The project owner links the result to the next campaign brief.",
    ),
  ],
};
export function currentWorkflowText(s: Session, id: string) {
  const capture = s.currentWorkflows[id];
  if (!capture) return "";
  return [
    ...currentWorkflowRows[id].map(
      (r, i) => `${r.label}: ${capture.rows[String(i)] || "Not captured"}`,
    ),
    `Friction: ${capture.friction || "Not captured"}`,
  ].join("\n\n");
}
