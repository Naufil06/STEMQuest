"""Puts the hero's own head on each costume figure from art/costumes-source.png.
Run AFTER make_characters.py:   pip install rembg onnxruntime scipy pillow numpy ;  python tools/make_costumes.py"""
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi
from rembg import remove, new_session

SRC, OUT, CW, CH, FEET = "art/costumes-source.png", "public/characters", 240, 579, 573
XS, YS = [0, 222, 420, 618, 815, 1024], [0, 342, 684, 1024]
# row-major order of the 15 figures on the sheet (None = not used: holds a weapon)
FIGS = ["cybervisor", None, "trench", "fieldscholar", "icegoggles", "runescholar", "wizard", "frostranger",
        "steampunk", "aviator", "deepspace", "galaxy", "plasma", "ecoguardian", "sprout"]

def base_head(g):
    start = 150 if g == "girl" else 105   # skip the eyes (the girl's are lower)
    a = np.asarray(Image.open(f"{OUT}/{g}-school.png").convert("RGBA")).astype(float) / 255
    al = a[..., 3] > .5; rgb = a[..., :3]
    xs = np.where(al[40:80].any(0))[0]; cx = int((xs.min() + xs.max()) / 2)
    mn = rgb.min(2); sat = (rgb.max(2) - mn) / (rgb.max(2) + 1e-6); white = (mn > .72) & (sat < .15) & al
    collar = next(y for y in range(start, 230) if white[y, cx - 35:cx + 35].sum() >= 5)   # where the shirt collar starts
    hair = (rgb[..., 0] > rgb[..., 2] + .04) & (rgb.max(2) < .55) & al
    m = np.zeros(al.shape); m[:collar + 3] = al[:collar + 3]; m[collar + 3:collar + 45] = hair[collar + 3:collar + 45]
    h = a.copy(); h[..., 3] = a[..., 3] * m
    return Image.fromarray((h * 255).astype("uint8"), "RGBA"), cx, collar

def cutout(sheet, i, sess):
    r, c = divmod(i, 5)
    cell = sheet.crop((XS[c], YS[r], XS[c + 1], YS[r + 1]))
    cut = np.asarray(remove(cell, session=sess)).copy()
    m = cut[..., 3] > 100
    lab, n = ndi.label(m)
    keep = lab == (np.argmax(ndi.sum(m, lab, range(1, n + 1))) + 1)       # biggest blob = the hero (drops drones, sparkles)
    cut[..., 3] = (cut[..., 3] * ndi.binary_dilation(keep, iterations=2)).astype("uint8")
    return Image.fromarray(cut, "RGBA"), keep

def neck(m):
    ys = np.where(m.any(1))[0]; top, bot = ys[0], ys[-1]; H = bot - top
    w = np.convolve(m.sum(1).astype(float), np.ones(5) / 5, "same")
    lo, hi = int(top + .17 * H), int(top + .40 * H)
    ny = lo + int(np.argmin(w[lo:hi])); xs = np.where(m[ny])[0]
    return ny, (xs.min() + xs.max()) / 2, bot

if __name__ == "__main__":
    sheet = Image.open(SRC).convert("RGB"); sess = new_session("u2net")
    heads = {g: base_head(g) for g in ("boy", "girl")}
    for i, fid in enumerate(FIGS):
        if not fid: continue
        fig, m = cutout(sheet, i, sess); ny, nx, bot = neck(m)
        for g, (head, cx, collar) in heads.items():
            s = (FEET - collar) / (bot - ny)
            body = fig.resize((int(fig.width * s), int(fig.height * s)), Image.LANCZOS).filter(ImageFilter.UnsharpMask(1.5, 60, 2))
            b = np.asarray(body).copy(); cut = int(ny * s); b[:cut, :, 3] = 0                  # remove the old head
            body = Image.fromarray(b, "RGBA")
            x0, y0 = int(cx - nx * s), int(collar - 2 - ny * s)
            big = Image.new("RGBA", (CW + 300, CH), (0, 0, 0, 0))
            crop_top = max(0, -y0); big.alpha_composite(body.crop((0, crop_top, body.width, body.height)), (max(0, x0 + 150), max(0, y0)) if x0 + 150 >= 0 else (0, max(0, y0)))
            if fid == "steampunk": big.paste((0, 0, 0, 0), (150, 290, 150 + 62, CH))   # drop the weapon-like brass gadget
            big.alpha_composite(head, (150, 0))
            big.crop((150, 0, 150 + CW, CH)).save(f"{OUT}/{g}-{fid}.png", optimize=True)
    # 15 extra colourways: (new id, base id, hue shift). Only blue/cyan/purple fabric changes - skin & hair are untouched.
    VARIANTS = [("inferno", "cybervisor", -152), ("emerald", "cybervisor", -70), ("embergoggles", "icegoggles", -152), ("junglegoggles", "icegoggles", -70),
                ("volcanoranger", "frostranger", -152), ("goldranger", "frostranger", -125), ("crimsonrune", "runescholar", -152), ("forestfield", "fieldscholar", -70),
                ("royalfield", "fieldscholar", 36), ("crimsonspace", "deepspace", -152), ("emeraldspace", "deepspace", -70), ("nebula", "galaxy", -152),
                ("aurora", "galaxy", -70), ("solarplasma", "plasma", -125), ("toxicplasma", "plasma", -70)]
    for g in ("boy", "girl"):
        for nid, base, d in VARIANTS:
            im = Image.open(f"{OUT}/{g}-{base}.png").convert("RGBA")
            hsv = np.asarray(im.convert("RGB").convert("HSV")).astype(int)
            h, s, v = hsv[..., 0], hsv[..., 1], hsv[..., 2]
            m = (s > 55) & (h > 105) & (h < 215)
            out = np.stack([np.where(m, (h + d) % 256, h), s, np.where(m, np.minimum(255, v * 1.08), v)], -1).astype("uint8")
            res = Image.fromarray(out, "HSV").convert("RGBA"); res.putalpha(im.getchannel("A"))
            res.save(f"{OUT}/{g}-{nid}.png", optimize=True)
    print("costumes done")
