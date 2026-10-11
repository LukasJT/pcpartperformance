'use strict';
const fs = require('fs'), path = require('path');
const dir = path.resolve('docs/program-2026-10-09');
const raw = JSON.parse(fs.readFileSync(path.join(dir, 'browser-lab-raw.json')));
const routes = ['/', '/hardware/graphics-cards/', '/learn/rtx5070.html', '/compare/rtx-5070-vs-rx-9070/', '/builder/', '/performance/', '/blog/how-to-choose-a-graphics-card/'];
const median = values => { const v = values.filter(Number.isFinite).sort((a,b)=>a-b); return v.length ? v.length%2 ? v[(v.length-1)/2] : (v[v.length/2-1]+v[v.length/2])/2 : null; };
const selected = new Set();
const rows = [];
for (const width of [1440,390]) for (const route of routes) {
  const repeatCount = ['/', '/builder/', '/performance/'].includes(route) ? 3 : 1;
  const groups = [4186,4185].map(port => raw.runs.filter(r=>r.valid && r.path===route && r.port===port && r.observed.metrics.viewport.width===width).slice(-repeatCount));
  const summarize = group => {
    group.forEach(r=>selected.add(r.at));
    if (!group.length) return null;
    const metrics={}; for (const key of ['lcp','cls','domContentLoaded','serverWait','resourceTransfer','longTaskMs','threeDRequests']) metrics[key]=median(group.map(r=>r.observed.metrics[key]));
    return { runs:group.length, dates:group.map(r=>r.at), medians:metrics, overflow:group.some(r=>r.observed.scrollWidth>r.observed.documentWidth), brokenImages:group.flatMap(r=>r.observed.brokenImages) };
  };
  const before=summarize(groups[0]), after=summarize(groups[1]);
  rows.push({route,width,before,after,transferChangePercent:before&&after?Number(((after.medians.resourceTransfer/before.medians.resourceTransfer-1)*100).toFixed(1)):null,
    limitation:route.includes('/compare/')?'The after page is a researched text draft, while the baseline is a different specification page. This is not a like-for-like template performance claim.':route.includes('/learn/')?'After-only observation: this product HTML was unavailable in the tracked baseline.':(before?.runs<3||after?.runs<3)?'Single observation; not a repeat-run estimate.':null});
}
const report={preparedAt:new Date().toISOString(),baselineCommit:raw.baselineCommit,protocol:raw.protocol,rows,
  exclusions:[...raw.pilots.map(r=>({at:r.at,reason:'Pilot metrics were missing.'})),...raw.runs.filter(r=>!selected.has(r.at)).map(r=>({at:r.at,path:r.path,reason:'Earlier intermediate run superseded by latest comparable observations.'}))],
  limits:['No CPU/network throttling, real-user p75, field INP, PageSpeed score or remote host comparison.', 'Resource transfer is resource entries only; navigation HTML is measured separately in static payload reports.', 'External font caching was not cleared or controlled.', 'Preview-only instrumentation is injected by the localhost server, not published in site HTML.', 'Normal production generation differs from staging: unreviewed drafts and product panels remain withheld.']};
fs.writeFileSync(path.join(dir,'browser-lab-summary.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify(rows.map(r=>({route:r.route,width:r.width,runs:[r.before?.runs||0,r.after?.runs||0],transfer:[r.before?.medians.resourceTransfer,r.after?.medians.resourceTransfer],cls:[r.before?.medians.cls,r.after?.medians.cls],change:r.transferChangePercent})),null,2));
