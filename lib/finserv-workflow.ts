import { finservResult, initialFinserv, type FinservInput } from "./finserv";
export const workflowSteps = ["Morning brief", "Audience & plan", "Content studio", "Review & approval", "Channel handoffs", "Activation & exceptions", "December learning"];
export const channels = ["LinkedIn / paid", "Web", "Email", "Events", "Sales"] as const;
export const reviewers = ["Morgan", "Brand / asset owner", "Legal / privacy"] as const;
export const sources = [
  { id: "workflow", title: "Financial Workflow Leaders Guide", description: "A practical framework for selecting a workflow, aligning owners and planning an evaluation.", claim: "Start with one workflow, a named owner and a clear measure of progress." },
  { id: "governance", title: "Responsible Evaluation Guide", description: "An evaluation framework for business sponsors, technical teams and procurement.", claim: "Bring business, technical and governance teams into the evaluation early." },
];
export type Asset = { id: string; track: "Top 20" | "Broader market"; channel: typeof channels[number]; title: string; body: string; cta: string; persona?: string };
export type Contact = { id:string; name:string; account:string; role:string; owner:string; input:FinservInput; matched:boolean; eligible:boolean; excluded:boolean; proof:boolean; accepted:boolean; followed:boolean; meetingHeld:boolean; log:string[] };
export type Workflow = { version:2; step:number; objective:string; instruction:string; activation:string; roundtable:string; webinar:string; source:string; briefConfirmed:boolean; audienceConfirmed:boolean; revision:number; assets:Asset[]; reviews:Record<string,string>; feedback:string; handoffs:Record<string,{owner:string;staged:boolean}>; launched:boolean; contacts:Contact[]; activity:string[]; turns:{prompt:string;reply:string}[]; learning:string; appliedLearning:string; actions:{title:string;owner:string;due:string;done:boolean}[] };
export function createWorkflow():Workflow {
 const people = [
  ["Maya Chen","Cedar & Finch","Business sponsor","Alex Rivera","top","broad"],
  ["Sam Patel","Cedar & Finch","Technical evaluator","Alex Rivera","top","tailored"],
  ["Avery Stone","Harborline Bank","Procurement lead","Taylor Brooks","top","tailored"],
  ["Jordan Lee","Elm Financial","Operations lead","Sales development","broad","broad"],
  ["Riley Park","Pine Mutual","Business sponsor","Sales development","broad","broad"],
  ["Casey Morgan","Lake Finance","Technical evaluator","Sales development","broad","broad"],
 ];
 return {version:2,step:0,objective:"Turn finance interest into qualified conversations and Top 20 buying-group engagement.",instruction:"Prioritize practical workflow evaluation. Use role-specific value for Top 20; keep the broad campaign inclusive.",activation:"October–November",roundtable:"November · date to confirm",webinar:"November · date to confirm",source:"workflow",briefConfirmed:false,audienceConfirmed:false,revision:1,assets:[],reviews:{},feedback:"",handoffs:Object.fromEntries(channels.map(c=>[c,{owner:c==="Sales"?"Account Directors":c==="Events"?"Events team":"Marketing operations",staged:false}])),launched:false,contacts:people.map((p,i)=>({id:`contact-${i}`,name:p[0],account:p[1],role:p[2],owner:p[3],input:{...initialFinserv,top20:p[4]==="top",entry:p[5] as FinservInput["entry"]},matched:i!==2,eligible:i!==5,excluded:false,proof:false,accepted:false,followed:false,meetingHeld:false,log:[]})),activity:[],turns:[],learning:"",appliedLearning:"",actions:[{title:"Complete priority-account follow-up",owner:"Account Directors",due:"Early December",done:false},{title:"Send event recaps and continue nurture",owner:"Lifecycle marketing",due:"Early December",done:false},{title:"Reconcile journey and CRM evidence",owner:"Marketing operations",due:"Mid-December",done:false},{title:"Agree the next activation plan",owner:"Morgan + Sales",due:"December readout",done:false}]};
}
export function invalidate(w:Workflow):Workflow{return {...w,contacts:w.contacts.map(c=>({...c,input:{...initialFinserv,top20:c.input.top20,entry:c.input.entry},proof:false,accepted:false,followed:false,meetingHeld:false,log:[]})),revision:w.revision+1,reviews:{},feedback:"",handoffs:Object.fromEntries(Object.entries(w.handoffs).map(([k,v])=>[k,{...v,staged:false}])),launched:false};}
export function generateAssets(w:Workflow):Asset[]{
 const source=sources.find(s=>s.id===w.source);if(!source)return [];
 const assets:Asset[]=[];
 for(const track of ["Top 20","Broader market"] as const){const top=track==="Top 20";const prefix=top?"top":"broad";
 const add=(id:string,channel:Asset["channel"],title:string,body:string,cta:string)=>assets.push({id:`${prefix}-${id}`,track,channel,title,body,cta});
 add("ad","LinkedIn / paid",top?"Make your next financial workflow evaluation a shared decision.":"Which financial workflow should you evaluate first?",`${top?"For finance leaders aligning a buying group":"For teams exploring financial workflows"}: ${source.claim} Explore the ${source.title}.`,"Get the guide");
 add("web","Web",top?"A clearer evaluation path for your finance team.":"Start with a financial workflow worth evaluating.",`The ${source.title} helps your team define the opportunity, align the right people and decide what evidence to gather. ${source.claim}\n\nRequest the guide using your work email. Form fields: work email, company and role. Guide delivery follows capture; download is tracked separately.`,"Email me the guide");
 add("guide","Email",`Your ${source.title}`,`Thanks for your interest. Here is your ${source.title}. ${top?"Share the framework with your business sponsor, technical evaluator and procurement lead to agree the next question to resolve.":"Use the framework to choose one workflow and a practical next step."}\n\nCampaign direction: ${w.instruction}`,"Read the guide");
 add("proof","Email","A practical way to frame your next evaluation",`Still considering where to start? ${source.claim} Begin by writing down the process, the people involved and the evidence you need. The ${source.title} provides a structure for that conversation.\n\nThis draft uses framework guidance; no customer result or performance claim is asserted.`,"Explore the guide");
 add("event","Events",top?"Join a financial-workflow leaders roundtable":"Join our financial-workflow webinar",`You downloaded the ${source.title}. ${top?"Join a small-group conversation about choosing a workflow, aligning stakeholders and defining an evaluation.":"Join a practical session on turning workflow interest into an evaluation plan."}\n\nTiming: ${top?w.roundtable:w.webinar}. Invitation is staged until event details are confirmed.`,top?"Reserve a roundtable place":"Register for the webinar");
 add("recap","Email",top?"Your roundtable next steps":"Your webinar next steps",`Thank you for joining. Bring the discussion back to your team: identify one workflow, name an owner and agree the evidence to collect. ${top?"Your Account Director can help coordinate the next conversation.":"Reply if you would like to discuss an evaluation."}`,"Discuss the next step");
 add("sales","Sales",top?"Account Director conversation brief":"Finance prospect meeting request",`${top?"Prepare context after confirmed download; prompt active follow-up on event registration, attendance or a meeting request.":"Route direct meeting requests to Sales; keep other contacts in marketing nurture."}\n\nInclude account, role, source campaign, entry journey, guide engagement, event response, requested next step and assigned owner.`,"Review engagement history");
 }
 const roles = [
  { id: "sponsor", name: "Business sponsor", direction: "Align the workflow opportunity with a business objective, a named owner and a decision the team can make." },
  { id: "technical", name: "Technical evaluator", direction: "Define the workflow inputs, integration questions and evidence needed for a practical technical evaluation." },
  { id: "procurement", name: "Procurement lead", direction: "Clarify the governance questions, evaluation requirements and stakeholders needed for a responsible decision." },
 ];
 return assets.flatMap(a=>a.track==="Broader market"?[a]:roles.map(role=>({...a,id:a.id.replace("top-",`top-${role.id}-`),persona:role.name,body:`${a.body}\n\nFor the ${role.name.toLowerCase()}: ${role.direction}`})));
}
export function approved(w:Workflow){return w.assets.length>0&&reviewers.every(r=>w.reviews[r]==="Approved");}
export function audienceReady(w:Workflow){return w.contacts.every(c=>c.excluded||(c.matched&&c.eligible))&&w.contacts.some(c=>!c.excluded);}
export function blockers(w:Workflow,step=w.step):string[]{
 switch(step){
 case 0:return w.briefConfirmed?[]:["Confirm the campaign objective and direction."];
 case 1:return w.audienceConfirmed&&audienceReady(w)?[]:["Resolve or exclude held records, then confirm the audience."];
 case 2:return !sources.some(s=>s.id===w.source)?["Choose an available practice source or resolve the source request."]:w.assets.length===0?["Prepare the channel work products."]:w.assets.some(a=>![a.title,a.body,a.cta].every(v=>v.trim()))?["Complete the title, copy and call to action for every asset."]:[];
 case 3:return approved(w)?[]:["All three reviewers must approve this revision."];
 case 4:return !approved(w)?["The current packet needs approval."]:channels.some(c=>!w.handoffs[c]?.staged||!w.handoffs[c]?.owner.trim())?["Assign an owner and stage every channel package."]:[];
 case 5:return w.launched?[]:["Start the simulated activation after staging all channels."];
 default:return [];
 }
}
export function salesReady(c:Contact){return !c.excluded&&c.matched&&c.eligible&&c.input.captured&&(c.input.meeting||(c.input.top20&&c.input.downloaded&&c.input.event!=="none"));}
export type ContactEvent="capture"|"proof"|"download"|"register"|"attend"|"meeting"|"accept"|"follow"|"held";
export function canAdvance(w:Workflow,c:Contact,event:ContactEvent){if(!w.launched||c.excluded||!c.matched||!c.eligible)return false;switch(event){case"capture":return !c.input.captured;case"proof":return c.input.captured&&!c.input.downloaded&&!c.proof;case"download":return c.input.captured&&!c.input.downloaded;case"register":return c.input.downloaded&&c.input.event==="none";case"attend":return c.input.event==="registered";case"meeting":return c.input.captured&&!c.input.meeting;case"accept":return salesReady(c)&&!c.accepted;case"follow":return c.accepted&&!c.followed;case"held":return c.followed&&c.input.meeting&&!c.meetingHeld;}}
export function advanceContact(w:Workflow,id:string,event:ContactEvent):Workflow{
 const c=w.contacts.find(c=>c.id===id);if(!c||!canAdvance(w,c,event))return w;
 const next={...c,input:{...c.input},log:[...c.log]};
 const labels:Record<ContactEvent,string>={capture:"Email captured; guide delivery prepared",proof:"Relevant proof delivered; guide offered again",download:"Guide download confirmed",register:`${c.input.top20?"Roundtable":"Webinar"} registration confirmed`,attend:"Event attendance recorded",meeting:"Meeting requested",accept:`${c.owner} accepted the handoff`,follow:"Sales follow-up completed",held:"Meeting held"};
 if(event==="capture")next.input.captured=true;if(event==="proof")next.proof=true;if(event==="download")next.input.downloaded=true;if(event==="register")next.input.event="registered";if(event==="attend")next.input.event="attended";if(event==="meeting")next.input.meeting=true;if(event==="accept")next.accepted=true;if(event==="follow")next.followed=true;if(event==="held")next.meetingHeld=true;
 next.log.push(labels[event]);if(event==="capture"&&c.input.top20&&c.input.entry==="broad")next.log.push("Matched Top 20: tailored follow-up takes priority; duplicate guide and webinar invitation suppressed");
 return {...w,contacts:w.contacts.map(c=>c.id===id?next:c),activity:[...w.activity,`${c.name}: ${labels[event]}`]};
}
export function measures(w:Workflow,topOnly=false){const c=w.contacts.filter(c=>!c.excluded&&c.matched&&c.eligible&&(!topOnly||c.input.top20));const captured=c.filter(c=>c.input.captured),downloads=captured.filter(c=>c.input.downloaded),registered=downloads.filter(c=>c.input.event!=="none"),attended=registered.filter(c=>c.input.event==="attended");return {eligible:c.length,captured:captured.length,downloads:downloads.length,registered:registered.length,attended:attended.length,accounts:new Set(captured.map(c=>c.account)).size,roles:new Set(captured.map(c=>c.role)).size,handoffs:c.filter(salesReady).length,accepted:c.filter(c=>c.accepted).length,followed:c.filter(c=>c.followed).length,requested:c.filter(c=>c.input.meeting).length,held:c.filter(c=>c.meetingHeld).length};}
export function workflowReadout(w:Workflow){return `# Finserv campaign work package\n\nIllustrative workflow simulation. No live outreach. All people, source material and results are fictional.\n\n## Brief\n${w.objective}\n${w.instruction}\nActivation: ${w.activation}\nRoundtable: ${w.roundtable}\nWebinar: ${w.webinar}\nPacket revision: ${w.revision}\n\n## Work products\n${w.assets.map(a=>`### ${a.track} / ${a.channel}: ${a.title}\n${a.body}\nCTA: ${a.cta}`).join("\n\n")}\n\n## Reviews\n${reviewers.map(r=>`${r}: ${w.reviews[r]||"Pending"}`).join("\n")}\nFeedback: ${w.feedback}\n\n## Handoffs\n${channels.map(c=>`${c}: ${w.handoffs[c].owner} / ${w.handoffs[c].staged?"Staged":"Pending"}`).join("\n")}\n\n## Contact evidence\n${w.contacts.map(c=>`### ${c.name} / ${c.account} / ${c.role}\nOwner: ${c.owner}\n${c.excluded?"Excluded":!c.matched||!c.eligible?"Held":finservResult(c.input).next}\n${c.log.join("\n")}`).join("\n\n")}\n\n## December simulation counts\nAll finance: ${JSON.stringify(measures(w))}\nTop 20 subset: ${JSON.stringify(measures(w,true))}\nCounts are deduplicated by contact; Top 20 is a subset. No actual campaign results or pipeline attribution are available.\n\n## Next actions\n${w.actions.map(a=>`${a.done?"Complete":"Open"}: ${a.title} / ${a.owner} / ${a.due}`).join("\n")}\nLearning: ${w.learning}\nApplied to next plan: ${w.appliedLearning||"Not applied"}\n\n## Activity\n${w.activity.join("\n")}\n\n## Conversation\n${w.turns.map(t=>`Morgan: ${t.prompt}\nAgent: ${t.reply}`).join("\n\n")}`;}
export function restoreWorkflow(raw:unknown):Workflow{
 const fresh=createWorkflow();if(!raw||typeof raw!=="object")return fresh;const r=raw as Partial<Workflow>;
 if(r.version!==2)return fresh;
 // Accept only a coherent saved state; invalid snapshots are reported by the caller.
 if(!Number.isInteger(r.step)||r.step!<0||r.step!>6||!Number.isInteger(r.revision)||r.revision!<1)throw Error("Invalid progress");
 for(const k of ["objective","instruction","activation","roundtable","webinar","source","feedback","learning","appliedLearning"] as const)if(typeof r[k]!=="string")throw Error("Invalid text");
 for(const k of ["briefConfirmed","audienceConfirmed","launched"] as const)if(typeof r[k]!=="boolean")throw Error("Invalid state");
 if(!Array.isArray(r.assets)||!r.assets.every(a=>a&&[a.id,a.title,a.body,a.cta].every(v=>typeof v==="string")&&channels.includes(a.channel)&&["Top 20","Broader market"].includes(a.track)))throw Error("Invalid assets");
 if(!r.reviews||!reviewers.every(k=>r.reviews![k]===undefined||["Approved","Changes requested"].includes(r.reviews![k])))throw Error("Invalid reviews");
 if(!r.handoffs||!channels.every(c=>typeof r.handoffs![c]?.owner==="string"&&typeof r.handoffs![c]?.staged==="boolean"))throw Error("Invalid handoffs");
 if(!Array.isArray(r.contacts)||r.contacts.length!==fresh.contacts.length||!fresh.contacts.every(c=>r.contacts!.filter(v=>v.id===c.id).length===1))throw Error("Invalid contacts");
 for(const c of r.contacts){if(![c.name,c.account,c.role,c.owner].every(v=>typeof v==="string")||![c.matched,c.eligible,c.excluded,c.proof,c.accepted,c.followed,c.meetingHeld].every(v=>typeof v==="boolean")||!Array.isArray(c.log)||!c.log.every(v=>typeof v==="string"))throw Error("Invalid contact");const i=c.input;if(!i||![i.top20,i.captured,i.downloaded,i.meeting].every(v=>typeof v==="boolean")||!["tailored","broad"].includes(i.entry)||!["none","registered","attended"].includes(i.event)||(!i.captured&&(i.downloaded||i.meeting))||(!i.downloaded&&i.event!=="none"))throw Error("Invalid journey");}
 if(!Array.isArray(r.activity)||!r.activity.every(v=>typeof v==="string")||!Array.isArray(r.turns)||!r.turns.every(t=>typeof t?.prompt==="string"&&typeof t?.reply==="string")||!Array.isArray(r.actions)||!r.actions.every(a=>[a?.title,a?.owner,a?.due].every(v=>typeof v==="string")&&typeof a.done==="boolean"))throw Error("Invalid record");
 return r as Workflow;
}
