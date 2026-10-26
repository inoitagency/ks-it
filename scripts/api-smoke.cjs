/* eslint-disable @typescript-eslint/no-require-imports -- Isolated route checks; never sends real contact messages. */
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ts = require('typescript');
const path = require('node:path');
let upstream;
let calls = [];
function load(file) {
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  const exports = {};
  vm.runInNewContext(source, {
    exports, Request, Response, AbortSignal, URL, process,
    fetch: async (url, init) => {calls.push({url, init}); return upstream(url, init);},
    require: name => name.startsWith('@/') ? load(`src/${name.slice(2)}.ts`) : name.startsWith('./') ? load(path.join(path.dirname(file),`${name}.ts`)) : require(name),
  }, {filename:file});
  return exports;
}
async function main() {
  const routes = [
    ['faculty', 'faculty', {faculty:[{_id:'real-id',name:'Upstream member'}]}, {}],
    ['faculty/[id]', 'faculty', {faculty:{_id:'real-id',name:'Upstream member'}}, {id:'a/b'}],
    ['oldPapers/getByCategory/All','oldPaper',{oldPaper:[{_id:'real-paper',url:'published.pdf'}]},{}],
    ['announcements/all/[category]','announcement',{announcement:[{_id:'real-notice',title:'Published notice'}]},{category:'General'}],
  ];
  for (const [route,key,fixture,params] of routes) {
    const handler = load(`src/app/api/${route}/route.ts`).GET;
    upstream = async () => Response.json(fixture);
    let response = await handler(new Request('http://localhost/api'), {params:Promise.resolve(params)});
    assert.equal(response.status,200);
    assert.deepEqual((await response.json())[key],fixture[key]);
    assert.ok(calls.at(-1).init.signal instanceof AbortSignal);
    if (params.id) assert.ok(calls.at(-1).url.endsWith('a%2Fb'), 'Encode profile IDs');
    if (key === 'announcement') {
      for (const alternate of [fixture[key], {announcements:fixture[key]}, {data:fixture[key]}]) {
        upstream = async () => Response.json(alternate);
        const normalized = await handler(new Request('http://localhost/api'), {params:Promise.resolve(params)});
        assert.equal(normalized.status,200);
        assert.deepEqual((await normalized.json())[key],fixture[key]);
      }
    }
    for (const fail of [async()=>new Response('offline',{status:503}),async()=>new Response('invalid JSON'),async()=>{throw new DOMException('Timed out','TimeoutError');},async()=>Response.json({success:false})]) {
      upstream = fail;
      response = await handler(new Request('http://localhost/api'), {params:Promise.resolve(params)});
      assert.equal(response.status,502);
      const body = await response.json();
      assert.equal(body.success,false);
      assert.deepEqual(body[key],route.includes('[id]')?null:[]);
      assert.ok(!JSON.stringify(body).includes('Example'));
    }
  }
  const activityRows = [
    {_id:'w',title:'Web Development Workshop',activityType:'Workshop',url:'Public/Activities/workshop.webp',isActive:true,order:1},
    {_id:'e',title:'Annual Cultural Event',activityType:'events',url:'Public/Activities/event.jpg',isActive:true,order:2},
    {_id:'p',title:'Campus Placement Session',activityType:'placement',url:'Public/Activities/placement.png',isActive:true,order:3},
    {_id:'hidden',title:'Private Event',activityType:'event',url:'Public/Activities/private.jpg',isActive:false},
    {_id:'test',title:'test1',activityType:'event',url:'Public/Activities/test.jpg',isActive:true,order:0},
    {_id:'latin',title:'Consequatur eligend',description:'Aliquip dolor vero s',activityType:'Impedit est offici',url:'Public/logo.png',isActive:true},
    {_id:'bad-url',title:'External Event',activityType:'event',url:'https://untrusted.example/photo.jpg',isActive:true,order:0},
  ];
  const select = load('src/lib/campus-activities.ts').selectCampusActivities;
  const normalized = select(activityRows,'https://ks-server-hqsn.onrender.com');
  assert.deepEqual(Array.from(normalized,x=>x.id),['w','e','p']);
  const activityGet=load('src/app/api/activities/route.ts').GET;
  upstream=async()=>Response.json({success:true,activities:activityRows});
  assert.deepEqual((await (await activityGet()).json()).activities,JSON.parse(JSON.stringify(normalized)));
  upstream=async()=>Response.json({success:true,activities:activityRows.filter(x=>['test','latin','hidden'].includes(x._id))});
  assert.deepEqual((await (await activityGet()).json()).activities,[],'No made-up activity fallback');
  upstream=async()=>new Response('offline',{status:503});
  assert.equal((await activityGet()).status,502);
  const announcementGet=load('src/app/api/announcements/all/[category]/route.ts').GET;
  upstream=async()=>Response.json({announcement:[{title:'TEST 4'},{title:'test1'},{title:'testing_bada'},{title:'hello'},{title:'SY final exam time table',description:'chal httt'},{title:'Semester Examination Schedule',description:'Published timetable'}]});
  const notices=await (await announcementGet(new Request('http://localhost/api'),{params:Promise.resolve({category:'General'})})).json();
  assert.deepEqual(notices.announcement,[{title:'Semester Examination Schedule',description:'Published timetable'}]);
  const post = load('src/app/api/contact-us/create/route.ts').POST;
  const message = {fullName:'Test Sender',email:'test@example.com',phone:'9876543210',message:'Validation only: mocked upstream.'};
  const request = body => new Request('http://localhost/api/contact-us/create',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  for (const invalid of [{}, {...message,phone:'123'}, {...message,email:'invalid'}, {...message,message:'x'.repeat(5001)}]) {
    calls = [];
    assert.equal((await post(request(invalid))).status,400);
    assert.equal(calls.length,0);
  }
  upstream = async () => Response.json({success:true});
  assert.equal((await post(request(message))).status,200);
  upstream = async () => Response.json({message:'Unconfirmed'});
  assert.equal((await post(request(message))).status,502);
  upstream = async () => {throw new Error('offline');};
  const failed = await post(request(message));
  assert.equal(failed.status,502);
  assert.equal((await failed.json()).success,false);
  console.log('PASS: upstream data preserved, encoded IDs, timeout signals, non-OK/invalid JSON/network/backend failures, no fabricated records, contact validation and confirmed-success handling. All upstream responses mocked; no messages sent.');
}
main().catch(error => {console.error(error);process.exitCode=1;});
