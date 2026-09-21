// Illustrative extension requested by Karen; not additional attributed OpenAI feedback.
export const eventContext: Record<string, { story: string; proof: string }> = {
  s1: {
    story:
      "Imagine those 18 people around an enterprise webinar. Some registered but missed it. Others attended a security session; one asked to speak with the team. Morgan needs to understand each person's path while seeing how the account is progressing as a whole.",
    proof:
      "Can we connect registration, attendance and subsequent engagement to the right person and account, with enough coverage to form useful audiences?",
  },
  s2: {
    story:
      "An event list tells Morgan who signed up. To choose the next message, she needs to see what happened before and after: which topic brought them in, whether they attended, and what they explored next. A no-show and someone asking a security question have different needs.",
    proof:
      "Can the team use a connected history of event, email and website engagement to define audiences and explain why each should receive a different next message?",
  },
  s3: {
    story:
      "The event gives Morgan several reasons to follow up. A no-show may need the recording. Someone exploring security may need an approved answer to a specific question. A person requesting a conversation needs a relevant handoff. One generic thank-you email leaves those differences unused.",
    proof:
      "Can we match each audience to approved messaging and reuse the content across events, without writing a separate campaign for every person?",
  },
  s4: {
    story:
      "Now Morgan needs to get those different messages out while the event is still fresh. If every audience means another spreadsheet, brief and approval chain, more relevant follow-up also means more work. The value to prove is whether one marketer can run several tailored paths within a repeatable process.",
    proof:
      "Can the team launch approved follow-up for several event audiences faster, with fewer manual hours per audience?",
  },
  s5: {
    story:
      "Before the recording goes out, Morgan needs the audience to reflect what people have done since the webinar. Someone who has already watched on demand shouldn't receive another missed-you message. Rebuilding and checking that list by hand is the repeatable work to interrogate here.",
    proof:
      "Can a routine event follow-up use current audience membership and contact permissions without repeated list-building requests?",
  },
  s6: {
    story:
      "The senior contact attended the event and is already speaking with sales. Their activity may qualify them for a broader segment, but Morgan needs to know when an active relationship should change or pause the next message.",
    proof:
      "Can the team identify the event follow-ups that require a person to review, change or stop them before sending?",
  },
  s7: {
    story:
      "At 6:00 PM, Morgan can count registrations, attendance and clicks. What she needs to learn is which paths led people toward a useful next step: did no-shows watch the recording, did security-focused attendees engage with the follow-up, and did requested conversations happen? Over the following weeks, she also needs to see which audiences progressed into opportunities.",
    proof:
      "Can we compare progression and drop-off by audience across the event and its follow-up, then use that learning to change the next audience or message?",
  },
};
export const eventSegments = [
  {
    audience: "Registered, missed the event",
    signal:
      "Registered for the webinar; hasn't attended or watched the recording.",
    message:
      "Catch up on the session you missed. Here’s the recording and a short summary.",
    outcome: "Recording viewers / eligible no-shows contacted",
  },
  {
    audience: "Exploring security",
    signal:
      "Attended the security session and explored related material; has not requested a conversation.",
    message:
      "Continue with the security topic you explored. Here’s the approved guide with more detail.",
    outcome: "Follow-up resource engagement / eligible contacts messaged",
  },
  {
    audience: "Asked for a conversation",
    signal: "Explicitly requested contact during or after the event.",
    message: "Let’s pick up your question with the right person on our team.",
    outcome: "Completed conversations / eligible contact requests",
  },
];
