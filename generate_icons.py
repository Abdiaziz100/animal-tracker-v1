#!/usr/bin/env python3
"""
Animal Tracker App Icon Generator
Creates icons in all required sizes for the mobile app
"""

from PIL import Image, ImageDraw
import os

# Create assets directory
assets_dir = '/home/abdiaziz-mahat/animal-tracker-App/mobile/assets'
os.makedirs(assets_dir, exist_ok=True)

def create_icon(size):
    """Create a simple animal tracker icon"""
    # Create image with green background
    img = Image.new('RGBA', (size, size), (45, 125, 70, 255))
    draw = ImageDraw.Draw(img)
    
    # Calculate proportions
    center = size // 2
    scale = size / 512
    
    # Draw outer circle (lighter green)
    outer_radius = int(200 * scale)
    draw.ellipse(
        [center - outer_radius, center - outer_radius, 
         center + outer_radius, center + outer_radius],
        fill=(58, 175, 101, 255)
    )
    
    # Draw cow body (white ellipse)
    body_width = int(240 * scale)
    body_height = int(160 * scale)
    draw.ellipse(
        [center - body_width//2, center + int(20*scale) - body_height//2,
         center + body_width//2, center + int(20*scale) + body_height//2],
        fill=(255, 255, 255, 255)
    )
    
    # Draw cow head (white ellipse on left)
    head_x = center - int(100 * scale)
    head_y = center - int(20 * scale)
    head_width = int(100 * scale)
    head_height = int(120 * scale)
    draw.ellipse(
        [head_x - head_width//2, head_y - head_height//2,
         head_x + head_width//2, head_y + head_height//2],
        fill=(255, 255, 255, 255)
    )
    
    # Draw cow spots (dark green)
    spot_positions = [
        (center + int(40*scale), center + int(20*scale), int(50*scale)),
        (center + int(100*scale), center + int(60*scale), int(40*scale)),
        (center + int(140*scale), center + int(10*scale), int(30*scale)),
    ]
    for sx, sy, sr in spot_positions:
        draw.ellipse(
            [sx - sr, sy - sr, sx + sr, sy + sr],
            fill=(30, 92, 50, 255)
        )
    
    # Draw cow ears
    ear_positions = [
        (head_x - int(50*scale), head_y - int(60*scale), int(40*scale), int(24*scale)),
        (head_x + int(40*scale), head_y - int(70*scale), int(40*scale), int(24*scale)),
    ]
    for ex, ey, ew, eh in ear_positions:
        draw.ellipse(
            [ex - ew//2, ey - eh//2, ex + ew//2, ey + eh//2],
            fill=(255, 255, 255, 255)
        )
    
    # Draw location pin (orange)
    pin_x = center + int(140 * scale)
    pin_y = center - int(100 * scale)
    pin_size = int(80 * scale)
    
    # Pin body
    draw.ellipse(
        [pin_x - pin_size//2, pin_y - pin_size//2,
         pin_x + pin_size//2, pin_y + pin_size//2],
        fill=(255, 107, 53, 255)
    )
    
    # Pin center (white circle)
    draw.ellipse(
        [pin_x - pin_size//4, pin_y - pin_size//4,
         pin_x + pin_size//4, pin_y + pin_size//4],
        fill=(255, 255, 255, 255)
    )
    
    # Pin dot (orange)
    draw.ellipse(
        [pin_x - pin_size//8, pin_y - pin_size//8,
         pin_x + pin_size//8, pin_y + pin_size//8],
        fill=(255, 107, 53, 255)
    )
    
    return img

def create_adaptive_icon(size):
    """Create adaptive icon with foreground and background"""
    # Background layer
    bg = Image.new('RGBA', (size, size), (45, 125, 70, 255))
    
    # Foreground - simplified cow + pin
    fg = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(fg)
    
    center = size // 2
    scale = size / 512
    
    # Cow body
    body_width = int(200 * scale)
    body_height = int(130 * scale)
    draw.ellipse(
        [center - body_width//2, center + int(30*scale) - body_height//2,
         center + body_width//2, center + int(30*scale) + body_height//2],
        fill=(255, 255, 255, 255)
    )
    
    # Cow head
    head_x = center - int(80 * scale)
    head_y = center - int(10 * scale)
    draw.ellipse(
        [head_x - int(60*scale), head_y - int(70*scale),
         head_x + int(60*scale), head_y + int(70*scale)],
        fill=(255, 255, 255, 255)
    )
    
    # Cow spots
    for offset in [(40, 30), (90, 60), (120, 20)]:
        draw.ellipse(
            [center + int(offset[0]*scale) - int(20*scale), 
             center + int(offset[1]*scale) - int(20*scale),
             center + int(offset[0]*scale) + int(20*scale), 
             center + int(offset[1]*scale) + int(20*scale)],
            fill=(30, 92, 50, 255)
        )
    
    # Location pin
    pin_x = center + int(100 * scale)
    pin_y = center - int(80 * scale)
    pin_r = int(35 * scale)
    draw.ellipse(
        [pin_x - pin_r, pin_y - pin_r, pin_x + pin_r, pin_y + pin_r],
        fill=(255, 107, 53, 255)
    )
    draw.ellipse(
        [pin_x - pin_r//2, pin_y - pin_r//2, pin_x + pin_r//2, pin_y + pin_r//2],
        fill=(255, 255, 255, 255)
    )
    
    # Composite
    result = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    result.paste(bg, (0, 0))
    result.paste(fg, (0, 0), fg)
    
    return result

# Generate icons for different sizes
sizes = {
    'icon.png': 1024,
    'icon-192.png': 192,
    'icon-512.png': 512,
}

print("Generating app icons...")

# Generate main icons
for filename, size in sizes.items():
    img = create_icon(size)
    img.save(os.path.join(assets_dir, filename), 'PNG')
    print(f"Created {filename} ({size}x{size})")

# Generate adaptive icons (Android)
adaptive_sizes = [
    ('mipmap-mdpi/ic_launcher.png', 48),
    ('mipmap-hdpi/ic_launcher.png', 72),
    ('mipmap-xhdpi/ic_launcher.png', 96),
    ('mipmap-xxhdpi/ic_launcher.png', 144),
    ('mipmap-xxxhdpi/ic_launcher.png', 192),
]

# Create mipmap directories
for path, _ in adaptive_sizes:
    dir_path = os.path.join(assets_dir, os.path.dirname(path))
    os.makedirs(dir_path, exist_ok=True)

for path, size in adaptive_sizes:
    img = create_adaptive_icon(size)
    img.save(os.path.join(assets_dir, path), 'PNG')
    print(f"Created {path} ({size}x{size})")

# Generate round icons
round_sizes = [
    ('mipmap-mdpi/ic_launcher_round.png', 48),
    ('mipmap-hdpi/ic_launcher_round.png', 72),
    ('mipmap-xhdpi/ic_launcher_round.png', 96),
    ('mipmap-xxhdpi/ic_launcher_round.png', 144),
    ('mipmap-xxxhdpi/ic_launcher_round.png', 192),
]

for path, size in round_sizes:
    img = create_adaptive_icon(size)
    # Make it circular
    mask = Image.new('L', (size, size), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse([0, 0, size, size], fill=255)
    output = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    output.paste(img, (0, 0), mask)
    output.save(os.path.join(assets_dir, path), 'PNG')
    print(f"Created {path} ({size}x{size})")

# Generate splash icon
splash_size = 128
splash = create_icon(splash_size)
splash.save(os.path.join(assets_dir, 'splash_icon.png'), 'PNG')
print(f"Created splash_icon.png ({splash_size}x{splash_size})")

print(f"\nAll icons generated successfully in: {assets_dir}")
