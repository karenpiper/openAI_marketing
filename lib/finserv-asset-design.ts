import type { Asset } from "./finserv-workflow";
// Presentation projection only: existing reviewed copy and saved workflow remain unchanged.
export function assetCopy(asset: Asset) {
  return asset.body.split(/\n\s*\n/).map(p=>p.trim()).filter(p=>p&&!/^(Campaign direction:|This draft uses |Include account,|Timing:)/i.test(p)).map(p=>p.replace(/^For the (business sponsor|technical evaluator|procurement lead):\s*/i, "").replace(/\s*Form fields:[\s\S]*$/i, "").replace(/\s*Guide delivery follows capture;[\s\S]*$/i, "")).filter(Boolean);
}
export function guideTitle(asset:Asset){return asset.body.includes("Responsible Evaluation Guide")?"Responsible Evaluation Guide":"Financial Workflow Leaders Guide";}
export function eventTiming(asset:Asset){const timing=asset.body.match(/Timing:\s*([^\n]+)/)?.[1];return timing?timing.replace(/\. Invitation is staged[\s\S]*$/,''):"November · date to confirm";}
export function assetFormat(asset:Asset){return asset.channel==="LinkedIn / paid"?"LinkedIn sponsored post · landscape creative":asset.channel==="Web"?"Guide landing page · desktop + mobile":asset.channel==="Email"?"Responsive email · inbox + message":asset.channel==="Events"?"Event invitation · registration preview":"Account Director briefing · internal";}
export const designNotes = {reference:"https://openai.com/brand/",portal:"https://brand.openai.com/",templates:"https://cdn.openai.com/brand/OpenAI-Partnership-Templates-2025.zip",font:"OpenAI Sans when installed locally; otherwise Helvetica Neue / Arial. No proprietary font file is bundled.",status:"Original concept layouts informed by public OpenAI guidance. Not official campaign templates or approved marketing assets."};
