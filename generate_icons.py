#!/usr/bin/env python3
"""
Generate simple placeholder icons for GTrack Android app
Creates icons with "GT" text in a blue circle/square
"""

try:
    from PIL import Image, ImageDraw, ImageFont
    import os
    import sys
except ImportError:
    print("PIL (Pillow) is required. Install it with: pip3 install Pillow")
    sys.exit(1)

def create_icon(size, is_round=False):
    """Create an icon of the specified size"""
    # Create image with transparent background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Colors matching your app theme (blue #2196F3)
    bg_color = (33, 150, 243, 255)  # #2196F3
    text_color = (255, 255, 255, 255)  # White
    
    # Draw shape
    padding = size // 10
    if is_round:
        # Draw circle
        draw.ellipse([padding, padding, size - padding, size - padding], 
                    fill=bg_color)
    else:
        # Draw rounded rectangle
        corner_radius = size // 6
        draw.rounded_rectangle([padding, padding, size - padding, size - padding],
                             radius=corner_radius, fill=bg_color)
    
    # Draw "GT" text
    try:
        # Try to use a nice font, fallback to default if not available
        font_size = size // 3
        try:
            # Try system fonts (varies by OS)
            font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
        except:
            try:
                font = ImageFont.truetype("Arial.ttf", font_size)
            except:
                font = ImageFont.load_default()
    except:
        font = ImageFont.load_default()
    
    # Calculate text position (centered)
    text = "GT"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    text_x = (size - text_width) // 2 - bbox[0]
    text_y = (size - text_height) // 2 - bbox[1]
    
    draw.text((text_x, text_y), text, fill=text_color, font=font)
    
    return img

def main():
    """Generate all required icon sizes"""
    base_dir = os.path.join(os.path.dirname(__file__), "android", "app", "src", "main", "res")
    
    # Icon sizes for each density
    sizes = {
        "mipmap-mdpi": 48,
        "mipmap-hdpi": 72,
        "mipmap-xhdpi": 96,
        "mipmap-xxhdpi": 144,
        "mipmap-xxxhdpi": 192,
    }
    
    print("Generating GTrack app icons...")
    
    for folder, size in sizes.items():
        folder_path = os.path.join(base_dir, folder)
        
        # Create folder if it doesn't exist
        os.makedirs(folder_path, exist_ok=True)
        
        # Generate square icon
        icon = create_icon(size, is_round=False)
        icon_path = os.path.join(folder_path, "ic_launcher.png")
        icon.save(icon_path, "PNG")
        print(f"✓ Created {icon_path} ({size}x{size})")
        
        # Generate round icon
        round_icon = create_icon(size, is_round=True)
        round_icon_path = os.path.join(folder_path, "ic_launcher_round.png")
        round_icon.save(round_icon_path, "PNG")
        print(f"✓ Created {round_icon_path} ({size}x{size})")
    
    print("\n✅ All icons generated successfully!")
    print("Rebuild your app to see the new icons:")
    print("  cd android && ./gradlew clean && cd .. && npm run android")

if __name__ == "__main__":
    main()

