#!/bin/bash

# Cookie Export Helper Script for X.com
# This script helps you export cookies from your browser

echo "🍪 X.com Cookie Export Helper"
echo "================================"
echo ""
echo "To use Grok with Selenium, you need to export your X.com cookies."
echo ""
echo "Choose your browser:"
echo ""
echo "1) Chrome/Chromium - Export cookies from Chrome"
echo "2) Firefox - Export cookies from Firefox"
echo "3) Manual - I'll use a browser extension"
echo ""
read -p "Enter choice [1-3]: " choice

case $choice in
    1)
        echo ""
        echo "📋 Chrome Cookie Export Steps:"
        echo "================================"
        echo ""
        echo "1. Install 'EditThisCookie' extension:"
        echo "   https://chrome.google.com/webstore/detail/editthiscookie/fngmhnnpilhplaeedifhccceomclgfbg"
        echo ""
        echo "2. Go to https://x.com and make sure you're logged in"
        echo ""
        echo "3. Click the EditThisCookie extension icon"
        echo ""
        echo "4. Click the 'Export' button (looks like a download icon)"
        echo ""
        echo "5. Save the exported JSON to: $(pwd)/x-cookies.json"
        echo ""
        ;;
    2)
        echo ""
        echo "📋 Firefox Cookie Export Steps:"
        echo "================================"
        echo ""
        echo "1. Install 'Cookie Quick Manager' extension:"
        echo "   https://addons.mozilla.org/en-US/firefox/addon/cookie-quick-manager/"
        echo ""
        echo "2. Go to https://x.com and make sure you're logged in"
        echo ""
        echo "3. Click the Cookie Quick Manager icon"
        echo ""
        echo "4. Search for 'x.com' cookies"
        echo ""
        echo "5. Click 'Export' and save as JSON"
        echo ""
        echo "6. Save the file as: $(pwd)/x-cookies.json"
        echo ""
        ;;
    3)
        echo ""
        echo "📋 Manual Export Steps:"
        echo "================================"
        echo ""
        echo "Use any cookie export extension that outputs JSON format."
        echo ""
        echo "Required format:"
        echo '['
        echo '  {'
        echo '    "name": "auth_token",'
        echo '    "value": "...",'
        echo '    "domain": ".x.com",'
        echo '    "path": "/",'
        echo '    "secure": true,'
        echo '    "httpOnly": true'
        echo '  },'
        echo '  ...'
        echo ']'
        echo ""
        echo "Save the exported cookies to: $(pwd)/x-cookies.json"
        echo ""
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

echo "After exporting cookies, test the setup:"
echo ""
echo "  node grok-generator.js"
echo ""
echo "If successful, you should see a generated blog post!"
echo ""
echo "Security Note: x-cookies.json contains your login credentials."
echo "Keep it private and add it to .gitignore!"
echo ""

# Add to .gitignore if it exists
if [ -f .gitignore ]; then
    if ! grep -q "x-cookies.json" .gitignore; then
        echo "x-cookies.json" >> .gitignore
        echo "✅ Added x-cookies.json to .gitignore"
    fi
else
    echo "x-cookies.json" > .gitignore
    echo "✅ Created .gitignore with x-cookies.json"
fi
