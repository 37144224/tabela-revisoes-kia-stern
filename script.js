// Tabela de Revisões e Garantia Kia (Stern) — Fase 2: abas, busca e resultado das revisões.
// Dados vêm de data/revisoes.js (gerado pelo ferramentas/excel_para_json.py; não editar à mão).
"use strict";

const DADOS = window.DADOS_REVISOES || { modelos: [] };
const MODELOS = DADOS.modelos;
const CONTATO = "Cleidiane · garantia@sternkia.com.br";

const campo = document.getElementById("campo-busca");
const lista = document.getElementById("sugestoes");
const resultado = document.getElementById("resultado");

// ---------- utilidades ----------
const reais = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const numero = new Intl.NumberFormat("pt-BR");

// Sem acento e minúsculo: "Sorento" = "sorento" = "SORÉNTO"
function normaliza(txt) {
  return String(txt || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

function escapa(txt) {
  return String(txt ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

function anosTexto(m) {
  if (!m.ano_inicial) return "anos não informados";
  return `${m.ano_inicial}–${m.ano_final || "atual"}`;
}

// "4 litro" -> "4 litros"; "500ML" -> "frasco 500 ml"
function unidade(it) {
  const u = String(it.unidade || "").toLowerCase().trim();
  if (u === "litro") return it.qtd > 1 ? "litros" : "litro";
  if (u === "500ml") return it.qtd > 1 ? "frascos 500 ml" : "frasco 500 ml";
  return u;
}

// Regra da Stern: parcela mínima R$ 500, até 3x sem juros; Pix sem desconto (Leonardo, 09/11/2026).
// Calculada aqui também porque na Fase 3 o total muda com agregados e desconto.
function textoPagamento(total) {
  const n = Math.max(1, Math.min(3, Math.floor(total / 500)));
  if (n === 1) return "Pix ou cartão de crédito · <strong>somente à vista</strong>";
  return `Pix ou cartão de crédito · <strong>parcelado em até ${n}x de ${reais.format(Math.round(total / n * 100) / 100)} sem juros</strong>`;
}

function dataBR(iso) {
  const [a, mes, d] = String(iso).split("-");
  return d ? `${d}/${mes}/${a}` : iso;
}

// Texto de busca de cada modelo: título do NBS + anos + nome da guia da planilha
MODELOS.forEach(m => {
  m._busca = normaliza(`${m.nome} ${m.aba}`).replace(/[_\-()]/g, " ");  // mantém o ponto: "2.2" precisa achar "2.2D"
});

// ---------- busca ----------
// Cada palavra digitada precisa aparecer; um número de 4 dígitos é tratado como ano do veículo
function busca(texto) {
  const palavras = normaliza(texto).split(/\s+/).filter(Boolean);
  if (!palavras.length) return [];
  return MODELOS.filter(m => palavras.every(p => {
    if (/^(19|20)\d{2}$/.test(p)) {
      const ano = Number(p);
      if (m.ano_inicial) return ano >= m.ano_inicial && ano <= (m.ano_final || 9999);
    }
    return m._busca.includes(p);
  }));
}

// Distância de edição: base das sugestões "Você quis dizer…?"
function distancia(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}

function parecidos(texto) {
  const palavras = normaliza(texto).split(/\s+/).filter(p => p.length > 2 && !/^\d+$/.test(p));
  if (!palavras.length) return [];
  const nomesBase = [...new Set(MODELOS.map(m => normaliza(m.nome).split(" ")[0]))];
  const nota = nomesBase.map(n => ({ n, d: Math.min(...palavras.map(p => distancia(p, n.slice(0, Math.max(p.length, 3))))) }));
  return nota.filter(x => x.d <= 2).sort((a, b) => a.d - b.d).slice(0, 4).map(x => x.n);
}

// ---------- sugestões ----------
let marcada = -1;
let atuais = [];

function mostraSugestoes() {
  atuais = busca(campo.value).slice(0, 12);
  marcada = atuais.length ? 0 : -1;
  if (!campo.value.trim()) { lista.hidden = true; return; }
  lista.innerHTML = atuais.length
    ? atuais.map((m, i) => `<li role="option" data-i="${i}" class="${i === 0 ? "marcada" : ""}">
        <span>${escapa(m.nome)}</span><span class="anos">${anosTexto(m)}</span></li>`).join("")
    : `<li class="vazio">Nenhum modelo com esse nome. Pressione Enter para ver sugestões.</li>`;
  lista.hidden = false;
}

function marca(i) {
  const itens = lista.querySelectorAll("li[data-i]");
  if (!itens.length) return;
  marcada = (i + itens.length) % itens.length;
  itens.forEach((li, k) => li.classList.toggle("marcada", k === marcada));
  itens[marcada].scrollIntoView({ block: "nearest" });
}

function escolhe(m) {
  lista.hidden = true;
  campo.value = m.nome;
  mostraModelo(m);
}

campo.addEventListener("input", mostraSugestoes);
campo.addEventListener("focus", () => { if (campo.value.trim()) mostraSugestoes(); });
campo.addEventListener("keydown", e => {
  if (e.key === "ArrowDown") { e.preventDefault(); marca(marcada + 1); }
  else if (e.key === "ArrowUp") { e.preventDefault(); marca(marcada - 1); }
  else if (e.key === "Enter") {
    e.preventDefault();
    if (atuais[marcada]) escolhe(atuais[marcada]);
    else if (campo.value.trim()) naoEncontrado(campo.value);
  } else if (e.key === "Escape") {
    campo.value = ""; lista.hidden = true; mostraInicio();
  }
});
lista.addEventListener("mousedown", e => {
  const li = e.target.closest("li[data-i]");
  if (li) { e.preventDefault(); escolhe(atuais[Number(li.dataset.i)]); }
});
document.addEventListener("click", e => { if (!e.target.closest(".busca")) lista.hidden = true; });

// Ctrl+K (ou "/") foca a busca de qualquer lugar da tela
document.addEventListener("keydown", e => {
  const foraDeCampo = !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName);
  if ((e.ctrlKey && e.key.toLowerCase() === "k") || (e.key === "/" && foraDeCampo)) {
    e.preventDefault();
    trocaAba("revisoes");
    campo.focus(); campo.select();
  }
});

// ---------- telas ----------
const SILHUETA = `<svg viewBox="0 0 72 40" fill="none" stroke="currentColor" stroke-width="2">
  <path d="M6 28h60M10 28l4-10c1-3 3-4 6-4h28c3 0 5 1 7 4l7 10M14 18h44"/>
  <circle cx="20" cy="30" r="5" fill="#fff"/><circle cx="52" cy="30" r="5" fill="#fff"/></svg>`;

function mostraInicio() {
  resultado.innerHTML = `<p class="inicio">Digite o modelo para ver o valor de todas as revisões.
    Dica: dá para incluir o ano, como <strong>"sportage 2023"</strong>.</p>`;
}

// Cartão fechado: revisão, km, total, peças + mão de obra. Clique abre os itens (peças e mão de obra separadas).
function mostraModelo(m) {
  const revisoes = m.revisoes.map((r, i) => {
    const itens = r.itens.map(it => `<div class="item"><span>${escapa(it.descricao)}
        <span class="qtd">${numero.format(it.qtd)} ${escapa(unidade(it))}${it.codigo ? ` · cód. ${escapa(it.codigo)}` : ""}</span></span>
        <span class="v">${reais.format(it.valor)}</span></div>`).join("");
    return `<article class="rev">
      <button class="rev-topo" type="button" aria-expanded="false" aria-controls="itens-${i}">
        <span><span class="rev-num">${r.numero}ª revisão</span><span class="rev-km">${numero.format(r.km)} km</span>
          ${r.gratuita ? '<span class="gratuita">Gratuita</span>' : ""}</span>
        <span class="rev-total">${reais.format(r.total)}</span>
        <span class="rev-partes">Peças ${reais.format(r.pecas)}<br>Mão de obra ${reais.format(r.mao_de_obra)}</span>
        <span class="rev-abrir">Ver itens <span class="seta" aria-hidden="true">&#9662;</span></span>
      </button>
      <div class="rev-itens" id="itens-${i}">
        <div><div class="grupo"><span>Peças</span><span>${reais.format(r.pecas)}</span></div>${itens}</div>
        <div><div class="grupo"><span>Mão de obra</span><span>${reais.format(r.mao_de_obra)}</span></div>
          <div class="item"><span>Serviço da revisão
            <span class="qtd">${numero.format(r.tempo_h)} h × ${reais.format(m.valor_hora)}/h</span></span>
            <span class="v">${reais.format(r.mao_de_obra)}</span></div>
          <div class="pagamento">
            <div class="grupo"><span>Forma de pagamento</span></div>
            <div class="pagamento-texto">${textoPagamento(r.total)}</div>
          </div>
          <!-- Pré-orçamento: só os itens da revisão, sem agregados (uso do agendamento) -->
          <button class="botao" type="button" data-pre="${i}">Pré-orçamento</button>
          <!-- Fase 3: abre agregados, serviços, avulso, desconto e o texto para o cliente -->
          <button class="botao botao-sec" type="button" disabled title="Disponível na próxima fase">Montar orçamento</button>
        </div>
      </div>
    </article>`;
  }).join("");

  resultado.innerHTML = `
    <section class="modelo">
      <div>
        <h1 class="modelo-nome">${escapa(m.nome)}</h1>
        <div class="modelo-anos">${anosTexto(m)} · ${m.revisoes.length} revisões</div>
        ${m.referencia_antiga ? '<span class="selo">Referência antiga: confirmar valor com a oficina</span>' : ""}
      </div>
      <div class="foto">${SILHUETA}<span>Foto pendente</span></div>
    </section>
    <div class="lista">${revisoes}</div>
    ${cartoesEspeciais(m)}`;

  resultado.querySelectorAll(".rev-topo").forEach(b => b.addEventListener("click", () => {
    const aberta = b.parentElement.classList.toggle("aberta");
    b.setAttribute("aria-expanded", aberta);
  }));
  resultado.querySelectorAll("[data-pre]").forEach(b => b.addEventListener("click", () =>
    abreJanela(textoPreOrcamento(m, m.revisoes[Number(b.dataset.pre)]))));
}

// ---------- manutenção especial (Sorento 2.2D, Tasman) ----------
// Itens trocados por intervalo próprio de km/tempo, cobrados junto com a revisão regular daquele momento.
function nomeEspecial(t) {
  t = String(t).toLowerCase().replace(/correia(\d)/, "correia $1").replace("dagua", "d'água")
    .replace(/\b(dct|mv|diii|d\/t)\b/g, s => s.toUpperCase()).replace(/(\d+)w(\d+)/, "$1W$2");
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function cartoesEspeciais(m) {
  if (!m.especial || !m.especial.length) return "";
  const cartoes = m.especial.map(e => {
    const titulo = `A cada ${numero.format(e.km)} km${e.anos ? ` ou ${e.anos} anos` : ""}`;
    const itens = e.itens.map(it => `<div class="item"><span>${escapa(nomeEspecial(it.descricao))}</span>
        <span class="v">${reais.format(it.valor)}</span></div>`).join("");
    return `<article class="rev especial">
      <button class="rev-topo" type="button" aria-expanded="false">
        <span><span class="rev-num">Manutenção especial</span><span class="rev-km">${titulo}</span></span>
        <span class="rev-total">${reais.format(e.total)}</span>
        <span class="rev-partes">Peças ${reais.format(e.pecas)}<br>Mão de obra ${reais.format(e.mao_de_obra)}</span>
        <span class="rev-abrir">Ver itens <span class="seta" aria-hidden="true">&#9662;</span></span>
      </button>
      <div class="rev-itens">
        <div><div class="grupo"><span>Peças</span><span>${reais.format(e.pecas)}</span></div>${itens}</div>
        <div><div class="grupo"><span>Mão de obra</span><span>${reais.format(e.mao_de_obra)}</span></div>
          <div class="item"><span>Serviço da manutenção especial
            <span class="qtd">${numero.format(e.tempo_h)} h × ${reais.format(m.valor_hora)}/h</span></span>
            <span class="v">${reais.format(e.mao_de_obra)}</span></div>
          <div class="pagamento">
            <div class="grupo"><span>Forma de pagamento</span></div>
            <div class="pagamento-texto">${textoPagamento(e.total)}</div>
          </div>
        </div>
      </div>
    </article>`;
  }).join("");
  return `<section class="especiais">
      <h2 class="especiais-titulo">Manutenção especial</h2>
      <p class="especiais-nota">* Somar o valor da manutenção especial com o da revisão regular do mesmo momento.
        Vale o que vencer primeiro, km ou tempo.</p>
      <div class="lista">${cartoes}</div>
    </section>`;
}

// ---------- pré-orçamento (texto aprovado pelo Leonardo em 09/11/2026) ----------
const EMAIL_AGENDAMENTO = "agendamento2@sternkia.com.br";

// Nome do item em linguagem de cliente (a planilha usa nomes técnicos/de estoque)
function nomeCliente(it) {
  const d = normaliza(it.descricao);
  const u = normaliza(it.unidade);
  if (d.includes("arruela") || d.includes("anel")) return "Arruela do bujão do cárter";
  if (d.includes("filtro") && d.includes("oleo")) return "Filtro de óleo do motor";
  if (d.includes("filtro") && (d.includes("a/c") || d.includes("ar cond") || d.includes("cabine"))) return "Filtro do ar-condicionado";
  if (d.includes("filtro") && d.includes("ar")) return "Filtro de ar do motor";
  if (d.includes("filtro") && d.includes("comb")) return "Filtro de combustível";
  // Descarbonizante Flex (Sportage SL) é o mesmo produto do Via Tanque, com outro nome
  if (d.includes("aditiv") || d.includes("descarbon")) return "Aditivo via tanque";
  if (d.includes("freio")) return "Fluido de freio";
  if (d.includes("arrefec") || d.includes("radiador")) return "Fluido de arrefecimento";
  if (d.includes("vela")) return "Velas de ignição";
  if (d.includes("correia")) return "Correia " + (d.includes("dent") ? "dentada" : "acionadora");
  if (d.includes("diferen") || d.includes("eixo traseiro")) return "Óleo do diferencial";
  if (d.includes("polia tensora")) return "Polia tensora";
  if (d.includes("alinhamento")) return "Alinhamento e balanceamento";
  if (u === "litro" && (d.includes("oleo") || d.includes("quartz") || /\dw\d/.test(d)) && !/diferen|transm|cambio|atf|dct/.test(d))
    return `Óleo do motor (${numero.format(it.qtd)} ${it.qtd > 1 ? "litros" : "litro"})`;
  const t = it.descricao.toLowerCase().replace(/\*+/g, "").replace(/\s+/g, " ").trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function precoExtra(codigo) {
  const e = (window.DADOS_EXTRAS || []).find(x => x.codigo === codigo);
  return e ? e.valor : 0;
}

function textoPreOrcamento(m, r) {
  const n = Math.max(1, Math.min(3, Math.floor(r.total / 500)));
  const pagamento = n === 1 ? "Pix ou cartão de crédito, somente à vista."
    : `Pix ou cartão de crédito, parcelado em até ${n}x de ${reais.format(Math.round(r.total / n * 100) / 100)} sem juros.`;
  const validade = new Date(); validade.setDate(validade.getDate() + 7);
  const alinhamento = precoExtra("ALI001") + precoExtra("BAL001");
  const itens = [...new Set(r.itens.map(nomeCliente))].map(t => `• ${t}`).join("\n");
  // Stinger: único modelo em que alinhamento/balanceamento é obrigatório e já está na revisão.
  // NÃO oferecer como "(Opcional)": o cliente acharia que é erro (Leonardo, 09/11/2026)
  const jaTemAlinhamento = r.itens.some(it => normaliza(it.descricao).includes("alinhamento"));
  return [
    "Olá! Segue o orçamento da revisão do seu Kia, conforme a tabela da Stern Kia:",
    "",
    `*Veículo:* ${m.nome} (${anosTexto(m)})`,
    `*Revisão:* ${r.numero}ª revisão – ${numero.format(r.km)} km`,
    "",
    "*Itens inclusos na revisão:*",
    itens,
    "",
    `*Valor total da revisão (*): ${reais.format(r.total)}*`,
    `Pagamento: ${pagamento}`,
    `Valores válidos até ${validade.toLocaleDateString("pt-BR")} (**)`,
    "",
    "*Serviços inclusos na revisão:*",
    "• Inspeção dos sistemas de segurança, elétrico, freios, suspensão, direção, arrefecimento, motor e câmbio.",
    "",
    ...(jaTemAlinhamento ? [] : [`Alinhamento/Balanceamento = R$: ${reais.format(alinhamento).replace(/R\$\s?/, "")} (Opcional)`, ""]),
    "(*) Orçamento prévio sujeito a complemento durante a execução dos serviços. Em caso de serviços adicionais, o consultor técnico encaminhará o orçamento para aprovação complementar.",
    "(**) Este orçamento tem validade de 07 dias a partir da data do envio.",
    "",
    "Stern Kia – Pós-venda",
    `Agende sua revisão: ${EMAIL_AGENDAMENTO}`,
  ].join("\n");
}

const janela = document.getElementById("janela");
const caixaTexto = document.getElementById("texto-orcamento");
const avisoCopiado = document.getElementById("copiado");

function abreJanela(texto) {
  caixaTexto.value = texto;
  avisoCopiado.hidden = true;
  janela.hidden = false;
  document.getElementById("copiar").focus();
}
function fechaJanela() { janela.hidden = true; }

document.getElementById("copiar").addEventListener("click", async () => {
  try { await navigator.clipboard.writeText(caixaTexto.value); }
  catch { caixaTexto.select(); document.execCommand("copy"); }  // arquivo aberto com dois cliques (file://)
  avisoCopiado.hidden = false;
});
janela.querySelectorAll("[data-fechar]").forEach(b => b.addEventListener("click", fechaJanela));
janela.addEventListener("click", e => { if (e.target === janela) fechaJanela(); });
document.addEventListener("keydown", e => { if (e.key === "Escape" && !janela.hidden) { e.stopPropagation(); fechaJanela(); } }, true);

function naoEncontrado(texto) {
  lista.hidden = true;
  const sug = parecidos(texto);
  resultado.innerHTML = `<section class="mensagem">
      <h2>Modelo não encontrado</h2>
      <p>Confira o nome ou consulte a oficina.</p>
      ${sug.length ? `<p>Você quis dizer:</p><div class="opcoes">${sug.map(s =>
        `<button data-sug="${escapa(s)}">${escapa(s.toUpperCase())}</button>`).join("")}</div>` : ""}
      <p class="contato">Se o modelo deveria estar na tabela, avise: ${CONTATO}</p>
    </section>`;
  resultado.querySelectorAll("button[data-sug]").forEach(b => b.addEventListener("click", () => {
    campo.value = b.dataset.sug; campo.focus(); mostraSugestoes();
  }));
}

// ---------- abas ----------
function trocaAba(nome) {
  document.querySelectorAll(".aba").forEach(b => {
    const ativa = b.dataset.aba === nome;
    b.classList.toggle("ativa", ativa);
    b.setAttribute("aria-selected", ativa);
  });
  document.getElementById("painel-revisoes").hidden = nome !== "revisoes";
  document.getElementById("painel-garantia").hidden = nome !== "garantia";
}
document.querySelectorAll(".aba").forEach(b => b.addEventListener("click", () => trocaAba(b.dataset.aba)));

// ---------- início ----------
document.getElementById("data-tabela").textContent = `Tabela atualizada em ${dataBR(DADOS.data_tabela)}`;
mostraInicio();
campo.focus();
