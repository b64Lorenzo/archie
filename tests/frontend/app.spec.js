const { test, expect } = require('@playwright/test');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const root = 'C:\\Archive';
const files = [
 {name:"O'Brien & notes.txt",path:root+"\\Docs\\O'Brien & notes.txt",file_type:'Documents',size:2048,extension:'txt',modified:'2026-01-01'},
 {name:'outside.txt',path:root+'\\Docs-other\\outside.txt',file_type:'Documents',size:1024,extension:'txt',modified:'unknown'},
 {name:'image.png',path:root+'\\image.png',file_type:'Media',size:4096,extension:'png',modified:'unknown'}
];
async function setup(page, options={}) {
 await page.addInitScript(({root,files,options})=>{
  window.calls=[]; window.fixtureFiles=options.empty?[]:options.zero?files.map(f=>({...f,size:0})):files;
  window.__TAURI__={core:{invoke:async(command,args)=>{
   window.calls.push({command,args});
   if(command==='scan_directory') { if(options.delay) await new Promise(r=>setTimeout(r,options.delay)); if(window.failScan) throw new Error('denied'); return {files:window.fixtureFiles,stats:{total_files:window.fixtureFiles.length,total_folders:2,total_size_human:'7 KB',total_size:7168,duplicate_groups:0,code_files:0}}; }
   if(command==='get_tree') return {name:'Archive',path:root,type:'folder',children:[{name:'Docs',path:root+'\\Docs',type:'folder',children:[{name:'Empty',path:root+'\\Docs\\Empty',type:'folder',children:[]}]},{name:'Docs-other',path:root+'\\Docs-other',type:'folder',children:[]}]};
   if(command==='get_topics') return {topics:[{topic:'Notes',files:window.fixtureFiles,count:window.fixtureFiles.length}]};
   if(command==='find_duplicates') return {total_groups:1,duplicates:[{name:files[0].name,count:2,total_size:4096,files:files.slice(0,2)}]};
   return null;
  }}};
 },{root,files,options});
 await page.goto(pathToFileURL(path.resolve('src/index.html')).href);
}
async function scan(page) {await page.locator('#homePathInput').fill(root); await page.locator('#homeScanBtn').click(); await expect(page.locator('#homeDashboard')).toBeVisible();}
test('duplicate deletion confirms once and refreshes only after deletion completes',async({page})=>{
 await setup(page);await scan(page);await page.locator('[data-page="duplicates"]').click();await page.locator('#findDupsBtn').click();
 await page.evaluate(()=>{const invoke=window.__TAURI__.core.invoke;window.__TAURI__.core.invoke=async(c,a)=>{if(c==='delete_file'){await new Promise(r=>setTimeout(r,100));window.calls.push({command:'deleted',args:a});window.fixtureFiles=window.fixtureFiles.filter(f=>f.path!==a.path);return null;}return invoke(c,a);};});
 let confirms=0;page.on('dialog',async d=>{confirms++;await d.accept();});
 await page.locator('#duplicatesTableBody button').filter({hasText:'Delete first copy'}).click();
 await expect.poll(()=>page.evaluate(()=>window.calls.filter(c=>c.command==='scan_directory').length)).toBe(2);
 expect(confirms).toBe(1);const calls=await page.evaluate(()=>window.calls.map(c=>c.command));expect(calls.indexOf('deleted')).toBeLessThan(calls.lastIndexOf('scan_directory'));
});
test('type sorting and pagination controls are correct',async({page})=>{
 await setup(page);await scan(page);await page.locator('[data-page="files"]').click();
 await expect(page.locator('#prevPageBtn')).toBeDisabled();await expect(page.locator('#nextPageBtn')).toBeDisabled();
 await page.locator('th[data-sort="file_type"]').click();await expect(page.locator('#filesTableBody tr').first()).toContainText('Documents');
 await page.locator('#filterSelect').selectOption('Other');await expect(page.locator('#filesTableBody')).toContainText('No files found');
});
test('failed scan retains previous inventory and unlocks controls',async({page})=>{
 await setup(page);await scan(page);await page.evaluate(()=>window.failScan=true);await page.locator('#refreshBtn').click();
 await expect(page.locator('#statusText')).toContainText('Scan failed');await expect(page.locator('#scanBtn')).toBeEnabled();
 await page.locator('[data-page="files"]').click();await expect(page.locator('#filesTableBody tr[data-path]')).toHaveCount(3);
});
test('empty scans render usable dashboard and Files empty state',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await setup(page,{empty:true});await scan(page);
 await expect(page.locator('#typeSummary')).toContainText('No files');await page.locator('[data-page="files"]').click();await expect(page.locator('#filesTableBody')).toContainText('No files found');expect(errors).toEqual([]);
});
test('CSV exports all filtered rows with quoting and formula protection',async({page})=>{
 await setup(page); await page.evaluate(()=>window.fixtureFiles.push({name:'=1+1.csv',path:'C:\\Archive\\=1+1.csv',file_type:'Other',size:0,modified:'unknown'}));await scan(page);
 await page.locator('[data-page="files"]').click();await page.locator('#searchInput').fill('=1+1');
 const download=page.waitForEvent('download');await page.locator('#exportCsvBtn').click();const item=await download;
 const stream=await item.createReadStream();let data='';for await(const chunk of stream)data+=chunk.toString();
 expect(data).toContain('"\'=1+1.csv"');expect(data).not.toContain('outside.txt');expect(data).toContain('Name,Path,Type,Size,Modified');
});
test('topic edits survive navigation and search reuses scan-scoped topics',async({page})=>{
 await setup(page); await scan(page); await page.locator('[data-page="topics"]').click();
 page.once('dialog',d=>d.accept('Renamed')); await page.locator('.topic-title').dblclick();
 await page.locator('#topicSearchInput').fill('Renamed'); await expect(page.locator('.topic-title')).toContainText('Renamed');
 await page.locator('[data-page="files"]').click(); await page.locator('[data-page="topics"]').click();
 await expect(page.locator('.topic-title')).toContainText('Renamed');
 expect(await page.evaluate(()=>window.calls.filter(c=>c.command==='get_topics').length)).toBe(1);
 page.once('dialog',d=>d.accept()); await page.locator('.topic-delete-btn').click();
 await page.locator('#topicSearchInput').fill(''); await expect(page.locator('.topic-card')).toHaveCount(0);
});
test('duplicates require explicit scan and selected group toolbar works across navigation',async({page})=>{
 await setup(page); await scan(page); await page.locator('[data-page="duplicates"]').click();
 expect(await page.evaluate(()=>window.calls.filter(c=>c.command==='find_duplicates').length)).toBe(0);
 await page.locator('#findDupsBtn').click(); await page.locator('#duplicatesTableBody tr[data-files]').click();
 await expect(page.locator('#duplicatesTableBody tr.selected')).toHaveCount(1);
 await page.locator('#dupOpenSelected').click();
 expect(await page.evaluate(()=>window.calls.find(c=>c.command==='open_file')?.args.path)).toBe(files[0].path);
 await page.locator('[data-page="home"]').click();await page.locator('[data-page="duplicates"]').click();
 await expect(page.locator('#duplicatesTableBody tr[data-files]')).toHaveCount(1);
});
test('all long subviews scroll within viewport while navigation remains visible',async({page})=>{
 await setup(page); await page.setViewportSize({width:1000,height:600});
 await page.evaluate(()=>{window.fixtureFiles=Array.from({length:130},(_,i)=>({...window.fixtureFiles[0],name:'note '+i,path:'C:\\Archive\\file'+i})); const invoke=window.__TAURI__.core.invoke;window.__TAURI__.core.invoke=async(c,a)=>{if(c==='get_topics')return {topics:Array.from({length:30},(_,i)=>({topic:'Topic '+i,files:window.fixtureFiles,count:130}))};if(c==='get_tree')return {name:'Archive',type:'folder',path:'C:\\Archive',children:Array.from({length:90},(_,i)=>({name:'Folder '+i,path:'C:\\Archive\\folder'+i,type:'folder',children:[]}))};if(c==='find_duplicates')return {total_groups:30,duplicates:Array.from({length:30},(_,i)=>({name:'Duplicate '+i,count:2,total_size:100,files:window.fixtureFiles.slice(0,2)}))};return invoke(c,a);};});
 await scan(page);
 async function scrollable(selector){ const result=await page.locator(selector).evaluate(el=>{el.scrollTop=el.scrollHeight;return {scrolled:el.scrollTop>0,bottom:el.getBoundingClientRect().bottom}});expect(result.scrolled).toBe(true);expect(result.bottom).toBeLessThanOrEqual(600); }
 await scrollable('.home-page');
 await page.locator('.tree-arrow').first().click(); await scrollable('.tree-container');
 await page.locator('[data-page="files"]').click(); await scrollable('#page-files .table-container');
 await page.locator('[data-page="topics"]').click(); await expect(page.locator('.topic-card')).toHaveCount(30); await scrollable('#topicsContainer');
 await page.locator('[data-page="duplicates"]').click(); await page.locator('#findDupsBtn').click(); await expect(page.locator('#duplicatesTableBody tr[data-files]')).toHaveCount(30); await scrollable('#page-duplicates .table-container');
 await expect(page.locator('.sidebar-nav')).toBeVisible();
});
test('Home analysis has readable zero-byte distribution and largest file navigation',async({page})=>{
 await setup(page,{zero:true}); await scan(page);
 await expect(page.locator('#typeSummary')).toContainText('0 B');
 await expect(page.locator('#largestFiles button')).toHaveCount(3);
 await page.locator('#largestFiles button').first().click();
 await expect(page.locator('#page-files')).toHaveClass(/active/);
 await expect(page.locator('#filesTableBody tr[data-path]')).toHaveCount(1);
});
test('scan is single-flight and refresh uses header root and camelCase IPC',async({page})=>{
 await setup(page,{delay:300}); await page.locator('#homePathInput').fill(root); await page.locator('#homeScanBtn').click();
 await expect(page.locator('#homeScanBtn')).toBeDisabled(); await expect(page.locator('#browseBtn')).toBeDisabled();
 await expect(page.locator('#homeDashboard')).toBeVisible(); await page.locator('#pathInput').fill('C:\\Other'); await page.locator('#scanBtn').click();
 await expect.poll(()=>page.evaluate(()=>window.calls.filter(c=>c.command==='scan_directory').at(-1).args.path)).toBe('C:\\Other');
 await expect(page.locator('#refreshBtn')).toBeEnabled(); await page.locator('#refreshBtn').click();
 await expect.poll(()=>page.evaluate(()=>window.calls.filter(c=>c.command==='scan_directory').at(-1).args.forceRefresh)).toBe(true);
});
test('file actions preserve Windows quotes and render untrusted names as text across views',async({page})=>{
 await setup(page); await page.evaluate(()=>window.fixtureFiles.push({name:'<img src=x onerror="window.injected=true">',path:'C:\\Archive\\unsafe',file_type:'Other',size:0,modified:'unknown'})); await scan(page);
 await page.locator('[data-page="files"]').click();
 await expect(page.locator('#filesTableBody img')).toHaveCount(0);
 const row=page.locator('#filesTableBody tr').filter({hasText:"O'Brien"}); await row.getByRole('button',{name:'Open',exact:false}).click();
 expect(await page.evaluate(()=>window.calls.find(c=>c.command==='open_file')?.args.path)).toBe(files[0].path);
 await page.locator('[data-page="topics"]').click(); await expect(page.locator('.topic-card')).toHaveCount(1); await expect(page.locator('#topicsContainer img')).toHaveCount(0);
 await page.locator('[data-page="duplicates"]').click(); await page.locator('#findDupsBtn').click();
 await expect(page.locator('#duplicatesTableBody [onclick]')).toHaveCount(0);
});
test('tree navigation selects only its folder subtree and preserves scan root',async({page})=>{
 await setup(page); await scan(page);
 const rootRow=page.locator('.tree-item').filter({hasText:'Archive'}).first();
 await rootRow.locator('.tree-arrow').first().click();
 await page.locator('.tree-item').filter({hasText:/Docs/}).last().click();
 await page.locator('[data-page="files"]').click();
 await expect(page.locator('#filesTableBody tr[data-path]')).toHaveCount(1);
 await expect(page.locator('#filesTableBody')).toContainText('outside.txt');
 await expect(page.locator('#pathInput')).toHaveValue(root);
});
test('scan survives Home navigation and populates Files without errors',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message)); await setup(page); await scan(page);
 await page.locator('[data-page="files"]').click(); await expect(page.locator('#filesTableBody tr[data-path]')).toHaveCount(3);
 await page.locator('[data-page="home"]').click(); await page.locator('[data-page="files"]').click();
 await expect(page.locator('#filesTableBody tr[data-path]')).toHaveCount(3); expect(errors).toEqual([]);
});
