# PRD — Tabela de Revisões e Tira-dúvidas de Garantia Kia (Stern)
**Versão:** 1.6 (24/11/2026: visual v2, turquesa e cartões em relevo, seção 3.15) · 1.5 (17/11/2026: aba Regras de revisão, seção 3.14) · 1.4 (12/11/2026: aba renomeada para Luzes de advertência; luzes por categoria de motorização, seção 3.13) · 1.3 (11/11/2026: aba Luzes do painel, seção 3.13; terceira aba em 3.10) · 1.2 (11/11/2026: atualização pelo Leonardo, sem pasta compartilhada) · 1.1 · v1.0 aprovada em 06/11/2026; **v1.1 (garantia + nomes do NBS) aprovada em 09/11/2026** · **Dono:** Leonardo

## 1. Visão
Um link aberto o dia todo no navegador do PC de trabalho do **agendamento** e dos **consultores** (o celular é uso raro). Durante a ligação, o funcionário digita o modelo e vê na hora o **valor da revisão pela Tabela Stern**, com a lista de itens e a foto do modelo. Ele monta o orçamento com extras e desconto e copia um texto pronto para o cliente.

Na mesma página, a aba **Garantia** tira as dúvidas de garantia: o funcionário digita o carro e o problema ("Sportage 2023 amortecedor") e vê a **regra oficial da Kia**, tirada dos livretos (manual do proprietário), com a página de origem.

**Problema de hoje:** a consulta é feita em Excel ou em papel, o que é lento e sujeito a erro de preço; e as dúvidas de garantia, que são das mais frequentes, dependem de alguém procurar no manual.

## 2. Usuários
| Quem | Uso |
|---|---|
| Agendamento | Consulta valores e passa ao cliente por telefone ou WhatsApp |
| Consultores | Consultam, montam o orçamento e avisam o agendamento quando o cliente fecha |
| Cleidiane (garantia@sternkia.com.br) | Responsável pelas atualizações da tabela, do catálogo e dos livretos de garantia, com ajuda do Claude |

## 3. Funcionalidades do MVP

### 3.1 Acesso
- **PIN único** da equipe, pedido uma vez em cada PC (o navegador lembra).
- Página com `noindex` (não aparece no Google).
- O PIN só impede acesso casual. Os dados ficam num arquivo público (decisão consciente, ver Riscos).

### 3.2 Busca
- Campo grande com sugestões enquanto digita, sem diferenciar acento e maiúscula ("sportage", "Sportage 2024").
- Atalho de teclado foca a busca, **Enter** seleciona e **Esc** limpa.
- **Modelo não encontrado:** mensagem *"Modelo não encontrado. Confira o nome ou consulte a oficina"* + **sugestões parecidas** ("Você quis dizer Sorento?") + contato **Cleidiane, garantia@sternkia.com.br**.

### 3.3 Resultado do modelo
- Cartão com o **nome exatamente como o título de dentro da aba** (mesma nomenclatura e códigos do NBS, ex.: "CERATO 1.6 FLEX YD"), os **anos de início e fim** (ex.: "2013–2019") e a **foto** do modelo/geração (aprovada pelo Leonardo; site Kia para os atuais, Wikimedia Commons com crédito do autor para os antigos; abas do mesmo carro dividem a foto). Nada de nomes reescritos (decisão do Leonardo, 09/11/2026). Fonte: `data/nomes.csv`.
- **Todas as revisões de uma vez**, cada uma com **valor total e lista de itens sempre abertos** (peças, óleo, mão de obra).
- Valor base = **Tabela Stern**, calculado a partir do detalhe das peças (regras em [ESTADO-DO-PROJETO.md](ESTADO-DO-PROJETO.md)).
- **Forma de pagamento** no cartão aberto, acima de "Montar orçamento": "Pix ou cartão de crédito · parcelado em até Nx de R$ X sem juros" (ou "somente à vista"). Regra: parcela mínima R$ 500, até 3x sem juros; Pix sem desconto. Calculada pelo total, não pela linha PARCELAMENTO da planilha (que está desatualizada em 38 modelos).
- **Manutenção especial** (Sorento 2.2D e Tasman): depois da 10ª revisão, cartões "MANUTENÇÃO ESPECIAL" por intervalo (a cada 120.000 km ou 3 anos; a cada 180.000 km ou 5 anos), com itens, peças, mão de obra, total e forma de pagamento, e a nota "somar com a revisão regular do mesmo momento". Lidos do quadro da própria aba (valores conferidos com o menu Kia).
- Modelos de abas antigas trazem o selo **"Referência antiga: confirmar valor com a oficina"**.

### 3.4 Revisão indicada (km + tempo)
- Campos opcionais: **km atual** e **data da compra/última revisão**.
- A tela destaca a revisão que **vence primeiro**, por km ou por tempo, conforme a **regra de cada modelo** (arquivo da Kia, pendente).
- O funcionário pode clicar em outra revisão para trocar. A revisão marcada é a que vai para o orçamento.

### 3.5 Orçamento
- **Revisão base + extras marcados − desconto = Total.**
- **Catálogo de extras** (`data/extras.json`), cada item com tipo:
  - Produtos agregados → **peça**
  - Serviços (alinhamento, balanceamento, retífica etc.) → **mão de obra**
- O consultor pode:
  - marcar extras e mudar a **quantidade**;
  - incluir **item avulso** (nome + valor + tipo peça/mão de obra);
  - dar **desconto separado** em mão de obra e em peças (R$ ou %).
- **Limite do desconto:** acima de **5% na mão de obra** ou **10% nas peças**, a tela mostra *"Desconto acima do permitido: precisa de aprovação do gerente"*, mas **não bloqueia**.

### 3.6 Copiar para o cliente
Texto completo, pronto para WhatsApp ou para ler ao telefone:
1. Saudação da Stern Kia
2. Modelo e revisão
3. Itens incluídos na revisão
4. Valor da revisão + extras + desconto (se houver) + **total**
5. **Forma de pagamento** recalculada sobre o total final (Pix ou cartão, até 3x sem juros com parcela mínima de R$ 500)
6. **"Valores válidos até DD/MM/AAAA"** (data da consulta + 7 dias)
7. Assinatura da Stern

### 3.6b Pré-orçamento (aprovado em 09/11/2026)
- Botão **PRÉ-ORÇAMENTO** no cartão aberto, acima de "Montar orçamento": só os itens da revisão, **sem agregados** (uso do agendamento).
- Abre uma janela com o texto pronto e **COPIAR TEXTO** (negrito no padrão do WhatsApp, com `*`).
- Texto: saudação; veículo (título NBS + anos); revisão e km; itens inclusos (nomes para o cliente, sem preço unitário); **valor total (*)**; pagamento; "Valores válidos até DD/MM/AAAA (**)" (envio + 7 dias); serviços inclusos (inspeção dos sistemas…); "Alinhamento/Balanceamento = R$: 300,00 (Opcional)" (preço do catálogo; omitido se a revisão já inclui alinhamento, como no Stinger); notas (*) e (**); assinatura "Stern Kia – Pós-venda" e "Agende sua revisão pelo WhatsApp: (11) 99021-6377 – https://wa.me/5511990216377" (WhatsApp do Agendamento de Serviços; trocou o e-mail em 13/11/2026, porque o texto vai ao cliente pelo WhatsApp). A mesma linha fecha os textos de garantia e de luzes de advertência.

### 3.7 Comparar dois modelos
- O funcionário escolhe dois modelos e vê **lado a lado** o valor de cada revisão (10 mil, 20 mil… km).
- A comparação mostra só os valores base, sem extras nem desconto.

### 3.8 Avisar o agendamento
- Botão **"Enviar para o agendamento"**, para o consultor usar quando o cliente fecha.
- Abre um **e-mail pronto** no programa de e-mail do PC (sem servidor), endereçado ao agendamento, com o orçamento completo. O consultor completa nome, telefone e placa do cliente antes de enviar.
- O agendamento em si continua sendo feito no **NBS**. As usuárias do agendamento não precisam de outro aviso.
- E-mail do agendamento: **agendamento2@sternkia.com.br** (informado em 09/11/2026).

### 3.9 Rodapé
- "Tabela atualizada em DD/MM/AAAA" e "Regras de garantia atualizadas em DD/MM/AAAA".

### 3.10 Abas no topo
- Quatro abas: **Revisões**, **Garantia**, **Luzes de advertência** e **Regras de revisão** (esta em 17/11/2026, seção 3.14; as três primeiras: decisão do Leonardo, 11/11/2026), cada uma com seu campo de busca. Só uma aparece por vez.

### 3.11 Garantia — base de regras (decisão do Leonardo, 06/11/2026: opção A)
- **Fonte oficial:** os **livretos em PDF** (manual do proprietário com a parte de garantia), juntados pela Cleidiane em `fonte/manuais/`. Quando dois livretos divergirem, vale o **mais recente**.
- O **Claude lê os livretos** e monta a base `data/garantia.json`. A página **não tem IA**: ela busca na base pronta.
- **Organização:** regras **por tipo de motorização** (combustão flex/gasolina, diesel, híbrido, elétrico); cada modelo herda as regras do seu tipo e, quando for diferente, ganha uma **exceção do modelo**. O tipo de cada modelo fica em `data/nomes.csv`.
- Cada regra tem: **item** (ex.: bateria, amortecedor, pneu, vidro, motor), **prazo (anos)**, **km**, **condições**, **o que não cobre**, **trecho oficial** e **livreto + página**.
- **Sinônimos** do balcão levam ao item certo ("suspensão" → amortecedor; "para-brisa" → vidro; "motor fundido" → motor).

### 3.12 Garantia — busca e resposta
- Campo com sugestões: **modelo/ano + problema**, sem diferenciar acento e maiúscula.
- Resultado: item, prazo, km, condições, exclusões, trecho oficial e página do livreto.
- **Campos opcionais:** data da venda e km atual → a tela calcula **"Dentro da garantia: vence em DD/MM/AAAA ou N km"** ou **"Fora da garantia"**, sempre com *"Sujeito à análise técnica da Kia"*.
- **Revisões em dia na rede Kia? Sim / Não / Não sei.** Com "Não" ou "Não sei": aviso *"Garantia pode ser negada: verificar histórico de revisões"* + trecho do livreto sobre isso.
- **Copiar para o cliente:** saudação Stern, regra oficial, situação (se calculada), *"conforme o Manual do Proprietário Kia, página X"* e assinatura.
- **Sem regra para o item/modelo:** *"Não encontrado no manual: consultar a garantia (Cleidiane, garantia@sternkia.com.br)"*. Nunca inventar.

### 3.13 Luzes de advertência (aprovado pelo Leonardo em 11/11/2026; categorias em 12/11/2026)
- Aba **Luzes de advertência**: o consultor escolhe o modelo e vê as luzes daquele veículo, em grade de ícones coloridos (vermelho, amarelo, azul ou verde, conforme o manual).
- **Luzes por categoria, não por modelo:** as luzes de advertência são quase padrão. A categoria vem da motorização do modelo (campo `motorizacao` da tabela): **elétrico** (EV5, EV9), **híbrido** (Niro, Carnival HEV, Stonic, Sportage MHEV), **flex/gasolina** e **diesel** (Bongo, Tasman, Sorento 2.2D, Mohave V6 diesel). Acessório que muda alguma luz fica para depois.
- Cada categoria tem o manual de referência com página, e cada luz tem a fonte.
- Busca por nome ou sintoma ("água", "freio", "bateria"). Clique no ícone abre o **significado** e a **orientação** para o cliente, em linguagem simples, com nível: *parar agora*, *procurar a oficina* ou *informativa*.
- Texto para o cliente: só o significado e a orientação (sem passo a passo do manual). Botão "Copiar para o cliente", como na garantia.
- **Fonte:** os manuais do proprietário Kia, com página de origem em cada luz. Texto próprio e curto (não se copia o manual). **Símbolos:** o próprio símbolo do manual, recortado e pintado na cor da luz (decisão do Leonardo, 12/11/2026, depois de conferir que o redesenho não ficava igual ao painel). Luz sem símbolo conferido aparece só com o nome.
- **Começa só com os manuais disponíveis.** Modelos sem manual em texto ficam de fora até o manual chegar. **EV9:** segue o EV5, marcado como "a confirmar com o manual do EV9".
- Luz que o manual não descreve: *"Não encontrado no manual: consultar a oficina"*. Nunca inventar.

### 3.14 Regras de revisão (pedido do Leonardo em 17/11/2026)
- Aba **Regras de revisão**, abaixo de Luzes de advertência: consulta para tirar dúvidas sobre intervalo e tolerância das revisões.
- Sem modelo digitado: mostra os quatro textos. Com o modelo: só o texto que vale para ele, com um resumo (km, meses, tolerância).
- **Textos** (copiados como o Leonardo enviou, em `garantia.json` → `regras_revisao`): elétricos (**só EV5 e EV9**) 20.000 km ou 12 meses, ±1.500 km ou ±30 dias; híbridos e combustão 10.000 km ou 12 meses, ±1.500 km ou ±30 dias; Bongo K2500 até o ano-modelo 2025, 10.000 km ou 12 meses, ±500 km ou ±30 dias; Bongo K2500 a partir do ano-modelo 2026, 15.000 km ou 12 meses, ±500 km ou ±30 dias.
- **Diesel exceto Bongo** (Tasman, Sorento 2.2, Mohave) segue a regra da combustão (decisão do Leonardo, 17/11/2026). **Bongo K2700** não tem texto: "Não encontrado no manual: consultar a garantia (Cleidiane)".
- Livreto e página do texto não foram informados; a tela cita "texto enviado pelo Leonardo em 17/11/2026". EV5 e EV9 passam a usar prazo e tolerância dessa regra na revisão indicada.

### 3.15 Visual v2 (pedido do Leonardo em 24/11/2026)
- Troca só a aparência; nenhuma regra, valor ou texto muda. Substitui o "preto e branco, cantos retos" da v1 (09/11/2026).
- Menu lateral preto noturno com ícone em cada aba (SVG próprio, sem biblioteca) e aba ativa em turquesa; busca grande com anel turquesa ao focar; cartão do modelo com luz vinda de cima e foto sobre fundo branco; cartões de revisão brancos em relevo com leve inclinação (somem com "reduzir movimento" do sistema); cartão da **revisão indicada** em destaque turquesa-escuro com texto branco; botões turquesa; mesmo estilo nas abas Garantia, Luzes e Regras de revisão.
- Azul-petróleo continua só nos dashboards internos da diretoria.

## 4. Atualização da tabela
**Decisão do Leonardo (11/11/2026):** o projeto fica só no PC do Leonardo; não há pasta compartilhada.
1. A Kia manda a tabela nova por e-mail e a equipe avisa a **Cleidiane**.
2. A Cleidiane **manda a planilha (ou o livreto) ao Leonardo**, que coloca no projeto; o **Claude** gera a Tabela Stern (óleo arredondado, mão de obra pelo valor-hora de cada modelo) e lista o que mudou.
3. O Leonardo confere e publica pela conta dele no GitHub. A Cleidiane confere os valores no link publicado.
3a. **Livretos de garantia:** mesmo caminho: Cleidiane → Leonardo → Claude atualiza `data/garantia.json` → Leonardo confere → publica.
4. A Cleidiane **não tem conta no GitHub** nem acesso à pasta do projeto. O catálogo de extras continua com ela (manda a planilha de agregados atualizada).

## 5. Erros e casos especiais
| Situação | Comportamento |
|---|---|
| Modelo não encontrado | Mensagem + sugestões + contato da Cleidiane |
| Campo de busca vazio | Nada acontece. Mostra as últimas buscas |
| Foto ausente ou que não carrega | Ícone genérico + "foto pendente" |
| Aba antiga | Selo "Referência antiga: confirmar valor com a oficina" |
| Regra de tempo do modelo ausente | Destaca a revisão só pelo km e avisa "regra de tempo não cadastrada" |
| Desconto acima do limite | Aviso, sem bloqueio |
| Digitação além do limite do campo | O campo não aceita mais caracteres (decisão do Leonardo, 16/11/2026): **km** só números, até 6; **ano da data** 4 dígitos; **valor do item avulso e desconto** até 9 caracteres; **buscas, filtros e descrição do item avulso** até 60 caracteres. PIN: 4 dígitos. Km e ano ficam em `LIMITES`/`dataValida` no `script.js`; os campos fixos do `index.html` levam o mesmo número no `maxlength` |
| PIN errado | "PIN incorreto", sem limite de tentativas |
| Sem internet depois de carregada | A página continua funcionando com os dados já carregados |
| Garantia: item sem regra | "Não encontrado no manual: consultar a garantia (Cleidiane)" |
| Garantia: modelo sem livreto próprio | Usa as regras do tipo de motorização e avisa "regra geral do tipo; livreto deste modelo ainda não cadastrado" |
| Garantia: data da venda não informada | Mostra a regra sem calcular a vigência |

## 6. Fora do escopo (MVP)
- Tempo estimado de serviço
- Aviso de revisões em promoção
- Histórico de orçamentos salvos e relatórios do que foi orçado (por cliente ou geral)
- Link ou integração com o NBS (o agendamento continua lá)
- Login individual / senha de verdade
- IA respondendo perguntas livres de garantia na página (opção B, recusada: custo, servidor e risco de erro em regra oficial)
- Análise de casos específicos ("cobre se bateu no meio-fio?"): continua com a Cleidiane

## 7. Critérios de aceite
- [ ] 100% dos modelos da planilha encontrados pela busca.
- [ ] Zero divergência entre o valor base calculado e a Tabela Stern (10 valores conferidos pelo Leonardo).
- [ ] Resultado em até 3 segundos após digitar.
- [ ] Orçamento soma corretamente revisão + extras (com quantidade) + avulsos − descontos.
- [ ] Aviso aparece acima de 5% na mão de obra e de 10% nas peças.
- [ ] Texto copiado tem saudação, itens, total, validade de 7 dias e assinatura.
- [ ] Comparação mostra dois modelos lado a lado.
- [ ] "Enviar para o agendamento" abre o e-mail com o orçamento.
- [ ] Garantia: 10 perguntas reais (itens e modelos variados) com resposta igual ao livreto e página correta, conferidas pelo Leonardo.
- [ ] Garantia: cálculo de vigência correto em 5 casos (dentro/fora por data e por km).
- [ ] Funciona no Chrome e no Edge do PC do agendamento.

## 8. Pendências antes de construir
| Item | Quem | Bloqueia |
|---|---|---|
| Regra de km/tempo por modelo (vem nos livretos de garantia) | Cleidiane/Leonardo | Fase 3 (revisão indicada) |
| Como a pasta será compartilhada com a Cleidiane | Leonardo | Fase 4 |
| Livretos de garantia em PDF (o máximo de modelos; pelo menos 1 de cada tipo: combustão, diesel, híbrido, elétrico) | Cleidiane | Fase G1 |

## 9. Riscos
- **PIN não é segurança real:** os preços ficam num repositório público. Foi aceito porque são os mesmos valores passados a qualquer cliente. Se precisar de mais sigilo: Cloudflare Pages + Cloudflare Access.
- **Preço desatualizado:** a data da tabela aparece sempre na tela.
- **Erro de cálculo na planilha:** o valor é sempre calculado pelo detalhe das peças, e o script lista as divergências.
- **Regra de garantia errada ou desatualizada:** cada resposta mostra o trecho oficial e a página do livreto; regras novas só entram depois da conferência do Leonardo; a data das regras aparece na tela.
