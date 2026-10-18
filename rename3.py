import os
import re

directories = ['src', 'server', 'docs']

replacements = {
    r'جاري تحميل مساعد الذكاء الاصطناعي VIP': 'جاري تحميل مساعد الذكاء الاصطناعي QEOS',
    r'Stable VIP Ledger': 'Stable QEOS Ledger',
    r'باقة يمن موبايل أندرويد VIP': 'باقة يمن موبايل أندرويد',
    r'Yemen Mobile VIP Android Recharge': 'Yemen Mobile Android Recharge',
    r'التقارير الاستراتيجية VIP': 'التقارير الاستراتيجية QEOS',
    r'Exclusive VIP Banners': 'Exclusive QEOS Banners',
    r'VIP Microscopic Order Tracking Portal': 'QEOS Microscopic Order Tracking Portal',
    r'VIP Live Invoice Tracker Portal': 'QEOS Live Invoice Tracker Portal',
    r'VIP Invoice': 'QEOS Invoice',
    r'Print VIP Receipt': 'Print QEOS Receipt',
    r'نظامنا VIP يخزن': 'نظامنا QEOS يخزن',
    r'شحن شدات ببجي VIP': 'شحن شدات ببجي'
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
