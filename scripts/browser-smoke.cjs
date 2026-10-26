/* eslint-disable @typescript-eslint/no-require-imports -- Standalone Node CommonJS script. */
// Real-browser smoke checks without downloading a browser or adding dependencies.
// Usage: node scripts/browser-smoke.cjs [http://127.0.0.1:3000]
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const base = process.argv[2] || 'http://127.0.0.1:3000';
const executable = process.env.CHROME_PATH || [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].find(fs.existsSync);
if (!executable) throw new Error('Set CHROME_PATH to a Chrome/Chromium executable.');

const artifacts = path.resolve('.browser-check');
fs.mkdirSync(artifacts, { recursive: true });
const browser = spawn(executable, [
  '--headless=new', '--no-first-run', '--no-default-browser-check',
  '--remote-debugging-port=0', `--user-data-dir=${path.join(artifacts, 'profile')}`, 'about:blank',
], { stdio: ['ignore', 'ignore', 'pipe'], windowsHide: true });
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
let socket;
let sessionId;
const pending = new Map();
const errors = [];
const consoleErrors = [];
let nextId = 0;
let integrationMode = false;
let activityScenario = 'valid';
let contactScenario = 'success';
const contactBodies = [];

function send(method, params = {}, session = sessionId) {
  const id = ++nextId;
  return new Promise((resolve, reject) => {
    const timeout = method === 'Page.captureScreenshot' ? 45000 : 15000;
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`Timed out: ${method}`)); }, timeout);
    pending.set(id, { resolve, reject, timer });
    socket.send(JSON.stringify({ id, method, params, ...(session ? { sessionId: session } : {}) }));
  });
}
async function evaluate(expression) {
  const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
}
async function until(expression) {
  for (let i = 0; i < 60; i++) {
    if (await evaluate(expression)) return;
    await delay(250);
  }
  throw new Error(`Condition not reached: ${expression}`);
}
async function screenshot(name) {
  const result = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifacts, `${name}.png`), Buffer.from(result.data, 'base64'));
}

async function checkFooter() {
  for (const route of ['/', '/about', '/placements/mba', '/contact']) {
    for (const [width,height] of [[1440,900],[1024,600],[768,844],[844,390],[390,844],[320,740]]) {
      await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width < 768});
      await send('Page.navigate',{url:base + route});
      await until(`location.pathname === ${JSON.stringify(route)} && !!document.querySelector('.curtain-footer-panel')`);
      await until('!document.querySelector("[data-testid=home-loader]")');
      await until('document.readyState === "complete"');
      if (route === '/') {
        await until(width >= 768 ? 'document.querySelector("#people-behind").parentElement.classList.contains("pin-spacer")' : '!document.querySelector(".hero-text")');
      }
      // Settle hydrated pin spacers and native scroll anchoring before measuring.
      await evaluate('window.scrollTo(0,document.documentElement.scrollHeight)');
      await delay(400);
      await evaluate('window.scrollTo(0,document.documentElement.scrollHeight)');
      await delay(400);
      const size = await evaluate(`(() => {const f=document.querySelector('.curtain-footer'),p=f.querySelector('.curtain-footer-panel');return {height:f.offsetHeight,panel:p.offsetHeight,top:f.getBoundingClientRect().top+scrollY,position:getComputedStyle(p).position,overflow:getComputedStyle(p).overflowY};})()`);
      assert.equal(size.height,size.panel,`Footer spacer mismatch at ${route} ${width}x${height}`);
      assert.notEqual(size.position,'fixed','Footer must not create a viewport-fixed layer');
      assert.notEqual(size.overflow,'auto','Footer must not trap wheel/touch in a nested scroller');
      const distance = width >= 768 ? Math.min(size.height,Math.max(0,height-96)) : 0;
      if (distance > 0) {
        // Check the reveal in both directions: the panel stays still as its mask opens.
        for (const fraction of [.25,.75,.25]) {
          const scroll = size.top - height + distance*fraction;
          await evaluate(`window.scrollTo(0,${scroll})`);
          try {
            await until(`Math.abs(document.querySelector('.curtain-footer-panel').getBoundingClientRect().top - ${height-distance}) < 3`);
          } catch (error) {
            console.error({route,width,height,fraction,size,current:await evaluate(`(() => {const f=document.querySelector('.curtain-footer'),p=f.querySelector('.curtain-footer-panel');return {scrollY,top:f.getBoundingClientRect().top,height:f.offsetHeight,panelTop:p.getBoundingClientRect().top,transform:p.style.transform,documentHeight:document.documentElement.scrollHeight};})()`)});
            await screenshot('footer-failure');
            throw error;
          }
        }
      }
      // Tall/short windows: the top of the footer can be read before scrolling to its bottom.
      if (size.height > height - 96) {
        await evaluate(`window.scrollTo(0,${size.top-96})`);
        await until('Math.abs(document.querySelector(".curtain-footer-panel").getBoundingClientRect().top-96)<3');
      }
      await evaluate('window.scrollTo(0,document.documentElement.scrollHeight)');
      await until('Math.abs(document.querySelector(".curtain-footer-panel").getBoundingClientRect().bottom - innerHeight) < 3');
      const bottom = await evaluate(`(() => {const f=document.querySelector('.curtain-footer'),p=f.querySelector('.curtain-footer-panel'),links=[...p.querySelectorAll('a')];return {gap:f.getBoundingClientRect().bottom-p.getBoundingClientRect().bottom,linkBottom:links.at(-1).getBoundingClientRect().bottom,overflow:document.documentElement.scrollWidth>innerWidth};})()`);
      assert.ok(Math.abs(bottom.gap)<2,'Blank space below footer');
      assert.ok(bottom.linkBottom<=height && bottom.linkBottom>0,'Last footer link is unreachable');
      assert.equal(bottom.overflow,false,`Horizontal overflow ${route} ${width}x${height}`);
      if (route==='/' && (width===1440 || width===390 || width===844)) await screenshot(`footer-${width}x${height}`);
      console.log(`Footer OK: ${route} ${width}x${height}`);
    }
  }
  // The same mounted footer must adapt without a page reload.
  for (const [width,height] of [[1440,900],[844,390],[390,844],[1024,600]]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<768});
    await evaluate('window.scrollTo(0,document.documentElement.scrollHeight)');
    await until('Math.abs(document.querySelector(".curtain-footer-panel").getBoundingClientRect().bottom-innerHeight)<3');
  }
  assert.deepEqual(errors,[],'Footer runtime errors');
  assert.deepEqual(consoleErrors,[],'Footer console errors');
  console.log('PASS: curtain reveal forward/backward, no fixed-layer/spacer mismatch or nested scroll, reachable final links, 4 routes x 6 viewport sizes, live resize and browser errors.');
}

async function checkIntegration() {
  integrationMode=true;
  await send('Fetch.enable',{patterns:[{urlPattern:'*/api/activities',requestStage:'Request'},{urlPattern:'*/api/contact-us/create',requestStage:'Request'}]});
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await send('Page.navigate',{url:base});
  await until('!!document.querySelector("[data-experience-source=activity]")');
  await until('!document.querySelector("[data-testid=home-loader]")');
  assert.equal(await evaluate('document.querySelector("#campus-experience-preview img[aria-hidden=false]").alt'),'Published Workshop');
  await evaluate('document.querySelector("#campus-experience").scrollIntoView({block:"center"})');
  await evaluate('document.querySelector("#experience-events").click()');
  await until('document.querySelector("#campus-experience-preview img[aria-hidden=false]").alt === "Published Event"');
  await until('document.querySelector("#campus-experience-preview").dataset.activeExperience === "placements"');
  for (const scenario of ['broken','failure','empty']) {
    activityScenario=scenario;
    await send('Page.reload');
    await until('!!document.querySelector("[data-experience-source=archive]")');
    await evaluate('document.querySelector("#campus-experience").scrollIntoView({block:"center"})');
    await until('document.querySelector("#campus-experience-preview img[aria-hidden=false]").naturalWidth > 0');
    assert.equal(await evaluate('document.querySelectorAll("#campus-experience button").length'),3);
    assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'),true);
  }
  await send('Page.navigate',{url:base+'/contact'});
  await until('!!document.querySelector("form input[name=fullName]")');
  async function submitMock() {
    for (const [field,value] of Object.entries({fullName:'Website Check',email:'website-test@example.com',phone:'0000000000',message:'Browser test; upstream intercepted.'})) {
      await evaluate(`document.querySelector('[name=${field}]').focus()`);
      await send('Input.insertText',{text:value});
    }
    await evaluate('document.querySelector("form button").click()');
  }
  await submitMock();
  await until('document.body.innerText.includes("Your inquiry has been submitted")');
  assert.equal(contactBodies.length,1);
  assert.equal(contactBodies[0].fullName,'Website Check');
  await evaluate('Array.from(document.querySelectorAll("button")).find(button=>button.textContent.toLowerCase().includes("send another message")).click()');
  await until('!!document.querySelector("form")');
  contactScenario='failure';
  await submitMock();
  await until('document.body.textContent.includes("Mock service unavailable")');
  assert.equal(await evaluate('document.body.innerText.includes("Message Sent!")'),false);
  assert.equal(contactBodies.length,2);
  for (const width of [390,1440]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<768});
    await evaluate('window.scrollTo(0,document.documentElement.scrollHeight)');
    await until('Math.abs(document.querySelector(".curtain-footer-panel").getBoundingClientRect().bottom-innerHeight)<3');
    const credit=await evaluate(`(() => {const raj=document.querySelector('a[href="https://github.com/Rajchandel1"]'),manav=document.querySelector('a[href="https://github.com/manavchawla146/"]'),p=raj.closest('p'),r=p.getBoundingClientRect();return {tag:p.tagName,right:document.documentElement.clientWidth-r.right,bottom:innerHeight-r.bottom,font:parseFloat(getComputedStyle(p).fontSize),targets:[raj.target,manav.target]};})()`);
    assert.equal(credit.tag,'P');
    assert.ok(Math.abs(credit.right-24)<2 && Math.abs(credit.bottom-16)<2,'Credit must stay at the footer bottom-right');
    assert.ok(credit.font<=12);
    assert.deepEqual(credit.targets,['_blank','_blank']);
  }
  assert.deepEqual(errors,[]);
  assert.deepEqual(consoleErrors,[]);
  console.log('PASS: activity mapping/rotation, labeled archive for empty/offline/broken photos, mobile layout, contact form payload and success/failure. Browser contact requests intercepted; no real messages sent.');
}

async function main() {
  const debuggerUrl = await new Promise((resolve, reject) => {
    let output = '';
    const timer = setTimeout(() => reject(new Error('Chrome did not start')), 15000);
    browser.on('exit', code => { clearTimeout(timer); reject(new Error(`Chrome exited: ${code}`)); });
    browser.stderr.on('data', chunk => {
      output += chunk;
      const match = output.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (match) { clearTimeout(timer); resolve(match[1]); }
    });
  });
  socket = new WebSocket(debuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  socket.onmessage = event => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const entry = pending.get(message.id);
      pending.delete(message.id);
      clearTimeout(entry.timer);
      if (message.error) entry.reject(new Error(JSON.stringify(message.error)));
      else entry.resolve(message.result);
    }
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails);
    if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') {
      consoleErrors.push(message.params.args.map(arg => arg.value || arg.description || '').join(' '));
    }
    if (message.method === 'Fetch.requestPaused') {
      if (integrationMode) {
        const request=message.params.request;
        let status=200;
        let body;
        if (request.url.endsWith('/api/activities')) {
          const activities=activityScenario==='valid' ? [
            {id:'w',type:'workshops',title:'Published Workshop',image:'/images/official/seminar-2.webp'},
            {id:'e',type:'events',title:'Published Event',image:'/images/official/advent-5.webp'},
            {id:'p',type:'placements',title:'Published Placement Session',image:'/images/official/alumni.webp'},
          ] : activityScenario==='broken' ? [{id:'b',type:'workshops',title:'Broken photo',image:'data:image/png;base64,broken'}] : [];
          status=activityScenario==='failure'?502:200;
          body={success:status===200,activities};
        } else {
          contactBodies.push(JSON.parse(request.postData));
          status=contactScenario==='success'?200:502;
          body={success:status===200,message:'Mock service unavailable'};
        }
        send('Fetch.fulfillRequest',{requestId:message.params.requestId,responseCode:status,responseHeaders:[{name:'Content-Type',value:'application/json'}],body:Buffer.from(JSON.stringify(body)).toString('base64')}).catch(error=>errors.push(String(error)));
        return;
      }
      send('Fetch.fulfillRequest', {requestId:message.params.requestId,responseCode:502,responseHeaders:[{name:'Content-Type',value:'application/json'}],body:Buffer.from(JSON.stringify({success:false,message:'Service temporarily unavailable'})).toString('base64')}).catch(error => errors.push(String(error)));
    }
  };
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' }, null);
  sessionId = (await send('Target.attachToTarget', { targetId, flatten: true }, null)).sessionId;
  await send('Page.enable');
  await send('Runtime.enable');
  if (process.argv.includes('--footer-only')) { await checkFooter(); return; }
  if (process.argv.includes('--integration-only')) { await checkIntegration(); return; }
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: base });
  await until('!!document.querySelector("[data-testid=home-loader]")');
  assert.ok(await evaluate('Number(getComputedStyle(document.querySelector("[data-testid=home-loader]")).zIndex) >= 1000'), 'Loader must cover navigation');
  await until('!!document.querySelector("video") && document.querySelectorAll(".gal-card").length === 6');
  await until('sessionStorage.getItem("hasVisitedKS") === "true"');
  await until('!document.querySelector("[data-testid=home-loader]")');
  await send('Page.reload');
  await until('!!document.querySelector("video") && document.querySelectorAll(".gal-card").length === 6');
  await delay(500);
  assert.equal(await evaluate('!!document.querySelector("[data-testid=home-loader]")'), false, 'Loader should not replay on reload');
  await until('document.querySelector("video").readyState >= 2 && !document.querySelector("video").paused');
  assert.equal(await evaluate('document.querySelectorAll(".hod-card-photo").length'), 3);
  await screenshot('desktop-top');

  await evaluate('document.querySelector(".service-tile").scrollIntoView({block:"center"})');
  await delay(1000);
  const hoverPoint = await evaluate('(() => { const r = document.querySelector(".service-tile").getBoundingClientRect(); return {x: Math.round(r.left + 150), y: Math.round(r.top + r.height / 2)}; })()');
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...hoverPoint });
  await until('Number(getComputedStyle(document.querySelector(".service-image-hover")).opacity) > 0.99');
  const preview = await evaluate('(() => { const r = document.querySelector(".service-image-hover").getBoundingClientRect(); return {x:r.left, y:r.top, width:r.width, height:r.height}; })()');
  assert.ok(Math.abs(preview.x - (hoverPoint.x - 140)) < 2, 'Hover preview x position changed');
  assert.ok(Math.abs(preview.y - (hoverPoint.y - 170)) < 2, 'Hover preview y position changed');
  assert.ok(Math.abs(preview.width - 280) < 2, 'Hover preview width changed');

  // Inspect the final stages of the existing pinned animation choreography.
  await evaluate('window.scrollTo(0, document.querySelector(".hero-text").closest("section").getBoundingClientRect().top + scrollY + 2300)');
  await until('Number(getComputedStyle(document.querySelector(".hod-main")).opacity) > 0.99');
  await until('Number(getComputedStyle(document.querySelector(".hod-side-right")).opacity) > 0.99');
  await delay(1200);
  await screenshot('desktop-leadership');
  await evaluate('window.scrollTo(0, document.querySelector(".gal-card").closest("section").getBoundingClientRect().top + scrollY + innerHeight * 2)');
  await until('Number(getComputedStyle(document.querySelector(".gal-item")).opacity) > 0.99');
  await until('Array.from(document.querySelectorAll(".gal-card img")).every(image => image.complete && image.naturalWidth > 0)');
  await delay(1500);
  await screenshot('desktop-gallery');

  await evaluate('document.querySelector("#campus-experience").scrollIntoView({block:"center"})');
  await until('Array.from(document.querySelectorAll("#campus-experience-preview img")).every(image => image.complete && image.naturalWidth > 0)');
  assert.equal(await evaluate('document.querySelectorAll("#campus-experience button").length'), 3);
  assert.equal(await evaluate('document.querySelectorAll("#campus-experience button[aria-pressed=true]").length'), 1);
  const tilePoint = await evaluate('(() => { const r = document.querySelector("#experience-events").getBoundingClientRect(); return {x:Math.round(r.left + r.width / 2), y:Math.round(r.top + r.height / 2)}; })()');
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...tilePoint });
  await until('document.querySelector("#campus-experience-preview").dataset.activeExperience === "events"');
  await evaluate('document.querySelector("#experience-placements").click()');
  await until('document.querySelector("#campus-experience-preview").dataset.activeExperience === "placements"');
  await evaluate('document.querySelector("#experience-workshops").focus({preventScroll:true})');
  await until('document.querySelector("#campus-experience-preview").dataset.activeExperience === "workshops"');
  await send('Input.dispatchKeyEvent', {type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
  await send('Input.dispatchKeyEvent', {type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
  await until('document.activeElement.id === "experience-events" && document.querySelector("#campus-experience-preview").dataset.activeExperience === "events"');
  await evaluate('document.querySelector("#experience-workshops").focus({preventScroll:true})');
  await delay(400);
  await screenshot('desktop-experience');
  // Manual selection starts a fresh five-second rotation window.
  await send('Input.dispatchMouseEvent', {type:'mouseMoved',x:5,y:100});
  await evaluate('document.querySelector("#experience-workshops").click()');
  await until('document.querySelector("#campus-experience-preview").dataset.activeExperience === "events"');
  await until('document.querySelector("#campus-experience-preview").dataset.activeExperience === "placements"');
  await until('document.querySelector("#campus-experience-preview").dataset.activeExperience === "workshops"');

  await evaluate('window.scrollTo(0, 4000)');
  await until('document.querySelector("video").paused');
  await evaluate('window.scrollTo(0, 0)');
  await until('!document.querySelector("video").paused');

  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await until('document.querySelectorAll(".gal-card").length === 6 && !document.querySelector(".hero-text")');
  assert.equal(await evaluate('document.querySelectorAll(".hod-card-photo").length'), 3);
  assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true);
  await send('Emulation.setTouchEmulationEnabled', {enabled:true,maxTouchPoints:1});
  await evaluate('document.querySelector("#campus-experience").scrollIntoView({block:"center"})');
  const touchPoint = await evaluate('(() => { const r = document.querySelector("#experience-placements").getBoundingClientRect(); return {x:Math.round(r.left + r.width / 2), y:Math.round(r.top + r.height / 2)}; })()');
  await send('Input.dispatchTouchEvent', {type:'touchStart',touchPoints:[touchPoint]});
  await send('Input.dispatchTouchEvent', {type:'touchEnd',touchPoints:[]});
  await until('document.querySelector("#campus-experience-preview").dataset.activeExperience === "placements"');
  for (const width of [360, 768, 1024, 390]) {
    await send('Emulation.setDeviceMetricsOverride', {width,height:844,deviceScaleFactor:1,mobile:width < 768});
    assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true, `Horizontal overflow at ${width}px`);
    assert.equal(await evaluate('document.querySelectorAll("#campus-experience button").length'), 3);
  }
  await evaluate('document.querySelector("#campus-experience").scrollIntoView({block:"end"})');
  await delay(400);
  await screenshot('mobile-experience');
  for (const [width, height] of [[320,740],[360,800],[390,844]]) {
    await send('Emulation.setDeviceMetricsOverride', {width,height,deviceScaleFactor:1,mobile:width < 768});
    await until('document.querySelectorAll(".leadership-mobile .hod-card-wrapper").length === 3 && !document.querySelector(".hero-text")');
    for (let index = 0; index < 3; index++) {
      await evaluate(`document.querySelectorAll('.leadership-mobile .hod-card-wrapper')[${index}].scrollIntoView({block:'center'})`);
      await until(`Number(getComputedStyle(document.querySelectorAll('.leadership-mobile .hod-card-wrapper')[${index}]).opacity) > .99`);
      await until(`document.querySelectorAll('.leadership-mobile .hod-card-photo')[${index}].naturalWidth > 0`);
      const card = await evaluate(`(() => {const card=document.querySelectorAll('.leadership-mobile .hod-card-wrapper')[${index}];const photo=card.querySelector('img').getBoundingClientRect();const name=card.querySelector('.hod-card-info').getBoundingClientRect();return {height:card.getBoundingClientRect().height,photoHeight:photo.height,photoWidth:photo.width,gap:name.top-photo.bottom};})()`);
      assert.ok(card.height < 490 && card.gap >= 0 && card.gap < 40, `Photo/name separation at ${width}x${height}: ${JSON.stringify(card)}`);
      assert.ok(Math.abs(card.photoHeight / card.photoWidth - 4/3) < .02, 'Leadership photo must reserve its portrait height');
    }
    assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true, `Overflow at ${width}x${height}`);
  }
  await send('Emulation.setDeviceMetricsOverride', {width:390,height:844,deviceScaleFactor:1,mobile:true});
  await evaluate('document.querySelector(".leadership-mobile .hod-card-wrapper").scrollIntoView({block:"center"})');
  await delay(500);
  await screenshot('mobile-leadership');
  // Preserve the pinned desktop choreography, including shorter PC windows.
  for (const [width,height] of [[1024,600],[844,390],[768,844]]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
    await until('!!document.querySelector(".hero-text") && !document.querySelector(".leadership-mobile")');
    await evaluate('window.scrollTo(0,document.querySelector("#people-behind").getBoundingClientRect().top + scrollY + 2300)');
    await until('Number(getComputedStyle(document.querySelector(".hod-side-right")).opacity) > .99');
    assert.equal(await evaluate('getComputedStyle(document.querySelector(".curtain-footer-panel")).position'),'relative');
  }
  assert.equal(await evaluate('document.querySelector("#infrastructure > div img").getAttribute("src")'),'/images/official/campus.webp');
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await until('!!document.querySelector(".leadership-mobile")');
  await send('Emulation.setTouchEmulationEnabled', {enabled:false});
  await evaluate('window.scrollTo(0, 0)');
  await delay(1000);
  await screenshot('mobile-top');
  await evaluate('document.querySelector(".gal-card").scrollIntoView({block:"center"})');
  await delay(1200);
  await screenshot('mobile-gallery');
  await evaluate('document.querySelector(".gal-card").click()');
  await until('!!document.querySelector("[role=dialog]")');
  assert.equal(await evaluate('document.body.style.overflow'), 'hidden');
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await until('!document.querySelector("[role=dialog]")');
  assert.notEqual(await evaluate('document.body.style.overflow'), 'hidden');

  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await until('!!document.querySelector(".hero-text") && document.querySelectorAll(".gal-card").length === 6');
  await evaluate('window.scrollTo(0, 0)');
  await delay(1000);
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 220, y: 150 });
  await delay(500);
  assert.equal(await evaluate('getComputedStyle(document.body).cursor'), 'none');

  await send('Page.navigate', { url: `${base}/programs/integrated-mba` });
  await until('!!document.querySelector("h1") && document.body.innerText.includes("Master of Business Administration")');
  await send('Page.navigate', { url: `${base}/placements/mba` });
  await until('!!document.querySelector("h1") && !document.body.innerText.includes("Placement type not found")');
  await evaluate('document.querySelector("img[src*=recruiter-]").scrollIntoView({block:"center"})');
  await until('Array.from(document.querySelectorAll("img[src*=recruiter-]")).every(image => image.complete && image.naturalWidth > 0)');
  // Simulate service outages without making contact submissions or external data requests.
  await send('Fetch.enable', {patterns:[{urlPattern:'*/api/*',requestStage:'Request'}]});
  const routes = [
    ['/about','ABOUT US'], ['/about/message-from-director',"Message from Director"],
    ['/programs/integrated-mba','Master of Business Administration'], ['/programs/m-sc-ca-it','Computer Applications'],
    ['/placements','Placements &'], ['/placements/mba','Five-Year Integrated MBA'], ['/placements/m-sc-ca-it','Five-Year Integrated M.Sc.'],
    ['/contact',"Connect"], ['/infrastructure','Excellence in Every Corner'],
    ['/faculty/mba','MBA Faculty'], ['/faculty/msc-it','MSc IT Faculty'], ['/papers','Past Examination Papers'], ['/announcements','Notifications'],
  ];
  for (const [route, text] of routes) {
    await send('Emulation.setDeviceMetricsOverride', {width:320,height:740,deviceScaleFactor:1,mobile:true});
    await send('Page.navigate', {url:base + route});
    await until(`location.pathname === ${JSON.stringify(route)} && document.body && document.body.innerText.includes(${JSON.stringify(text)})`);
    if (/faculty|papers|announcements/.test(route)) await until('document.body.innerText.includes("Information is temporarily unavailable")');
    await delay(350);
    assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true, `Route overflow: ${route}`);
    if (route.includes('director')) assert.equal(await evaluate('document.body.innerText.includes("Message as published on the official school website")'),false);
    for (const width of [768,1024]) {
      await send('Emulation.setDeviceMetricsOverride', {width,height:768,deviceScaleFactor:1,mobile:false});
      assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true, `Route overflow: ${route} at ${width}`);
    }
  }
  await send('Emulation.setDeviceMetricsOverride', {width:320,height:740,deviceScaleFactor:1,mobile:true});
  await evaluate('document.querySelector("button[aria-controls=mobile-navigation]").click()');
  await until('!!document.querySelector("#mobile-navigation")');
  assert.equal(await evaluate('document.body.style.overflow'), 'hidden');
  assert.ok(await evaluate('document.querySelectorAll("#mobile-navigation a").length >= 12'));
  assert.equal(await evaluate('Array.from(document.querySelectorAll("#mobile-navigation a")).some(link => link.getAttribute("href") === "/faculty")'),false);
  await send('Input.dispatchKeyEvent', {type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
  await until('!document.querySelector("#mobile-navigation")');
  assert.notEqual(await evaluate('document.body.style.overflow'),'hidden');
  assert.deepEqual(errors, [], 'Unexpected browser runtime exceptions');
  assert.deepEqual(consoleErrors, [], 'Unexpected browser console errors');
  console.log('PASS: first-visit loader/reload, mobile leadership spacing, 13 routes at 320/768/1024px, API outage UI, mobile menu, campus selection, image loading, animation stages, resize, video playback, gallery, cursor and runtime/console errors.');
  console.log(`Screenshots: ${artifacts}`);
}

main().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => {
  if (socket?.readyState === WebSocket.OPEN) {
    await send('Browser.close', {}, null).catch(() => {});
    socket.close();
  }
  browser.kill();
});
