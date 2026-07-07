import os
import re

def process_directory(directory):
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Replace ?w=...&fit=max&auto=format with ?auto=format
                # Regex pattern: \?w=\d+&fit=max&auto=format
                new_content = re.sub(r'\?w=\d+&fit=max&auto=format', '?auto=format', content)
                
                if new_content != content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Updated {filepath}")

if __name__ == '__main__':
    process_directory('/Volumes/TrienSSD/WEBSITE BDS/src')
