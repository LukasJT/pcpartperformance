// Default-off configuration: no ad requests or empty placement boxes in this release.
const config={enabled:false,publisherApproved:false,publisherId:null,cmpVerified:false,placements:['article-after-section-2','article-end'],excluded:['builder','compare','performance','phone-size','search']};
function mayRequestAds({consent=false,gpc=false,pageKind,settings=config}={}){return settings.enabled===true&&settings.publisherApproved===true&&settings.cmpVerified===true&&/^ca-pub-\d{16}$/.test(settings.publisherId||'')&&consent===true&&gpc!==true&&['article','guide'].includes(pageKind)&&!settings.excluded.includes(pageKind)}
module.exports={config,mayRequestAds};
