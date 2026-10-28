from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

src = Path('public/washington-connection-homepage.png')
out = Path('public/washington-connection-homepage-draft-annotated.png')

if not src.exists():
    raise FileNotFoundError(f'Missing source screenshot: {src}')

img = Image.open(src).convert('RGB')
annotated = img.copy()
draw = ImageDraw.Draw(annotated)

# Pick a system font when available; otherwise default to Pillow's built-in font.
font_paths = [
    '/System/Library/Fonts/Helvetica.ttc',
    '/System/Library/Fonts/SFCompactDisplay-Regular.otf',
    '/System/Library/Fonts/SFProDisplay-Regular.otf',
]

title_font = None
label_font = None
for fp in font_paths:
    try:
        title_font = ImageFont.truetype(fp, 28)
        label_font = ImageFont.truetype(fp, 18)
        break
    except Exception:
        pass

if title_font is None:
    title_font = ImageFont.load_default()
if label_font is None:
    label_font = ImageFont.load_default()

# Banner
banner = (20, 18, 1260, 82)
draw.rounded_rectangle(banner, radius=12, fill=(255, 240, 214), outline=(214, 122, 45), width=3)
draw.text((42, 28), 'DRAFT — VERIFY AGAINST THE LIVE WEBSITE', fill=(110, 55, 20), font=title_font)

# Major visible regions only. These are actual page regions that are visible in the screenshot.
regions = [
    (1, (40, 95, 1225, 150), 'Top header/navigation region'),
    (2, (55, 160, 520, 300), 'Branding/identity area'),
    (3, (90, 380, 1190, 980), 'Main content region'),
    (4, (90, 1010, 1190, 1560), 'Lower content region'),
    (5, (40, 1765, 1240, 2145), 'Footer region'),
]

for num, box, label in regions:
    x1, y1, x2, y2 = box

    # Orange border box
    draw.rounded_rectangle([(x1, y1), (x2, y2)], outline=(255, 100, 0), width=4, radius=8)

    # Number circle and arrow
    cx, cy = x1 + 24, y1 + 24
    draw.ellipse((cx - 16, cy - 16, cx + 16, cy + 16), fill=(255, 100, 0), outline=(40, 40, 40), width=2)
    draw.text((cx - 6, cy - 10), str(num), fill='white', font=label_font)

    arrow_start = (cx, cy + 18)
    arrow_end = (x1 + 120, y1 + 46)
    draw.line([arrow_start, arrow_end], fill=(255, 100, 0), width=3)
    draw.polygon([(arrow_end[0], arrow_end[1]), (arrow_end[0] - 8, arrow_end[1] - 8), (arrow_end[0] - 8, arrow_end[1] + 8)], fill=(255, 100, 0))

    # Readable label beside the outline
    draw.text((x1 + 48, y1 + 4), label, fill=(20, 20, 20), font=label_font)

# Bottom numbered explanation guide. This avoids inventing actions not visible in the screenshot.
notes_box = (36, 2165, 1244, 2330)
draw.rounded_rectangle(notes_box, radius=10, fill=(248, 248, 248), outline=(200, 200, 200), width=2)

list_items = [
    '1. Header/navigation area — visible top-of-page navigation strip or utility region.',
    '2. Branding/identity area — visible logo or site identity section near the top-left.',
    '3. Main content region — large central area that appears to contain the main webpage content.',
    '4. Lower content region — visible secondary page content beneath the main block.',
    '5. Footer region — lower page area that appears to contain footer information.',
    'These are preliminary region labels only. Do not treat them as verified instructions or button names.',
]

for i, line in enumerate(list_items):
    draw.text((54, 2182 + i * 34), line, fill=(35, 35, 35), font=label_font)

annotated.save(out)
print(f'Created: {out}')
print(f'Exists: {out.exists()}')
img2 = Image.open(out)
print(f'Dimensions: {img2.size}')
print(f'File size bytes: {out.stat().st_size}')
