#!/bin/bash

# Setup cron job for automated blog post generation

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
CRON_CMD="0 9 * * * cd $SCRIPT_DIR && /usr/bin/node generate-blog-post.js >> /tmp/grimoire-blog.log 2>&1"

echo "Setting up cron job for Grand Magus Alistair's automated blog..."
echo ""
echo "This will run daily at 9:00 AM and generate a new Chronicle entry."
echo ""
echo "Cron command:"
echo "$CRON_CMD"
echo ""

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "generate-blog-post.js"; then
    echo "⚠️  Cron job already exists!"
    echo ""
    echo "Current cron jobs:"
    crontab -l | grep "generate-blog-post.js"
    echo ""
    read -p "Do you want to replace it? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 0
    fi
    # Remove existing job
    crontab -l | grep -v "generate-blog-post.js" | crontab -
fi

# Add new cron job
(crontab -l 2>/dev/null; echo "$CRON_CMD") | crontab -

echo "✅ Cron job installed successfully!"
echo ""
echo "To view all cron jobs:"
echo "  crontab -l"
echo ""
echo "To remove this cron job:"
echo "  crontab -e"
echo "  (then delete the line with generate-blog-post.js)"
echo ""
echo "To test the script manually:"
echo "  node $SCRIPT_DIR/generate-blog-post.js"
echo ""
