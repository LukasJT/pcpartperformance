// Manufacturer specifications read October 4, 2026. CAD appearance is supplied
// by Noctua; modified impellers must not be used to predict cooling performance.
const facts=require('../docs/model-research/noctua-expansion-specs.json');
module.exports=Object.entries(facts).map(([slug,p])=>{
 const values=Object.fromEntries(p.rows), parseSize=s=>(s||'').match(/[\d.]+/g)?.slice(0,3).map(Number);
 const nominal=parseSize(values['Dimensions without anti-vibration pads']||values['Size (Form factor)']);
 if(!nominal||nominal.length!==3)throw Error('Missing fan dimensions: '+slug);
 const envelope=parseSize(values['Dimensions with anti-vibration pads'])||nominal;
 const id='retail-noctua-'+slug, pwm=/PWM/.test(p.title), connector=values.Connector+(pwm?' PWM':' DC'), small=nominal[0]<80;
 const source=p.source||'https://www.noctua.at/en/products/'+slug+'/specifications';
 const specs={'Fan size':nominal[0],Thickness:nominal[2],Connector:connector,'Rated voltage':values['Rated voltage'],'Speed range':values['Speed range'],'Maximum airflow':values['Airflow (max.)'],'Maximum static pressure':values['Static pressure (max.)'],'Maximum noise':values['Acoustical noise (max.)'],'Mounting hole spacing':values['Mounting hole spacing(s)'],'Units per pack':1};
 for(const key of Object.keys(specs))if(specs[key]===undefined)delete specs[key];
 const notes=[`${nominal.join(' × ')} mm nominal frame${envelope[2]!==nominal[2]?`; ${envelope[2]} mm with anti-vibration pads`:''}. ${pwm?'Four-pin PWM speed control':'Three-pin DC speed control'}; verify the motherboard header's voltage and current rating.`, values['Frame shape']==='Round'?'Round frame: use the listed mounting-hole pattern rather than assuming a square fan of the same nominal diameter will fit.':'Check the case mounting-hole spacing and space for pads, cables and screw heads.',small?'This small-format fan is intended for matching specialist mounts; it is not a replacement for a standard 120 or 140 mm case fan.':'', 'Airflow, pressure and noise figures are manufacturer ratings; the 3D preview does not calculate temperatures or noise.'].filter(Boolean).join(' ');
 return {id,name:p.title,brand:'Noctua',cat:'fan',source,architecture:`${nominal[0]} mm · ${connector}`,summary:`${nominal[0]} mm · ${nominal[2]} mm frame · ${connector}`,specs,note:notes,physical:{size:envelope,model:id,color:slug.includes('chromax')?'#25272a':slug.includes('redux')?'#969698':'#b39a7b',connector,rgb:false,dimensionStatus:'Manufacturer nominal frame and pad dimensions. Placement, attached cables and assembled clearance have not been certified.'}};
});
