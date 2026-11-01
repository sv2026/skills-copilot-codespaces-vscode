from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

PUBLIC = Path('public')
CAPTURED_AT = '2026-11-01'

FONT_PATHS = [
    '/System/Library/Fonts/Helvetica.ttc',
    '/System/Library/Fonts/SFCompactDisplay-Regular.otf',
    '/System/Library/Fonts/SFProDisplay-Regular.otf',
]

for font_path in FONT_PATHS:
    try:
        TITLE_FONT = ImageFont.truetype(font_path, 28)
        LABEL_FONT = ImageFont.truetype(font_path, 18)
        NOTE_FONT = ImageFont.truetype(font_path, 16)
        break
    except OSError:
        continue
else:
    TITLE_FONT = ImageFont.load_default()
    LABEL_FONT = ImageFont.load_default()
    NOTE_FONT = ImageFont.load_default()

PLANS = [
    {
        'source': 'washington-connection-application-introduction.png',
        'output': 'washington-connection-application-introduction-annotated.png',
        'regions': [
            ((260, 220, 650, 290), 'Application introduction'),
            ((270, 292, 1080, 520), 'Information to prepare'),
            ((932, 290, 1160, 430), 'See If You Qualify'),
            ((1080, 1210, 1170, 1270), 'Next navigation'),
        ],
        'notes': [
            '1. Read the introduction before starting.',
            '2. Prepare the categories of information listed on the page.',
            '3. The visible See If You Qualify option is separate from Apply Now.',
            '4. Use Next to move through the application guidance.',
        ],
    },
    {
        'source': 'washington-connection-about-application.png',
        'output': 'washington-connection-about-application-annotated.png',
        'regions': [
            ((275, 235, 650, 275), 'About this Application'),
            ((275, 282, 1160, 335), 'How to apply'),
            ((275, 345, 1160, 635), 'Food and cash timing'),
            ((275, 990, 1160, 1165), 'Identity and SSN guidance'),
            ((1080, 3220, 1170, 3285), 'Next navigation'),
        ],
        'notes': [
            '1. This page explains the application process and when an application can be filed.',
            '2. Review the visible food and cash processing timelines.',
            '3. Read the identity and SSN guidance before entering application data.',
            '4. Continue only after reviewing the official instructions.',
        ],
    },
    {
        'source': 'washington-connection-your-needs-basic-food.png',
        'output': 'washington-connection-your-needs-basic-food-annotated.png',
        'regions': [
            ((465, 280, 800, 345), 'Your Needs'),
            ((820, 380, 1150, 455), 'Food Assistance / Basic Food'),
            ((470, 235, 590, 275), 'Progress: 5%'),
            ((1080, 805, 1170, 855), 'Next navigation'),
        ],
        'notes': [
            '1. Choose the benefit category that matches the help needed.',
            '2. Basic Food is visibly listed under Food Assistance.',
            '3. The progress indicator shows this is an early application step.',
            '4. Use Next after making the relevant selection.',
        ],
    },
    {
        'source': 'washington-connection-household-questions-2.png',
        'output': 'washington-connection-household-questions-2-annotated.png',
        'regions': [
            ((470, 280, 850, 345), 'Household Questions 2/2'),
            ((825, 345, 1140, 430), 'Interpreter and language choices'),
            ((825, 430, 1140, 505), 'Recent out-of-state or tribal benefits'),
            ((1075, 490, 1170, 545), 'Next navigation'),
        ],
        'notes': [
            '1. Answer whether an interpreter is needed.',
            '2. Choose a language only when the question applies.',
            '3. Review the recent out-of-state or tribal benefits question carefully.',
            '4. Continue with Next after choosing the applicable answers.',
        ],
    },
    {
        'source': 'washington-connection-authorized-representative.png',
        'output': 'washington-connection-authorized-representative-annotated.png',
        'regions': [
            ((470, 280, 930, 345), 'Authorized representative'),
            ((820, 345, 1140, 430), 'Yes or No decision'),
            ((660, 400, 1080, 455), 'More information link'),
            ((1075, 455, 1170, 515), 'Next navigation'),
        ],
        'notes': [
            '1. Decide whether anyone in the household has an authorized representative.',
            '2. The page says most people do not have one.',
            '3. Open the visible information link if this concept applies.',
            '4. Use Next after choosing the applicable answer.',
        ],
    },
    {
        'source': 'washington-connection-your-rights.png',
        'output': 'washington-connection-your-rights-annotated.png',
        'regions': [
            ((280, 220, 1180, 300), 'Rights and Responsibilities'),
            ((280, 430, 1180, 1250), 'Responsibilities and verification'),
            ((280, 1250, 1180, 2350), 'Rights, timelines, and EBT guidance'),
            ((280, 2750, 1180, 3160), 'Acknowledgment and Next'),
        ],
        'notes': [
            '1. Read the official responsibilities before signing.',
            '2. Review verification, reporting, and SSN guidance.',
            '3. Note the visible processing timelines and EBT information.',
            '4. The acknowledgment and Next control mark the transition toward submission.',
        ],
    },
    {
        'source': 'washington-connection-resources.png',
        'output': 'washington-connection-resources-annotated.png',
        'regions': [
            ((470, 280, 850, 345), 'Resources'),
            ((820, 345, 1140, 435), 'Resources yes/no decision'),
            ((470, 400, 1140, 700), 'Examples of resources'),
            ((470, 700, 1120, 765), 'Annuities note'),
        ],
        'notes': [
            '1. Decide whether anyone applying has resources to report.',
            '2. Use the visible examples to understand what counts as a resource.',
            '3. Note that annuities are asked about on a separate page.',
            '4. Answer based on the household situation; do not copy test values.',
        ],
    },
]


def draw_arrow(draw, start, end):
    draw.line([start, end], fill=(230, 82, 24), width=4)
    x, y = end
    draw.polygon([(x, y), (x - 12, y - 8), (x - 12, y + 8)], fill=(230, 82, 24))


def annotate(plan):
    source = PUBLIC / plan['source']
    output = PUBLIC / plan['output']
    image = Image.open(source).convert('RGB')
    draw = ImageDraw.Draw(image)


    for box, _label in plan['regions']:
        x1, y1, x2, y2 = box
        draw.rounded_rectangle((x1, y1, x2, y2), radius=8, outline=(230, 82, 24), width=4)
        arrow_start = (max(20, x1 - 70), max(90, y1 - 24))
        arrow_end = (x1 + 8, y1 + 8)
        draw_arrow(draw, arrow_start, arrow_end)


    image.save(output)
    print(f'Created {output} ({image.width}x{image.height}, {output.stat().st_size} bytes)')


for plan in PLANS:
    annotate(plan)
