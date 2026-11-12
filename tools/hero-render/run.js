const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const [,, out, count, test] = process.argv; fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 800, height: 800 } });
  p.on('pageerror', e => console.log('ERR', e.message)); p.on('console', m => console.log('LOG', m.text()));
  await p.goto('http://localhost:8777/render.html'); await p.waitForFunction('window.ready', null, { timeout: 60000 });
  const N = +count; const list = test ? test.split(',').map(Number) : [...Array(N).keys()];
  for (const i of list) {
    const url = await p.evaluate(t => window.renderFrame(t), i / (N - 1));
    fs.writeFileSync(`${out}/${String(i).padStart(3, '0')}.webp`, Buffer.from(url.split(',')[1], 'base64'));
  }
  await b.close();
})();
