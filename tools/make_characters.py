"""Cuts the boy/girl out of art/characters-source.jpeg and recolours ONLY the navy clothes for each costume.
Run:  python tools/make_characters.py   (needs: pip install pillow numpy scipy)"""
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

SRC, OUT, SCALE = "art/characters-source.jpeg", "public/characters", 0.6
a = np.asarray(Image.open(SRC).convert("RGB")).astype(float) / 255
mx, mn = a.max(2), a.min(2)
light = (mx > 0.78) & ((mx - mn) / (mx + 1e-6) < 0.13)       # fake-checkerboard background
lab, _ = ndi.label(light)
edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
fg = ~np.isin(lab, list(edge))                                  # everything not connected to the border
fg = ndi.binary_closing(fg, np.ones((3, 3)), iterations=7)      # rescues white cuffs
fg = ndi.binary_fill_holes(fg)
fg = ndi.binary_erosion(ndi.binary_opening(fg, iterations=1), iterations=1)
alpha = ndi.gaussian_filter(fg.astype(float), 0.8)

# (dark colour, light colour) the navy shading is mapped between
OUTFITS = {
    "school": None,
    "labcoat": ((165, 178, 198), (255, 255, 255)),
    "astronaut": ((150, 55, 10), (255, 150, 40)),
    "engineer": ((140, 120, 0), (255, 225, 40)),
    "inventor": ((15, 90, 60), (70, 205, 135)),
    "hero": ((70, 30, 130), (175, 115, 245)),
}
CROPS = {"boy": (152, 0, 518), "girl": (475, 518, 1024)}        # (crop x0, keep-from-x, keep-to-x)
Y0, Y1, W = 30, 995, 400
sheet = Image.new("RGBA", (int(W * SCALE) * 6, int((Y1 - Y0) * SCALE) * 2), (200, 210, 230, 255))
for r, (g, (x0, kx0, kx1)) in enumerate(CROPS.items()):
    keep = np.zeros_like(alpha); keep[:, kx0:kx1] = 1
    al = (alpha * keep)[Y0:Y1, x0:x0 + W]
    rgb = a[Y0:Y1, x0:x0 + W]
    # lighter skin (matches the costume art): shift the average skin colour, keep the shading
    sk = np.clip((rgb.max(2) - 0.45) / 0.15, 0, 1) * ((rgb[..., 0] > rgb[..., 1]) & (rgb[..., 1] > rgb[..., 2]) & (rgb[..., 0] - rgb[..., 2] > 0.10))
    sk = ndi.gaussian_filter(sk, 0.7) * (al > 0.2)
    if sk.sum() > 50:
        mean = (rgb * sk[..., None]).sum((0, 1)) / sk.sum()
        rgb = np.clip(rgb + (np.array([238, 186, 152]) / 255 - mean) * sk[..., None], 0, 1)
    rr, gg, bb = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    w = np.clip((bb - rr - 0.02) / 0.1, 0, 1) * (rgb.max(2) < 0.7)   # how "navy" each pixel is
    lum = np.clip((rgb.max(2) - 0.08) / 0.5, 0, 1)[..., None]
    for c, (o, cols) in enumerate(OUTFITS.items()):
        out = rgb
        if cols:
            d, l = np.array(cols[0]) / 255, np.array(cols[1]) / 255
            out = rgb * (1 - w[..., None]) + (d * (1 - lum) + l * lum) * w[..., None]
        img = Image.fromarray(np.dstack([(out * 255).astype("uint8"), (al * 255).astype("uint8")]), "RGBA")
        img = img.resize((int(W * SCALE), int((Y1 - Y0) * SCALE)), Image.LANCZOS)
        img.save(f"{OUT}/{g}-{o}.png", optimize=True)
        sheet.alpha_composite(img, (c * img.width, r * img.height))
sheet.save("/tmp/sheet.png")
