"""Símbolos das luzes de advertência: recorte do manual do proprietário e pintura na cor da luz.

Por que existe: as luzes da aba "Luzes de advertência" usam o símbolo do PRÓPRIO manual Kia
(decisão do Leonardo, 12/11/2026: desenho feito pelo nome não bate com o painel).
Use quando chegar um manual novo ou uma luz nova.

Passo 1 — recortar os símbolos de um manual (PDF com texto, símbolo numa caixinha cinza):
    python ferramentas/simbolos_luzes.py recortar "manual garantia/Rio - Manual do Proprietário.pdf" 156 166 rio
    -> grava os recortes em ferramentas/simbolos-recortes/<prefixo>_p<pag>_<n>.png (fora do Git)
       e um indice_<prefixo>.json com o título da luz ao lado de cada recorte.
    Manual só em imagem (ex.: EV5): renderizar a página e recortar à mão as coordenadas.

Passo 2 — pintar na cor da luz e gravar em assets/luzes/<id>.png:
    python ferramentas/simbolos_luzes.py pintar ferramentas/simbolos-recortes/rio_p160_1.png vermelho rio-temperatura
    -> depois pôr "icone": "assets/luzes/<id>.png" na luz em data/luzes.json e refazer data/luzes.js
       (python ferramentas/simbolos_luzes.py js).

Sempre mostrar ao Leonardo (folha de conferência) antes de publicar.
Requer: pypdfium2 e Pillow (já instalados neste PC).
"""
import ctypes
import json
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
RECORTES = RAIZ / "ferramentas" / "simbolos-recortes"
CORES = {"vermelho": "#bb162b", "amarelo": "#b98500", "verde": "#2e7d32", "azul": "#1565c0", "neutro": "#05141f"}


def recortar(pdf, ini, fim, prefixo, escala=4):
    """Acha as caixinhas cinza (cor 238,238,239) onde o manual põe o símbolo e recorta cada uma."""
    import pypdfium2 as p
    import pypdfium2.raw as r
    RECORTES.mkdir(parents=True, exist_ok=True)
    d = p.PdfDocument(str(pdf))
    indice = []
    for n in range(ini, fim + 1):
        pg = d[n - 1]
        _, H = pg.get_size()
        caixas = []
        for o in pg.get_objects(max_depth=4):
            if o.type != r.FPDF_PAGEOBJ_PATH:
                continue
            esq, base, dir_, topo = o.get_bounds()
            larg, alt = dir_ - esq, topo - base
            if not (25 <= larg <= 60 and 15 <= alt <= 40):
                continue
            R, G, B, A = (ctypes.c_uint() for _ in range(4))
            if r.FPDFPageObj_GetFillColor(o.raw, R, G, B, A) and abs(R.value - 238) < 4 and abs(G.value - 238) < 4:
                caixas.append((esq, base, dir_, topo))
        if not caixas:
            continue
        img = pg.render(scale=escala).to_pil().convert("RGB")
        tp = pg.get_textpage()
        for k, (esq, base, dir_, topo) in enumerate(sorted(caixas, key=lambda c: (round(c[0] / 100), -c[1]))):
            nome = f"{prefixo}_p{n}_{k}.png"
            img.crop((int(esq * escala), int((H - topo) * escala), int(dir_ * escala), int((H - base) * escala))).save(RECORTES / nome)
            titulo = tp.get_text_bounded(left=esq - 135, bottom=base - 4, right=esq - 1, top=topo + 4).replace("\r\n", " ")
            indice.append({"arquivo": nome, "pdf": n, "titulo": " ".join(titulo.split())[:110]})
    (RECORTES / f"indice_{prefixo}.json").write_text(json.dumps(indice, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"{len(indice)} símbolos recortados em {RECORTES}")


def pintar(recorte, cor, id_luz):
    """Fundo cinza vira transparente e o preto vira a cor da luz."""
    from PIL import Image
    im = Image.open(recorte).convert("L")
    hexa = CORES[cor]
    r_, g_, b_ = (int(hexa[i:i + 2], 16) for i in (1, 3, 5))
    alfa = im.point(lambda v: max(0, min(255, int((225 - v) * 255 / 170))))
    out = Image.new("RGBA", im.size, (r_, g_, b_, 0))
    out.putalpha(alfa)
    destino = RAIZ / "assets" / "luzes" / f"{id_luz}.png"
    out.save(destino, optimize=True)
    print("gravado", destino)


def gera_js():
    """data/luzes.json é a fonte; a página lê a cópia em .js (abre com dois cliques, sem servidor)."""
    d = json.loads((RAIZ / "data" / "luzes.json").read_text(encoding="utf-8"))
    (RAIZ / "data" / "luzes.js").write_text("window.DADOS_LUZES = " + json.dumps(d, ensure_ascii=False) + ";\n", encoding="utf-8")
    print("data/luzes.js refeito:", len(d["luzes"]), "luzes")


if __name__ == "__main__":
    acao = sys.argv[1] if len(sys.argv) > 1 else ""
    if acao == "recortar":
        recortar(Path(sys.argv[2]), int(sys.argv[3]), int(sys.argv[4]), sys.argv[5])
    elif acao == "pintar":
        pintar(Path(sys.argv[2]), sys.argv[3], sys.argv[4])
    elif acao == "js":
        gera_js()
    else:
        print(__doc__)
