const checked='2026-10-04';
const rows=[
 ['drivers','Microsoft','Troubleshoot screen flickering in Windows','https://support.microsoft.com/en-us/windows/hardware/display-graphics/troubleshoot-screen-flickering-in-windows','driver rollback prerequisites; symptoms are not proof of cause'],
 ['nvidiadrivers','NVIDIA','Game Ready and Studio driver explanation','https://www.nvidia.com/en-us/geforce/news/ces-2022-nvidia-community-qa/','driver audience and release focus; historical explanation'],
 ['profile','Google Search Help','Create a new Search profile','https://support.google.com/websearch/answer/16904498?hl=en','US availability; follower requirements; no direct ranking effect'],
 ['msi','MSI','B650 TOMAHAWK specifications','https://us.msi.com/Motherboard/MAG-B650-TOMAHAWK-WIFI/Specification','slot topology; CPU-dependent storage'],
 ['n5060','NVIDIA','RTX 5060 family specifications','https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5060-family/','reference GPU configuration'],
 ['usb','USB-IF','USB Type-C language guidelines','https://www.usb.org/sites/default/files/usb_type-c_language_product_and_packaging_guidelines_20230320.pdf','connector versus protocol'],
 ['expo','AMD','EXPO memory profiles','https://www.amd.com/en/products/processors/technologies/expo.html','profiles; memory qualification'],
 ['llama','ggml-org','llama.cpp completion documentation','https://github.com/ggml-org/llama.cpp/blob/master/tools/completion/README.md','runtime context and cache options'],
 ['apple16','Apple','iPhone 16 specifications','https://support.apple.com/en-us/121029','body dimensions; display; chip; USB'],
 ['apple16pro','Apple','iPhone 16 Pro specifications','https://support.apple.com/en-us/121031','body dimensions; display; chip; USB'],
 ['pixel','Google','Pixel 9 and Pixel 9 Pro comparison','https://store.google.com/gb/magazine/compare_pixel?hl=en-GB&toggler0=Pixel+9a&toggler1=Pixel+9+Pro&toggler2=Pixel+9','UK specifications; regional limits'],
 ['pixelupdates','Google','Pixel software-update policy','https://support.google.com/pixelphone/answer/4457705?hl=en','seven years; first US availability anchor'],
 ['s25','Samsung','Galaxy S25 Canada buying guide','https://www.samsung.com/ca/mobile-buying-guide/introducing-galaxy-s25-series/','Canada dimensions; chip; battery'],
 ['micron','Micron','Fiscal 2026 results announcement','https://investors.micron.com/news/press-release/2026/Micron-Technology-Inc--Reports-Record-Fiscal-Fourth-Quarter-and-Full-Year-2026-Results/','company-reported AI business; not desktop retail prices'],
 ['discover','Google Search Central','Discover guidance','https://developers.google.com/search/docs/appearance/google-discover','eligibility; representative large imagery'],
 ['news','Google Search Central','News sitemap guidance','https://developers.google.com/search/docs/crawling-indexing/sitemaps/news-sitemap','two-day publication window'],
 ['preferred','Google Search Central','Preferred sources','https://developers.google.com/search/docs/appearance/preferred-sources','domain eligibility; not guaranteed'],
 ['ads','Google AdSense','Ad placement policy','https://support.google.com/adsense/answer/1346295?hl=en','separation from controls; accidental clicks'],
 ['opc','Office of the Privacy Commissioner of Canada','Behavioural advertising guidance','https://www.priv.gc.ca/en/privacy-topics/technology/online-privacy-tracking-cookies/tracking-and-ads/gl_ba_1112/','consent and tracking'],
 ['ccpa','California DOJ','CCPA guidance','https://oag.ca.gov/privacy/ccpa','covered-business duties; Global Privacy Control'],
 ['video','NVIDIA GeForce','RTX 50 series announcement video','https://www.youtube.com/watch?v=YBJEiWDPyGs','company presentation; not independent testing'],
 ['tpu','TechPowerUp','GPU database interface','https://www.techpowerup.com/gpu-specs/?architecture=Blackwell+2.0&sort=name','first-party search result inspected; full page robots-blocked'],
 ['rtings','RTINGS','Monitor input-lag methodology','https://www.rtings.com/monitor/tests/inputs/input-lag','first-party testing method; no reuse of results'],
 ['demandphones','Reddit','Phone comparison question','https://www.reddit.com/r/Smartphones/comments/1jaylyw/should_i_get_samsung_s25_iphone_16_or_pixel_9/','qualitative demand signal only; not representative']
];
module.exports=Object.fromEntries(rows.map(([id,publisher,title,url,scope])=>[id,{id,publisher,title,url,scope,checked,confidence:id==='demandphones'?'qualitative demand only':id==='tpu'?'partial access':'primary source',nextReview:['pixelupdates','micron'].includes(id)?'2026-11-04':'2027-01-04'}]));
