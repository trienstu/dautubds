import sys
try:
    from PIL import Image
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
    from PIL import Image

def remove_background(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()
    
    newData = []
    for item in datas:
        # Check if the pixel is white or light grey (the checkerboard)
        # Assuming the logo itself doesn't have very light grey pixels that we want to keep.
        # R, G, B are all > 200 and the difference between them is small (grey/white)
        r, g, b, a = item
        if r > 200 and g > 200 and b > 200 and abs(r-g) < 20 and abs(r-b) < 20 and abs(g-b) < 20:
            newData.append((255, 255, 255, 0)) # Transparent
        else:
            newData.append(item)
            
    img.putdata(newData)
    img.save(output_path, "PNG")
    print(f"Saved transparent image to {output_path}")

input_img = "/Users/johnnynguyen/.gemini/antigravity-ide/brain/ad89488f-f6b1-4f1c-a6e8-e6cc33aac220/media__1782922293501.jpg"
output_img = "src/app/icon.png"

remove_background(input_img, output_img)
