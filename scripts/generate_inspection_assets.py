from pathlib import Path
import math
import random
from PIL import Image, ImageDraw, ImageFilter

OUT = Path(__file__).resolve().parents[1] / "public" / "inspection"
OUT.mkdir(parents=True, exist_ok=True)

paths = [
    [(0.38,0.18),(0.42,0.29),(0.40,0.40),(0.46,0.53),(0.44,0.68),(0.51,0.82)],
    [(0.25,0.22),(0.34,0.31),(0.43,0.38),(0.52,0.50),(0.64,0.57),(0.76,0.68)],
    [(0.18,0.44),(0.31,0.46),(0.43,0.43),(0.55,0.48),(0.67,0.45),(0.82,0.50)],
    [(0.28,0.18),(0.35,0.31),(0.43,0.44),(0.50,0.55),(0.58,0.68),(0.67,0.82)],
    [(0.20,0.28),(0.31,0.34),(0.40,0.45),(0.52,0.48),(0.63,0.59),(0.79,0.64)],
    [(0.16,0.58),(0.29,0.52),(0.42,0.55),(0.56,0.47),(0.70,0.50),(0.85,0.42)],
]

def make_image(index: int, crack_path):
    random.seed(721 + index)
    width, height = 800, 440
    image = Image.new("RGB", (width, height), (154, 158, 153))
    pixels = image.load()
    for y in range(height):
        shade = int(10 * math.sin(y / 49 + index) + 7 * math.sin(y / 13.7))
        for x in range(width):
            grain = random.randint(-13, 13)
            wave = int(5 * math.sin(x / 82 + y / 57))
            base = 151 + grain + shade + wave
            pixels[x, y] = (max(95, min(190, base + 3)), max(95, min(190, base + 5)), max(95, min(190, base + 1)))
    image = image.filter(ImageFilter.GaussianBlur(0.55))
    draw = ImageDraw.Draw(image, "RGBA")
    for _ in range(95):
        x, y = random.randrange(width), random.randrange(height)
        r = random.choice([1,1,2,3,5])
        alpha = random.randrange(8, 25)
        draw.ellipse((x-r, y-r, x+r, y+r), fill=(55, 62, 58, alpha))
    for y in range(42, height, 86):
        draw.line((0, y, width, y + random.randint(-4,4)), fill=(210,211,205,22), width=2)

    points = [(int(x*width), int(y*height)) for x,y in crack_path]
    detailed = []
    for a, b in zip(points, points[1:]):
        for step in range(9):
            t = step / 9
            x = a[0] + (b[0]-a[0])*t + random.uniform(-3.2, 3.2)
            y = a[1] + (b[1]-a[1])*t + random.uniform(-2.4, 2.4)
            detailed.append((x,y))
    detailed.append(points[-1])
    draw.line(detailed, fill=(34,31,29,205), width=4, joint="curve")
    draw.line([(x+1.2,y+1) for x,y in detailed], fill=(20,18,17,150), width=1)
    for branch_index in [12, 25, 34]:
        if branch_index >= len(detailed):
            continue
        x, y = detailed[branch_index]
        branch = [(x,y)]
        for n in range(1,6):
            branch.append((x + n*random.uniform(5,9), y + n*random.uniform(-4,5)))
        draw.line(branch, fill=(42,38,35,155), width=2)

    draw.rectangle((18, 16, 188, 44), fill=(10,18,20,150))
    draw.text((29, 23), f"UAV CAM  C{index+1:02d}", fill=(210,231,230,230))
    draw.rectangle((width-168, 16, width-18, 44), fill=(10,18,20,140))
    draw.text((width-155, 23), "4K  ZOOM 3.0X", fill=(210,231,230,220))
    image.save(OUT / f"crack-{index+1:03d}.png", optimize=True)

for idx, path in enumerate(paths):
    make_image(idx, path)

print(f"Generated {len(paths)} inspection images in {OUT}")
