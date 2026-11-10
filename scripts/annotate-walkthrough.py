"""Draw boxes (and optional arrows) on screenshots from a JSON plan.

Usage: python3 scripts/annotate-walkthrough.py scripts/annotations/<name>.json [--webp]

Plan format:
{
  "images": [
    {
      "source": "public/raw.png",
      "output": "public/raw-annotated.png",   # .webp extension also works
      "boxes": [{"box": [x1, y1, x2, y2], "arrow": true}]
    }
  ]
}
"""
import json
import sys
from pathlib import Path

from PIL import Image, ImageDraw

COLOR = (230, 82, 24)


def draw_arrow(draw, start, end):
    draw.line([start, end], fill=COLOR, width=4)
    x, y = end
    draw.polygon([(x, y), (x - 12, y - 8), (x - 12, y + 8)], fill=COLOR)


def annotate(item):
    image = Image.open(item['source']).convert('RGB')
    draw = ImageDraw.Draw(image)
    for entry in item['boxes']:
        x1, y1, x2, y2 = entry['box']
        draw.rounded_rectangle((x1, y1, x2, y2), radius=8, outline=COLOR, width=4)
        if entry.get('arrow'):
            draw_arrow(draw, (max(20, x1 - 70), max(20, y1 - 24)), (x1 + 8, y1 + 8))
    output = Path(item['output'])
    if output.suffix == '.webp':
        image.save(output, quality=82, method=6)
    else:
        image.save(output, optimize=True)
    print(f'Created {output} ({image.width}x{image.height}, {output.stat().st_size} bytes)')


if __name__ == '__main__':
    plan = json.loads(Path(sys.argv[1]).read_text())
    for item in plan['images']:
        annotate(item)
