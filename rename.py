import os
import re

files_to_update = [
    'src/data/defaultData.ts',
    'src/layout/Header.tsx',
    'src/admin/Dashboard.tsx',
    'src/auth/Gateway.tsx',
    'src/App.tsx',
    'server/modules/assistant/assistant.gemini.ts',
    'server/modules/assistant/context/organizations.context.ts',
    'server/modules/assistant/assistant.service.ts'
]

replacements = {
    r'مستودع ومتجر الذيباني VIP': 'نظام قاروني (QEOS)',
    r'مستودع ومخازن الذيباني VIP': 'نظام قاروني (QEOS)',
    r'مستودعات الذيباني التجارية VIP': 'نظام قاروني (QEOS)',
    r'مستودع الذيباني الفاخر VIP': 'نظام قاروني (QEOS)',
    r'متجر الذيباني الفاخر VIP': 'نظام قاروني (QEOS)',
    r'متجر ومستودع الذيباني VIP': 'نظام قاروني (QEOS)',
    r'مستودع ومتجر الذيباني': 'نظام قاروني (QEOS)',
    r'مستودعات الذيباني': 'نظام قاروني (QEOS)',
    r'متجر الذيباني الفاخر': 'نظام قاروني',
    r'مستودع الذيباني': 'نظام قاروني',
    r'متجر الذيباني': 'نظام قاروني',
    r'الذيباني VIP': 'QEOS',
    r'الذيباني': 'قاروني',
    r'Al-Dhibani VIP Live Recharge & Logistics Hub': 'QEOS Multi-Tenant ERP & SaaS Platform',
    r'Al-Dheebani VIP Hybrid Warehouse': 'QEOS Platform',
    r'Al-Dheebani VIP Hybrid system': 'QEOS System',
    r'Al-Dheebani VIP Warehouse': 'QEOS Platform',
    r'ALDHEEBANI VIP CLOUD WORKSPACE': 'QEOS CLOUD WORKSPACE',
    r'Al-Dhibani VIP Store': 'QEOS',
    r'Al-Dhibani VIP': 'QEOS',
    r'Aldhibani VIP': 'QEOS',
    r'Al-Dheebani VIP': 'QEOS'
}

for filepath in files_to_update:
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        for pattern, replacement in replacements.items():
            content = re.sub(pattern, replacement, content)
            
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated {filepath}")
