// @ts-check
/** @typedef {{status:string,editorApproved:boolean,confirmedDeployment:boolean,sourceIds:string[],route:string,title:string,datePublished:string}} NewsRecord */
const origin='https://www.pcpartperformance.com';
/** @param {unknown} s */
const xml=s=>String(s).replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]||c));
/** @param {unknown} value @param {number} now @returns {value is NewsRecord} */
function eligible(value,now){
 if(!value||typeof value!=='object')return false;
 const a=/** @type {Partial<NewsRecord>} */(value);
 return a.status==='published'&&a.editorApproved===true&&a.confirmedDeployment===true&&Array.isArray(a.sourceIds)&&a.sourceIds.length>0&&typeof a.title==='string'&&typeof a.route==='string'&&/^news\/[a-z0-9-]+$/.test(a.route)&&typeof a.datePublished==='string'&&Number.isFinite(Date.parse(a.datePublished))&&Date.parse(a.datePublished)<=now&&now-Date.parse(a.datePublished)<=48*3600e3;
}
/** @param {unknown[]} rows @param {number} [now] */
export function renderRecentNews(rows,now=Date.now()){
 const recent=rows.filter(a=>eligible(a,now)).slice(0,1000);
 return '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">'+recent.map(a=>`<url><loc>${origin}/${xml(a.route)}/</loc><news:news><news:publication><news:name>PC Part Performance</news:name><news:language>en</news:language></news:publication><news:publication_date>${xml(a.datePublished)}</news:publication_date><news:title>${xml(a.title)}</news:title></news:news></url>`).join('')+'</urlset>';
}
