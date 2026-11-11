# CLAUDE.md — Tabela de Revisões e Tira-dúvidas de Garantia Kia (Stern)

Página web com duas abas, usada pelo agendamento e pelos consultores da Stern: **Revisões** (consulta e orçamento) e **Garantia** (regras oficiais da Kia tiradas dos livretos).
Requisitos aprovados: [PRD.md](PRD.md). Fases: [plan.md](plan.md). Situação atual: [ESTADO-DO-PROJETO.md](ESTADO-DO-PROJETO.md).

## 5 regras de trabalho
1. **Propor antes de executar:** mostrar o plano da mudança e esperar o "ok" antes de criar ou alterar código.
2. **Sem bibliotecas sem aprovação:** HTML, CSS e JS puros na página; Python padrão + `openpyxl` no script. Qualquer outra lib precisa de aprovação.
3. **Comentários em português**, curtos, explicando o porquê.
4. **Justificar arquivo novo:** antes de criar um arquivo, dizer por que ele é necessário e onde fica.
5. **Avisar conflito com o PRD:** se um pedido contrariar o PRD, apontar o conflito e perguntar antes de seguir. Mudança aprovada → atualizar o PRD.

## Quem usa este projeto
- **Leonardo** (dono) e **Cleidiane** (garantia@sternkia.com.br). Ela não usa GitHub e não é técnica: explicar em linguagem simples, passo a passo, e confirmar cada etapa.
- **Atualização (decisão de 11/11/2026):** a Cleidiane manda a planilha ou o livreto ao Leonardo; o projeto fica só no PC dele; ele traz o arquivo, o Claude atualiza, ele confere e publica. Não há pasta compartilhada.
- Respostas em português brasileiro, diretas.

## Estrutura
```
index.html / style.css / script.js   ← a página (desktop primeiro, 1280px+)
data/revisoes.json                   ← gerado pelo script, nunca editar à mão
data/extras.json                     ← catálogo de agregados e serviços
data/nomes.csv                       ← nome amigável, versão, anos e motorização de cada aba
data/garantia.json                   ← regras de garantia (por motorização + exceções), montadas pelo Claude a partir dos livretos
fotos/                               ← <modelo>-<anoini>-<anofim>.webp, 800px, ~100 KB; controle.csv
ferramentas/excel_para_json.py       ← planilha Stern → revisoes.json
fonte/                               ← planilhas e PDFs originais (NUNCA alterar; fora do Git)
fonte/manuais/                       ← livretos de garantia em PDF (manual do proprietário)
```

## Regras de negócio (não mudar sem aprovação)
- **Uma só tabela base: Tabela Stern** (linha "VALOR TABELA KIA" da planilha). Não existe alternador Kia/Stern.
- **Valor sempre calculado a partir do detalhe das peças**, nunca de totais digitados. O script lista as abas onde detalhe ≠ linha.
- **Óleo:** arredondar para cima; fração ,1 arredonda para baixo (4,1 → 4). Bongo K2500 fixo em 8 L.
- **Mão de obra:** tempo × valor-hora **da própria aba** (coluna C da linha "MÃO OBRA"). O valor vale pelo título da linha ("MÃO OBRA 450,00"). Varia por modelo: R$ 350 (Bongo K2500/New Bongo), 450 (maioria, incl. Niro e Stonic), 600 (EV5, EV9, Carnival 1.6 HEV/3.5 2022/Gran 3.3, Sorento 3.5 UM, Stinger); abas antigas 185–250.
- **Fluido de freio:** vale o detalhe da Stern (frascos de 500 ml, ex.: 2 × R$ 66,47 = R$ 132,94), não o valor digitado de R$ 91,57 (decisão do Leonardo, 06/11/2026).
- **Aditivo Via Tanque** (010164 Flex / 010163 Diesel) já está na revisão: nunca somar de novo como extra. **Exceção:** Mohave V6 e V6 Diesel não incluem o aditivo (decisão do Leonardo, 06/11/2026). O script só soma os itens dentro do intervalo de PEÇAS da planilha.
- **Stinger:** único modelo com **alinhamento/balanceamento obrigatório dentro da revisão** (R$ 300). No pré-orçamento dele NÃO aparece a linha "(Opcional)" — o cliente acharia que é erro.
- **Descarbonizante Flex** (Sportage 2.0 Flex SL, R$ 185) = mesmo produto do Aditivo Via Tanque; para o cliente aparece como "Aditivo via tanque".
- **Limpa TBI** é agregado, nunca item de revisão.
- **Filtro do ar-condicionado no orçamento:** todo "Montar orçamento" oferece o filtro do A/C do próprio modelo (código e preço tirados das revisões que o trocam), **só a peça**, sem mão de obra. Na revisão que já traz o filtro, aparece travado "Já incluso". Carnival KA4: dianteiro e traseiro separados. Bongo sem filtro na planilha: não aparece (decisão do Leonardo, 10/11/2026).
- **Abas antigas** levam o selo "Referência antiga: confirmar valor com a oficina".
- **Extras:** produto = peça; serviço (alinhamento, balanceamento, limpezas, retífica) = mão de obra. Retífica de discos: R$ 270 por par, quantidade 1 ou 2.
- **Desconto:** separado em peças e mão de obra. Aviso (sem bloqueio) acima de **5% na mão de obra** e **10% nas peças**.
- **Validade do orçamento:** data da consulta + 7 dias.
- **Forma de pagamento:** Pix ou cartão de crédito. Parcelas = total ÷ R$ 500 (para baixo), mínimo 1 ("somente à vista"), máximo 3, **sem juros**; Pix sem desconto. Calculado pela regra, não pela linha PARCELAMENTO da planilha (decisão do Leonardo, 09/11/2026). No orçamento, recalcular sobre o total final.
- **Revisão indicada:** o que vencer primeiro, km ou tempo, pela regra de cada modelo.

## Regras da garantia (não mudar sem aprovação)
- **Só o que está escrito no livreto oficial.** Nunca completar com conhecimento geral ou suposição. Sem regra → "Não encontrado no manual: consultar a garantia (Cleidiane)".
- Toda regra em `garantia.json` guarda o **trecho oficial** (cópia fiel, curta) e **livreto + página**. Livretos divergentes: vale o mais recente.
- **Modelo sem livreto disponível** (decisão do Leonardo, 10/11/2026): a garantia geral vem da página kia.com.br/garantia (vendas a partir de 01/2025) ou da **conferência da Cleidiane** (vendas anteriores), sempre com a fonte na tela; os itens (bateria, amortecedor, vidros etc.) usam o texto igual em todos os livretos, com o selo "confirmar com a garantia".
- Depois de editar `data/garantia.json`, refazer `data/garantia.js` (o `excel_para_json.py` faz isso ao rodar).
- Regras por **motorização** (combustão, diesel, híbrido, elétrico) + **exceções por modelo**.
- Regra nova ou alterada só vai ao ar depois da **conferência do Leonardo**.
- A tela sempre diz "Sujeito à análise técnica da Kia" e pergunta se as revisões estão em dia na rede Kia.

## Atualizar a tabela (rotina)
1. Planilha nova da Kia/Stern → salvar em `fonte/<origem>-<AAAA-MM-DD>/` sem alterar o original.
2. Conferir os pontos de [ferramentas/correcoes-na-planilha.md](ferramentas/correcoes-na-planilha.md) (o que já corrigimos e decidimos; reaplicar o que a planilha nova não trouxer) e rodar `python ferramentas/excel_para_json.py`; revisar a lista de divergências.
3. Conferir alguns valores com a planilha e atualizar a data "Tabela atualizada em".
4. Publicar (passo a passo definido na Fase 4).

**Livreto novo de garantia:** salvar em `fonte/manuais/`, o Claude lê e atualiza `data/garantia.json` (listando o que mudou), o Leonardo confere, publicar.

## Visual (decisão do Leonardo, 09/11/2026)
- Sistema **"Stern Kia"** (artefato de design, Kia Web Style Guide): Preto Noturno `#05141f` + branco, cantos retos, hierarquia pela opacidade do texto. Azul-petróleo NÃO (só dashboards da diretoria).
- Layout **B**: menu lateral preto (logo Kia Stern vertical + abas + Kia Service no rodapé); revisões em lista, uma por linha; clique abre os itens (peças | mão de obra). Logos em `assets/logos/`, sem redesenhar.

## Verificação
- Toda fase termina com o "como verificar" do plan.md e a conferência do Leonardo.
- Valores: zero divergência entre a planilha e a página.
- Testar no Chrome e no Edge.

## Segurança e dados
- O PIN só evita acesso casual; não colocar na página nada além dos preços (sem dados de clientes).
- Nada de dados de cliente salvos: o e-mail ao agendamento é montado na hora e não fica guardado.
- Nunca mover, renomear ou apagar arquivos sem confirmar.
