"""
Converte a planilha Stern de revisões em data/revisoes.json e o catálogo de
agregados (CSV) em data/extras.json. Gera ferramentas/divergencias.md.

Regra principal (CLAUDE.md): o valor de cada revisão é SEMPRE recalculado a
partir do detalhe das peças (preço unitário x quantidade), nunca dos totais
digitados nas linhas de cima. Diferenças viram linhas no relatório.

Uso:
    python ferramentas/excel_para_json.py [planilha.xlsx] [agregados.csv]
"""
import csv
import json
import math
import re
import sys
import unicodedata
import warnings
from datetime import date
from pathlib import Path

import openpyxl
from openpyxl.utils import column_index_from_string, get_column_letter

warnings.filterwarnings("ignore")  # avisos do openpyxl sobre desenhos/formatação

RAIZ = Path(__file__).resolve().parent.parent
# Cópia da planilha da Cleidiane de 06/11 15h13 + aba Tasman + 2 correções do Sorento 2.2D (o original dela não é alterado)
PLANILHA_PADRAO = RAIZ / "fonte/cleidiane-2026-11-06-1513/Menu revisão atualizado (STERN) 2026-11-06 - com TASMAN.xlsx"
CSV_PADRAO = RAIZ / "fonte/agregados-leonardo-2026-11-12/AGREGADOS-transcrito.csv"  # planilha de 12/11/2026: +2 itens de polimento
DATA_TABELA = "2026-09-21"  # preços de setembro/2026 (decisão do Leonardo, 06/11/2026)

# Abas que não são modelos
ABAS_IGNORADAS = {"TABELA AGREGADOS", "PLAN1", "PLAN2", "PLAN3", "PLAN4", "TABELAS"}
# Abas antigas: entram com o selo "Referência antiga" (regra 7)
ABAS_ANTIGAS = {"CERATO_KOUP_10_15_", "NEW_BONGO_2500", "_SPORTAGE_2_0_2WD_05_14",
                "BONGOK2700_4X4", "BONGOK2700", "BONGOK2500_05_14"}
TOLERANCIA = 0.01  # diferença em R$ aceita como "igual"
PARCELA_MINIMA = 500.0  # regra da Stern: parcela mínima de R$ 500, até 3x sem juros (Leonardo, 09/11/2026)
PARCELAS_MAX = 3


def parcelas_de(total):
    """Quantas parcelas cabem sem passar da parcela mínima (1 = só à vista)."""
    return max(1, min(PARCELAS_MAX, int(total // PARCELA_MINIMA)))


def normaliza(txt):
    """Maiúsculas, sem acento e sem espaços extras (para comparar rótulos)."""
    if txt is None:
        return ""
    s = unicodedata.normalize("NFKD", str(txt))
    s = "".join(c for c in s if not unicodedata.combining(c))
    return re.sub(r"\s+", " ", s).strip().upper()


def num(v):
    """Converte célula em número; texto/vazio vira None."""
    if isinstance(v, bool):
        return None
    if isinstance(v, (int, float)):
        return float(v)
    if isinstance(v, str) and re.fullmatch(r"\s*\d+(,\d+)?\s*", v):
        return float(v.replace(",", "."))  # número digitado como texto, ex.: '1,00'
    return None


def arred(v):
    return round(v + 1e-9, 2)


def litros_oleo(qtd, aba):
    """Regra do óleo: sempre para cima, exceto fração ,1 (para baixo). Bongo K2500 = 8 L."""
    if "K2500" in normaliza(aba) and normaliza(aba) not in ABAS_ANTIGAS:
        return 8.0
    base = math.floor(qtd + 1e-9)
    frac = round(qtd - base, 2)
    if frac == 0:
        return float(base)
    if frac <= 0.1:
        return float(base)
    return float(base + 1)


def km_de(txt, anterior):
    """'10.000 km' -> 10000. Corrige erros de digitação como '100.00km'."""
    if isinstance(txt, (int, float)):
        km = int(txt)
    else:
        dig = re.sub(r"\D", "", str(txt or ""))
        if not dig:
            return None
        km = int(dig)
    if km <= 0:
        return None
    # corrige zeros faltando ('100.00km' depois de 80.000), no máximo 2 vezes
    for _ in range(2):
        if anterior and km <= anterior:
            km *= 10
    return km if not anterior or km > anterior else None


REF = re.compile(r"^=\s*\$?([A-Z]{1,3})\$?(\d+)\s*$")


class Aba:
    """Lê uma aba de modelo: rótulos, colunas de revisão e bloco de detalhe."""

    def __init__(self, ws_f, ws_v):
        self.f, self.v, self.nome = ws_f, ws_v, ws_f.title
        self.avisos = []
        self._cache = {}
        self._acha_rotulos()
        self._acha_detalhe()

    # ---------- localização ----------
    def _acha_rotulos(self):
        self.rot = {}
        for r in range(1, min(self.f.max_row, 120) + 1):
            for c in range(1, 5):
                t = normaliza(self.f.cell(r, c).value)
                if not t:
                    continue
                chave = None
                if t == "DESCRICAO":
                    chave = "desc"
                elif t == "PECAS":
                    chave = "pecas"
                elif t == "TEMPO":
                    chave = "tempo"
                elif t.startswith("MAO OBRA") or t.startswith("MAO DE OBRA"):
                    chave = "mo"
                elif t == "VALOR TABELA KIA":
                    chave = "total"
                elif t == "TOTAL" and "total" not in self.rot:
                    chave = "total"
                elif t.startswith("PARCELAMENTO"):
                    chave = "parcelamento"
                if chave and chave not in self.rot:
                    self.rot[chave] = (r, c)
        if "pecas" not in self.rot:
            raise ValueError("linha PEÇAS não encontrada")
        self.col_rot = self.rot["pecas"][1]
        # linha dos km: a do rótulo DESCRIÇÃO ou, sem ele, a linha acima do 1º item com números grandes
        if "desc" in self.rot:
            self.lin_km = self.rot["desc"][0]
        else:
            self.lin_km = next(r for r in range(self.rot["pecas"][0] - 1, 0, -1)
                               if sum(1 for c in range(self.col_rot + 1, self.col_rot + 25)
                                      if (num(self.f.cell(r, c).value) or 0) >= 1000) >= 4)
        # colunas de revisão: têm km no cabeçalho e fórmula/valor na linha de total
        lin_tot = self.rot["total"][0]
        self.revs, ant = [], None
        for c in range(self.col_rot + 1, self.col_rot + 30):
            cab = self.f.cell(self.lin_km, c).value
            if cab in (None, "", " ") or self.f.cell(lin_tot, c).value in (None, ""):
                continue
            km = km_de(cab, ant)
            if km:
                self.revs.append((c, km))
                ant = km
        if not self.revs:
            raise ValueError("nenhuma coluna de revisão encontrada")

    def _acha_detalhe(self):
        self.det = {}
        for r in range(self.rot["pecas"][0], min(self.f.max_row, 250) + 1):
            for c in range(1, 12):
                if normaliza(self.f.cell(r, c).value) == "P.N":
                    self.lin_det = r
                    self.det["pn"] = c
                    self.det["item"] = c + 2  # padrão quando falta o título "ITEM SUBSTITUÍVEL"
                    for cc in range(c, c + 14):
                        t = normaliza(self.f.cell(r, cc).value)
                        if t.startswith("ITEM"):
                            self.det["item"] = cc
                        elif t.startswith("R$ UNIT"):
                            self.det["unit"] = cc
                        elif t.startswith("UNID"):
                            self.det["unid"] = cc
                        elif t.startswith("QTDE"):
                            self.det["qtd"] = cc
                        elif t.startswith("TOTAL"):
                            self.det["tot"] = cc
                    return
        raise ValueError("cabeçalho do detalhe (P.N) não encontrado")

    # ---------- detalhe ----------
    def linha_detalhe(self, r):
        if r in self._cache:
            return self._cache[r]
        self._cache[r] = self._linha_detalhe(r)
        return self._cache[r]

    def _linha_detalhe(self, r):
        """Dados de uma linha do detalhe (valores calculados pelo Excel para nomes/preços vindos de outras abas)."""
        d = self.det
        unit = num(self.v.cell(r, d["unit"]).value)
        qtd = num(self.v.cell(r, d["qtd"]).value)
        return {
            "codigo": str(self.v.cell(r, d["pn"]).value or "").strip(),
            "descricao": str(self.v.cell(r, d["item"]).value or "").strip(),
            "unidade": str(self.v.cell(r, d["unid"]).value or "").strip(),
            "unit": unit,
            "qtd": qtd,
        }

    def linhas_detalhe(self):
        fim = min(self.f.max_row, 250)
        return [r for r in range(self.lin_det + 1, fim + 1)
                if num(self.v.cell(r, self.det["unit"]).value)]

    # ---------- cálculo ----------
    def valor_hora(self):
        r, c = self.rot["mo"]
        m = re.search(r"(\d+)[.,]?(\d{2})?", normaliza(self.f.cell(r, c).value)[8:])
        if m:
            return float(m.group(1))
        return num(self.v.cell(r, c + 1).value)

    def calcula(self):
        aba_antiga = normaliza(self.nome) in ABAS_ANTIGAS
        lin_ini, lin_fim = self.lin_km + 1, self.rot["pecas"][0] - 1
        dets = self.linhas_detalhe()
        self._dets = dets
        hora = self.valor_hora()
        revisoes = []
        for n, (c, km) in enumerate(self.revs, start=1):
            itens, pecas = [], 0.0
            # respeita o intervalo da soma de PEÇAS da planilha (ex.: Mohave V6 deixa o aditivo de fora
            # por decisão do Leonardo, 06/11/2026); itens fora da soma vão para o relatório
            m_soma = re.search(r"SUM\([A-Z]+(\d+):[A-Z]+(\d+)\)", str(self.f.cell(self.rot["pecas"][0], c).value or ""))
            fim_soma = int(m_soma.group(2)) if m_soma else lin_fim
            for r in range(lin_ini, lin_fim + 1):
                rotulo = str(self.f.cell(r, self.col_rot).value or "").strip()
                cel = self.f.cell(r, c).value
                item = self._resolve(cel, r, c, rotulo, dets, aba_antiga)
                if item is None:
                    continue
                if r > fim_soma:
                    self.avisos.append(f"{get_column_letter(c)}{r} ({rotulo}): fora da soma de PEÇAS da planilha; não incluído")
                    continue
                pecas += item["valor"]
                itens.append(item)
            tempo = num(self.v.cell(self.rot["tempo"][0], c).value) or 0.0
            mo = arred(tempo * hora) if hora else 0.0
            mo_planilha = num(self.v.cell(self.rot["mo"][0], c).value) or 0.0
            if abs(mo - mo_planilha) > TOLERANCIA:
                self.avisos.append(f"{n}ª rev.: mão de obra calculada {mo:.2f} ≠ planilha {mo_planilha:.2f}")
            total = arred(pecas + mo)
            total_planilha = num(self.v.cell(self.rot["total"][0], c).value)
            # parcelamento: o site usa a regra; o da planilha fica só para o relatório
            parc_pl = None
            if "parcelamento" in self.rot:
                txt = normaliza(self.v.cell(self.rot["parcelamento"][0], c).value)
                dig = re.sub(r"\D", "", txt)
                parc_pl = 1 if "VISTA" in txt else (int(dig) if dig else None)
            revisoes.append({
                "numero": n, "km": km,
                "pecas": arred(pecas), "tempo_h": tempo, "mao_de_obra": mo, "total": total,
                "total_planilha": arred(total_planilha) if total_planilha is not None else None,
                "parcelas": parcelas_de(total),
                "valor_parcela": arred(total / parcelas_de(total)),
                "parcelas_planilha": parc_pl,
                "itens": itens,
            })
        return hora, revisoes

    def _resolve(self, cel, r, c, rotulo, dets, aba_antiga):
        """Transforma uma célula do quadro de revisões num item calculado pelo detalhe."""
        coord = f"{get_column_letter(c)}{r}"
        valor_v = num(self.v.cell(r, c).value)
        if cel in (None, "", " ") or (num(cel) == 0):
            return None
        oleo = bool(re.match(r"^(OLEO|ÓLEO)", normaliza(rotulo))) and not re.search(
            r"DIFEREN|TRANSM|CAMBIO|EIXO", normaliza(rotulo))
        # 1) referência simples a uma linha do detalhe
        if isinstance(cel, str):
            m = REF.match(cel)
            if m and int(m.group(2)) > self.lin_det:
                ref_r, ref_c = int(m.group(2)), column_index_from_string(m.group(1))
                # o total do detalhe pode apontar para outra linha (ex.: M70 '=J71'): segue a referência
                alvo = self.f.cell(ref_r, ref_c).value
                m2 = REF.match(alvo) if isinstance(alvo, str) else None
                if m2 and int(m2.group(2)) != ref_r and int(m2.group(2)) > self.lin_det:
                    self.avisos.append(f"{coord} ({rotulo}): {get_column_letter(ref_c)}{ref_r} aponta para {m2.group(1)}{m2.group(2)}; usado o item da linha {m2.group(2)}")
                    ref_r, ref_c = int(m2.group(2)), column_index_from_string(m2.group(1))
                d = self.linha_detalhe(ref_r)
                if d["unit"] is None:
                    return None  # item sem preço (ex.: anel do bujão incluso no filtro)
                qtd = 1.0 if ref_c == self.det["unit"] else (d["qtd"] or 1.0)
                return self._item(d, qtd, oleo and not aba_antiga, rotulo, coord, valor_v)
            # outra fórmula: usa o valor calculado pelo Excel e avisa
            if valor_v:
                self.avisos.append(f"{coord} ({rotulo}): fórmula não reconhecida `{cel}`; usado o valor da planilha {valor_v:.2f}")
                return {"descricao": rotulo, "codigo": "", "qtd": 1, "unidade": "", "valor": arred(valor_v)}
            return None
        # 2) valor digitado: procura no detalhe a linha correspondente
        literal = num(cel)
        if literal is None:
            return None
        cand = [rr for rr in dets if abs((self.linha_detalhe(rr)["unit"] or 0) * (self.linha_detalhe(rr)["qtd"] or 1) - literal) <= TOLERANCIA]
        if not cand:
            cand = [rr for rr in dets if self._parecido(rotulo, self.linha_detalhe(rr)["descricao"])]
            if len(cand) == 1:
                d = self.linha_detalhe(cand[0])
                it = self._item(d, d["qtd"] or 1.0, oleo and not aba_antiga, rotulo, coord, None)
                self.avisos.append(f"{coord} ({rotulo}): valor digitado {literal:.2f} trocado pelo detalhe {it['valor']:.2f} ({d['descricao']})")
                return it
            self.avisos.append(f"{coord} ({rotulo}): valor digitado {literal:.2f} sem linha correspondente no detalhe; mantido")
            return {"descricao": rotulo, "codigo": "", "qtd": 1, "unidade": "", "valor": arred(literal)}
        d = self.linha_detalhe(cand[0])
        return self._item(d, d["qtd"] or 1.0, oleo and not aba_antiga, rotulo, coord, None)

    def _item(self, d, qtd, oleo, rotulo, coord, valor_planilha):
        if oleo:
            novo = litros_oleo(qtd, self.nome)
            if novo != qtd:
                self.avisos.append(f"{coord} ({rotulo}): óleo {qtd:g} L → {novo:g} L (regra de arredondamento)")
            qtd = novo
        valor = arred(d["unit"] * qtd)
        return {"descricao": d["descricao"] or rotulo, "codigo": d["codigo"],
                "qtd": qtd, "unidade": d["unidade"], "valor": valor}

    @staticmethod
    def _parecido(rotulo, descricao):
        """Compara palavras-chave do rótulo com a descrição do detalhe."""
        ignora = {"DE", "DO", "DA", "M.", "T.", "E"}
        a = {p for p in re.split(r"[^A-Z0-9/]+", normaliza(rotulo)) if len(p) > 2 and p not in ignora}
        b = set(re.split(r"[^A-Z0-9/]+", normaliza(descricao)))
        return bool(a) and a <= b

    def especial(self, hora):
        """Quadro "Manutenção Especial" (Sorento 2.2D, Tasman): itens por intervalo, somados aqui
        (os totais digitados no quadro não são usados). Mão de obra = tempo × valor-hora da aba."""
        ini = None
        for r in range(1, 15):
            for c in range(10, 26):
                if normaliza(self.f.cell(r, c).value).startswith("MANUTENCAO ESPECIAL"):
                    ini = (r, c)
                    break
            if ini:
                break
        if not ini:
            return []
        r0, cdesc = ini[0] + 1, ini[1]
        colunas = [c for c in range(cdesc + 1, cdesc + 6) if "A CADA" in normaliza(self.v.cell(r0, c).value)]
        fim = next((r for r in range(r0 + 1, r0 + 40) if normaliza(self.v.cell(r, cdesc).value).startswith("PECAS")), None)
        lin_tempo = next((r for r in range(r0 + 1, r0 + 45) if normaliza(self.v.cell(r, cdesc).value) == "TEMPO"), None)
        if not colunas or not fim:
            self.avisos.append("quadro de manutenção especial fora do padrão; não lido")
            return []
        blocos = []
        for c in colunas:
            cab = normaliza(self.v.cell(r0, c).value)
            km = re.search(r"([\d.]+)\s*KM", cab)
            anos = re.search(r"(\d+)\s*ANOS", cab)
            itens = [{"descricao": str(self.v.cell(r, cdesc).value).strip(), "valor": arred(num(self.v.cell(r, c).value))}
                     for r in range(r0 + 1, fim) if num(self.v.cell(r, c).value)]
            pecas = arred(sum(i["valor"] for i in itens))
            tempo = num(self.v.cell(lin_tempo, c).value) or 0.0 if lin_tempo else 0.0
            mo = arred(tempo * hora)
            blocos.append({
                "km": int(km.group(1).replace(".", "")) if km else None,
                "anos": int(anos.group(1)) if anos else None,
                "itens": itens, "pecas": pecas, "tempo_h": tempo, "mao_de_obra": mo,
                "total": arred(pecas + mo), "parcelas": parcelas_de(pecas + mo),
            })
        return blocos

    def metadados(self):
        ano_ini = ano_fim = None
        for r in range(1, self.lin_km):
            for c in range(1, 20):
                if normaliza(self.f.cell(r, c).value).startswith("MY INICIO"):
                    ano_ini = num(self.v.cell(r + 1, c).value)
                    fim = self.v.cell(r + 1, c + 1).value
                    ano_fim = num(fim)
        texto = " ".join(normaliza(self.v.cell(r, c).value) for r in range(1, self.lin_km + 1) for c in range(1, 8))
        gratuitas = []
        pos = texto.find("REVISOES SAO GRATUITAS")
        if pos > 0:
            # ex.: "1ª - 2ª - 3ª REVISÕES SÃO GRATUITAS" -> [1, 2, 3]
            gratuitas = [int(x) for x in re.findall(r"(\d+)\D", texto[max(0, pos - 30):pos])]
        return (int(ano_ini) if ano_ini else None), (int(ano_fim) if ano_fim else None), gratuitas


def nome_amigavel(aba):
    s = re.sub(r"[_]+", " ", aba).strip()
    return re.sub(r"\s+", " ", s)


def id_de(aba):
    return re.sub(r"[^a-z0-9]+", "-", normaliza(aba).lower()).strip("-")


def le_nomes(caminho):
    """data/nomes.csv: título de dentro da aba (igual ao NBS), anos e motorização."""
    if not caminho.exists():
        return {}
    with open(caminho, encoding="utf-8") as f:
        return {lin["aba"]: lin for lin in csv.DictReader(f, delimiter=";")}


def le_fotos(caminho):
    """fotos/controle.csv: origem e crédito de cada foto aprovada (Wikimedia exige crédito na tela)."""
    if not caminho.exists():
        return {}
    with open(caminho, encoding="utf-8") as f:
        return {lin["arquivo"]: lin for lin in csv.DictReader(f, delimiter=";")}


def foto_do_modelo(nm, fotos, avisos):
    """Arquivo da foto (coluna 'foto' do nomes.csv) + crédito; sem arquivo aprovado → None (página mostra 'Foto pendente')."""
    base = (nm.get("foto") or "").strip() if nm else ""
    if not base:
        return None, None
    arq = f"{base}.webp"
    if not (RAIZ / "fotos" / arq).exists():
        avisos.append(f"foto '{arq}' indicada no nomes.csv não existe em fotos/")
        return None, None
    c = fotos.get(arq, {})
    credito = None
    if c.get("origem", "").startswith("Wikimedia"):
        credito = f"Foto: {c['autor']} · {c['licenca']} · Wikimedia Commons"
    return f"fotos/{arq}", credito


def converte_planilha(caminho):
    nomes = le_nomes(RAIZ / "data/nomes.csv")
    fotos = le_fotos(RAIZ / "fotos/controle.csv")
    wb_f = openpyxl.load_workbook(caminho, data_only=False)
    wb_v = openpyxl.load_workbook(caminho, data_only=True)
    modelos, relatorio = [], []
    for ws in wb_f.worksheets:
        if normaliza(ws.title) in ABAS_IGNORADAS:
            continue
        try:
            aba = Aba(ws, wb_v[ws.title])
            hora, revisoes = aba.calcula()
        except Exception as e:  # aba fora do padrão: registra e segue
            relatorio.append((ws.title, [f"**ABA NÃO LIDA:** {e}"], [], None))
            continue
        ano_ini, ano_fim, gratuitas = aba.metadados()
        for rv in revisoes:
            rv["gratuita"] = rv["numero"] in gratuitas
        difs = [rv for rv in revisoes if rv["total_planilha"] is not None
                and abs(rv["total"] - rv["total_planilha"]) > TOLERANCIA]
        nm = nomes.get(ws.title)
        if nm is None:
            aba.avisos.append("aba sem linha em data/nomes.csv; usado o nome da guia")
        elif nm["mostrar"].strip().lower() != "sim":
            continue  # aba escondida do site
        anos = lambda k, padrao: int(nm[k]) if nm and nm[k].strip() else padrao
        foto, credito = foto_do_modelo(nm, fotos, aba.avisos)
        modelos.append({
            "id": id_de(ws.title),
            "nome": nm["titulo"].strip() if nm else nome_amigavel(ws.title),
            "aba": ws.title,
            "ano_inicial": anos("ano_inicial", ano_ini),
            "ano_final": anos("ano_final", ano_fim),
            "motorizacao": nm["motorizacao"] if nm else None,
            "foto": foto,
            "foto_credito": credito,
            "valor_hora": hora,
            "referencia_antiga": normaliza(ws.title) in ABAS_ANTIGAS,
            "especial": aba.especial(hora),
            "revisoes": revisoes,
        })
        relatorio.append((ws.title, aba.avisos, difs, hora))
    return modelos, relatorio


def converte_extras(caminho):
    extras = []
    with open(caminho, encoding="utf-8") as f:
        for lin in csv.DictReader(f, delimiter=";"):
            cod = lin["codigo"].strip()
            obs = lin.get("observacao", "") or ""
            extras.append({
                "codigo": cod,
                "nome": lin["descricao"].strip(),
                "valor": float(lin["valor"].replace(".", "").replace(",", ".")),
                "tipo": lin["tipo_sugerido"].strip(),
                "qtd_max": 2 if cod == "RETDISCO" else 10,
                "ja_incluso_na_revisao": cod in ("010164", "010163"),
                "observacao": obs.strip(),
            })
    return extras


def escreve_relatorio(relatorio, modelos, caminho):
    linhas = [f"# Divergências — gerado em {date.today():%d/%m/%Y}", "",
              "Compara o **total recalculado pelo detalhe** com o **VALOR TABELA KIA** (ou TOTAL) da planilha.",
              "", f"Modelos lidos: **{len(modelos)}**", "",
              "## Resumo por aba", "", "| Aba | Valor-hora | Revisões com diferença | Avisos |", "|---|---|---|---|"]
    for aba, avisos, difs, hora in relatorio:
        linhas.append(f"| {aba} | {hora if hora else '—'} | {len(difs)} | {len(avisos)} |")
    linhas += ["", "## Detalhe", ""]
    for aba, avisos, difs, hora in relatorio:
        if not avisos and not difs:
            continue
        linhas.append(f"### {aba}")
        for rv in difs:
            linhas.append(f"- **{rv['numero']}ª rev. ({rv['km']:,} km):** calculado R$ {rv['total']:.2f} × planilha R$ {rv['total_planilha']:.2f} "
                          f"(dif. {rv['total'] - rv['total_planilha']:+.2f})".replace(",", "."))
        for a in avisos:
            linhas.append(f"- {a}")
        linhas.append("")
    linhas += ["## Parcelamento: planilha × regra (parcela mínima R$ 500, até 3x sem juros)", "",
               "O site usa a regra. Abaixo, as revisões em que a linha PARCELAMENTO da planilha é diferente.", ""]
    for m in modelos:
        d = [f"{r['numero']}ª ({r['parcelas_planilha']}x → {r['parcelas']}x)" for r in m["revisoes"]
             if r["parcelas_planilha"] is not None and r["parcelas_planilha"] != r["parcelas"]]
        if d:
            linhas.append(f"- **{m['nome']}:** " + ", ".join(d))
    caminho.write_text("\n".join(linhas), encoding="utf-8")


def main():
    planilha = Path(sys.argv[1]) if len(sys.argv) > 1 else PLANILHA_PADRAO
    agregados = Path(sys.argv[2]) if len(sys.argv) > 2 else CSV_PADRAO
    modelos, relatorio = converte_planilha(planilha)
    extras = converte_extras(agregados)
    (RAIZ / "data").mkdir(exist_ok=True)
    (RAIZ / "data/revisoes.json").write_text(json.dumps(
        {"data_tabela": DATA_TABELA, "origem": planilha.name, "modelos": modelos},
        ensure_ascii=False, indent=1), encoding="utf-8")
    # cópia em .js: deixa abrir o index.html com dois cliques, sem servidor (fetch não funciona em file://)
    (RAIZ / "data/revisoes.js").write_text("window.DADOS_REVISOES = " + json.dumps(
        {"data_tabela": DATA_TABELA, "modelos": modelos}, ensure_ascii=False) + ";\n", encoding="utf-8")
    (RAIZ / "data/extras.js").write_text("window.DADOS_EXTRAS = " + json.dumps(
        extras, ensure_ascii=False) + ";\n", encoding="utf-8")
    (RAIZ / "data/extras.json").write_text(json.dumps(
        {"origem": agregados.name, "extras": extras}, ensure_ascii=False, indent=1), encoding="utf-8")
    # garantia.json é montado pelo Claude a partir dos livretos; aqui só se refaz a cópia .js (abrir sem servidor)
    garantia = RAIZ / "data/garantia.json"
    if garantia.exists():
        (RAIZ / "data/garantia.js").write_text("window.DADOS_GARANTIA = " + json.dumps(
            json.loads(garantia.read_text(encoding="utf-8")), ensure_ascii=False) + ";\n", encoding="utf-8")
    escreve_relatorio(relatorio, modelos, RAIZ / "ferramentas/divergencias.md")
    com_dif = sum(1 for _, _, d, _ in relatorio if d)
    nao_lidas = [a for a, av, _, _ in relatorio if av and av[0].startswith("**ABA")]
    print(f"Modelos: {len(modelos)} | Extras: {len(extras)} | Abas com diferença de total: {com_dif} | Não lidas: {nao_lidas}")


if __name__ == "__main__":
    main()
