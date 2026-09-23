// Category silhouettes for parts without a researched outer envelope. These
// are deliberately shared and must never be used as fit or clearance data.
function fallbackFor(p) {
 const text = `${p.name} ${p.architecture || ''}`.toLowerCase();
 let model, size, category = p.cat, fans;
 switch (category) {
 case 'gpu': {
  fans = (p.specs?.['Board power'] || 0) >= 220 || /rtx (40[789]|50[789]|30[789])|rx (68|69|78|79|90)/i.test(p.name) ? 3 : 2;
  model = `silhouette-gpu-${fans}fan`; size = fans === 3 ? [300, 54, 125] : [240, 42, 115]; break;
 }
 case 'cpu': model = 'silhouette-cpu'; size = [40, 40, 5]; break;
 case 'ram': model = 'silhouette-ram'; size = [7, 133, 35]; break;
 case 'board': {
  const form = /mini.itx/.test(text) ? 'itx' : /micro.atx|m.atx/.test(text) ? 'matx' : 'atx';
  model = `silhouette-board-${form}`; size = form === 'itx' ? [170, 170, 12] : form === 'matx' ? [244, 244, 12] : [244, 305, 12]; break;
 }
 case 'case': model = 'silhouette-case'; size = [450, 460, 220]; break;
 case 'ssd': {
  const sata = /sata|2.5.inch/.test(text);
  model = sata ? 'silhouette-ssd-sata' : 'silhouette-ssd-m2'; size = sata ? [100, 70, 7] : [80, 22, 3]; break;
 }
 case 'hdd': model = 'silhouette-hdd'; size = [147, 26, 102]; break;
 case 'psu': {
  const sfx = /\bsfx\b/.test(text);
  model = sfx ? 'silhouette-psu-sfx' : 'silhouette-psu-atx'; size = sfx ? [125, 64, 100] : [160, 86, 150]; break;
 }
 default: return null;
 }
 return {model, size, category, fans, color:'#303843', identity:'category-silhouette', referenceName:`${category.toUpperCase()} category silhouette`, dimensionStatus:'Illustrative category silhouette and assumed size; dimensions and surface details are not verified for this product.', estimated:true};
}
module.exports = {fallbackFor};
