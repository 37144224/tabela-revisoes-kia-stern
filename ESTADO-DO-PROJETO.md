# Estado do projeto — Revisões, Garantia e Luzes de Advertência Kia (Stern)
**Atualizado:** 13/11/2026 · **Situação:** publicado e em uso pela equipe (lançado em 13/11/2026).

> Para uma conversa nova: leia este arquivo primeiro, depois o [CLAUDE.md](CLAUDE.md) (regras) e, se precisar do porquê de alguma decisão, o [PRD.md](PRD.md).

## 1. O que é
Página web de consulta para o agendamento e os consultores da Stern Kia, com três abas:
- **Revisões:** valor de cada revisão (Tabela Stern), itens, forma de pagamento, revisão indicada (km + data), comparar modelos, pré-orçamento e "Montar orçamento" (agregados, filtro do A/C, item avulso, desconto, texto ao cliente e e-mail ao agendamento).
- **Garantia:** regras dos livretos Kia por modelo e item, vigência pela data da venda e km, aviso das revisões em dia, texto ao cliente e o aviso em destaque do boletim CS 020/25 (peças de reposição).
- **Luzes de advertência:** 64 luzes por categoria de motorização (elétrico, híbrido, flex/gasolina, diesel), cada uma com o símbolo do próprio manual, significado, orientação e texto ao cliente.

**Link:** https://37144224.github.io/tabela-revisoes-kia-stern/ · **PIN:** 4 dígitos, fica com o Leonardo (no código só existe o hash; não escrever o número em arquivo do repositório, que é público).
**Repositório:** `37144224/tabela-revisoes-kia-stern` (público, branch `main`, GitHub Pages). Publicar = commit + `git push` (o Claude faz quando o Leonardo pede); o site atualiza em 1–2 min; nos PCs, Ctrl+F5.

## 2. Onde estamos
| Fase | Situação |
|---|---|
| 0 — PRD, CLAUDE.md, plan.md | ✅ |
| 1 — Planilha → JSON (53 modelos, 27 agregados) | ✅ |
| 2 — Tela, busca, cartões, pré-orçamento | ✅ (conferida pela Cleidiane) |
| 2b — Fotos dos modelos | ⏳ **pendente** (tratada em outra conversa; hoje aparece "Foto pendente") |
| 3 — Orçamento, revisão indicada, comparar, agendamento | ✅ |
| G1/G2 — Garantia (base + tela) | ✅ (conferida pela Cleidiane) |
| Luzes de advertência (PRD 3.13) | ✅ publicada em 13/11 |
| 4 — PIN + GitHub Pages | ✅ |
| 5 — Testes formais | parcial: testes automáticos no navegador a cada mudança; falta o roteiro do plan.md (Chrome e Edge em outro PC) |
| 6 — Rotina de atualização | ✅ ver seção 4 |

## 3. Pendências (nenhuma bloqueia o uso)
- [ ] **Fotos dos modelos** (Fase 2b): o Claude procura a foto de cada modelo/geração em fonte oficial e o Leonardo aprova uma a uma; arquivos em `fotos/` + `fotos/controle.csv`.
- [ ] **Luzes:** conferir as luzes comuns do elétrico com a seção geral do EV5; conferir o híbrido com os manuais do Sportage MHEV e do Stonic; EV9 usa o EV5 (a confirmar); Picanto sem manual (usa o grupo flex/gasolina); luzes de equipamento do Stinger (prevenção de colisão, iluminação dinâmica, LED) ainda não incluídas; cores sem indicação no manual seguem a convenção do painel.
- [ ] **Garantia:** modelos antigos sem livreto usam a conferência da Cleidiane (selo "confirmar com a garantia").
- [ ] **Bongo K2700 e New Bongo 2500:** anos de início/fim não constam na planilha.

## 4. Como atualizar (rotina)
| Chegou… | O que fazer |
|---|---|
| **Planilha nova de revisões** (Kia/Cleidiane) | Salvar em `fonte/<origem>-<AAAA-MM-DD>/` sem alterar; conferir [correcoes-na-planilha.md](ferramentas/correcoes-na-planilha.md) (reaplicar o que faltar numa cópia); apontar o caminho em `ferramentas/excel_para_json.py` (ou passar como argumento) e rodar `python ferramentas/excel_para_json.py`; ler `ferramentas/divergencias.md`; conferir alguns valores; atualizar a data da tabela; publicar. |
| **Planilha nova de agregados** | Salvar em `fonte/agregados-<origem>-<data>/`; transcrever para `AGREGADOS-transcrito.csv` (código; descrição; valor; peca ou mao_de_obra; observação), mantendo a retífica (RETDISCO, informada pelo Leonardo); apontar `CSV_PADRAO` no script; rodar o script; publicar. |
| **Livreto de garantia ou boletim Kia** | Salvar em `fonte/` (boletins em `fonte/kia-boletins/`); transcrever em `ferramentas/garantia-fontes/`; atualizar `data/garantia.json` (trecho fiel + livreto/página) e refazer `data/garantia.js` (o script de planilha refaz); Leonardo confere; publicar. Avisos em destaque ficam em `garantia.json` → `avisos`. |
| **Manual do proprietário / luz nova** | `python ferramentas/simbolos_luzes.py` (recortar → folha de conferência ao Leonardo → pintar); editar `data/luzes.json` (texto próprio, página, categoria) e `python ferramentas/simbolos_luzes.py js`; publicar. |

## 5. Onde fica cada coisa
- **Página:** `index.html`, `style.css`, `script.js`; logos em `assets/logos/`; símbolos das luzes em `assets/luzes/`.
- **Dados (no Git):** `data/revisoes.json/.js` (gerado), `data/extras.json/.js` (gerado), `data/garantia.json/.js` (fonte = JSON, montado pelo Claude), `data/luzes.json/.js` (fonte = JSON), `data/nomes.csv`.
- **Ferramentas (no Git):** `ferramentas/excel_para_json.py`, `ferramentas/simbolos_luzes.py`, `ferramentas/correcoes-na-planilha.md`, `ferramentas/divergencias.md` (gerado).
- **Fora do Git (só no PC):** `fonte/` (originais: planilhas, menus Kia, boletins; `fonte/antigos-raiz/` = arquivos que estavam soltos na raiz), `manual garantia/` (livretos e manuais em PDF, pasta do Leonardo), `ferramentas/garantia-fontes/` (transcrições), `ferramentas/simbolos-recortes/`, `envios/` (planilhas e e-mails enviados, folha de conferência das luzes).
- **Planilha base atual:** `fonte/cleidiane-2026-11-06-1513/Menu revisão atualizado (STERN) 2026-11-06 - com TASMAN.xlsx` (cópia corrigida; original dela intacto). Agregados: `fonte/agregados-leonardo-2026-11-12/`.
- **Histórico de planejamento:** `docs/historico/plano-inicial.md` e `docs/historico/analise-dados.md`.

## 6. Contatos usados na página
- Garantia: Cleidiane, garantia@sternkia.com.br (aparece no rodapé e nos avisos "consultar a garantia").
- Texto ao cliente: WhatsApp do Agendamento de Serviços, (11) 99021-6377, link wa.me (site sternkia.com.br, 13/11/2026).
- Botão interno "Enviar para o agendamento": agendamento2@sternkia.com.br.

## 7. Histórico resumido
- **05–06/11:** plano inicial, conferência das planilhas e dos menus Kia, PRD/CLAUDE.md/plan.md; script Excel → JSON (53 modelos); correções na cópia da planilha (registradas em `correcoes-na-planilha.md`, enviadas à Cleidiane em 09/11).
- **09/11:** tela com layout B (sistema visual "Stern Kia"), pré-orçamento, forma de pagamento, manutenção especial; Cleidiane conferiu modelos e valores; 1º commit.
- **10/11:** garantia (livretos transcritos, conferência da Cleidiane, base de 53 modelos, verificação ampla de 2.992 combinações); filtro do A/C no orçamento.
- **11/11:** revisão indicada; PIN; publicação no GitHub Pages; PRD 1.2 (sem pasta compartilhada: a Cleidiane manda as planilhas ao Leonardo).
- **12/11:** aba Luzes de advertência por categoria (PRD 1.3/1.4); símbolos do manual (opção B aprovada); EV5 lido página a página; luz MIL = "luz da injeção eletrônica".
- **13/11:** agregados de polimento (KIT, KIT02); boletim CS 020/25 como aviso na Garantia; contato por WhatsApp nos textos ao cliente; e-mail de apresentação enviado à equipe (gerenteposvenda@, assistencia4@, assistencia1@, garantia@, marketing@, agendamento2@, agendamento1@, acessorios@); organização final do projeto.
