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

// ---------- últimas buscas: só no navegador deste PC (sem dados de cliente) ----------
const CHAVE_ULTIMAS = "kia-stern-ultimas-buscas";
function ultimas() {
  try {
    const ids = JSON.parse(localStorage.getItem(CHAVE_ULTIMAS) || "[]");
    return ids.map(id => MODELOS.find(m => m.id === id)).filter(Boolean);
  } catch { return []; }  // navegador sem armazenamento: a página funciona igual, só sem a lista
}
function registraBusca(m) {
  try {
    const ids = [m.id, ...ultimas().map(x => x.id).filter(id => id !== m.id)].slice(0, 5);
    localStorage.setItem(CHAVE_ULTIMAS, JSON.stringify(ids));
  } catch { /* sem armazenamento */ }
}

function mostraSugestoes() {
  // campo vazio: mostra as últimas buscas
  if (!campo.value.trim()) {
    atuais = ultimas();
    marcada = -1;
    lista.innerHTML = `<li class="vazio titulo-lista">Últimas buscas</li>` + atuais.map((m, i) => `<li role="option" data-i="${i}">
        <span>${escapa(m.nome)}</span><span class="anos">${anosTexto(m)}</span></li>`).join("");
    lista.hidden = !atuais.length;
    return;
  }
  atuais = busca(campo.value).slice(0, 12);
  marcada = atuais.length ? 0 : -1;
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
  registraBusca(m);
  mostraModelo(m);
}

campo.addEventListener("input", mostraSugestoes);
campo.addEventListener("focus", () => { if (campo.value.trim()) mostraSugestoes(); });
campo.addEventListener("click", () => { if (lista.hidden) mostraSugestoes(); });
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

// Ctrl+K (ou "/") foca a busca da aba aberta, de qualquer lugar da tela
document.addEventListener("keydown", e => {
  const foraDeCampo = !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName);
  if ((e.ctrlKey && e.key.toLowerCase() === "k") || (e.key === "/" && foraDeCampo)) {
    e.preventDefault();
    const alvo = document.getElementById("painel-garantia").hidden ? campo : document.getElementById("campo-garantia");
    alvo.focus(); alvo.select();
  }
});

// ---------- telas ----------
const SILHUETA = `<svg viewBox="0 0 72 40" fill="none" stroke="currentColor" stroke-width="2">
  <path d="M6 28h60M10 28l4-10c1-3 3-4 6-4h28c3 0 5 1 7 4l7 10M14 18h44"/>
  <circle cx="20" cy="30" r="5" fill="#fff"/><circle cx="52" cy="30" r="5" fill="#fff"/></svg>`;

function mostraInicio() {
  const recentes = ultimas();
  resultado.innerHTML = `<p class="inicio">Digite o modelo para ver o valor de todas as revisões.
    Dica: dá para incluir o ano, como <strong>"sportage 2023"</strong>.</p>
    ${recentes.length ? `<div class="recentes"><span class="busca-rotulo">Últimas buscas</span>
      <div class="opcoes">${recentes.map(m => `<button type="button" class="chip" data-id="${escapa(m.id)}">${escapa(m.nome)}
        <span>${anosTexto(m)}</span></button>`).join("")}</div></div>` : ""}`;
  resultado.querySelectorAll(".chip").forEach(b => b.addEventListener("click", () =>
    escolhe(MODELOS.find(m => m.id === b.dataset.id))));
}

// Cartão fechado: revisão, km, total, peças + mão de obra. Clique abre os itens (peças e mão de obra separadas).
function mostraModelo(m) {
  const revisoes = m.revisoes.map((r, i) => {
    const itens = r.itens.map(it => `<div class="item"><span>${escapa(it.descricao)}
        <span class="qtd">${numero.format(it.qtd)} ${escapa(unidade(it))}${it.codigo ? ` · cód. ${escapa(it.codigo)}` : ""}</span></span>
        <span class="v">${reais.format(it.valor)}</span></div>`).join("");
    return `<article class="rev" data-num="${r.numero}">
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
          <button class="botao botao-sec" type="button" data-orc="${i}">Montar orçamento</button>
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
        <div><button type="button" class="link-comparar" id="abrir-comparar">Comparar com outro modelo</button></div>
      </div>
      <div class="foto">${SILHUETA}<span>Foto pendente</span></div>
    </section>
    <div id="comparacao"></div>
    <!-- Revisão indicada (PRD 3.4): km atual + data da venda → a revisão que vence primeiro -->
    <section class="indicada-campos">
      <span class="busca-rotulo">Revisão indicada</span>
      <label>Km atual<input type="text" inputmode="numeric" id="ind-km" placeholder="ex.: 28500" autocomplete="off"></label>
      <label>Data da venda<input type="date" id="ind-data"></label>
      <div id="ind-resultado" class="ind-resultado"></div>
    </section>
    <div class="lista">${revisoes}</div>
    ${cartoesEspeciais(m)}`;

  resultado.querySelectorAll(".rev-topo").forEach(b => b.addEventListener("click", () => {
    const aberta = b.parentElement.classList.toggle("aberta");
    b.setAttribute("aria-expanded", aberta);
  }));
  resultado.querySelectorAll("[data-pre]").forEach(b => b.addEventListener("click", () =>
    abreJanela(textoPreOrcamento(m, m.revisoes[Number(b.dataset.pre)]))));
  resultado.querySelectorAll("[data-orc]").forEach(b => b.addEventListener("click", () =>
    abreOrcamento(m, m.revisoes[Number(b.dataset.orc)])));
  document.getElementById("abrir-comparar").addEventListener("click", () => abreComparar(m));
  // Espera o consultor terminar de digitar o km (0,8 s sem tecla) antes de indicar; senão o "1" de "12000"
  // já abriria a 1ª revisão. Enter ou sair do campo indica na hora.
  let espera = null;
  ["ind-km", "ind-data"].forEach(id => {
    const el = document.getElementById(id);
    el.addEventListener("input", () => { clearTimeout(espera); espera = setTimeout(() => mostraIndicada(m), 800); });
    el.addEventListener("change", () => { clearTimeout(espera); mostraIndicada(m); });
    el.addEventListener("keydown", e => { if (e.key === "Enter") { clearTimeout(espera); mostraIndicada(m); } });
  });
}

// ---------- revisão indicada ----------
// Regra de cada modelo vem do livreto (data/garantia.js): intervalo em km, em meses e tolerância.
// Sem livreto: só pelo km, com aviso. Sem saber quais revisões já foram feitas, indica a próxima a fazer:
// a de número mais alto entre "pelo km" e "pelo tempo" (o que vencer primeiro).
function mesesEntre(iso, ate) {
  const [a, m, d] = iso.split("-").map(Number);
  let meses = (ate.getFullYear() - a) * 12 + (ate.getMonth() + 1 - m);
  if (ate.getDate() < d) meses--;
  return meses;
}

function revisaoIndicada(m, kmAtual, venda, hoje = new Date()) {
  const rv = ((window.DADOS_GARANTIA || {}).modelos || {})[m.id]?.revisoes || {};
  const tolKm = rv.tol_km || 0, tolMeses = rv.tol_meses || 0;
  let porKm = null, porTempo = null;
  if (kmAtual != null) {
    // primeira revisão cujo km (com a tolerância) ainda não ficou para trás
    porKm = m.revisoes.find(r => r.km + tolKm >= kmAtual) || "acima";
  }
  if (venda && rv.meses) {
    const decorridos = mesesEntre(venda, hoje);
    if (decorridos < 0) porTempo = "futuro";
    else {
      const n = Math.max(1, Math.ceil((decorridos - tolMeses) / rv.meses));
      porTempo = m.revisoes.find(r => r.numero === n) || "acima";
    }
  }
  return { porKm, porTempo, temTempo: !!rv.meses, rv };
}

function mostraIndicada(m) {
  const kmTxt = document.getElementById("ind-km").value.replace(/\D/g, "");
  const kmAtual = kmTxt ? Number(kmTxt) : null;
  const venda = document.getElementById("ind-data").value;
  const saida = document.getElementById("ind-resultado");
  // Fecha o cartão que a indicação anterior abriu (os que o consultor abriu à mão ficam como estão)
  resultado.querySelectorAll(".rev.indicada").forEach(a => {
    a.classList.remove("indicada");
    if (a.dataset.abertaPelaIndicada) {
      a.classList.remove("aberta");
      a.querySelector(".rev-topo").setAttribute("aria-expanded", false);
      delete a.dataset.abertaPelaIndicada;
    }
  });
  if (kmAtual == null && !venda) { saida.innerHTML = ""; return; }
  const { porKm, porTempo, temTempo, rv } = revisaoIndicada(m, kmAtual, venda);
  if (venda && new Date(venda + "T00:00") > new Date()) { saida.innerHTML = "Data da venda no futuro: confira a data digitada."; return; }
  const validas = [porKm, porTempo].filter(x => x && x !== "acima");
  const acima = porKm === "acima" || porTempo === "acima";
  const avisos = [];
  if (venda && !temTempo) avisos.push("Regra de tempo não cadastrada para este modelo (livreto não disponível): indicada só pelo km.");
  if (!venda && temTempo) avisos.push(`Informe a data da venda: neste modelo a revisão vence a cada ${numero.format(rv.km)} km ou ${rv.meses} meses, o que ocorrer primeiro.`);
  // só a data, num modelo sem regra de tempo: falta o km
  if (!acima && !validas.length) { saida.innerHTML = `<strong>Informe o km atual.</strong>` + avisos.map(a => `<br><small>${escapa(a)}</small>`).join(""); return; }
  if (acima) {
    const ultima = m.revisoes[m.revisoes.length - 1];
    saida.innerHTML = `<strong>Acima da última revisão da tabela (${ultima.numero}ª, ${numero.format(ultima.km)} km): consultar a oficina.</strong>` +
      avisos.map(a => `<br><small>${escapa(a)}</small>`).join("");
    return;
  }
  const r = validas.reduce((a, b) => (b.numero > a.numero ? b : a));
  const motivo = porKm && porTempo && porKm !== "acima" && porTempo !== "acima"
    ? (porKm.numero === porTempo.numero ? "pelo km e pelo tempo" : r === porTempo ? `pelo tempo desde a venda (pelo km seria a ${porKm.numero}ª)` : `pelo km (pelo tempo seria a ${porTempo.numero}ª)`)
    : r === porKm ? "pelo km" : "pelo tempo desde a venda";
  const tol = rv.tol_km ? ` Tolerância do livreto: ±${numero.format(rv.tol_km)} km ou ±${rv.tol_meses} mês.` : "";
  saida.innerHTML = `<strong>Indicada: ${r.numero}ª revisão (${numero.format(r.km)} km) · ${reais.format(r.total)}</strong>
    <br><small>${escapa(`Vence ${motivo}.${tol} Confirme no histórico do cliente se as anteriores foram feitas.`)}</small>` +
    avisos.map(a => `<br><small>${escapa(a)}</small>`).join("");
  const card = resultado.querySelector(`.rev[data-num="${r.numero}"]`);
  if (card) {
    if (!card.classList.contains("aberta")) card.dataset.abertaPelaIndicada = "1";
    card.classList.add("indicada", "aberta");
    card.querySelector(".rev-topo").setAttribute("aria-expanded", true);
    card.scrollIntoView({ behavior: "smooth", block: "nearest" });  // leva até a indicada (ex.: 10ª, lá embaixo)
  }
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

// Pagamento em texto simples (WhatsApp/e-mail), pela mesma regra de textoPagamento
function pagamentoSimples(total) {
  const n = Math.max(1, Math.min(3, Math.floor(total / 500)));
  return n === 1 ? "Pix ou cartão de crédito, somente à vista."
    : `Pix ou cartão de crédito, parcelado em até ${n}x de ${reais.format(Math.round(total / n * 100) / 100)} sem juros.`;
}

function dataValidade() {
  const validade = new Date(); validade.setDate(validade.getDate() + 7);
  return validade.toLocaleDateString("pt-BR");
}

// Nome do agregado para o cliente: "HIGIENIZADOR AR CONDICIONADO" -> "Higienizador ar condicionado"
function nomeExtra(nome) {
  const t = String(nome).toLowerCase();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

// Pré-orçamento = texto aprovado sem agregados. Orçamento = o mesmo texto + adicionais, desconto e total final.
function textoPreOrcamento(m, r) { return textoCliente(m, r, null); }

function textoCliente(m, r, c) {
  const total = c ? c.total : r.total;
  const alinhamento = precoExtra("ALI001") + precoExtra("BAL001");
  const itens = [...new Set(r.itens.map(nomeCliente))].map(t => `• ${t}`).join("\n");
  // Stinger: único modelo em que alinhamento/balanceamento é obrigatório e já está na revisão.
  // NÃO oferecer como "(Opcional)": o cliente acharia que é erro (Leonardo, 09/11/2026).
  // No orçamento, também some se o consultor já incluiu alinhamento ou balanceamento.
  const jaTemAlinhamento = r.itens.some(it => normaliza(it.descricao).includes("alinhamento"))
    || (c && c.linhas.some(l => l.codigo === "ALI001" || l.codigo === "BAL001"));
  const adicionais = !c ? [] : [
    `Valor da revisão: ${reais.format(r.total)}`,
    ...(c.linhas.length ? ["", "*Adicionais:*", ...c.linhas.map(l =>
      `• ${l.nome}${l.qtd > 1 ? ` (${numero.format(l.qtd)}x)` : ""} – ${reais.format(l.total)}`)] : []),
    ...(c.descTotal > 0 ? ["", `Desconto: – ${reais.format(c.descTotal)}`] : []),
    "",
  ];
  return [
    "Olá! Segue o orçamento da revisão do seu Kia, conforme a tabela da Stern Kia:",
    "",
    `*Veículo:* ${m.nome} (${anosTexto(m)})`,
    `*Revisão:* ${r.numero}ª revisão – ${numero.format(r.km)} km`,
    "",
    "*Itens inclusos na revisão:*",
    itens,
    "",
    ...adicionais,
    c ? `*Valor total (*): ${reais.format(total)}*` : `*Valor total da revisão (*): ${reais.format(total)}*`,
    `Pagamento: ${pagamentoSimples(total)}`,
    `Valores válidos até ${dataValidade()} (**)`,
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

function abreJanela(texto, titulo = "PRÉ-ORÇAMENTO") {
  document.getElementById("janela-titulo").textContent = titulo;
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
// Esc fecha a janela de cima primeiro (texto), depois a do orçamento
document.addEventListener("keydown", e => {
  if (e.key !== "Escape") return;
  if (!janela.hidden) { e.stopPropagation(); fechaJanela(); }
  else if (!janelaOrc.hidden) { e.stopPropagation(); fechaOrcamento(); }
}, true);

// ---------- montar orçamento (Fase 3, PRD 3.5, 3.6 e 3.8) ----------
const EXTRAS = window.DADOS_EXTRAS || [];
const LIMITE_DESC = { pecas: 10, mo: 5 };  // % acima do qual o gerente precisa aprovar (só aviso, sem bloqueio)
const janelaOrc = document.getElementById("janela-orc");
let orc = null;  // { m, r, lista: filtro do A/C do modelo + catálogo de extras }

const centavos = v => Math.round(v * 100) / 100;

// Aceita "10", "10,5", "1.234,56" e "10.5"
function lerNumero(txt) {
  let s = String(txt || "").trim().replace(/[R$\s%]/g, "");
  if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

// Via Tanque: se a revisão já traz o aditivo, não pode somar de novo (Mohave V6 não traz, então lá pode).
// Alinhamento/balanceamento: idem quando já está na revisão (Stinger).
function inclusoNaRevisao(e, r) {
  if (e.filtroAC) return r.itens.some(it => it.codigo === e.codigo);
  const descr = r.itens.map(it => normaliza(it.descricao));
  if (e.ja_incluso_na_revisao) return descr.some(d => d.includes("aditiv") || d.includes("descarbon"));
  if (e.codigo === "ALI001" || e.codigo === "BAL001") return descr.some(d => d.includes("alinhamento"));
  return false;
}

// Filtro do A/C do próprio modelo, tirado das revisões que o trocam (as pares, na maioria).
// Os consultores oferecem também nas ímpares: entra só a peça, sem mão de obra (Leonardo, 10/11/2026).
// Carnival KA4 tem dois (dianteiro e traseiro); Bongo sem ar não tem filtro na planilha e não mostra o item.
function filtrosAC(m) {
  const achados = new Map();
  m.revisoes.forEach(r => r.itens.forEach(it => {
    if (nomeCliente(it) === "Filtro do ar-condicionado" && !achados.has(it.codigo)) achados.set(it.codigo, it);
  }));
  const varios = achados.size > 1;
  return [...achados.values()].map(it => {
    const lado = !varios ? "" : normaliza(it.descricao).includes("tras") ? " traseiro" : " dianteiro";
    return { codigo: it.codigo, nome: `FILTRO DO AR-CONDICIONADO${lado.toUpperCase()}`, valor: it.valor,
      tipo: "peca", qtd_max: 1, filtroAC: true };
  });
}

function abreOrcamento(m, r) {
  orc = { m, r, lista: [...filtrosAC(m), ...EXTRAS] };
  document.getElementById("orc-sub").textContent = `${m.nome} (${anosTexto(m)}) · ${r.numero}ª revisão – ${numero.format(r.km)} km`;
  document.getElementById("orc-extras").innerHTML = orc.lista.map((e, k) => {
    const incluso = inclusoNaRevisao(e, r);
    const tipo = e.tipo === "peca" ? "Peça" : "Mão de obra";
    return `<div class="extra${incluso ? " incluso" : ""}">
        <label><input type="checkbox" data-extra="${k}" ${incluso ? "disabled" : ""}>
          <span>${escapa(nomeExtra(e.nome))}<span class="qtd">${incluso ? "Já incluso nesta revisão" : `${tipo}${e.filtroAC ? ` · cód. ${escapa(e.codigo)}` : ""} · ${reais.format(e.valor)}${e.qtd_max === 2 ? " · até 2" : ""}`}</span></span></label>
        <input type="number" class="extra-qtd" data-qtd="${k}" min="1" max="${e.qtd_max}" value="1" disabled aria-label="Quantidade">
        <span class="v" data-linha="${k}"></span>
      </div>`;
  }).join("");
  document.getElementById("orc-avulsos").innerHTML = "";
  ["desc-pecas", "desc-mo"].forEach(id => { document.getElementById(id).value = ""; document.getElementById(id + "-un").value = "R$"; });
  recalcula();
  janelaOrc.hidden = false;
  janelaOrc.querySelector(".orc-form").scrollTop = 0;
}
function fechaOrcamento() { janelaOrc.hidden = true; }

// Lê a tela e devolve todas as contas (base para o resumo, o texto e o e-mail)
function calculaOrcamento() {
  const { r } = orc;
  const linhas = [];
  janelaOrc.querySelectorAll("[data-extra]").forEach(cx => {
    const k = Number(cx.dataset.extra), e = orc.lista[k];
    const campoQtd = janelaOrc.querySelector(`[data-qtd="${k}"]`);
    campoQtd.disabled = !cx.checked;
    if (!cx.checked) return;
    const qtd = Math.max(1, Math.min(e.qtd_max, Math.round(Number(campoQtd.value) || 1)));
    if (campoQtd.value !== "" && Number(campoQtd.value) !== qtd) campoQtd.value = qtd;  // retífica: no máximo 2 pares
    linhas.push({ codigo: e.codigo, nome: nomeExtra(e.nome), qtd, unit: e.valor, total: centavos(qtd * e.valor), tipo: e.tipo, k });
  });
  janelaOrc.querySelectorAll(".avulso").forEach(div => {
    const nome = div.querySelector(".av-nome").value.trim();
    const valor = lerNumero(div.querySelector(".av-valor").value);
    if (nome && valor) linhas.push({ codigo: "", nome, qtd: 1, unit: valor, total: centavos(valor), tipo: div.querySelector(".av-tipo").value });
  });
  const soma = tipo => centavos(linhas.filter(l => l.tipo === tipo).reduce((s, l) => s + l.total, 0));
  const pecas = centavos(r.pecas + soma("peca"));
  const mo = centavos(r.mao_de_obra + soma("mao_de_obra"));
  // Desconto em R$ ou %, nunca maior que o próprio grupo
  const desconto = (id, base) => {
    const v = lerNumero(document.getElementById(id).value);
    const reaisDesc = document.getElementById(id + "-un").value === "%" ? base * v / 100 : v;
    return centavos(Math.min(base, reaisDesc));
  };
  const descPecas = desconto("desc-pecas", pecas);
  const descMo = desconto("desc-mo", mo);
  const pct = (d, base) => base > 0 ? d / base * 100 : 0;
  return {
    linhas, pecas, mo, descPecas, descMo, descTotal: centavos(descPecas + descMo),
    pctPecas: pct(descPecas, pecas), pctMo: pct(descMo, mo),
    total: centavos(pecas - descPecas + mo - descMo),
  };
}

function recalcula() {
  const c = calculaOrcamento();
  janelaOrc.querySelectorAll("[data-linha]").forEach(s => {
    const l = c.linhas.find(x => x.k === Number(s.dataset.linha));
    s.textContent = l ? reais.format(l.total) : "";
  });
  const pct = p => `${p.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
  const linha = (rotulo, valor, classe = "") => `<div class="item ${classe}"><span>${rotulo}</span><span class="v">${valor}</span></div>`;
  document.getElementById("orc-contas").innerHTML = [
    linha("Revisão", reais.format(orc.r.total)),
    c.linhas.length ? linha(`Adicionais (${c.linhas.length})`, reais.format(centavos(c.linhas.reduce((s, l) => s + l.total, 0)))) : "",
    linha("Peças", reais.format(c.pecas)),
    linha("Mão de obra", reais.format(c.mo)),
    c.descPecas ? linha(`Desconto em peças (${pct(c.pctPecas)})`, "– " + reais.format(c.descPecas)) : "",
    c.descMo ? linha(`Desconto em mão de obra (${pct(c.pctMo)})`, "– " + reais.format(c.descMo)) : "",
    linha("Total", reais.format(c.total), "orc-total"),
  ].join("");
  // PRD 3.5: avisa, mas não bloqueia
  const acima = [];
  // Compara em centavos: 10% de R$ 2.355,08 = R$ 235,51 (arredondado) não pode acusar "acima de 10%"
  if (c.descPecas > centavos(c.pecas * LIMITE_DESC.pecas / 100)) acima.push(`peças ${pct(c.pctPecas)} (limite ${LIMITE_DESC.pecas}%)`);
  if (c.descMo > centavos(c.mo * LIMITE_DESC.mo / 100)) acima.push(`mão de obra ${pct(c.pctMo)} (limite ${LIMITE_DESC.mo}%)`);
  const aviso = document.getElementById("orc-aviso");
  aviso.hidden = !acima.length;
  aviso.innerHTML = `<strong>Desconto acima do permitido: precisa de aprovação do gerente.</strong><br>${acima.join(" · ")}`;
  document.getElementById("orc-pagamento").innerHTML = textoPagamento(c.total);
}

function novoAvulso() {
  const div = document.createElement("div");
  div.className = "avulso";
  div.innerHTML = `<input class="av-nome" type="text" placeholder="Descrição (ex.: palheta do limpador)" aria-label="Descrição do item avulso">
    <input class="av-valor" type="text" inputmode="decimal" placeholder="Valor R$" aria-label="Valor do item avulso">
    <select class="av-tipo" aria-label="Tipo do item avulso"><option value="peca">Peça</option><option value="mao_de_obra">Mão de obra</option></select>
    <button type="button" class="av-tirar" aria-label="Remover item avulso">&times;</button>`;
  document.getElementById("orc-avulsos").appendChild(div);
  div.querySelector(".av-nome").focus();
}

janelaOrc.addEventListener("input", recalcula);
janelaOrc.addEventListener("change", recalcula);
janelaOrc.addEventListener("click", e => {
  if (e.target === janelaOrc || e.target.closest("[data-fechar-orc]")) return fechaOrcamento();
  const tirar = e.target.closest(".av-tirar");
  if (tirar) { tirar.parentElement.remove(); recalcula(); }
});
document.getElementById("orc-add-avulso").addEventListener("click", novoAvulso);
document.getElementById("orc-texto").addEventListener("click", () =>
  abreJanela(textoCliente(orc.m, orc.r, calculaOrcamento()), "ORÇAMENTO"));

// E-mail ao agendamento: abre o programa de e-mail do PC (sem servidor). Nada fica guardado.
// Texto curto de propósito: endereços mailto muito longos podem ser cortados pelo Windows.
document.getElementById("orc-email").addEventListener("click", () => {
  const { m, r } = orc, c = calculaOrcamento();
  const corpo = [
    "Cliente fechou a revisão. Favor agendar no NBS.",
    "",
    "Cliente: ",
    "Telefone: ",
    "Placa: ",
    "Consultor: ",
    "",
    `Veículo: ${m.nome} (${anosTexto(m)})`,
    `Revisão: ${r.numero}ª revisão – ${numero.format(r.km)} km`,
    `Valor da revisão: ${reais.format(r.total)}`,
    ...(c.linhas.length ? ["Adicionais:", ...c.linhas.map(l =>
      `- ${l.nome}${l.qtd > 1 ? ` (${numero.format(l.qtd)}x)` : ""}: ${reais.format(l.total)}`)] : []),
    ...(c.descPecas ? [`Desconto em peças: ${reais.format(c.descPecas)}`] : []),
    ...(c.descMo ? [`Desconto em mão de obra: ${reais.format(c.descMo)}`] : []),
    `Total: ${reais.format(c.total)}`,
    `Pagamento: ${pagamentoSimples(c.total)}`,
    `Orçamento válido até ${dataValidade()}`,
  ].join("\r\n");
  const assunto = `Agendar revisão – ${m.nome} – ${r.numero}ª revisão`;
  location.href = `mailto:${EMAIL_AGENDAMENTO}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
});

// ---------- comparar dois modelos (PRD 3.7): só valores base, por revisão ----------
const rotuloModelo = m => `${m.nome} · ${anosTexto(m)}`;

function abreComparar(a) {
  const area = document.getElementById("comparacao");
  area.innerHTML = `<section class="comparar">
      <div class="comparar-cab">
        <label for="comparar-campo" class="busca-rotulo">Comparar ${escapa(a.nome)} com:</label>
        <button type="button" class="fechar" aria-label="Fechar comparação" id="fechar-comparar">&times;</button>
      </div>
      <input id="comparar-campo" class="comparar-campo" list="comparar-lista" autocomplete="off"
             placeholder="Digite o outro modelo e escolha na lista">
      <datalist id="comparar-lista">${MODELOS.filter(m => m !== a).map(m => `<option value="${escapa(rotuloModelo(m))}">`).join("")}</datalist>
      <div id="comparar-tabela"></div>
    </section>`;
  const entrada = document.getElementById("comparar-campo");
  const escolher = () => {
    const txt = entrada.value.trim();
    const b = MODELOS.find(m => m !== a && rotuloModelo(m) === txt) || (txt ? busca(txt).find(m => m !== a) : null);
    if (b) { entrada.value = rotuloModelo(b); tabelaComparar(a, b); }
  };
  entrada.addEventListener("change", escolher);
  entrada.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); escolher(); } });
  document.getElementById("fechar-comparar").addEventListener("click", () => { area.innerHTML = ""; });
  entrada.focus();
}

function tabelaComparar(a, b) {
  const nums = [...new Set([...a.revisoes, ...b.revisoes].map(r => r.numero))].sort((x, y) => x - y);
  const cel = (m, n) => {
    const r = m.revisoes.find(x => x.numero === n);
    return r ? `<td><strong>${reais.format(r.total)}</strong><span class="qtd">${numero.format(r.km)} km</span></td>` : "<td>—</td>";
  };
  const dif = n => {
    const ra = a.revisoes.find(x => x.numero === n), rb = b.revisoes.find(x => x.numero === n);
    if (!ra || !rb) return "<td>—</td>";
    const d = centavos(rb.total - ra.total);
    return `<td>${d === 0 ? "igual" : (d > 0 ? "+ " : "– ") + reais.format(Math.abs(d))}</td>`;
  };
  document.getElementById("comparar-tabela").innerHTML = `<table class="tabela-comparar">
      <thead><tr><th>Revisão</th><th>${escapa(a.nome)}<span class="qtd">${anosTexto(a)}</span></th>
        <th>${escapa(b.nome)}<span class="qtd">${anosTexto(b)}</span></th><th>Diferença<span class="qtd">2º − 1º</span></th></tr></thead>
      <tbody>${nums.map(n => `<tr><th>${n}ª</th>${cel(a, n)}${cel(b, n)}${dif(n)}</tr>`).join("")}</tbody>
    </table>
    ${a.referencia_antiga || b.referencia_antiga ? '<p class="especiais-nota">Modelo de referência antiga: confirmar valor com a oficina.</p>' : ""}`;
}

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
  (nome === "garantia" ? document.getElementById("campo-garantia") : campo).focus();
}
document.querySelectorAll(".aba").forEach(b => b.addEventListener("click", () => trocaAba(b.dataset.aba)));

// ================= ABA GARANTIA (Fase G2, PRD 3.11 e 3.12) =================
// Regras de data/garantia.js, montadas pelo Claude a partir dos livretos. A página não inventa nada:
// sem regra → "Não encontrado no manual: consultar a garantia (Cleidiane)".
const GAR = window.DADOS_GARANTIA || { itens: [], modelos: {}, livretos: {} };
const campoG = document.getElementById("campo-garantia");
const listaG = document.getElementById("sugestoes-garantia");
const resultadoG = document.getElementById("resultado-garantia");
const NAO_ENCONTRADO = `Não encontrado no manual: consultar a garantia (${CONTATO}).`;
const SUJEITO = "Sujeito à análise técnica da Kia.";
const PAG4 = ["bateria12", "amortecedor", "rodas", "pneus", "vidros", "audio", "gas_ar"];  // itens da pág. 4 dos livretos

// Sinônimos sem acento, do maior para o menor: "bateria 48v" ganha de "bateria"
const SINONIMOS = GAR.itens.flatMap(it => [it.nome, ...(it.sinonimos || [])].map(s => ({ s: normaliza(s), id: it.id })))
  .sort((a, b) => b.s.length - a.s.length);

// Separa o texto digitado em item (pelos sinônimos) e o resto (modelo/ano)
function separaItem(texto) {
  let t = ` ${normaliza(texto).replace(/[-_]/g, " ")} `;
  for (const { s, id } of SINONIMOS) {
    const alvo = ` ${s.replace(/[-_]/g, " ")} `;
    if (t.includes(alvo)) return { item: id, resto: t.replace(alvo, " ").trim(), achou: s };
  }
  return { item: null, resto: t.trim() };
}

const motorizacaoTexto = { combustao: "Flex/gasolina", diesel: "Diesel", hibrido: "Híbrido", eletrico: "Elétrico" };
const nomeLivreto = id => (GAR.livretos[id] || id || "").replace("Manual de Garantia e Manutenção ", "");
const codLivreto = id => String(id).replace(/-/g, " ").replace("G5 261 MQ4", "G5 261 - MQ4");

// semLimite: só a garantia geral diz "sem limite de km"; item sem km (ex.: vidros, 3 meses) fica só no tempo
function prazoTexto(meses, km, semLimite = false) {
  // 12 meses fica em meses, como no livreto; a partir de 24, em anos
  const tempo = meses == null ? "" : meses >= 24 && meses % 12 === 0 ? `${meses / 12} anos` : `${meses} meses`;
  if (km == null) return semLimite ? `${tempo}, sem limite de km` : tempo;
  return `${tempo} ou ${numero.format(km)} km, o que ocorrer primeiro`;
}

// Soma meses sem "pular" o mês: venda em 29/02 + 12 meses vence em 28/02, não em 01/03
function somaMeses(iso, meses) {
  const [a, m, d] = iso.split("-").map(Number);
  const ultimoDia = new Date(a, m - 1 + meses + 1, 0).getDate();
  return new Date(a, m - 1 + meses, Math.min(d, ultimoDia));
}

// Situação pela data da venda e km atual (campos opcionais)
function situacao(meses, km, venda, kmAtual) {
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  // só o km já basta para dizer "fora" quando passou do limite
  if (!venda) return km != null && kmAtual != null && kmAtual > km
    ? { ok: false, texto: `Fora da garantia: passou de ${numero.format(km)} km.` } : null;
  if (meses == null) return null;
  if (new Date(venda + "T00:00") > hoje) return { ok: false, texto: "Data da venda no futuro: confira a data digitada." };
  const vence = somaMeses(venda, meses);
  const porData = hoje <= vence;
  const porKm = km == null || kmAtual == null || kmAtual <= km;
  const venceTxt = `${vence.toLocaleDateString("pt-BR")}${km != null ? ` ou ${numero.format(km)} km` : ""}`;
  if (porData && porKm) return { ok: true, texto: `Dentro da garantia: vence em ${venceTxt}${km != null && kmAtual == null ? " (informe o km atual para confirmar)" : ""}.` };
  return { ok: false, texto: `Fora da garantia: ${!porData ? `venceu em ${vence.toLocaleDateString("pt-BR")}` : `passou de ${numero.format(km)} km`}.` };
}

// Regra geral que vale para a data da venda (modelos atuais têm uma regra a partir de 01/2025 e outra antes)
function regraGeral(g, venda) {
  const regras = g.geral || [];
  if (!venda) return regras;
  return regras.filter(r => (!r.vendido_desde || venda >= r.vendido_desde) && (!r.vendido_ate || venda <= r.vendido_ate));
}

function fonteTexto(livreto, pag) {
  if (!livreto) return "";
  if (livreto === "CONF-STERN") return "Fonte: garantia Stern (livreto da época não disponível)";
  if (livreto === "SITE-KIA") return "Fonte: kia.com.br/garantia (resumo da página; livreto deste modelo não disponível)";
  return `Fonte: livreto ${codLivreto(livreto)}${pag ? `, pág. ${pag}` : ""}`;
}

// Monta a regra do item para o modelo: texto do livreto do modelo, ou o texto comum a todos os livretos
function regraItem(m, it) {
  const g = GAR.modelos[m.id] || {};
  if (it.so_motorizacao && !it.so_motorizacao.includes(m.motorizacao)) return null;
  if (it.id === "bateria_alta") {
    const b = g.bateria_alta;
    return b ? { meses: b.meses, km: b.km, trecho: b.trecho, livreto: b.livreto, pag: b.pag, condicoes: it.condicoes } : null;
  }
  let livreto = g.livreto, comum = !livreto;
  if (livreto && PAG4.includes(it.id) && GAR.pag4_substituto && GAR.pag4_substituto[livreto]) livreto = GAR.pag4_substituto[livreto];
  const extra = (livreto && it.por_livreto && it.por_livreto[livreto]) || {};
  const r = { ...it, ...extra, livreto, comum };
  if (it.tipo === "geral") {
    const regras = g.geral || [];
    r.regras = regras;
  }
  return r;
}

// ---------- busca da garantia ----------
let marcadaG = -1, atuaisG = [], itemDigitado = null, textoItem = "", problemaDesconhecido = "";

function mostraSugestoesG() {
  const { item, resto, achou } = separaItem(campoG.value);
  itemDigitado = item;
  textoItem = achou || "";
  problemaDesconhecido = "";
  atuaisG = resto ? busca(resto).slice(0, 12) : [];
  // Problema que não está no dicionário ("sportage barulho estranho"): acha o modelo pelas primeiras palavras
  // e guarda o resto para mostrar "Não encontrado no manual"
  if (!atuaisG.length && resto) {
    const palavras = resto.split(/\s+/);
    for (let n = palavras.length - 1; n > 0 && !atuaisG.length; n--) {
      atuaisG = busca(palavras.slice(0, n).join(" ")).slice(0, 12);
      if (atuaisG.length) problemaDesconhecido = palavras.slice(n).join(" ");
    }
  }
  marcadaG = atuaisG.length ? 0 : -1;
  if (!campoG.value.trim()) { listaG.hidden = true; return; }
  const rotItem = item ? ` · ${escapa(GAR.itens.find(i => i.id === item).nome)}` : "";
  listaG.innerHTML = atuaisG.length
    ? atuaisG.map((m, i) => `<li role="option" data-i="${i}" class="${i === 0 ? "marcada" : ""}">
        <span>${escapa(m.nome)}<span class="anos">${rotItem}</span></span><span class="anos">${anosTexto(m)}</span></li>`).join("")
    : `<li class="vazio">${resto ? "Nenhum modelo com esse nome." : "Digite também o modelo."}</li>`;
  listaG.hidden = false;
}

function escolheG(m) {
  listaG.hidden = true;
  const problema = problemaDesconhecido;
  campoG.value = `${m.nome}${itemDigitado ? " " + textoItem : problema ? " " + problema : ""}`;
  mostraGarantia(m, itemDigitado);
  if (problema && !itemDigitado) {  // mostra o aviso de "não encontrado" no filtro da tela do modelo
    const f = document.getElementById("g-filtro");
    f.value = problema; f.dispatchEvent(new Event("input"));
  }
}

campoG.addEventListener("input", mostraSugestoesG);
campoG.addEventListener("focus", () => { if (campoG.value.trim()) mostraSugestoesG(); });
campoG.addEventListener("keydown", e => {
  const itens = listaG.querySelectorAll("li[data-i]");
  const marcaG = i => {
    if (!itens.length) return;
    marcadaG = (i + itens.length) % itens.length;
    itens.forEach((li, k) => li.classList.toggle("marcada", k === marcadaG));
  };
  if (e.key === "ArrowDown") { e.preventDefault(); marcaG(marcadaG + 1); }
  else if (e.key === "ArrowUp") { e.preventDefault(); marcaG(marcadaG - 1); }
  else if (e.key === "Enter") { e.preventDefault(); if (atuaisG[marcadaG]) escolheG(atuaisG[marcadaG]); }
  else if (e.key === "Escape") { campoG.value = ""; listaG.hidden = true; resultadoG.innerHTML = ""; mostraInicioG(); }
});
listaG.addEventListener("mousedown", e => {
  const li = e.target.closest("li[data-i]");
  if (li) { e.preventDefault(); escolheG(atuaisG[Number(li.dataset.i)]); }
});
document.addEventListener("click", e => { if (!e.target.closest("#busca-garantia")) listaG.hidden = true; });

function mostraInicioG() {
  resultadoG.innerHTML = `<p class="inicio">Digite o modelo e, se quiser, a peça ou o problema.
    Ex.: <strong>"sportage 2023 amortecedor"</strong>, <strong>"niro bateria"</strong>, <strong>"bongo revisão atrasada"</strong>.</p>`;
}

// ---------- tela do modelo ----------
let gm = null;  // estado da tela: { m, item, venda, km, emDia }

function mostraGarantia(m, itemId) {
  const g = GAR.modelos[m.id] || {};
  gm = { m, item: itemId || "geral", venda: "", km: null, emDia: null };
  const livreto = g.livreto ? `Livreto ${codLivreto(g.livreto)}` : "Livreto de garantia deste modelo não disponível";
  const itens = GAR.itens.filter(it => regraItem(m, it));
  resultadoG.innerHTML = `
    <section class="modelo">
      <div>
        <h1 class="modelo-nome">${escapa(m.nome)}</h1>
        <div class="modelo-anos">${anosTexto(m)} · ${motorizacaoTexto[m.motorizacao] || ""} · ${livreto}</div>
        ${!g.livreto ? '<span class="selo">Regras comuns aos livretos Kia: confirmar com a garantia</span>' : ""}
      </div>
    </section>
    <div class="g-grade">
      <div>
        <!-- peça/problema primeiro: é a pergunta principal do balcão -->
        <div class="g-bloco">
          <div class="grupo"><span>Peça ou problema</span></div>
          <input type="text" id="g-filtro" class="g-filtro" placeholder="Filtrar, ex.: vidro, bateria, pastilha" autocomplete="off">
          <div class="g-itens">${itens.map(it => `<button type="button" class="g-item" data-item="${it.id}">${escapa(it.nome)}</button>`).join("")}</div>
          <div id="g-nada" class="g-nada" hidden>${escapa(NAO_ENCONTRADO)}</div>
        </div>
        <div class="g-bloco">
          <div class="grupo"><span>Situação do veículo</span><span>opcional</span></div>
          <div class="g-campos">
            <label>Data da venda<input type="date" id="g-venda"></label>
            <label>Km atual<input type="text" inputmode="numeric" id="g-km" placeholder="ex.: 35000"></label>
          </div>
        </div>
        <div class="g-bloco">
          <div class="grupo"><span>Revisões em dia na rede Kia?</span></div>
          <div class="g-opcoes" role="group">
            <button type="button" data-emdia="sim">Sim</button>
            <button type="button" data-emdia="nao">Não</button>
            <button type="button" data-emdia="naosei">Não sei</button>
          </div>
          <div id="g-revisao"></div>
        </div>
      </div>
      <div>
        <div id="g-resposta"></div>
        <button type="button" class="botao" id="g-copiar">Copiar para o cliente</button>
        <p class="g-sujeito">${SUJEITO}</p>
      </div>
    </div>`;

  resultadoG.querySelectorAll(".g-item").forEach(b => b.addEventListener("click", () => { gm.item = b.dataset.item; atualizaG(); }));
  resultadoG.querySelectorAll("[data-emdia]").forEach(b => b.addEventListener("click", () => { gm.emDia = b.dataset.emdia; atualizaG(); }));
  document.getElementById("g-venda").addEventListener("input", e => { gm.venda = e.target.value; atualizaG(); });
  document.getElementById("g-km").addEventListener("input", e => {
    const v = Number(String(e.target.value).replace(/\D/g, ""));
    gm.km = e.target.value.trim() && Number.isFinite(v) ? v : null; atualizaG();
  });
  // Filtro: o mesmo dicionário de sinônimos do campo de busca
  document.getElementById("g-filtro").addEventListener("input", e => {
    const t = e.target.value.trim();
    const achado = t ? separaItem(t).item : null;
    const disponivel = achado && itens.some(it => it.id === achado);
    document.getElementById("g-nada").hidden = !t || disponivel;
    if (disponivel) { gm.item = achado; atualizaG(); }
  });
  document.getElementById("g-copiar").addEventListener("click", async () => {
    const texto = textoGarantiaCliente();
    abreJanela(texto, "GARANTIA");
  });
  if (itemId && !itens.some(it => it.id === itemId)) gm.item = "geral";
  atualizaG();
}

// Resposta do item escolhido + revisões
function atualizaG() {
  const { m } = gm;
  const g = GAR.modelos[m.id] || {};
  const it = GAR.itens.find(i => i.id === gm.item);
  const r = regraItem(m, it);
  resultadoG.querySelectorAll(".g-item").forEach(b => b.classList.toggle("ativo", b.dataset.item === gm.item));
  resultadoG.querySelectorAll("[data-emdia]").forEach(b => b.classList.toggle("ativo", b.dataset.emdia === gm.emDia));
  gm.resposta = respostaItem(m, g, it, r);
  document.getElementById("g-resposta").innerHTML = gm.resposta.html;

  // Revisões: intervalo do modelo + aviso quando não estão em dia (PRD 3.12)
  const rv = g.revisoes || {};
  const intervalo = rv.km ? `Revisões a cada ${numero.format(rv.km)} km${rv.meses ? ` ou ${rv.meses} meses, o que ocorrer primeiro` : ""}` +
    (rv.tol_km ? ` (tolerância ±${numero.format(rv.tol_km)} km ou ±${rv.tol_meses} mês)` : "") +
    (rv.livreto ? `. ${fonteTexto(rv.livreto, rv.pag)}.` : ". Prazo em meses e tolerância não cadastrados (sem livreto).") : "";
  const aviso = gm.emDia === "nao" || gm.emDia === "naosei"
    ? `<div class="aviso-desconto"><strong>Garantia pode ser negada: verificar histórico de revisões.</strong><br>
        <em>"${escapa(rv.trecho || GAR.itens.find(i => i.id === "perda").trecho)}"</em>
        <br><small>${rv.livreto ? `Livreto ${escapa(codLivreto(rv.livreto))}, pág. 10` : "Texto igual em todos os livretos Kia disponíveis (pág. 6)"}</small></div>` : "";
  document.getElementById("g-revisao").innerHTML = `<p class="g-nota">${escapa(intervalo)}</p>${aviso}`;
}

function respostaItem(m, g, it, r) {
  const cab = `<div class="grupo"><span>${escapa(it.nome)}</span></div>`;
  if (!r) return { html: cab + `<p class="g-nada">${escapa(NAO_ENCONTRADO)}</p>`, prazo: null };
  let prazo = "", sit = null, fonte = fonteTexto(r.livreto, r.pag), trecho = r.trecho || "", extra = "";
  if (it.tipo === "geral") {
    const validas = regraGeral(g, gm.venda);
    if (!validas.length) {
      prazo = gm.venda ? "Regra para a data dessa venda não cadastrada." : "";
      extra = `<p class="g-nada">${escapa(NAO_ENCONTRADO)}</p>`;
      if (!gm.venda) extra = "";
    }
    const linhas = (gm.venda ? validas : (g.geral || [])).map(x => {
      const cond = x.vendido_desde ? ` (vendido a partir de ${dataBR(x.vendido_desde)})` : x.vendido_ate ? ` (vendido até ${dataBR(x.vendido_ate)})` : "";
      return `<div class="g-prazo">${prazoTexto(x.meses, x.km, true)}${cond}</div>
        <blockquote>"${escapa(x.trecho)}"</blockquote><div class="g-fonte">${escapa(fonteTexto(x.livreto, x.pag))}</div>`;
    }).join("");
    if (validas.length === 1) sit = situacao(validas[0].meses, validas[0].km, gm.venda, gm.km);
    const unica = gm.venda && validas.length === 1 ? validas[0] : (g.geral || []).length === 1 ? g.geral[0] : null;
    return {
      html: cab + (prazo ? `<div class="g-prazo">${escapa(prazo)}</div>` : "") + linhas + extra +
        `<p class="g-cond">${escapa(it.condicoes)}</p><p class="g-cond"><strong>Não cobre:</strong> ${escapa(it.nao_cobre)}</p>` + htmlSituacao(sit),
      // sem data da venda e com duas regras (antes/depois de 01/2025): o texto leva as duas
      prazo: unica ? prazoTexto(unica.meses, unica.km, true) : (g.geral || []).map(x => `${prazoTexto(x.meses, x.km, true)}${x.vendido_desde ? ` (vendido a partir de ${dataBR(x.vendido_desde)})` : x.vendido_ate ? ` (vendido até ${dataBR(x.vendido_ate)})` : ""}`).join("; ") || null,
      trecho: unica ? unica.trecho : it.trecho,
      fonte: unica ? fonteTexto(unica.livreto, unica.pag) : "", sit, comum: false,
    };
  }
  if (r.meses != null) {
    prazo = prazoTexto(r.meses, r.km);
    sit = situacao(r.meses, r.km, gm.venda, gm.km);
  } else if (it.tipo === "fabricante") prazo = "Garantia do fabricante do pneu";
  else if (it.tipo === "condicional") prazo = "Só se vier de defeito coberto pela garantia";
  else if (it.tipo === "nao_coberto") prazo = "Não coberto pela garantia";
  else if (it.tipo === "perda") prazo = "Pode excluir o veículo da garantia";
  if (it.id === "pecas") sit = null;  // conta da nota fiscal da peça, não da venda do carro
  if (r.comum) fonte = `Texto igual em todos os livretos Kia disponíveis (pág. ${r.pag}); o livreto deste modelo não está disponível: confirmar com a garantia`;
  if (r.comum && it.id === "pecas") extra = `<p class="g-cond">Nos livretos de 2025/2026 a peça instalada na concessionária Kia tem 12 meses; nos anteriores, 90 dias. Confirmar com a garantia.</p>`;
  const html = cab + `<div class="g-prazo">${escapa(prazo)}</div>
    <blockquote>"${escapa(trecho)}"</blockquote><div class="g-fonte">${escapa(fonte)}</div>
    ${r.nota ? `<p class="g-cond"><em>${escapa(r.nota)}</em></p>` : ""}
    <p class="g-cond">${escapa(r.condicoes || "")}</p>
    ${r.nao_cobre ? `<p class="g-cond"><strong>Não cobre:</strong> ${escapa(r.nao_cobre)}</p>` : ""}${extra}${htmlSituacao(sit)}`;
  return { html, prazo, trecho, fonte, sit, comum: r.comum };
}

function htmlSituacao(sit) {
  if (!sit) return "";
  return `<div class="g-situacao ${sit.ok ? "ok" : "fora"}">${escapa(sit.texto)}<br><small>${SUJEITO}</small></div>`;
}

// Texto para o cliente (PRD 3.12): saudação, regra oficial, situação, página do livreto e assinatura
function textoGarantiaCliente() {
  const { m } = gm;
  const it = GAR.itens.find(i => i.id === gm.item);
  const r = gm.resposta;
  return [
    "Olá! Segue a informação sobre a garantia do seu Kia:",
    "",
    `*Veículo:* ${m.nome} (${anosTexto(m)})`,
    `*Item:* ${it.nome}`,
    ...(r.prazo ? [`*Garantia:* ${r.prazo}.`] : []),
    ...(r.trecho ? ["", `*Regra oficial:* "${r.trecho}"`] : []),
    ...(r.fonte ? [`(${r.fonte.replace(/^Fonte: livreto /, "conforme o Manual de Garantia e Manutenção Kia ").replace("pág.", "página")})`] : []),
    ...(r.sit ? ["", `*Situação:* ${r.sit.texto}`] : []),
    "",
    "A garantia depende das revisões em dia na rede Kia. " + SUJEITO,
    "",
    "Stern Kia – Pós-venda",
  ].join("\n");
}

// ---------- PIN (Fase 4, PRD 3.1) ----------
// O repositório é público: o PIN não fica escrito aqui, só uma "impressão digital" (hash FNV-1a) dele.
// Só evita acesso casual; quem souber mexer no código passa. Lembrado no navegador; sem limite de tentativas.
const PIN_HASH = "4e1108fc";
const CHAVE_PIN = "kia-stern-pin";
function hashPin(txt) {
  let h = 0x811c9dc5;
  for (const c of new TextEncoder().encode("stern-kia:" + txt)) h = Math.imul(h ^ c, 0x01000193) >>> 0;
  return h.toString(16).padStart(8, "0");
}
function pinLembrado() {
  try { return localStorage.getItem(CHAVE_PIN) === PIN_HASH; } catch { return false; }
}
const telaPin = document.getElementById("tela-pin");
const campoPin = document.getElementById("campo-pin");
document.getElementById("form-pin").addEventListener("submit", e => {
  e.preventDefault();
  if (hashPin(campoPin.value.trim()) === PIN_HASH) {
    try { localStorage.setItem(CHAVE_PIN, PIN_HASH); } catch { /* sem armazenamento: vale só nesta visita */ }
    telaPin.hidden = true;
    campo.focus();
  } else {
    document.getElementById("erro-pin").hidden = false;
    campoPin.select();
  }
});

// ---------- início ----------
document.getElementById("data-tabela").textContent = `Tabela atualizada em ${dataBR(DADOS.data_tabela)}`;
if (GAR.data_regras) document.getElementById("data-garantia").textContent = `Regras de garantia atualizadas em ${dataBR(GAR.data_regras)}`;
mostraInicio();
mostraInicioG();
if (pinLembrado()) campo.focus();
else { telaPin.hidden = false; campoPin.focus(); }
