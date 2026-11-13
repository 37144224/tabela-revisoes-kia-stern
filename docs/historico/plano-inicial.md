# Plano de início — Tabela de Preços Kia (Revisões)

## Contexto
Na concessionária Kia, o agendamento e os consultores atendem clientes por telefone e precisam informar o valor das **revisões programadas**. Hoje consultam um Excel no computador ou listas em papel. Isso é lento e sujeito a erro.
**Objetivo:** um **link no navegador do computador de trabalho** (sem instalar nada e sem conta Claude; o celular funciona, mas é uso raro) em que o funcionário digita o modelo e vê na hora os valores das revisões. A ideia é evoluir aos poucos a qualidade da informação passada ao cliente.

Respostas já definidas:
- Conteúdo: revisões programadas (por modelo/ano/km)
- Fonte: planilha Excel que já existe (caminho a informar)
- Acesso: GitHub Pages + PIN da equipe
- Pasta: `C:\Users\DELL\Claude Code\Tabela_Precos_Kia`
- **Dois tipos de valor** para cada revisão:
  > **Atualizado em 06/11/2026:** existe uma só tabela base, a **Tabela Stern** (menu de revisão Stern, com os mesmos itens do menu Kia). Os **agregados e serviços extras** (produtos, alinhamento, balanceamento, retífica etc.) ficam num catálogo separado. O consultor marca os extras que quiser e o sistema soma: **revisão base + extras = total do orçamento**. Não há mais alternador Kia/Stern.
- **Foto do modelo** no resultado, para confirmar com o cliente que é o carro certo (geração/ano).

## Fotos dos modelos: de onde tirar
Ordem recomendada:
**Decisão (06/11/2026):** o Claude procura na internet uma foto do modelo e da geração exatos de cada aba, de preferência em fontes oficiais (site e imprensa da Kia), e o Leonardo aprova uma por uma. O status de cada foto fica em `fotos/controle.csv`. Como alternativa, fotos próprias tiradas no pátio.

Padrão técnico: `fotos/<modelo>-<anoinicial>-<anofinal>.webp`, largura de 800px e até cerca de 100 KB cada (para carregar rápido). Se faltar a foto, aparece um ícone genérico com o texto "foto pendente". Uma planilha de controle (`fotos/controle.csv`) mostra quais modelos ainda não têm foto.

## O que aproveitar do curso (pasta `Desktop\Curso Claude`)
| Material | Uso no projeto |
|---|---|
| Fluxo ClimaView: `prompt-prd.txt` → `prompt-claude.md` → `prompt-plan.md` | Mesma sequência: **PRD.md → CLAUDE.md → plan.md**, cada um aprovado antes do código |
| `PRD.md` / `plan.md` do ClimaView | Modelo de estrutura (visão, funcionalidades, erros, fora do escopo, critérios de aceite; fases com arquivo, complexidade e modelo) |
| `CLAUDE.md` do ClimaView | 5 regras: propor antes de executar, sem libs sem aprovação, comentários em PT, justificar arquivo novo, avisar conflito com o PRD |
| Framework SMART | Metas do projeto (abaixo) |
| Prompt GOAL | Prompt-mestre da interface (abaixo) |
| Prompt de Alta Precisão (Persona + Few-shot + CoT + Controle) | Formato do texto "Copiar para o cliente" |
| `prompts-aula-11-opus.md` | Fase de testes com Opus gerando `cenarios-de-teste.md` |
| Apresentação de Versionamento | Git + GitHub, base para publicar no GitHub Pages |
| Boas práticas (PDF) | Uma fase por vez, dizer como verificar, revisar sempre |

## Metas SMART
- **S:** página web de consulta de revisões Kia por modelo, com busca por digitação.
- **M:** resultado em até 3 segundos após digitar; 100% dos modelos da planilha encontrados; zero divergência de valor entre a planilha e a página.
- **A:** HTML/CSS/JS puro + arquivo de dados; sem servidor nem banco.
- **R:** reduz tempo de ligação e erro de preço passado ao cliente.
- **T:** MVP publicado em 2 semanas; tabela atualizada sempre que a Kia mudar os preços.

## Prompt GOAL da interface
- **G:** consulta rápida de preços de revisão Kia por modelo.
- **O:** `index.html`, `style.css`, `script.js` + `data/revisoes.json`; **desktop primeiro** (tela de trabalho, 1280px+), usável no celular em caso raro. Tela que fica aberta o dia todo numa aba: atalho de teclado para focar a busca, Enter seleciona e Esc limpa.
- **A:** agendamento e consultores, durante a ligação com o cliente, com pouco tempo e pouca familiaridade técnica.
- **L:** tela de PIN → campo de busca grande com sugestões → cartão do modelo (ano/motor) → tabela de revisões (km/meses, valor, itens) → botão "Copiar para o cliente" → rodapé com "Tabela atualizada em DD/MM/AAAA".

## Estrutura da pasta
```
Tabela_Precos_Kia/
├── CLAUDE.md            ← regras do projeto (até 80 linhas)
├── PRD.md               ← requisitos aprovados
├── plan.md              ← fases
├── cenarios-de-teste.md ← gerado na fase de testes
├── index.html / style.css / script.js
├── data/revisoes.json   ← gerado a partir do Excel
├── fonte/               ← cópia da planilha original (nunca editada; fica fora do Git)
└── ferramentas/excel_para_json.py ← converte a planilha em JSON
```

## Fases
| Fase | Entrega | Como verificar | Modelo |
|---|---|---|---|
| 0. Fundação | Pasta, `git init`, PRD.md (entrevista uma pergunta por vez, igual ao `prompt-prd.txt`), CLAUDE.md, plan.md | Você aprova os 3 documentos | Opus |
| 1. Dados | Ler o Excel, mapear modelo, ano, motor, km, itens e **valor base Stern** (calculado a partir do detalhe das peças) + **catálogo de agregados/serviços** (`data/extras.json`); script `excel_para_json.py` | Contagem de modelos igual à planilha; 10 valores base conferidos por você; lista das abas em que o detalhe não bate com a linha | Sonnet |
| 2. Busca + resultado | Campo com sugestões tolerantes a acento/maiúscula ("sportage", "Sportage 2024"), cartão do modelo com **foto**, tabela de revisões (valor base) + **painel de extras com caixas de marcar e total somado** | Digitar 5 modelos reais, marcar extras e conferir a soma | Sonnet |
| 2b. Fotos | Pasta `fotos/`, padrão de nomes, controle das pendentes, imagem genérica | Todos os modelos mostram a foto ou "foto pendente" | Sonnet |
| 3. Interações | Filtro por ano/motor, revisão destacada pelo km informado pelo cliente, total acumulado, botão "Copiar para o cliente" (texto padrão para falar/WhatsApp), últimas buscas | Teste no navegador do PC do agendamento (Chrome/Edge) | Sonnet |
| 4. Acesso e publicação | Tela de PIN, repositório no GitHub, GitHub Pages ativo, link para a equipe | Abrir o link no PC de um funcionário e salvar como favorito | Sonnet |
| 5. Testes | `cenarios-de-teste.md` (caminho feliz, erros, modelo inexistente, campo vazio, sem internet) e correções | Rodar os cenários no navegador | Opus |
| 6. Rotina de atualização | Passo a passo: nova planilha → rodar script → publicar; data de atualização na tela | Simular uma troca de preço | Sonnet |

**Ideias para depois do MVP:** comparar dois modelos, tempo estimado de serviço, aviso de revisões em promoção, link direto para agendar.

## Riscos e decisões
- **PIN não é segurança real:** no GitHub Pages os dados ficam em arquivo público; o PIN só impede acesso casual. Se os preços forem confidenciais, depois migramos para Netlify/Cloudflare com senha de verdade.
- **Repositório:** precisa ser público para o GitHub Pages gratuito. A planilha original fica fora do Git.
- **Planilha bagunçada** (células mescladas, vários formatos): a Fase 1 resolve antes de qualquer tela.
- **Preço desatualizado:** a data da tabela sempre aparece na tela.
- Seguir CLAUDE.md global: nunca modificar a planilha original; confirmar antes de mover/renomear/deletar.

## Próximo passo após aprovação
1. Criar a pasta e iniciar a sessão nela.
2. Fase 0: entrevista do PRD (você responde uma pergunta por vez).
3. Pedir o caminho da planilha Excel para a Fase 1 (onde estão as colunas Kia e Stern/agregados).
4. Você aciona a Kia sobre o banco de imagens enquanto construímos as Fases 1 e 2.
