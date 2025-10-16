#!/usr/bin/env python3

"""
Extract X.com cookies from Chrome/Chromium browser
"""

import sqlite3
import json
import os
import shutil
from pathlib import Path

# Find Chrome/Chromium cookie database
CHROME_PATHS = [
    Path.home() / '.config' / 'google-chrome' / 'Default' / 'Cookies',
    Path.home() / '.config' / 'chromium' / 'Default' / 'Cookies',
    Path.home() / '.config' / 'google-chrome' / 'Profile 1' / 'Cookies',
    Path.home() / '.config' / 'chromium' / 'Profile 1' / 'Cookies',
]

def find_cookie_db():
    """Find the Chrome/Chromium cookie database"""
    for path in CHROME_PATHS:
        if path.exists():
            print(f"✅ Found cookie database: {path}")
            return path
    return None

def extract_x_cookies(cookie_db_path):
    """Extract X.com cookies from the database"""

    # Make a temporary copy (Chrome locks the database)
    temp_db = '/tmp/chrome_cookies_copy.db'
    shutil.copy2(cookie_db_path, temp_db)

    try:
        conn = sqlite3.connect(temp_db)
        cursor = conn.cursor()

        # Query for X.com cookies
        # Chrome's cookie schema: name, value, host_key, path, expires_utc, is_secure, is_httponly
        query = """
            SELECT name, value, host_key, path, expires_utc, is_secure, is_httponly
            FROM cookies
            WHERE host_key LIKE '%x.com%' OR host_key LIKE '%twitter.com%'
        """

        cursor.execute(query)
        rows = cursor.fetchall()

        cookies = []
        for row in rows:
            name, value, domain, path, expires, is_secure, is_httponly = row

            # Chrome stores expiration in microseconds since epoch
            # Convert to seconds for Selenium
            expiration_date = expires / 1000000 if expires else None

            cookie = {
                'name': name,
                'value': value,
                'domain': domain,
                'path': path,
                'secure': bool(is_secure),
                'httpOnly': bool(is_httponly)
            }

            if expiration_date:
                cookie['expirationDate'] = expiration_date

            cookies.append(cookie)

        conn.close()

        return cookies

    finally:
        # Clean up temp file
        if os.path.exists(temp_db):
            os.remove(temp_db)

def main():
    print("🍪 Extracting X.com cookies from Chrome/Chromium...")
    print("")

    # Find cookie database
    cookie_db = find_cookie_db()

    if not cookie_db:
        print("❌ Could not find Chrome/Chromium cookie database")
        print("")
        print("Searched paths:")
        for path in CHROME_PATHS:
            print(f"  - {path}")
        print("")
        print("Please ensure Chrome/Chromium is installed and you're logged into X.com")
        return 1

    # Extract cookies
    try:
        cookies = extract_x_cookies(cookie_db)

        if not cookies:
            print("❌ No X.com cookies found")
            print("")
            print("Make sure you're logged into https://x.com in your Chrome/Chromium browser")
            return 1

        print(f"✅ Found {len(cookies)} X.com cookies")

        # Show important cookies
        important_cookies = ['auth_token', 'ct0', 'kdt']
        found_important = [c['name'] for c in cookies if c['name'] in important_cookies]

        if found_important:
            print(f"✅ Found authentication cookies: {', '.join(found_important)}")
        else:
            print("⚠️  Warning: No auth_token cookie found. You may not be logged in.")

        # Save to file
        output_file = Path(__file__).parent / 'x-cookies.json'
        with open(output_file, 'w') as f:
            json.dump(cookies, f, indent=2)

        print("")
        print(f"✅ Cookies saved to: {output_file}")
        print("")
        print("Test the cookies with:")
        print("  node grok-generator.js")

        return 0

    except Exception as e:
        print(f"❌ Error extracting cookies: {e}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == '__main__':
    exit(main())
