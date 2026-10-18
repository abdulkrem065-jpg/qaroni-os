import os
import re

directories = ['src', 'server', 'docs']

replacements = {
    r'مستودع ومتجر الذيباني VIP الشامل': 'نظام قاروني (QEOS) الشامل',
    r'متجر الذيباني VIP': 'نظام قاروني (QEOS)',
    r'مستودع الذيباني VIP': 'نظام قاروني (QEOS)',
    r'بوابة الذيباني VIP': 'بوابة QEOS',
    r'هايبر الذيباني VIP': 'منصة QEOS',
    r'مساعد الذيباني VIP الذكي': 'مساعد QEOS الذكي',
    r'Al-Dheebani VIP Warehouse & Store': 'QEOS Platform',
    r'Al-Dheebani VIP!': 'QEOS!',
    r'Smart Store VIP AI': 'QEOS AI',
    r'Smart Store VIP': 'QEOS',
    r'الذيباني VIP': 'QEOS',
    r'الذيباني': 'قاروني'
}

for root, _, files in os.walk('.'):
    if 'node_modules' in root or '.git' in root:
        continue
    for file in files:
        if file.endswith(('.ts', '.tsx', '.js', '.json', '.md')):
            filepath = os.path.join(root, file)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
            except Exception:
                continue
            
            original_content = content
            for pattern, replacement in replacements.items():
                content = re.sub(pattern, replacement, content)
                
            if content != original_content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Updated {filepath}")
