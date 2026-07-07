import os
import re

def process_directory(directory):
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Replace query params
                new_content = content.replace('?w=1600&fit=max', '?w=1920&fit=max')
                new_content = new_content.replace('?w=800&fit=max', '?w=1200&fit=max')
                new_content = new_content.replace('?w=900&fit=max', '?w=1200&fit=max')
                new_content = new_content.replace('?w=600&fit=max', '?w=800&fit=max')

                # Replace urlFor chained methods
                new_content = new_content.replace('.width(1600).fit(\'max\')', '.width(1920).fit(\'max\')')
                new_content = new_content.replace('.width(800).fit(\'max\')', '.width(1200).fit(\'max\')')
                new_content = new_content.replace('.width(900).fit(\'max\')', '.width(1200).fit(\'max\')')
                new_content = new_content.replace('.width(600).fit(\'max\')', '.width(800).fit(\'max\')')
                
                if new_content != content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Updated {filepath}")

if __name__ == '__main__':
    process_directory('/Volumes/TrienSSD/WEBSITE BDS/src')
