from pathlib import Path
import json,re
from pypdf import PdfReader

root=Path(__file__).resolve().parents[1]
report=json.loads((root/'docs/component-photos-catalog-oct17/cpu-board-research.json').read_text(encoding='utf-8'))
output=[]
for row in report['rows']:
    pdf=next((c for c in row.get('candidates',[]) if c.get('file','').endswith('.pdf')),None)
    if not pdf: continue
    reader=PdfReader(pdf['file']); text=reader.pages[0].extract_text() or ''
    model=re.sub(r'^MSI\s+','',row['name'],flags=re.I)
    normalize=lambda s: re.sub(r'[^a-z0-9]','',s.lower())
    if normalize(model) not in normalize(text):
        output.append({'id':row['id'],'rejected':'Exact model absent from PDF text'}); continue
    images=[]
    for image in reader.pages[0].images:
        width,height=image.image.size
        if width<200 or height<200: continue
        file=root/'tmp/cpu-board-photos-oct17'/f"{row['id']}-{image.name}"
        file.write_bytes(image.data)
        images.append({'file':str(file),'width':width,'height':height,'object':image.name,'area':width*height})
    output.append({'id':row['id'],'name':row['name'],'sourceUrl':pdf['sourceUrl'],'imageUrl':pdf['imageUrl'],'sourcePdf':pdf['file'],'images':sorted(images,key=lambda x:x['area'],reverse=True)[:20]})
(root/'tmp/cpu-board-photos-oct17/pdf-images.json').write_text(json.dumps(output,indent=2),encoding='utf-8')
print(json.dumps([{'id':r['id'],'images':[(x['object'],x['width'],x['height']) for x in r.get('images',[])]} for r in output]))
