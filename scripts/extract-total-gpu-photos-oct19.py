from pathlib import Path
import json, re, hashlib
from pypdf import PdfReader
from PIL import Image, ImageDraw, ImageFont

root=Path(__file__).resolve().parents[1]
directory=root/'tmp/total-gpu-photos-oct19'
docs=root/'docs/total-refinement/photos/gpu'
rows=json.loads((docs/'intake.json').read_text(encoding='utf-8'))['rows']
normalize=lambda text:re.sub(r'[^a-z0-9]','',text.lower().replace('geforce',''))
output=[]
previous={r['id']:r for r in json.loads((docs/'extraction.json').read_text(encoding='utf-8')).get('rows',[])} if (docs/'extraction.json').exists() else {}
for row in rows:
 if row.get('error'):continue
 item=dict(row)
 if row['sourceType']=='official-datasheet':
  cached=previous.get(row['id'])
  if cached and cached.get('sourceSha256')==row['sourceSha256'] and cached.get('exactModelTextVerified') is True:
   images=cached['candidates']
  else:
   reader=PdfReader(root/row['file'])
   text=reader.pages[0].extract_text() or ''
   if normalize(row['name']) not in normalize(text):
    raise ValueError('Exact named variant absent from datasheet: '+row['id'])
   images=[]
   for image in reader.pages[0].images:
    width,height=image.image.size
    if width<200 or height<150:continue
    file=directory/(row['id']+'-'+image.name)
    file.write_bytes(image.data)
    images.append({'candidateFile':str(file.relative_to(root)).replace('\\','/'),'sourceImageObject':image.name,'sourceWidth':width,'sourceHeight':height,'area':width*height,'extractedSha256':hashlib.sha256(image.data).hexdigest()})
  if not images:raise ValueError('No actual embedded product image: '+row['id'])
  # Named image objects were compared with the PDF product group. Masks and
  # large fan marketing illustrations must never win an area-based selection.
  shifted={'GeForce GTX 970 GAMING 4G','GeForce GTX 980 GAMING 4G','GeForce GTX 1080 GAMING X 8G'}
  wanted='I8.png' if row['name'] in shifted else 'I6.png'
  selected=next(x for x in images if x['sourceImageObject']==wanted)
  if Image.open(root/selected['candidateFile']).mode not in ('RGB','RGBA'):raise ValueError('Selected a mask instead of product colors')
  item.update(selected)
  item['candidates']=images
  item['sourcePage']=1
  item['exactModelTextVerified']=True
 else:
  try:
   im=Image.open(root/row['file']);im.load()
  except Exception as error:
   print('Rejected non-image bytes: '+row['id']+' '+str(error))
   continue
  item.update({'candidateFile':row['file'],'sourceWidth':im.width,'sourceHeight':im.height,'extractedSha256':hashlib.sha256((root/row['file']).read_bytes()).hexdigest(),'exactModelTextVerified':'Official gallery linked from the exact product page via web inspection'})
 output.append(item)
(docs/'extraction.json').write_text(json.dumps({'checkedAt':rows[0]['checkedAt'],'rows':output},indent=2),encoding='utf-8')
for start in range(0,len(output),10):
 batch=output[start:start+10]
 sheet=Image.new('RGB',(1200, len(range(0,len(batch),2))*300),'#e6e9ef')
 draw=ImageDraw.Draw(sheet)
 font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',15)
 for i,row in enumerate(batch):
  x=(i%2)*600;y=(i//2)*300
  tile=Image.new('RGBA',(580,230),'white')
  im=Image.open(root/row['candidateFile']).convert('RGBA');im.thumbnail((560,220))
  tile.alpha_composite(im,((580-im.width)//2,(230-im.height)//2))
  sheet.paste(tile.convert('RGB'),(x+10,y+6))
  draw.text((x+12,y+244),str(start+i)+': '+row['brand']+' '+row['name'],fill='black',font=font)
  draw.text((x+12,y+266),str(row['sourceWidth'])+' x '+str(row['sourceHeight'])+' | '+row.get('sourceImageObject','manufacturer gallery'),fill='black',font=font)
 sheet.save(docs/('contact-'+str(start//10+1)+'.jpg'),quality=94)
print(json.dumps([{'id':x['id'],'object':x.get('sourceImageObject'),'dimensions':[x['sourceWidth'],x['sourceHeight']]}for x in output]))
