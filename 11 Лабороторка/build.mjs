import { build } from 'esbuild';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';

const tasks = [
  { n: 5, title: 'Задание 5 — Оценка занятия' },
  { n: 10, title: 'Задание 10 — Опрос' },
  { n: 16, title: 'Задание 16 — Планировщик расходов' },
];

const safeJs = (s) => s.replace(/<\/script/gi, '<\\/script');
const safeCss = (s) => s.replace(/<\/style/gi, '<\\/style');

rmSync('ready', { recursive: true, force: true });

for (const { n, title } of tasks) {
  const out = `ready/task${n}`;
  mkdirSync(out, { recursive: true });

  const result = await build({
    entryPoints: { app: `src/entries/task${n}.jsx` },
    outdir: out,
    write: false,
    bundle: true,
    format: 'iife',
    minify: true,
    jsx: 'automatic',
    loader: { '.jsx': 'jsx' },
    define: { 'process.env.NODE_ENV': '"production"' },
    logLevel: 'warning',
  });

  let js = '';
  let css = '';
  for (const f of result.outputFiles) {
    if (f.path.endsWith('.js')) js = f.text;
    if (f.path.endsWith('.css')) css = f.text;
  }

  const html = `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Лабораторная работа №11 — ${title}</title>
    ${css ? `<style>${safeCss(css)}</style>` : ''}
  </head>
  <body>
    <div id="root"></div>
    <script>
      window.addEventListener('error', function (e) {
        var root = document.getElementById('root');
        if (root && !root.hasChildNodes()) {
          root.innerHTML = '<pre style="color:#b00;padding:16px;white-space:pre-wrap">Ошибка: ' +
            String(e.message).replace(/</g, '&lt;') + '</pre>';
        }
      });
    </script>
    <script>${safeJs(js)}</script>
  </body>
</html>
`;
  writeFileSync(`${out}/index.html`, html);
  console.log('готово:', `${out}/index.html`);
}
