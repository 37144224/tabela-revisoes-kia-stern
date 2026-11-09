# Análise das fontes de dados — 05/11/2026

## Arquivos
| Arquivo | O que é | Cobertura |
|---|---|---|
| `CS 02126 - Anexo 1 - Original Menu KIA Tabela 1 - Brasil - 20260921.pdf` | Menu oficial Kia, validade a partir de 21/09/2026 | 11 modelos atuais (Bongo x3, Carnival x2, EV5, EV9, Niro, Sorento 2.2D, Sportage x2, Stonic, Tasman) |
| `CS 02126 - TABELA DE PREÇOS ... CORREÇÃO ...pdf` | Comunicado 021/26 (22/09/2026): corrige a revisão "C" da Tasman (2 correias) | Só Tasman |
| `Menu revisão atualizado (STERN) JUNHO 2026.xlsx` | Tabela Stern: 46 abas de modelos + aba TABELA AGREGADOS | Atuais e antigos (Cerato, Soul, Picanto, Optima, Mohave, Quoris, Cadenza etc.) |

## Estrutura de cada aba Stern
- Linhas de itens (filtro, óleo, etc.) × colunas 1ª a 10ª revisão (10.000 a 100.000 km)
- `PEÇAS`, `TEMPO`, `MÃO OBRA` (R$ 450/h), **`VALOR TABELA KIA`** (com óleo arredondado)
- Bloco `AGREGADOS` (9 itens, total R$ 1.274) e **`VALOR TABELA KIA C/ AGREGADOS`** = Tabela Stern
- Detalhe por peça: part number, preço unitário, unidade, quantidade

## Regra do óleo (confirmada nos números)
A Kia usa litros fracionados; a Stern arredonda para o litro **mais próximo**, com o óleo a R$ 98,70/L:
| Modelo | Kia (L) | Stern (L) | Diferença por revisão |
|---|---|---|---|
| Sportage MHEV | 4,8 | 5 | +19,74 ✅ |
| Carnival HEV | 4,8 | 5 | +19,74 ✅ |
| Stonic | 3,6 | 4 | +39,48 ✅ |
| Niro | 3,8 | 4 | +19,74 ✅ |
| Sportage Flex QL | 4,1 | 4 | −9,87 ✅ |
| Carnival 3.5 | 6,1 | 6 | −9,87 ✅ |

## Divergências encontradas (para validar)
1. **Bongo K2500**: Kia usa 7,4 L a R$ 87,78 (óleo PU); a Stern usa 8 L a R$ 98,70 → +R$ 140,03 por revisão. Pelo "mais próximo" seriam 7 L.
2. **Sorento 2.2 D MQ4**: Stern fica R$ 137,98 **abaixo** da Kia. Não é só o óleo; provavelmente o preço na planilha é anterior a set/2026.
3. **Niro, 2ª revisão**: diferença de 19,44 (e não 19,74), ou seja, R$ 0,30 a mais em algum item.
4. **Erro de soma na Tabela Stern**:
   - Sportage MHEV, 2ª revisão: mostra 2.537,64; o correto seria 1.683,01 + 1.274 = 2.957,01.
   - New Bongo Ineo: "c/ agregados" = 749 em várias revisões (fórmula quebrada).
5. **Sportage SL (3 abas)**: ainda usam 4,1 L fracionado.
6. **Tasman e EV5/EV9 (gratuitas 1ª–3ª)**: conferir se a aba Stern já tem a correção do comunicado 021/26.
7. A planilha Stern é de **junho/2026**, e o menu Kia é de **21/09/2026**: os preços da Kia podem ter mudado depois.
8. Abas antigas sem o bloco Kia/agregados: CERATO_KOUP, NEW_BONGO_2500, _SPORTAGE_2_0_2WD_05_14, BONGOK2700 (x2), BONGOK2500_05_14.

## Resposta da Cleidiane — 06/11/2026 11:10 (e-mail "RES: Conferência de divergências")
| # | Ponto | Resposta | Impacto no projeto |
|---|---|---|---|
| 1 | Bongo K2500 | 8 L a R$ 98,70 | Exceção: manter 8 L (não segue o "mais próximo") |
| 2 | Sorento 2.2D | Atualizou correias e polias | Usar a planilha nova anexada |
| 3 | Niro 2ª rev. | Corrigir arruela na revisão de 20 mil | Usar a planilha nova |
| 4 | Somas Sportage MHEV / New Bongo Ineo | Fórmulas corrigidas | Mesmo assim, recalcular a partir dos itens |
| 5 | Sportage SL 4,1 L | Arredondar para 4 L | Confirma o "litro mais próximo" |
| 6 | Regra oficial do óleo | **Sem resposta** | Adotar "mais próximo" + exceção Bongo, até confirmação |
| 7 | Tasman | Pode incluir | Usar o menu Kia set/2026 + CS 021/26 |
| 8 | Preços de set/2026 | **Sem resposta** | Conferir: planilha nova x PDF Kia |
| 9 | Abas antigas | Não respondeu diretamente | Pendente |

**Mudança importante — agregados:** segundo ela, só deve ficar como obrigatório o que consta na tabela Kia: **Aditivo Via Tanque**, código **010164 (Flex)** ou **010163 (Diesel)**. Os outros agregados saem da tabela, porque preço e produto mudam o tempo todo; o consultor oferece à parte no orçamento.
⚠️ **Atenção:** o código 010164 já aparece **dentro** do "Valor Tabela Kia", como "ADITIVO FUEL CLEANER" (R$ 185, linha 22 da aba Sportage MHEV). O menu Kia também já inclui o "ADITIVO KIA FUEL CLEANER". Se o Via Tanque for o mesmo produto, a Tabela Stern fica **igual** à Tabela Kia (só com o óleo arredondado), e somar o Via Tanque de novo cobraria duas vezes. Confirmar com a Cleidiane.

**Anexos recebidos (ainda não baixados):**
- CS 02026 - TABELA DE PREÇOS DE REVISÃO - MENU DE SERVIÇOS - FILTRO DE ÓL....pdf (~197 KB) — novo: correção de filtro de óleo
- CS 02026 - Anexo 1 - Original Menu KIA Tabela 1 - Brasil - 20260921.pdf (~732 KB)
- CS 02026 - Anexo 2 - Original Menu KIA Tabela 2 - Brasil - 20260921.pdf (~1,4 MB) — novo: Tabela 2
- Menu revisão atualizado (STERN) JUNHO 2026.xlsx (~1,5 MB) — versão corrigida

## Decisões do Leonardo — 06/11/2026
- **Planilha oficial:** `fonte/kia-email-2026-11-06/Menu revisão atualizado (STERN) SETEMBRO 2026 - recebido 2026-11-06.xlsx`. O arquivo diz "JUNHO", mas os preços são de **setembro/2026**, sem alteração depois disso.
- **Menus Kia de referência:** Anexo 1 (Tabela 1, 11 modelos atuais) e Anexo 2 (Tabela 2, 34 modelos antigos), ambos CS 020/26, de 21/09/2026.
- **Tasman:** valem os valores **corrigidos do CS 021/26** (Anexo 1 na raiz do projeto: 6ª revisão = R$ 4.543,70, com 2 correias). O Anexo 1 do CS 020/26 traz R$ 4.038,72, que está errado.
- **Aditivo:** "Fuel Cleaner" e "Via Tanque" são o **mesmo produto** (010164 Flex / 010163 Diesel), que já está dentro do Valor Tabela Kia.
- **Regra do óleo:** arredondar **sempre para cima**, **exceto quando a fração for ,1**, que arredonda para baixo (4,1 → 4; 6,1 → 6). Exceção fixa: Bongo K2500 = 8 L.
  Exemplos: 3,6 → 4 · 3,8 → 4 · 4,8 → 5 · 5,6 → 6 · 7,4 → 8.

## Aba Tasman criada — 06/11/2026
Arquivo novo: `fonte/kia-email-2026-11-06/Menu revisão atualizado (STERN) SETEMBRO 2026 - com TASMAN.xlsx` (o original não foi alterado).
Aba `TASMAN 2.2 D TK`, copiada do layout do Sorento 2.2 D MQ4, com peças, tempos e manutenção especial do Menu Kia + CS 021/26 e óleo de 6 L.
Conferência do Valor Tabela Kia (Stern) = Kia PDF + R$ 39,48 (0,4 L de óleo): 2.223,16 · 3.213,22 · 2.223,16 · 3.929,10 · 2.223,16 · 4.583,18 · 2.223,16 · 5.292,75 · 2.223,16 · 3.213,22 ✅

## Novo problema encontrado — Sorento 2.2 D MQ4 (planilha de setembro)
A linha 12 (ÓLEO) está com o valor **fixo de R$ 407,88**, mas o detalhe usa 6 L × 98,70 = **R$ 592,20**. Por isso a aba fica R$ 144,84 abaixo da Kia.
Com o óleo correto, a 1ª revisão daria R$ 2.017,15 (= Kia 1.977,67 + 39,48), que fecha certinho. Avisar a Cleidiane.

## Correções e decisões — 06/11/2026 (2ª rodada)
**Sorento 2.2 D MQ4 corrigido** no arquivo "com TASMAN":
- Óleo: a linha 12 agora usa o detalhe (6 L × 98,70 = 592,20), e não mais o fixo de 407,88.
- Fluido de freio: na 4ª e na 8ª revisão, agora 265,88 (4 × 500 ml), e não mais 91,57.
- Resultado: as 10 revisões = Kia + R$ 39,48 ✅ (2.017,15 · 2.896,37 · 2.017,15 · 3.477,25 · 2.017,15 · 4.163,21 · 2.017,15 · 4.565,44 · 2.017,15 · 2.896,37)

**Abas antigas: entram na consulta** (decisão do Leonardo), como base de referência dos produtos usados.
| Aba | Formato | Observação |
|---|---|---|
| CERATO_KOUP_10_15_ | 10 revisões (10–100 mil km), linha TOTAL | sem bloco Kia/agregados |
| NEW_BONGO_2500 | 10 revisões, linha TOTAL | idem |
| _SPORTAGE_2_0_2WD_05_14 | 10 revisões, linha TOTAL | idem |
| BONGOK2500_05_14 | **a cada 5 mil km** (1.000 a 100.000), linha TOTAL | preços muito antigos (óleo R$ 18/L, MO R$ 230/h) |
| BONGOK2700 / BONGOK2700_4x4 | a cada 5 mil km, linha TOTAL | idem |
→ Na tela, esses modelos aparecem com o selo **"Referência antiga: confirmar valor com a oficina"**, mostrando as peças/itens e o total da planilha. Não entram no alternador Kia/Stern.
