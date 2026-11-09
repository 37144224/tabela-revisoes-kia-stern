# plan.md — Tabela de Revisões e Tira-dúvidas de Garantia Kia (Stern)
**Base:** [PRD.md](PRD.md) v1.1 (v1.0 aprovada em 06/11/2026; garantia incluída na v1.1) · regras em [CLAUDE.md](CLAUDE.md)
**Regra geral:** uma fase por vez. Cada fase só começa depois que o Leonardo confere o "como verificar" da anterior.

## Resumo
| Fase | Entrega | Complexidade | Modelo | Bloqueio |
|---|---|---|---|---|
| 0 | Documentos + Git | Baixa | Opus | — |
| 1 | Dados (revisões + extras em JSON) ✅ | **Alta** | Sonnet | — |
| 2 | Tela com abas + busca de revisões + resultado | Média | Sonnet | Fase 1; nomes.csv aprovado |
| 2b | Fotos dos modelos | Média | Sonnet | aprovação das fotos pelo Leonardo |
| 3 | Orçamento, texto, revisão indicada, comparar, agendamento | **Alta** | Sonnet | regra km/tempo; e-mail do agendamento |
| G1 | Garantia: ler livretos → `garantia.json` | **Alta** | Opus | livretos da Cleidiane |
| G2 | Garantia: aba, busca, vigência, copiar | Média | Sonnet | G1 + Fase 2 |
| 4 | PIN + publicação + acesso da Cleidiane | Média | Sonnet | conta GitHub do Leonardo |
| 5 | Testes | Média | Opus | Fases 1–4 |
| 6 | Rotina de atualização (com a Cleidiane) | Baixa | Sonnet | Fase 4 |

---

## Fase 0 — Fundação
- **Arquivos:** `PRD.md` ✅, `CLAUDE.md` ✅, `plan.md`, `.gitignore` (deixa `fonte/` fora do Git), `git init`.
- **Como verificar:** o Leonardo aprova os 3 documentos; `git status` não mostra nada de `fonte/`.

## Fase 1 — Dados
- **Arquivos:** `ferramentas/excel_para_json.py`, `data/revisoes.json`, `data/extras.json`, `ferramentas/divergencias.md` (relatório gerado).
- **O que faz:**
  - Lê cada aba da planilha Stern (com Tasman) e extrai modelo, ano/geração, motor, revisões (km) e itens (código, descrição, quantidade, valor unitário, tipo peça/óleo/mão de obra).
  - Calcula o valor de cada revisão **pelo detalhe das peças**, aplicando as regras do óleo e do fluido de freio, e a mão de obra pelo valor-hora da aba (R$ 300 a 600, conforme o modelo).
  - Separa o total de cada revisão em **peças** e **mão de obra**, porque o desconto depende disso.
  - Marca as abas antigas com `referencia_antiga: true`.
  - Converte `AGREGADOS-transcrito.csv` em `extras.json` (código, nome, valor, tipo, quantidade máxima, aviso "já incluso" no Via Tanque).
  - Grava a data da tabela no JSON.
  - Gera `divergencias.md`: abas em que o detalhe ≠ linha "VALOR TABELA KIA".
- **Como verificar:** número de modelos no JSON = número de abas; o Leonardo confere 10 valores sorteados com a planilha; a lista de divergências é revisada uma a uma.

## Fase 2 — Busca + resultado
- **Arquivos:** `index.html`, `style.css`, `script.js`.
- **O que faz:**
  - Busca com sugestões, sem diferenciar acento e maiúscula; atalho para focar; Enter seleciona; Esc limpa.
  - "Não encontrado" + sugestões parecidas + contato da Cleidiane.
  - Cartão do modelo (foto ou "foto pendente", selo de referência antiga).
  - Todas as revisões com valor e itens sempre abertos.
  - Rodapé "Tabela atualizada em".
- **Como verificar:** digitar 5 modelos reais (com e sem acento e um nome errado) no Chrome e no Edge; os valores batem com o JSON.

## Fase 2b — Fotos
- **Arquivos:** `fotos/*.webp`, `fotos/controle.csv`, `fotos/generica.svg`.
- **O que faz:** o Claude procura uma foto do modelo e da geração exatos em fonte oficial; o Leonardo aprova cada uma; as aprovadas são convertidas para 800px webp.
- **Como verificar:** cada modelo mostra a foto aprovada ou "foto pendente"; `controle.csv` sem itens esquecidos.

## Fase 3 — Interações e orçamento
- **Arquivos:** `script.js`, `style.css` (e `data/regras-revisao.json` quando a regra km/tempo chegar).
- **O que faz:**
  1. **Revisão indicada:** campos de km atual e data; destaca o que vencer primeiro pela regra do modelo. Sem regra cadastrada → destaca só pelo km e avisa.
  2. **Orçamento:** extras com caixa de marcar e quantidade; item avulso (nome, valor, peça/mão de obra); desconto separado em peças e mão de obra (R$ ou %); aviso acima de 5% (mão de obra) e 10% (peças); total.
  3. **Copiar para o cliente:** saudação, modelo, revisão, itens, valores, desconto, total, validade de 7 dias e assinatura.
  4. **Comparar dois modelos:** valores base lado a lado, por revisão.
  5. **Enviar para o agendamento:** `mailto:` com o orçamento; o consultor completa nome, telefone e placa.
  6. **Últimas buscas** (guardadas só no navegador).
- **Como verificar:** 5 orçamentos montados à mão, conferidos na calculadora (incluindo desconto acima do limite); texto colado no WhatsApp Web; e-mail abre no Outlook do PC.

## Fase G1 — Garantia: base de regras
- **Arquivos:** `fonte/manuais/*.pdf` (originais), `data/garantia.json`, `data/sinonimos-garantia.csv`, coluna `motorizacao` em `data/nomes.csv`, `ferramentas/garantia-fontes.md` (quais livretos foram lidos e o que saiu de cada um).
- **O que faz:**
  - O Claude lê cada livreto (começando pelos 2 da Bongo) e extrai as regras: item, prazo, km, condições, exclusões, trecho oficial e página.
  - Agrupa por motorização (combustão, diesel, híbrido, elétrico) e marca as exceções por modelo.
  - Lista de sinônimos do balcão → item.
  - Lista o que ficou sem livreto (modelos e itens).
- **Como verificar:** o Leonardo confere 10 regras sorteadas contra o PDF (texto e página).

## Fase G2 — Garantia: tela
- **Arquivos:** `index.html`, `style.css`, `script.js`.
- **O que faz:** aba Garantia com busca "modelo + problema"; resposta com trecho e página; data da venda + km → vigência; pergunta das revisões em dia com aviso; "Copiar para o cliente"; mensagem de "não encontrado"; data das regras no rodapé.
- **Como verificar:** 10 perguntas reais conferidas com o livreto; 5 cálculos de vigência (dentro/fora por data e por km).

## Fase 4 — Acesso e publicação
- **Arquivos:** `index.html`/`script.js` (tela de PIN), `noindex`, `PUBLICAR.md`.
- **O que faz:**
  - Tela de PIN (lembrado no navegador).
  - Repositório no GitHub (conta do Leonardo) e GitHub Pages ativo.
  - Pasta compartilhada com a Cleidiane (forma a definir: rede, OneDrive ou Google Drive) e o jeito de publicar sem ela ter GitHub.
- **Como verificar:** abrir o link no PC de um funcionário, digitar o PIN, salvar como favorito; a página não aparece numa busca pelo nome no Google.

## Fase 5 — Testes
- **Arquivos:** `cenarios-de-teste.md` + correções.
- **Cenários:** caminho feliz, modelo inexistente, campo vazio, aba antiga, sem foto, sem regra de tempo, desconto acima do limite, item avulso, sem internet depois de carregar, PIN errado, Chrome e Edge.
- **Como verificar:** todos os cenários passam no navegador.

## Fase 6 — Rotina de atualização
- **Arquivos:** `ATUALIZAR.md` (passo a passo para a Cleidiane, em linguagem simples).
- **O que faz:** planilha nova → `fonte/` → script → conferência → publicação; como incluir ou alterar um extra.
- **Como verificar:** a Cleidiane simula uma troca de preço sozinha (com o Claude) e o valor novo aparece no link.

---

## Pendências que bloqueiam fases
| Item | Quem | Bloqueia |
|---|---|---|
| Regra de km/tempo por modelo (arquivo da Kia) | Leonardo | Fase 3, item 1 |
| E-mail do agendamento | Leonardo | Fase 3, item 5 |
| Forma de compartilhar a pasta com a Cleidiane | Leonardo | Fase 4 |
| PIN da equipe | Leonardo | Fase 4 |
| Livretos de garantia em PDF (pelo menos 1 por motorização) | Cleidiane | Fase G1 |
| Aprovar `data/nomes.csv` | Leonardo | Fase 2 |
| Contar à Cleidiane as 2 correções do Sorento 2.2D | Leonardo | — |

**Depois do MVP (ideias):** nenhuma pendente. As ideias recusadas estão no PRD, seção 6.
