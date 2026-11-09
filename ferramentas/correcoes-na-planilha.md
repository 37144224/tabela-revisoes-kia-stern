# Correções e decisões sobre a planilha de revisões
**Para que serve:** registro de tudo o que foi corrigido na nossa cópia da planilha e das regras decididas pelo Leonardo.
- Quando chegar uma **planilha nova da Cleidiane**, o Claude confere **estes pontos** (e roda o script) em vez de reler a conversa.
- É a base do e-mail de correções para a Cleidiane.

**Planilha base:** cópia da planilha da Cleidiane de 06/11/2026 15h13
(`fonte/cleidiane-2026-11-06-1513/Menu revisão atualizado (STERN) 2026-11-06 - com TASMAN.xlsx`). O arquivo original dela nunca é alterado.

## A. Correções feitas na nossa cópia (a Cleidiane precisa fazer na dela)
**09/11/2026:** itens A1–A13 enviados à Cleidiane por e-mail, com a planilha corrigida em anexo (`envios/Menu revisao STERN - CORRIGIDO 09-11-2026.xlsx`).

| # | Aba | O que estava | Como ficou | Decidido em |
|---|---|---|---|---|
| A1 | TASMAN 2.2 D TK | não existia | aba criada no layout do Sorento 2.2D, com o menu Kia de set/2026 + correção do CS 021/26 (6ª revisão R$ 4.583,18) | 06/11 |
| A2 | SORENTO 2.2 D MQ4 | óleo (linha 12) digitado R$ 407,88 | puxa o detalhe: 6 L × R$ 98,70 = R$ 592,20 | 06/11 |
| A3 | SORENTO 2.2 D MQ4 | fluido de freio 4ª/8ª digitado R$ 91,57 | puxa o detalhe: 4 × 500 ml = R$ 265,88 | 06/11 |
| A4 | 29 abas (lista abaixo) | fluido de freio digitado R$ 91,57 (EV: R$ 183,14; Bongo MY26: R$ 91,75) | puxa o detalhe da própria aba (ex.: 2 × 500 ml × R$ 66,47 = R$ 132,94) → +R$ 41,37 na 4ª e 8ª revisão | 09/11 |
| A5 | CARNIVAL 3.5 G 11-15 | total do fluido de freio no detalhe (M68) digitado R$ 91,57 | fórmula `=J68*L68` (R$ 132,94) | 09/11 |
| A6 | CARENS | PEÇAS somava só as linhas 10–12; o total `=SUM(D10:D25)` somava também horas e mão de obra | PEÇAS `=SUM(D10:D21)`; total = peças + mão de obra (1ª rev. R$ 1.149,02) | 09/11 |
| A7 | SPORTAGE MHEV NQ5e | 10ª revisão: mão de obra digitada R$ 525 | 1,5 h × R$ 450 = R$ 675 (total R$ 2.880,17) | 09/11 |
| A8 | EV5 | 4ª revisão: arrefecimento azul digitado R$ 1.024,02 (preço antigo) | puxa o detalhe atualizado: 6 L × R$ 251,54 = R$ 1.509,24 (total R$ 4.062,82) | 09/11 |
| A9 | Sportage 2.0 FLEX SL e 2.0 G 4X4 SL | óleo 4,1 L | 4 L (regra do arredondamento) | 09/11 |
| A10 | SORENTO 3.3 G UM | 3ª revisão apontava para o **Limpa TBI** (agregado, R$ 98) | aponta para o Aditivo Via Tanque como as outras (total R$ 1.361,73) | 09/11 |
| A11 | Sportage_2_0_FLEX_SL_ | 4ª revisão: aditivo digitado R$ 166 | puxa o detalhe (Descarbonizante Flex R$ 185; total R$ 2.715,89) | 09/11 |
| A12 | SORENTO 2.2 D MQ4 e TASMAN 2.2 D TK | linha "ANEL BUJÃO" (R$ 0) em todas as revisões | linha removida: no motor 2.2 diesel a arruela vem acoplada ao filtro | 09/11 |
| A13 | SORENTO 2.2 D MQ4 (quadro "Manutenção Especial", colunas N–P) | 2º intervalo "a cada 150.000 km"; totais digitados: 120 mil = R$ 1.057,00, peças 180 mil = R$ 6.002,64, total = R$ 10.682,64 | igual ao menu Kia de 21/09/2026: **180.000 km ou 5 anos**; somas por fórmula: 120 mil km/3 anos = **R$ 1.351,57**; 180 mil km/5 anos = **R$ 9.062,47** | 09/11 |

**Abas do A4:** EV9, EV5, NEW_SPORTAGE_FLEX_4X2_QL, Sportage_2_0_FLEX_SL_, Sportage 2.0 g 4x2 SL 2011-2012, Sportage_2_0_G 4X4 SL, CARNIVAL_3_8_06_11, _Cerato_YD_1_6_flex_, CERATO_1_6_GAS, SORENTO_2_4_UM_, _SORENTO_3_5G_UM, SORENTO 3.3 G UM 2015-2018, NEW_SORENTO_3_5 2013-2015, SORENTO_3_5_XM_, _SORENTO_2_4G, RIO 1.6 FLEX SC, STINGER_GT_3_3_G, BONGO K2500 4X4 C_AC PU (2), SOUL 1.6 FLEX PS 2015-2019, Soul_1_6_FLEX_AM, NEW_PICANTO_GT_FLEX_, PICANTO 1.0 FLEX TA1, CADENZA_3_5_G_VG, CARENS, OPTIMA_2_0_TF, Optima_2_4_, MOHAVE_V8_G, MOHAVE_V6_, MOHAVE_V6_DIESEL.

## B. Pontos que ficam como estão (decisão do Leonardo)
- **Mohave V6 e V6 Diesel:** o Aditivo Via Tanque fica **fora** da revisão (a planilha já não somava).
- **Arruela do bujão a R$ 0** em Sportage MHEV, Sorento FL 3.5 UM, Sorento 3.3 UM, Stinger, Quoris e Cadenza: fica como está na planilha.
- **Descarbonizante Flex** (Sportage 2.0 Flex SL, R$ 185) = mesmo produto do Aditivo Via Tanque.
- **Stinger:** alinhamento/balanceamento (R$ 300) é obrigatório e faz parte da revisão.
- **Bongo K2500:** óleo fixo em 8 L.
- **Óleo Sportage SL 4,1 L** e afins: arredonda para baixo só quando a fração é ,1.

## C. Regras que o site aplica por conta própria (a planilha pode ficar diferente)
- **Parcelamento:** calculado pela regra (parcela mínima R$ 500, até 3x sem juros; Pix sem desconto). A linha PARCELAMENTO da planilha está desatualizada em 38 modelos (lista em `divergencias.md`). Sugestão à Cleidiane: atualizar a linha ou deixar de usá-la.
- **Valores:** sempre recalculados pelo detalhe das peças (nunca por totais digitados).

## D. Pendências da planilha
- Anos de início/fim das abas antigas New Bongo 2500, Bongo K2700 4x2 e 4x4 (não constam na aba).

## Como conferir uma planilha nova
1. Salvar em `fonte/<origem>-<AAAA-MM-DD>/` (sem alterar).
2. Verificar se cada item da seção A já foi corrigido por ela; o que não foi, reaplicar na cópia nova.
3. Rodar `python ferramentas/excel_para_json.py` e ler `divergencias.md` (deve dar zero diferença nos modelos atuais).
4. Atualizar este arquivo com o que mudou.
