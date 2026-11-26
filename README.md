# DigitaHinos Sax

Visualizador MIDI/MusicXML com **saxofone animado** (soprano, alto, tenor e barítono): toca o hino e mostra, em tempo real, as chaves apertadas em cada nota. Biblioteca com 480 hinos, compositor integrado, partitura em PDF, WAV, MIDI e JSON.

## Publicar (GitHub Pages)
Envie todos os arquivos para a raiz do repositório e ative Pages (HTTPS é necessário para instalar como app). A cada versão nova, mude o número em `CACHE_NAME` no `sw.js`.

## Celulares fracos (modo leve) e sons locais
- **Modo leve (⚡ no topo):** liga sozinho em celulares. Desliga o reverb, tira os brilhos do desenho, limita a animação a ~30 quadros/s e reduz a resolução do canvas. O som usa buffer maior e as notas são entregues ao áudio com antecedência (agendador no relógio do áudio), para não picotar. O botão força ligado/desligado.
- **Diagnóstico de áudio:** segure o ⚡ por ~1 s para ver o estado real do áudio no aparelho.
- **Sons dentro do app (recomendado):** no GitHub vá em **Actions → "Baixar sons do sax (rodar 1 vez)" → Run workflow**. Ele baixa os sons do saxofone, converte para mono/MP3 leve e grava `samples/` e `vendor/` (Tone.js) no repositório. Depois mude o `CACHE_NAME` no `sw.js`. Créditos: tonejs-instruments, CC-BY 3.0.

## Gerar o AAB (Google Play) ou o APK
Actions → **Gerar APK e AAB (Sax)** → Run workflow:
- **canal `play`** → `digitahinos-sax.aab` (Google Play Billing + anúncio premiado, sem Pix). Exige os secrets `KEYSTORE_BASE64`, `KEYSTORE_PASSWORD` e `KEY_ALIAS`.
- **canal `apkpure`** → `digitahinos-sax.apk` (com Pix).
- `anuncios_teste` marcado = anúncios de TESTE. Desmarque só no build que vai para produção (o workflow recusa se os IDs do AdMob ainda forem os de teste).

### Antes de publicar na Play (preencher uma vez)
1. AdMob: crie o app **Sax** e um bloco **premiado**. Troque `ADMOB_APP_ID` em `.github/workflows/build-apk.yml` e `adRewardedId` em `pro-config.js`.
2. Play Console: crie o produto in-app `pro_desbloqueio` (igual ao `produtoId`).
3. Use a mesma chave de assinatura sempre (guarde o keystore).

## Ícones
Web/PWA na raiz (`icon-*.png`, `icon-maskable-*.png`), Android em `android-icons/` (copiados no build) e ficha da Play em `design/icone-playstore-512.png`.
