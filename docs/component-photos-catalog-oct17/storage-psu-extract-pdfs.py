import json, hashlib
from pathlib import Path
from pypdf import PdfReader
folder=Path(__file__).resolve().parent
rows=json.loads((folder/'storage-psu-additional.json').read_text('utf-8'))
out=[]
for row in rows:
    if row.get('status')!=200 or row.get('type')!='application/pdf': continue
    reader=PdfReader(row['cache']); page=reader.pages[0]
    text=page.extract_text()
    sku=row['url'].split('/')[-1].replace('.pdf','').replace('_','/')
    if sku not in text:
        print('REJECT SKU',row['id'],sku); continue
    images=list(page.images)
    images=[x for x in images if x.image.width>400 and x.image.height>140]
    if not images: print('NO PRODUCT',row['id']); continue
    image=max(images,key=lambda x:x.image.width*x.image.height)
    local=folder/'storage-psu-research'/(row['id']+'-pdf-product.png')
    image.image.save(local)
    (folder/'storage-psu-research'/(row['id']+'-pdf-text.txt')).write_text(text,encoding='utf-8')
    out.append({'id':row['id'],'page':row['url'],'imageUrl':row['url'],'localImage':str(local),'originalPdf':row['cache'],'picturedModel':'Kingston FURY '+sku+' (one module from the kit)','note':f'Official SKU datasheet {sku} page 1 explicitly confirms kit capacity, speed and timing. Extracted embedded product photograph {image.name} from that page (one module shown); no generative changes.'})
    print('EXTRACT',row['id'],sku,image.name,image.image.size)
(folder/'storage-psu-pdf-picks.json').write_text(json.dumps(out,indent=2),encoding='utf-8')
