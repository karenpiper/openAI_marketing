export type FinservInput = { top20: boolean; entry: "tailored" | "broad"; captured: boolean; downloaded: boolean; event: "none" | "registered" | "attended"; meeting: boolean };
export const initialFinserv: FinservInput = { top20: true, entry: "tailored", captured: false, downloaded: false, event: "none", meeting: false };
export function finservResult(s: FinservInput) {
  const identified = s.captured && s.top20;
  const downloaded = s.captured && s.downloaded;
  const event = downloaded ? s.event : "none";
  const activeSales = s.captured && (s.meeting || (identified && event !== "none"));
  return {
    track: identified ? "Top 20" : "Broader market",
    next: !s.captured ? "Capture email on the landing page" : !downloaded ? "Send relevant proof and offer the guide again" : event === "none" ? `Invite to the ${identified ? "virtual roundtable" : "webinar"}` : event === "registered" ? "Send event confirmation and reminders" : "Send the event recap and a relevant next step",
    sales: activeSales ? identified ? "Account Director follow-up prompted" : "Route meeting request to Sales" : identified && downloaded ? "Account Director context ready · active follow-up pending" : "Continue marketing nurture",
    history: [s.entry === "tailored" ? "Account/persona ad → tailored landing page" : "Prospect ad → financial-workflow page", ...(s.captured ? ["Email captured → guide email delivered"] : []), ...(downloaded ? ["Guide download confirmed"] : []), ...(event !== "none" ? [`${identified ? "Roundtable" : "Webinar"}: ${event}`] : []), ...(s.captured && s.meeting ? ["Direct meeting request"] : [])],
  };
}
export const finservMeasures = [
  ["Audience engagement", "Unique finance prospects engaged; Top 20 accounts reached out of 20; buying-group roles engaged.", "Paid, web and account records"],
  ["Journey conversion", "Email captures → confirmed downloads → registrations → attendance. Show counts and conversion at each step.", "Web, email and event records"],
  ["Sales progression", "Handoffs accepted; follow-ups completed; meetings booked and held.", "Account Director and CRM records"],
  ["Commercial signals", "Opportunities created or advanced; sourced and influenced pipeline reported separately, without summing overlapping credit.", "CRM and agreed attribution rules"],
  ["Next actions", "Accounts for Sales follow-up, contacts for nurture, and changes for the next activation.", "Marketing and Sales review"],
];
