"""Crop the monogram out of logo.jpeg and lift it off its white paper.

The source is a square JPEG lockup: decorative arc + crown + EF monogram on top,
the word "Elyrafashion" and a flourish underneath. The navbar wants just the mark,
with transparency so it sits on any background.
"""
from PIL import Image

SRC = "/home/athervi/company/rakkhi/public/images/logo/logo.jpeg"
OUT = "/home/athervi/company/rakkhi/public/images/logo/logo-mark.png"

# Row 700-710 is the blank gap between the monogram and the wordmark (see row profile).
SPLIT_Y = 708

im = Image.open(SRC).convert("RGB")
w, h = im.size
px = im.load()


def is_ink(p):
    mx = max(p)
    return mx < 238 or (mx - min(p)) > 18


# tight bbox of the mark region
x0, y0, x1, y1 = w, h, 0, 0
for y in range(0, SPLIT_Y):
    for x in range(w):
        if is_ink(px[x, y]):
            if x < x0: x0 = x
            if x > x1: x1 = x
            if y < y0: y0 = y
            if y > y1: y1 = y

pad = 6
box = (max(0, x0 - pad), max(0, y0 - pad), min(w, x1 + 1 + pad), min(SPLIT_Y, y1 + 1 + pad))
print("crop box", box, "->", (box[2] - box[0], box[3] - box[1]))

mark = im.crop(box).convert("RGBA")
mw, mh = mark.size
mp = mark.load()

# Unmultiply the white paper: C = a*Cs + (1-a)*255  =>  a = 1 - min(C)/255
for y in range(mh):
    for x in range(mw):
        r, g, b, _ = mp[x, y]
        mn = min(r, g, b)
        a = 255 - mn
        if a <= 2:
            mp[x, y] = (0, 0, 0, 0)
            continue
        f = a / 255.0
        sr = int(round((r - 255 * (1 - f)) / f))
        sg = int(round((g - 255 * (1 - f)) / f))
        sb = int(round((b - 255 * (1 - f)) / f))
        clamp = lambda v: 0 if v < 0 else (255 if v > 255 else v)
        mp[x, y] = (clamp(sr), clamp(sg), clamp(sb), a)

# Keep the mark's own aspect ratio — the slot in lib/imageSizes.ts matches it.
target_w = 640
out = mark.resize((target_w, round(mh * target_w / mw)), Image.LANCZOS)
out.save(OUT, optimize=True)
print("wrote", OUT, out.size)
