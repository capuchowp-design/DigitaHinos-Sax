// Copia só os arquivos do app (site) para a pasta www/, que o Capacitor empacota no APK.
// Também injeta o native-bridge.js no index.html (só da versão Android).
const fs = require('fs');
const path = require('path');

const out = 'www';
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out);

const exts = ['.html', '.js', '.json', '.png', '.svg', '.css', '.webp', '.jpg', '.ico', '.mid', '.midi'];
const skip = new Set(['package.json', 'package-lock.json', 'capacitor.config.json']);

for (const f of fs.readdirSync('.')) {
  if (!fs.statSync(f).isFile()) continue;
  if (skip.has(f) || f.startsWith('feature-graphic')) continue;
  if (exts.includes(path.extname(f).toLowerCase())) {
    fs.copyFileSync(f, path.join(out, f));
  }
}

for (const d of ['hinos', 'samples', 'vendor']) {   // hinos, sons do saxofone (opcional) e Tone.js local (opcional)
  if (fs.existsSync(d)) fs.cpSync(d, path.join(out, d), { recursive: true });
}

const idx = path.join(out, 'index.html');
let html = fs.readFileSync(idx, 'utf8');
if (!/<head[^>]*>/i.test(html)) throw new Error('index.html sem <head>');
html = html.replace(/<head[^>]*>/i, (m) => m + '\n<script src="native-bridge.js"></script>');
fs.writeFileSync(idx, html);

console.log('www/ pronto:', fs.readdirSync(out).join(', '));

// ===== Canal da Google Play (CANAL=play): cobrança só pelo Google Play Billing, sem Pix =====
if (process.env.CANAL === 'play') {
  const cfgPath = path.join(out, 'pro-config.js');
  const cfg = {};
  new Function('window', fs.readFileSync(cfgPath, 'utf8'))({ set PRO_CFG(v) { Object.assign(cfg, v); } });
  const limpo = {
    modo: 'play',
    produtoId: cfg.produtoId || 'pro_desbloqueio',
    app: cfg.app || 'sax',
    freeHinos: cfg.freeHinosPlay != null ? cfg.freeHinosPlay : 5,
    previewSec: cfg.previewSec,
    adRewardedId: cfg.adRewardedId,
    adHoras: cfg.adHoras || 1,
    adsTeste: process.env.ADS_TESTE !== 'false'   // true = anúncios de teste do Google (padrão); false só no build de produção
  };
  fs.writeFileSync(cfgPath, 'window.PRO_CFG = ' + JSON.stringify(limpo, null, 2) + ';\n');

  let h = fs.readFileSync(idx, 'utf8');
  h = h.replace(/[ \t]*<!--PIX-START-->[\s\S]*?<!--PIX-END-->\n?/g, '');
  h = h.replace(/\/\*PIX-JS-START\*\/[\s\S]*?\/\*PIX-JS-END\*\/\n?/g, '');
  if (/meuidwp|PIX_KEY|id="btnPix"|getElementById\('(btnPix|pixModal)'\)/.test(h)) throw new Error('Sobrou Pix no index.html do canal play');
  fs.writeFileSync(idx, h);
  console.log('Canal play: Pix removido, modo Google Play Billing ativo.');
}
