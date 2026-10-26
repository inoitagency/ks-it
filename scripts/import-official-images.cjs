/* eslint-disable @typescript-eslint/no-require-imports -- Standalone Node asset importer. */
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'public', 'images', 'official');
const records = [];

async function read(url) {
  const content = execFileSync('powershell.exe', ['-NoProfile', '-Command',
    `$ErrorActionPreference='Stop'; $r=Invoke-WebRequest -Uri '${url.replaceAll("'", "''")}' -UseBasicParsing -TimeoutSec 30; [Console]::Write($r.Content)`],
    { encoding: 'utf8', maxBuffer: 4 * 1024 * 1024, windowsHide: true });
  return { text: async () => content };
}

async function main() {
  fs.mkdirSync(output, { recursive: true });
  if (process.argv.includes('--additional')) {
    const catalogPath = path.join(output, 'sources.json');
    const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
    const discovery = JSON.parse(fs.readFileSync(path.join(output, 'discovery.json'), 'utf8'));
    const rawDir = path.join(root, '.browser-check', 'imports');
    fs.mkdirSync(rawDir, { recursive: true });
    for (const group of ['Advent', 'Technomantra', 'Melange', 'Seminar']) {
      const images = discovery[0].images.filter(image => image.alt === group);
      for (const index of [3, 4, 5, 6]) {
        const image = images[index];
        if (!image) continue;
        const name = `${group.toLowerCase()}-${index + 1}`;
        const raw = path.join(rawDir, `${name}.original`);
        const target = path.join(output, `${name}.webp`);
        if (!fs.existsSync(target)) {
          const quote = text => `'${text.replaceAll("'", "''")}'`;
          execFileSync('powershell.exe', ['-NoProfile', '-Command', `$ErrorActionPreference='Stop'; Invoke-WebRequest -Uri ${quote(image.url)} -OutFile ${quote(raw)} -UseBasicParsing -TimeoutSec 30`], { windowsHide: true, stdio: 'pipe' });
          await sharp(raw).rotate().resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true }).webp({ quality: 84 }).toFile(target);
        }
        const meta = await sharp(target).metadata();
        const record = { ...image, name, page: discovery[0].page, local: `/images/official/${name}.webp`, width: meta.width, height: meta.height, bytes: fs.statSync(target).size };
        const existing = catalog.findIndex(item => item.name === name);
        if (existing >= 0) catalog[existing] = record; else catalog.push(record);
        fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2));
        console.log(`Imported ${name}: ${meta.width}x${meta.height}`);
      }
    }
    return;
  }
  if (process.argv.includes('--leadership')) {
    const portraits = [
      {name:'vice-chancellor', url:'https://www.gujaratuniversity.ac.in/images/vc.jpg', page:'https://www.gujaratuniversity.ac.in/vicechancellor'},
      {name:'school-director', url:'https://ksschool.org.in/img/drbsagrawal.jpeg', page:'https://ksschool.org.in/ksdirector1.php'},
    ];
    const catalogPath = path.join(output, 'sources.json');
    const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
    for (const portrait of portraits) {
      const raw = path.join(root, '.browser-check', `${portrait.name}.original`);
      const quote = text => `'${text.replaceAll("'", "''")}'`;
      execFileSync('powershell.exe',['-NoProfile','-Command',`$ErrorActionPreference='Stop'; Invoke-WebRequest -Uri ${quote(portrait.url)} -OutFile ${quote(raw)} -UseBasicParsing -TimeoutSec 30`],{windowsHide:true,stdio:'pipe'});
      const target = path.join(output, `${portrait.name}.webp`);
      await sharp(raw).rotate().resize({width:640,withoutEnlargement:true}).webp({quality:88}).toFile(target);
      const meta = await sharp(target).metadata();
      const record={...portrait,local:`/images/official/${portrait.name}.webp`,width:meta.width,height:meta.height,bytes:fs.statSync(target).size};
      const index=catalog.findIndex(item=>item.name===portrait.name);
      if(index>=0)catalog[index]=record;else catalog.push(record);
      console.log(`Imported ${portrait.name}: ${meta.width}x${meta.height}`);
    }
    fs.writeFileSync(catalogPath,JSON.stringify(catalog,null,2));
    return;
  }
  if (process.argv.includes('--audit')) {
    const directory = path.join(root, '.browser-check', 'official-audit');
    fs.mkdirSync(directory, {recursive:true});
    for (const page of ['', 'ksdirector1.php', 'ContactUs.php', 'AboutUs.php', 'mbaplacement.php']) {
      try {
        const html = await (await read(`https://ksschool.org.in/${page}`)).text();
        fs.writeFileSync(path.join(directory, (page || 'index') + '.html'), html);
        const links = [...html.matchAll(/href=["']([^"']+)["']/gi)].map(match => match[1]);
        const paragraphs = [...html.matchAll(/<(?:p|h[1-6])\b[^>]*>([\s\S]*?)<\/(?:p|h[1-6])>/gi)].map(match => match[1].replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim()).filter(Boolean);
        const images = [...html.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)].map(match => match[1]);
        console.log(JSON.stringify({page, links:links.filter(link=>/\.php|brochure|\.pdf/i.test(link)),paragraphs,images}));
      } catch {console.warn(`Unavailable: ${page}`);}
    }
    return;
  }
  if (process.argv.includes('--download')) {
    const catalog = JSON.parse(fs.readFileSync(path.join(output, 'discovery.json'), 'utf8'));
    const selected = [];
    for (const group of ['Advent', 'Technomantra', 'Melange', 'Seminar']) {
      catalog[0].images.filter(image => image.alt === group).slice(0, 3).forEach((image, index) => selected.push({ ...image, name: `${group.toLowerCase()}-${index + 1}`, page: catalog[0].page }));
    }
    const explicit = [
      ['campus', 'img/slides/1_Updated.jpg', ''],
      ['students', 'img/slides/ksstudentdelhi.jpg', ''],
      ['alumni', 'img/slides/ksalumni.jpg', ''],
      ...[1, 2, 3].map(i => [`library-${i}`, `img/lp${i}.jpg`, 'Libraryinfo.php']),
      ...[1, 2, 3, 4].map(i => [`campus-${i}`, `img/AboutUs/${i}.${i < 3 ? 'jpg' : 'png'}`, 'AboutUs.php']),
      ['mba-placement-1', 'img/mp1.jpg', 'mbaplacement.php'],
      ['mba-placement-2', 'img/mp2.jpg', 'mbaplacement.php'],
    ];
    explicit.forEach(([name, url, page]) => selected.push({name, url: `https://ksschool.org.in/${url}`, page: `https://ksschool.org.in/${page}`}));
    const imported = [];
    const rawDir = path.join(root, '.browser-check', 'imports');
    fs.mkdirSync(rawDir, {recursive: true});
    for (const image of selected) {
      const target = path.join(output, `${image.name}.webp`);
      try {
        if (!fs.existsSync(target)) {
          const raw = path.join(rawDir, `${image.name}.original`);
          const quote = text => `'${text.replaceAll("'", "''")}'`;
          execFileSync('powershell.exe', ['-NoProfile', '-Command', `$ErrorActionPreference='Stop'; Invoke-WebRequest -Uri ${quote(image.url)} -OutFile ${quote(raw)} -UseBasicParsing -TimeoutSec 30`], {windowsHide:true, stdio:'pipe'});
          await sharp(raw).rotate().resize({width:1400, withoutEnlargement:true}).webp({quality:88}).toFile(target);
        }
        const meta = await sharp(target).metadata();
        imported.push({...image, local: `/images/official/${image.name}.webp`, width:meta.width, height:meta.height, bytes:fs.statSync(target).size});
        console.log(`Imported ${image.name}: ${meta.width}x${meta.height}`);
      } catch { console.warn(`Unavailable image: ${image.url}`); }
    }
    fs.writeFileSync(path.join(output, 'sources.json'), JSON.stringify(imported, null, 2));
    console.log(`Saved ${imported.length} optimized official images.`);
    return;
  }
  const pages = ['photoG1.php', 'Libraryinfo.php', '', 'AboutUs.php', 'mbaplacement.php'];
  for (const page of pages) {
    const url = `https://ksschool.org.in/${page}`;
    let html;
    try {
      html = page === 'photoG1.php' && fs.existsSync(path.join(root, '.gallery-source.html'))
        ? fs.readFileSync(path.join(root, '.gallery-source.html'), 'utf8')
        : await (await read(url)).text();
    } catch { console.warn(`Unavailable: ${url}`); continue; }
    const images = [...html.matchAll(/<img\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/gi)].map(match => ({
      url: new URL(match[1], url).href,
      alt: match[0].match(/\balt\s*=\s*["']([^"']*)["']/i)?.[1] || '',
    }));
    records.push({ page: url, images });
    fs.writeFileSync(path.join(output, 'discovery.json'), JSON.stringify(records, null, 2));
    console.log(`${page || 'Home'}: ${images.length} images`);
  }
  fs.writeFileSync(path.join(output, 'discovery.json'), JSON.stringify(records, null, 2));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
