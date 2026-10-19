# Modo Free / Pro com Pix e planilha Google — passo a passo

## Como funciona
- **Grátis:** todos os 480 hinos abrem, com qualquer voz, mas tocam só **15 segundos**. Os hinos **1 a 5** tocam completos.
  (Arquivos que a pessoa abre do próprio celular e músicas compostas no editor não têm limite.)
- **Pro:** a pessoa paga via **Pix**, manda o comprovante, você envia um **código** (ex.: `PRO-7K3Q-9XWM`). Ela digita o código no app e tudo é liberado.
- **1 código = 1 aparelho.** Na primeira ativação o app grava na planilha o identificador do aparelho. Se outro aparelho tentar o mesmo código, o script recusa.
- Se a pessoa **desinstalar, limpar dados ou trocar de navegador/versão**:
  - **App instalado (APK):** o acesso volta **sozinho** (o app pergunta ao script se aquele aparelho já tem um código ativo).
  - **Navegador/PWA:** ela digita o **mesmo código** de novo; o script reconhece o aparelho e libera.

## 1) Criar a planilha e o script (uma vez)
1. Entre no Google Drive → **Novo → Planilhas Google** (dê o nome "Pro – Códigos").
2. Menu **Extensões → Apps Script**.
3. Apague o que estiver lá e **cole o arquivo `Code.gs` inteiro**. Clique em **Salvar** (disquete).
4. Na barra de funções, escolha **`configurarPlanilha`** e clique em **Executar**. O Google vai pedir autorização (conta → *Avançado* → *Acessar…* → *Permitir*). Isso cria a aba **Codigos**.
5. Volte para a planilha e recarregue a página: aparece o menu **Pro**. Use **Pro → Gerar 10 códigos novos** (ou 50).
6. No Apps Script: **Implantar → Nova implantação → Tipo: App da Web**
   - *Executar como:* **Eu**
   - *Quem pode acessar:* **Qualquer pessoa**
   - Clique em **Implantar** e **copie a URL** (termina em `/exec`).
   - Importante: sempre que você mudar o `Code.gs`, faça **Implantar → Gerenciar implantações → editar → Nova versão** (a URL continua a mesma).

## 2) Preencher o app
Abra o arquivo **`pro-config.js`** (na pasta do app) e troque:
- `scriptUrl` → a URL `/exec` do passo anterior
- `pixKey`, `pixName`, `pixCity` → sua chave Pix, seu nome (até 25 letras) e sua cidade (até 15)
- `price` → valor (ex.: `19.90`)
- `whatsapp` → seu WhatsApp com 55 + DDD (ex.: `5511999999999`), para onde chega o comprovante

Teste antes de publicar: abra o app → ⭐ **Pro** → **Copiar Pix copia e cola** → cole no app do seu banco. O banco deve mostrar **seu nome e o valor** (não precisa pagar para conferir).

## 3) No dia a dia
1. A pessoa paga e manda o comprovante no WhatsApp.
2. Você abre a planilha, escolhe um código com status **livre**, copia e envia para ela. (Anote o nome em **cliente**, se quiser.)
3. Ela digita o código no app: a linha vira **ativo**, com o aparelho e a data.

Colunas: `codigo · status · dispositivo · ativado_em · cliente · app · observacao · ultima_verificacao · tentativas_outro_aparelho`.
- **Trocou de celular / quer mudar o aparelho?** Selecione a linha → **Pro → Liberar aparelho da linha selecionada**. O código volta a ser livre.
- **Estorno ou fraude?** Selecione a linha → **Pro → Bloquear**. Em até 24 h o app daquele aparelho perde o Pro (se estiver online).
- A coluna `tentativas_outro_aparelho` mostra quantas vezes tentaram usar o código em outro aparelho (código compartilhado).

## 4) Pontos importantes
- **Assinatura do APK:** o reconhecimento pelo identificador do Android só se mantém ao reinstalar se o APK for assinado **sempre com a mesma chave**. No GitHub, confirme que os *secrets* `KEYSTORE_BASE64`, `KEYSTORE_PASSWORD` e `KEY_ALIAS` estão preenchidos. Sem eles o workflow usa uma chave de teste nova a cada build, e o aparelho muda de identificador a cada versão.
- **Limite honesto:** é uma proteção prática, não à prova de tudo. Quem entende de programação pode alterar o app no próprio aparelho. Para um app de hinos isso costuma bastar. No navegador, o aparelho é reconhecido por uma "assinatura" (tela, fuso, idioma etc.); se mudar muito, o usuário pede para você liberar a linha.
- **Loja:** na **Google Play**, desbloqueios pagos dentro do app normalmente precisam usar o sistema de cobrança da própria Google, então confira as regras vigentes antes de publicar lá. APK fora da Play (ex.: APKPure) não tem essa regra da Google, mas vale conferir as regras de cada loja.
- **Privacidade:** o app passa a enviar código + identificador do aparelho ao seu script (só de quem ativa o Pro). A `privacy.html` já foi atualizada com isso; revise o texto.
- **Pagamento por Pix é manual:** o app não sabe se o Pix caiu. Quem libera é você, ao enviar o código.
