// ===== CONFIGURAÇÃO DO MODO PRO — edite só este arquivo =====
window.PRO_CFG = {
  modo: 'pix',                                  // 'pix' = site e APKPure | 'play' = versão da Google Play (o workflow define sozinho)
  produtoId: 'pro_desbloqueio',                 // ID do produto criado na Play Console (só vale no modo 'play')
  app: 'sax',                                   // nome do app (aparece na planilha)
  scriptUrl: 'https://script.google.com/macros/s/AKfycbxaRx4dRSxyHpMG89JDImdtlBS-8MCpIv01vyBbO95h3CHOPcWzDM87GUqWz7evJLL40A/exec',// termina em /exec (veja GUIA_PRO.md)
  pixKey: 'meuidwp@duck.com',// CPF/CNPJ (só números), e-mail, telefone (+5511999999999) ou chave aleatória
  pixName: 'WESLEY PHILIP A CAPUCHO',// nome do recebedor (até 25 letras, sem acento)
  pixCity: 'SAO SEBASTIAO',// cidade (até 15 letras, sem acento)
  price: 19.90,                                 // valor em reais
  whatsapp: '5512974087661',// WhatsApp (com 55 + DDD) para receber o comprovante
  freeHinos: 50,                                // hinos 1 a N completos no modo grátis (site e APKPure, sem anúncio)
  freeHinosPlay: 5,                             // idem na versão da Google Play (lá há o anúncio para liberar 1 hino por 1 h)
  previewSec: 15,                               // segundos de prévia nos demais hinos
  // >>> TROQUE pelo bloco de anúncio premiado do Sax no AdMob. O valor abaixo é o de TESTE do Google.
  adRewardedId: 'ca-app-pub-3940256099942544/5224354917',
  adHoras: 1                                    // horas de hino liberado ao assistir o anúncio
};
