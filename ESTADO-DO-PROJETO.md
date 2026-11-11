# Estado do projeto — Tabela de Revisões e Garantia Kia (Stern)
**Atualizado:** 06/11/2026

## Objetivo (resumo)
Um link no **navegador do PC de trabalho** do agendamento e dos consultores (o celular é uso raro). O funcionário digita o modelo e vê o **valor base da revisão (Tabela Stern)**, a foto do modelo e um texto pronto para passar ao cliente. Também pode **marcar agregados e serviços extras**, que vão somando a um orçamento. Publicação: GitHub Pages + PIN da equipe. Plano completo: [plano-inicial.md](plano-inicial.md).

## Onde estamos
| Fase | Status |
|---|---|
| Plano inicial (método do curso: SMART, GOAL, PRD → CLAUDE.md → plan.md) | ✅ aprovado |
| Conferência das planilhas e dos menus Kia | ✅ concluída (detalhes em [analise-dados.md](analise-dados.md)) |
| Fase 0: PRD.md → CLAUDE.md → plan.md | ✅ concluída (3 documentos aprovados, Git iniciado em 06/11; nenhum commit ainda) |
| Fase 1: script Excel → JSON | ✅ concluída em 06/11: 53 modelos + 25 extras; 10 valores conferidos pelo Leonardo; modelos atuais 100% iguais à planilha ([divergencias.md](ferramentas/divergencias.md)) |
| Garantia (novo, 06/11) | ✅ PRD v1.1 aprovado em 09/11 (opção A: base de regras dos livretos; aba Garantia). Fase G1 em andamento (09/11): 4 livretos recebidos em `manual garantia/` (Bongo até 2025, Bongo a partir de 2026, Niro 2024, Sportage/Stonic 2024), transcritos em `ferramentas/garantia-fontes/` (texto literal + página). Livreto 2026 = só Bongo 2026 (Leonardo). 09/11: +16 manuais do proprietário extraídos em `ferramentas/garantia-fontes/manuais-proprietario/` (nenhum traz plano de revisão nem prazos; só regras que anulam garantia e capacidades). Página kia.com.br/garantia resumida em `kia-site-garantia.md`. Pendentes: Sorento (PDF corrompido), EV5 (760 págs. em imagem), proposta da base aguardando aprovação. Tasman tem regra própria (manual a providenciar); Leonardo vai baixar de novo o Sorento e buscar o Carnival HEV |
| **Fase 2: tela com abas + busca de revisões** | ⏳ **09/11: pronta para teste** (`index.html`, `style.css`, `script.js`; dados em `data/revisoes.js` para abrir com dois cliques). Testada por nós: busca com/sem acento, com ano, nome errado com sugestão, EV5 gratuitas, selo de aba antiga, valores conferidos (Carens, Sorento 2.2D, Tasman). Falta o teste do Leonardo no Chrome e no Edge. **09/11:** Leonardo pediu ajustes visuais: usar o sistema "Stern Kia" (artefato de design, Kia Web Style Guide: Preto Noturno/Branco, cantos retos; azul-petróleo só em dashboards), logos Kia Stern + Kia Service (`assets/logos/`), cartões fechados que abrem os itens ao clicar. 3 propostas em `prototipos/layouts.html`; **escolhida a B** (menu lateral), aplicada na página com letra maior e modelo em negrito. Arruela do bujão a R$ 0 em 7 abas: fica como está na planilha (decisão do Leonardo, 09/11). **09/11:** página enviada à Cleidiane em .zip (`envios/Tabela-Revisoes-Kia-Stern-TESTE.zip`) para conferir modelos e valores com o NBS; **Cleidiane conferiu: tudo certo (Leonardo, 09/11)**. **09/11:** incluída a forma de pagamento no cartão aberto (regra: parcela mínima R$ 500, até 3x sem juros; Pix sem desconto). Também o botão **PRÉ-ORÇAMENTO** (texto aprovado) com janela e "Copiar texto". E-mail do agendamento: agendamento2@sternkia.com.br. Correções na cópia: Sorento 3.3 UM 3ª rev. (Limpa TBI → aditivo, R$ 1.361,73) e Sportage 2.0 Flex SL 4ª rev. (aditivo digitado 166 → descarbonizante 185, R$ 2.715,89). Arruela removida do Sorento 2.2D/Tasman. **Manutenção especial** (Sorento 2.2D e Tasman) em cartões após a 10ª revisão. Todas as correções em `ferramentas/correcoes-na-planilha.md`; enviadas à Cleidiane em 09/11 com a planilha corrigida. O zip que a Cleidiane recebeu ainda não tem isso |
| **Garantia G1 + G2** | **10/11: prontas, aguardando conferência do Leonardo.** Cleidiane devolveu a conferência (`manual garantia/Garantia por modelo - conferencia.xlsx`); novos livretos lidos: PTGEN G5 261 (Carnival HEV) e PTGES G5 261 - MQ4 (Sorento 2.2D e Tasman, confirmado pelo Leonardo). Base `data/garantia.json` (+ `.js`): 53 modelos, 15 itens com sinônimos, trecho e página. Modelos sem livreto: garantia geral pelo site Kia (vendas desde 01/2025) ou pela conferência da Cleidiane, com selo "confirmar com a garantia". Aba Garantia: busca "modelo + problema", itens, data da venda + km → dentro/fora, revisões em dia (aviso), copiar para o cliente, "não encontrado no manual". Testada no navegador; falta Chrome/Edge do Leonardo. **10/11 — verificação ampla (Leonardo sem tempo):** trechos conferidos palavra por palavra com as transcrições dos livretos (só os do site Kia são resumo, marcados assim na tela); 53 modelos × todos os itens × 4 cenários de data/km (2.992 combinações) sem erro; 20 buscas de balcão; datas-limite (29/02, fim de mês, venda futura) e km sem data corrigidos |
| Fase 3: interações | **pronta, aguardando conferência do Leonardo** (09/11): montar orçamento (agregados, retífica até 2 pares, item avulso, desconto peças/MO em R$ ou % com aviso 10%/5%), texto para o cliente, e-mail ao agendamento, comparar dois modelos, últimas buscas. 10/11: filtro do A/C em todo orçamento (só peça) e aviso de desconto corrigido no limite exato. **11/11: revisão indicada pronta** (km atual + data da venda; regra km/meses/tolerância do livreto de cada modelo; sem livreto, só pelo km com aviso; indica a próxima a fazer, a de número mais alto entre km e tempo; destaca e abre o cartão). Testada em todos os modelos. **Fase 3 completa, aguardando conferência do Leonardo** |
| Fase 4: PIN + GitHub Pages | pendente |
| Fase 5: testes (Opus) | pendente |
| Fase 6: rotina de atualização | pendente |

## Arquivos que valem
- **Planilha base (desde 06/11 15h40):** `fonte/cleidiane-2026-11-06-1513/Menu revisão atualizado (STERN) 2026-11-06 - com TASMAN.xlsx`. É uma cópia da planilha que a Cleidiane mandou em 06/11 às 15h13, com a aba Tasman copiada da base anterior e as 2 correções do Sorento 2.2D reaplicadas (ela ainda não tinha feito). Montada e recalculada no Excel. O original dela não foi alterado.
  - O que mudou na planilha dela: EV5 (preços do fluido de arrefecimento azul e do fluido de freio), Sorento 2.4 UM (fluido de freio 132,94) e a fórmula do total do Carens, que ainda está errada (`=SUM(D10:D25)` soma também peças, tempo e mão de obra).
  - Correções nossas na cópia (06/11, pedido do Leonardo): **Carens** (peças = soma das linhas 10–21; total = peças + mão de obra) e **Sportage MHEV** 10ª revisão (mão de obra = 1,5 h × 450 = 675, no lugar dos 525 digitados). **Fluido de freio:** 52 células digitadas (R$ 91,57 etc.) em 28 abas passaram a puxar o detalhe, e o total do detalhe do Carnival 3.5 11-15 (M68) também. Mohave V6/V6 Diesel: aditivo fica fora (como na planilha).
  - Também corrigidos: EV5 F16 (arrefecimento azul puxa o detalhe, 1.509,24) e Sportage SL 4x2/4x4 (óleo 4 L no detalhe).
  - **Resultado:** os 47 modelos atuais batem 100% com a planilha. Só 2 abas antigas diferem (New Bongo 2500 e Bongo K2500 05-14, só referência).
- Base anterior (referência): `fonte/kia-email-2026-11-06/Menu revisão atualizado (STERN) SETEMBRO 2026 - com TASMAN.xlsx`.
- **Menus Kia (21/09/2026):** `fonte/kia-email-2026-11-06/` Anexo 1 (11 modelos atuais) e Anexo 2 (34 modelos antigos).
- **Tasman:** valores corrigidos pelo CS 021/26 (Anexo 1 na raiz do projeto).

## Regras de negócio decididas
1. **Existe uma só tabela base: a "Tabela Stern"** (menu de revisão da Stern). Ela tem os mesmos itens do menu Kia, mas com os valores da Stern: óleo arredondado, peças e mão de obra a R$ 450/h. Na planilha, é a linha "VALOR TABELA KIA". **Não há mais alternador Kia/Stern.**
2. **Agregados e serviços extras são opcionais.** Ficam numa tabela separada (catálogo) e o consultor marca o que quiser incluir; o sistema soma ao valor base:
   - **Produtos agregados:** Air Cleaner 360, Higienizador A/C, Kit Revisão, Evaporator Cleaner, Nano Cleaner, Cleaner Brake, Limpa TBI, Descontaminação Interna do Motor etc. **O Leonardo vai mandar uma planilha nova** com a lista completa.
   - **Serviços:** alinhamento, balanceamento, retífica de disco e outros. **O Leonardo vai fornecer os valores.**
   - A tela mostra **Revisão base + extras marcados = Total do orçamento**, pronto para copiar ao cliente.
   - O catálogo cresce aos poucos, conforme a equipe chega ao melhor orçamento.
   - O bloco "AGREGADOS / C/ AGREGADOS" das abas atuais **não é usado** como valor fixo.
3. **Aditivo Fuel Cleaner = Via Tanque** (010164 Flex / 010163 Diesel). É o mesmo item e já está dentro do valor Kia; não somar duas vezes.
4. **Óleo:** arredondar sempre para cima; fração ,1 arredonda para baixo (4,1 → 4). O Bongo K2500 fica fixo em 8 L.
5. **Fluido de freio:** a Stern usa frasco de 500 ml (o dobro da quantidade, metade do preço) e a Kia usa litro. O total é o mesmo.
6. **Cálculo:** sempre a partir do **detalhe das peças**, nunca de valores digitados nas linhas de cima (já houve 2 erros assim no Sorento). Listar as abas em que o detalhe não bate com a linha.
7. **Abas antigas** (Cerato Koup, New Bongo 2500, Sportage 2WD 05-14, Bongo K2500 05-14, Bongo K2700 x2): entram na consulta com o selo "Referência antiga: confirmar valor com a oficina".

## Pendências
- [ ] Contar à Cleidiane as 2 correções do Sorento 2.2D (óleo 6 L e fluido de freio da 4ª/8ª) para ela ajustar a planilha dela.
- [x] Planilha de agregados recebida da Cleidiane (06/11, 24 itens): transcrita em `fonte/agregados-cleidiane-2026-11-06/AGREGADOS-transcrito.csv`.
- [x] Serviços (alinhamento, balanceamento, limpezas) contam como **mão de obra** no limite de desconto; produtos contam como **peça**.
- [x] Retífica de discos: R$ 270 por par (1 eixo); quantidade 1 ou 2 (4 discos = R$ 540).
- [ ] **Fotos dos modelos:** o Claude procura na internet uma foto de cada modelo/geração exatos (de preferência em fontes oficiais, como o site e a imprensa da Kia), e o **Leonardo aprova** uma por uma. Controle em `fotos/controle.csv`.
- [x] Repositório Git iniciado; 1º commit em 09/11/2026 (fases 0–2). `fonte/`, planilhas e `envios/` ficam fora do Git.
- [ ] **Leonardo enviar:** regra de km/tempo por modelo (arquivo da Kia) e e-mail do agendamento. A Cleidiane não terá ramal na tela.
- [ ] Definir como compartilhar a pasta do projeto com a Cleidiane, que não terá GitHub (Fase 4).
