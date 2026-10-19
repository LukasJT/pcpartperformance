'use strict';
// Read-only, bounded public-source capture. The exact visible model columns are
// kept for review; family option lists never become product configurations.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),{execFileSync}=require('node:child_process');
function decodeWorkbook(filename){
 const python=process.env.PCP_PYTHON||path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe');
 const source=`import json,sys,zipfile,xml.etree.ElementTree as E
ns={'s':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
with zipfile.ZipFile(sys.argv[1]) as z:
 if sum(x.file_size for x in z.infolist())>10000000: raise ValueError('Workbook exceeds research budget')
 strings=[''.join(t.text or '' for t in si.findall('.//s:t',ns)) for si in E.fromstring(z.read('xl/sharedStrings.xml')).findall('s:si',ns)]
 root=E.fromstring(z.read('xl/worksheets/sheet1.xml')); result=[]
 for row in root.findall('.//s:sheetData/s:row',ns):
  values={}
  for cell in row.findall('s:c',ns):
   if cell.find('s:f',ns) is not None: raise ValueError('Formula is not a reviewed specification value')
   address=cell.attrib['r']; letters=''.join(c for c in address if c.isalpha()); index=0
   for c in letters: index=index*26+ord(c.upper())-64
   node=cell.find('s:v',ns); value=node.text if node is not None else ''
   if cell.attrib.get('t')=='s': value=strings[int(value)]
   elif cell.attrib.get('t')=='inlineStr': value=''.join(t.text or '' for t in cell.findall('.//s:t',ns))
   values[index-1]=value
  result.append(values)
 headers=result.pop(0)
 if headers.get(0)!='Model': raise ValueError('Not a fixed-model specification export')
 print(json.dumps([{title:row.get(index,'') for index,title in headers.items()} for row in result]))
`;
 return JSON.parse(execFileSync(python,['-c',source,path.resolve(filename)],{encoding:'utf8',maxBuffer:10000000}));
}
async function main(){
 if(process.argv[2]==='decode'){
  const source=path.resolve(process.argv[3]),rows=decodeWorkbook(source),output=source.replace(/\.xlsx$/i,'.rows.json');
  if(output===source)throw Error('Use an .xlsx source file');
  if(fs.existsSync(output)){require('node:assert/strict').deepEqual(rows,JSON.parse(fs.readFileSync(output,'utf8')));console.log('Verified '+rows.length+' existing source rows');}
  else{fs.writeFileSync(output,JSON.stringify(rows,null,2)+'\n');console.log('Decoded '+rows.length+' source rows into '+output);}return;
 }
 const target=new URL(process.argv[2]);if(target.origin!=='https://psref.lenovo.com')throw Error('Only the reviewed manufacturer host is allowed');
 const {chromium}=require(process.env.PCP_PLAYWRIGHT_MODULE||path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
 const browser=await chromium.launch({headless:true,executablePath:process.env.PCP_BROWSER_EXE||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
 try{
  const page=await browser.newPage();await page.goto(target.href,{waitUntil:'domcontentloaded',timeout:40000});
  await page.getByText('Models',{exact:true}).first().waitFor({timeout:20000});
  const decline=page.getByRole('button',{name:'Decline',exact:true});if(await decline.count())await decline.click();
  await page.getByText('Models',{exact:true}).first().click();
  await page.waitForLoadState('networkidle',{timeout:20000});
  if(process.argv[4]==='inspect-pagination'){
   console.log(await page.locator('.pp-models-grid').evaluate(t=>({ancestors:[t.parentElement,t.parentElement.parentElement,t.parentElement.parentElement.parentElement].map(n=>({class:n.className,scrollWidth:n.scrollWidth,clientWidth:n.clientWidth,scrollHeight:n.scrollHeight,clientHeight:n.clientHeight})),excel:[...document.querySelectorAll('*')].filter(n=>n.textContent.trim()==='Excel').map(n=>n.outerHTML.slice(0,800))})));return;
  }
  if(process.argv[4]==='inspect-country'){
   await page.locator('button').filter({hasText:/^Select$/}).click({timeout:10000});
   console.log(await page.locator('button').evaluateAll(nodes=>nodes.filter(n=>n.innerText.trim()).map(n=>({text:n.innerText,html:n.outerHTML.slice(0,400)}))));return;
  }
  await page.locator('#pp-models-region').click();
  let countries=0;for(const name of ['USA','Canada']){const field=page.getByLabel(name,{exact:true});if(await field.count()){await field.check();countries++;}}if(!countries)throw Error('No reviewed North American region exposed');
  await page.getByRole('button',{name:'Filter',exact:true}).click();
  await page.waitForLoadState('networkidle',{timeout:20000});
  if(process.argv[4]==='export'){
   const pending=page.waitForEvent('download',{timeout:20000});await page.locator('.pp-models-export-btn').click();
   const download=await pending;const name=path.basename(process.argv[3],'.json')+'.xlsx';if(!/^[a-z0-9-]+\.xlsx$/.test(name))throw Error('Use a simple evidence filename');const output=path.resolve('data/prebuilt-intake/2026-10-19/observations',name);if(fs.existsSync(output))throw Error('Evidence already exists; capture a newly named revision instead of overwriting reviewed data');fs.mkdirSync(path.dirname(output),{recursive:true});await download.saveAs(output);const rows=decodeWorkbook(output);fs.writeFileSync(output.replace(/\.xlsx$/,'.rows.json'),JSON.stringify(rows,null,2)+'\n');console.log(JSON.stringify({url:page.url(),file:output,originalName:download.suggestedFilename(),rows:rows.length}));return;
  }
  const observation=await page.evaluate(()=>({url:location.href,title:document.title,capturedAt:new Date().toISOString(),text:document.body.innerText,tables:[...document.querySelectorAll('table')].map(t=>({class:t.className,parent:t.parentElement.className,rows:[...t.rows].map(r=>[...r.cells].map(c=>c.innerText)),links:[...t.querySelectorAll('a')].map(a=>({text:a.textContent,href:a.href}))})),controls:[...document.querySelectorAll('input,select,button')].map(el=>({tag:el.tagName,type:el.type,text:el.innerText,placeholder:el.placeholder,aria:el.getAttribute('aria-label'),value:el.value}))}));
  if(process.argv[3]){const name=path.basename(process.argv[3]);if(!/^[a-z0-9-]+\.json$/.test(name))throw Error('Use a simple JSON evidence filename');const output=path.resolve('data/prebuilt-intake/2026-10-19/observations',name);fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(observation,null,2)+'\n');}
  console.log(JSON.stringify({url:observation.url,title:observation.title,text:observation.text.slice(0,1100),tableShapes:observation.tables.map(t=>({class:t.class,parent:t.parent,rows:t.rows.length,columns:t.rows[0]?.length,links:t.links.slice(0,2)}))},null,2));
 }finally{await browser.close();}
}
if(require.main===module)main().catch(error=>{console.error(error.message);process.exitCode=1;});
module.exports={decodeWorkbook};
