#!/usr/bin/env python3
"""
Generate poster images from HTML using Selenium + Chrome
"""

import json
import os
import time
from pathlib import Path

try:
    from selenium import webdriver
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
except ImportError:
    print("❌ Selenium not installed. Using HTML files instead.")
    print("\n📂 海报 HTML 文件已生成，请在浏览器中打开:")
    for f in Path('.').glob('poster-*.html'):
        print(f"   • {f.name}")
    exit(0)

# Load cats data
with open('src/data/cats.json', 'r', encoding='utf-8') as f:
    cats_data = json.load(f)

cats_map = {cat['id']: cat for cat in cats_data['cats']}

# Test cases
test_cases = [
    {
        'catId': 'kun_kun_mao',
        'bodyState': '身体不舒服',
        'need': '休息',
        'filename': 'poster-kun-kun',
    },
    {
        'catId': 'wei_qu_mao',
        'bodyState': '心里堵',
        'need': '被理解',
        'filename': 'poster-wei-qu',
    },
    {
        'catId': 'sa_huan_mao',
        'bodyState': '说不出来',
        'need': '被陪着',
        'filename': 'poster-sa-huan',
    },
    {
        'catId': 'beng_jin_mao',
        'bodyState': '都有',
        'need': '自己待着',
        'filename': 'poster-beng-jin',
    },
    {
        'catId': 'zhixiang_mao',
        'bodyState': '说不上来',
        'need': '自己待着',
        'filename': 'poster-zhixiang',
    },
]

print('🎨 Generating Poster Images with Selenium\n')
print('=' * 60)

try:
    # Initialize Chrome driver
    options = webdriver.ChromeOptions()
    options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--window-size=375,600')
    
    driver = webdriver.Chrome(options=options)
    
    for test in test_cases:
        cat = cats_map.get(test['catId'])
        if not cat:
            print(f"❌ Cat not found: {test['catId']}")
            continue
        
        html_file = f"{test['filename']}.html"
        png_file = f"{test['filename']}.png"
        
        try:
            # Load HTML file
            file_path = Path(html_file).resolve()
            driver.get(f'file://{file_path}')
            
            # Wait for page to load
            time.sleep(1)
            
            # Take screenshot
            driver.save_screenshot(png_file)
            
            print(f"✅ Generated: {png_file}")
            print(f"   Cat: {cat['name']}")
            print(f"   Size: 375×600px")
            print()
        except Exception as e:
            print(f"❌ Failed to generate {png_file}: {e}")
    
    driver.quit()
    
except Exception as e:
    print(f"❌ Error: {e}")
    print("\n💡 Chrome/Selenium not available.")
    print("📂 Using HTML files instead. Open in browser to view:")
    for f in Path('.').glob('poster-*.html'):
        print(f"   • {f.name}")

print('=' * 60)
print('\n✅ Done!\n')
