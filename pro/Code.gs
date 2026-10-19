/**
 * ATIVAÇÃO PRO — Google Apps Script (cole este arquivo inteiro em Extensões > Apps Script da sua planilha)
 *
 * A planilha guarda os códigos. Cada código só pode ser ativado em UM aparelho:
 *   - 1ª vez que alguém digita o código  -> grava o identificador do aparelho (status "ativo")
 *   - mesmo aparelho de novo (reinstalou/limpou cache) -> libera de novo ("restaurado")
 *   - outro aparelho tentando o mesmo código -> recusa ("outro_dispositivo") e conta a tentativa
 */
var ABA = 'Codigos';
var COLS = ['codigo', 'status', 'dispositivo', 'ativado_em', 'cliente', 'app', 'observacao', 'ultima_verificacao', 'tentativas_outro_aparelho'];
// posição (1 = coluna A) de cada campo
var C = { codigo: 1, status: 2, dispositivo: 3, ativado_em: 4, cliente: 5, app: 6, obs: 7, ultima: 8, tent: 9 };
var CARACTERES = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sem 0/O/1/I para não confundir ao digitar

function aba_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(ABA);
  if (!sh) { sh = ss.insertSheet(ABA); }
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, COLS.length).setValues([COLS]).setFontWeight('bold').setBackground('#fcad2a');
    sh.setFrozenRows(1);
  }
  return sh;
}

function normalizar_(c) { return String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); }
function formatar_(c) { // PROXXXXXXXX -> PRO-XXXX-XXXX
  c = normalizar_(c);
  return c.length === 11 && c.indexOf('PRO') === 0 ? 'PRO-' + c.substr(3, 4) + '-' + c.substr(7, 4) : c;
}

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Pro')
    .addItem('Preparar planilha', 'configurarPlanilha')
    .addItem('Gerar 10 códigos novos', 'gerar10')
    .addItem('Gerar 50 códigos novos', 'gerar50')
    .addSeparator()
    .addItem('Liberar aparelho da linha selecionada (código volta a ser livre)', 'liberarLinha')
    .addItem('Bloquear linha selecionada', 'bloquearLinha')
    .addToUi();
}

function configurarPlanilha() { aba_(); SpreadsheetApp.getUi().alert('Planilha pronta! Agora use o menu Pro > Gerar códigos.'); }
function gerar10() { gerarCodigos(10); }
function gerar50() { gerarCodigos(50); }

function gerarCodigos(n) {
  var sh = aba_();
  var existentes = {};
  var ult = sh.getLastRow();
  if (ult > 1) sh.getRange(2, 1, ult - 1, 1).getValues().forEach(function (r) { existentes[normalizar_(r[0])] = true; });
  var linhas = [];
  while (linhas.length < n) {
    var s = '';
    for (var i = 0; i < 8; i++) s += CARACTERES.charAt(Math.floor(Math.random() * CARACTERES.length));
    var cod = 'PRO' + s;
    if (existentes[cod]) continue;
    existentes[cod] = true;
    linhas.push([formatar_(cod), 'livre', '', '', '', '', '', '', 0]);
  }
  sh.getRange(sh.getLastRow() + 1, 1, linhas.length, COLS.length).setValues(linhas);
  return linhas.length;
}

function liberarLinha() {
  var sh = aba_(), r = sh.getActiveRange().getRow();
  if (r < 2) return;
  sh.getRange(r, C.status).setValue('livre');
  sh.getRange(r, C.dispositivo).setValue('');
  sh.getRange(r, C.ativado_em).setValue('');
}
function bloquearLinha() {
  var sh = aba_(), r = sh.getActiveRange().getRow();
  if (r < 2) return;
  sh.getRange(r, C.status).setValue('bloqueado');
}

function resposta_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
function doGet() { return resposta_({ ok: true, msg: 'Ativação Pro online' }); }

function achar_(sh, codigo) {
  var cod = normalizar_(codigo); if (!cod) return 0;
  var ult = sh.getLastRow(); if (ult < 2) return 0;
  var v = sh.getRange(2, 1, ult - 1, 1).getValues();
  for (var i = 0; i < v.length; i++) if (normalizar_(v[i][0]) === cod) return i + 2;
  return 0;
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    var d = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var acao = String(d.acao || ''), disp = String(d.dispositivo || '').trim();
    if (!disp || disp.length < 6 || disp.length > 120) return resposta_({ ok: false, erro: 'dispositivo_invalido' });
    var sh = aba_(), agora = new Date();

    if (acao === 'restaurar') {                       // só para aparelhos com identificador nativo (Android): "n-..."
      if (disp.indexOf('n-') !== 0) return resposta_({ ok: false, erro: 'nenhum' });
      var ult = sh.getLastRow();
      if (ult >= 2) {
        var linhas = sh.getRange(2, 1, ult - 1, C.dispositivo).getValues();
        var sts = sh.getRange(2, C.status, ult - 1, 1).getValues();
        for (var i = 0; i < linhas.length; i++) {
          if (String(linhas[i][C.dispositivo - 1]) === disp && sts[i][0] === 'ativo') {
            sh.getRange(i + 2, C.ultima).setValue(agora);
            return resposta_({ ok: true, status: 'restaurado', codigo: linhas[i][0] });
          }
        }
      }
      return resposta_({ ok: false, erro: 'nenhum' });
    }

    var lin = achar_(sh, d.codigo);
    if (!lin) return resposta_({ ok: false, erro: 'invalido' });
    var st = String(sh.getRange(lin, C.status).getValue());
    var dispAtual = String(sh.getRange(lin, C.dispositivo).getValue());
    if (st === 'bloqueado') return resposta_({ ok: false, erro: 'bloqueado' });

    if (acao === 'ativar') {
      if (st === 'livre' || !dispAtual) {
        sh.getRange(lin, C.status).setValue('ativo');
        sh.getRange(lin, C.dispositivo).setValue(disp);
        sh.getRange(lin, C.ativado_em).setValue(agora);
        sh.getRange(lin, C.app).setValue(String(d.app || ''));
        sh.getRange(lin, C.ultima).setValue(agora);
        return resposta_({ ok: true, status: 'ativado' });
      }
      if (dispAtual === disp) {
        sh.getRange(lin, C.ultima).setValue(agora);
        return resposta_({ ok: true, status: 'restaurado' });
      }
      var t = Number(sh.getRange(lin, C.tent).getValue()) || 0;
      sh.getRange(lin, C.tent).setValue(t + 1);
      return resposta_({ ok: false, erro: 'outro_dispositivo' });
    }

    if (acao === 'verificar') {
      if (st === 'ativo' && dispAtual === disp) { sh.getRange(lin, C.ultima).setValue(agora); return resposta_({ ok: true, status: 'ativo' }); }
      return resposta_({ ok: false, erro: st === 'ativo' ? 'outro_dispositivo' : 'invalido' });
    }
    return resposta_({ ok: false, erro: 'acao_invalida' });
  } catch (err) {
    return resposta_({ ok: false, erro: 'servidor', detalhe: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}
