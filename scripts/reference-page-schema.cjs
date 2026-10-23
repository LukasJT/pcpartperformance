'use strict';

// Specification records are reference pages. They do not establish a priced
// offer, a review, or a rating required for Google's Product rich results.
function fullName(part) {
 const name=String(part.name||'').trim(),brand=String(part.brand||'').trim();
 return !brand||name.toLowerCase()===brand.toLowerCase()||name.toLowerCase().startsWith(brand.toLowerCase()+' ')?name:brand+' '+name;
}
function httpURL(value) {
 try { const url=new URL(value);return ['http:','https:'].includes(url.protocol)?url.href:null; } catch { return null; }
}
function referencePageSchema(part,canonical,image=null) {
 const url=httpURL(canonical);if(!url)throw Error('Reference page needs an absolute HTTP(S) canonical');
 const name=fullName(part),citation=httpURL(part.source),pictured=httpURL(image);
 return {'@context':'https://schema.org','@type':'WebPage','@id':url+'#webpage',url,name,description:part.summary||name,
  isPartOf:{'@id':'https://www.pcpartperformance.com/#website'},about:{'@type':'Thing',name},
  ...(citation?{citation}:{}),...(pictured?{primaryImageOfPage:{'@type':'ImageObject',url:pictured}}:{})};
}
function referenceSchemaScript(part,canonical,image=null) {
 return '<script type="application/ld+json">'+JSON.stringify(referencePageSchema(part,canonical,image)).replace(/</g,'\\u003c')+'</script>';
}
module.exports={fullName,referencePageSchema,referenceSchemaScript};
