# Public-domain deployment

pcpartperformance.com redirects to www.pcpartperformance.com. Cloudflare Worker `pcpartperformance-live` proxies the current redesign at https://pcpartperformance-redesign.ktfkyd72bv.chatgpt.site. The separate Sites project appgprj_6aa5dc69b50081918911622d3eddc970 provides ad assets at https://pc-part-performance.lukajt.chatgpt.site; publishing it alone does not update the redesign served by the custom domain.

The worker preserves the redesign, serves ad assets, injects consent-controlled responsive placements, and uses a separate workers.dev origin for sandboxed ad documents. Adsterra fill is external and must be verified independently from the presence of an iframe.

Deploy this worker to the existing Cloudflare Worker; GitHub pushes do not automatically deploy it.
