// Baixa os sons originais de saxofone (tonejs-instruments, CC-BY 3.0), converte para
// MONO MP3 leve e grava em samples/<instrumento>/ + index.json. Baixa também o Tone.js para vendor/.
//
// Uso (precisa de Node 18+, git e ffmpeg):   node scripts/baixar-samples.js
// Opções:  --src <pasta>   usa uma pasta que já tem <instrumento>/*.mp3 (não clona o GitHub)
//          --sem-tone      não baixa o Tone.js
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

const args = process.argv.slice(2);
const opt = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const INSTR = ['saxophone'];
const BITRATE = '64k';
const TONE_VERSION = '14.8.49';           // a mesma versão usada no index.html

let src = opt('--src');
if (!src) {
  src = fs.mkdtempSync(path.join(os.tmpdir(), 'tonejs-instruments-'));
  console.log('Baixando amostras do GitHub (só saxofone)...');
  const git = (a, cwd) => execFileSync('git', a, { cwd, stdio: 'inherit' });
  git(['clone', '--depth', '1', '--filter=blob:none', '--sparse', 'https://github.com/nbrosowsky/tonejs-instruments.git', src]);
  git(['sparse-checkout', 'set', ...INSTR.map(i => 'samples/' + i)], src);
  src = path.join(src, 'samples');
}

const out = path.join(__dirname, '..', 'samples');
const NOTE = /^([A-G])(s?)(\d)\.(mp3|wav|ogg)$/i;
let total = 0;
for (const inst of INSTR) {
  const dir = path.join(src, inst);
  if (!fs.existsSync(dir)) { console.warn('Pasta não encontrada, pulando:', dir); continue; }
  const dst = path.join(out, inst);
  fs.rmSync(dst, { recursive: true, force: true });
  fs.mkdirSync(dst, { recursive: true });
  const urls = {};
  for (const f of fs.readdirSync(dir).sort()) {
    const m = f.match(NOTE);
    if (!m) continue;
    const nome = m[1].toUpperCase() + m[2].toLowerCase() + m[3];          // ex.: As3
    const chave = m[1].toUpperCase() + (m[2] ? '#' : '') + m[3];         // ex.: A#3
    const dest = path.join(dst, nome + '.mp3');
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', path.join(dir, f),
      '-ac', '1', '-ar', '44100', '-c:a', 'libmp3lame', '-b:a', BITRATE, dest]);
    urls[chave] = nome + '.mp3';
    total += fs.statSync(dest).size;
  }
  if (!Object.keys(urls).length) throw new Error('Nenhuma amostra encontrada em ' + dir);
  fs.writeFileSync(path.join(dst, 'index.json'), JSON.stringify(urls, null, 1) + '\n');
  console.log(inst + ':', Object.keys(urls).length, 'notas');
}
fs.writeFileSync(path.join(out, 'LICENCA.txt'),
  'Gravações de saxofone: projeto tonejs-instruments (Nicholas Brosowsky),\n' +
  'licença Creative Commons Attribution 3.0 (CC-BY 3.0): https://github.com/nbrosowsky/tonejs-instruments\n' +
  'Os arquivos aqui foram convertidos para mono/MP3 (' + BITRATE + ') para o app ficar mais leve.\n');
console.log('Total dos sons: ' + (total / 1024 / 1024).toFixed(1) + ' MB');

(async () => {
  if (args.includes('--sem-tone')) return;
  const url = 'https://cdn.jsdelivr.net/npm/tone@' + TONE_VERSION + '/build/Tone.js';
  const r = await fetch(url);
  if (!r.ok) throw new Error('Falha ao baixar Tone.js: ' + r.status);
  const txt = await r.text();
  if (txt.length < 100000 || !/Tone/.test(txt)) throw new Error('Tone.js baixado parece inválido');
  fs.mkdirSync(path.join(__dirname, '..', 'vendor'), { recursive: true });
  fs.writeFileSync(path.join(__dirname, '..', 'vendor', 'Tone.js'), txt);
  console.log('vendor/Tone.js ok (' + (txt.length / 1024).toFixed(0) + ' KB)');
})().catch(e => { console.error(e.message); process.exit(1); });
