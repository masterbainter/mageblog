#!/usr/bin/env python3

"""
Grok Generator using Keyboard Automation
Triggers Super+Shift+A to open Grok, then types the prompt
"""

import subprocess
import time
import json
import sys

GROK_PROMPT = """You are Grand Magus Alistair, a wizard who claims to be one of the five most powerful mages, but your "magical" feats are actually just mundane modern activities described in grandiose medieval terms.

Write a short (2-3 sentences) humorous blog post for today's chronicle entry. The post should:
- Describe a mundane daily activity (laundry, grocery shopping, tech support, etc.) as if it were a grand magical quest
- Use dramatic, archaic language
- Include specific details that reveal it's actually something ordinary
- Be funny through the contrast between the grandiose description and mundane reality

Write ONE new chronicle entry for today. Only return the chronicle text, no additional commentary."""

def send_keys(keys):
    """Send keyboard keys using xdotool"""
    try:
        subprocess.run(['xdotool', 'key', keys], check=True)
        return True
    except FileNotFoundError:
        print("❌ xdotool not installed. Installing...")
        # Try to install xdotool
        try:
            subprocess.run(['pacman', '-S', '--noconfirm', 'xdotool'], check=True)
            subprocess.run(['xdotool', 'key', keys], check=True)
            return True
        except:
            return False
    except Exception as e:
        print(f"❌ Error sending keys: {e}")
        return False

def type_text(text):
    """Type text using xdotool"""
    try:
        # xdotool type can handle special characters
        subprocess.run(['xdotool', 'type', '--delay', '50', text], check=True)
        return True
    except Exception as e:
        print(f"❌ Error typing text: {e}")
        return False

def get_clipboard():
    """Get clipboard contents"""
    try:
        result = subprocess.run(['xclip', '-o', '-selection', 'clipboard'],
                              capture_output=True, text=True, check=True)
        return result.stdout
    except:
        # Try with xsel as fallback
        try:
            result = subprocess.run(['xsel', '--clipboard', '--output'],
                                  capture_output=True, text=True, check=True)
            return result.stdout
        except:
            return None

def generate_with_grok():
    """Generate blog post using Grok via keyboard shortcut"""

    print("🤖 Generating with Grok using keyboard shortcut...")
    print("")

    # Step 1: Open Grok with Super+Shift+A
    print("1️⃣  Opening Grok (Super+Shift+A)...")
    if not send_keys('super+shift+a'):
        raise Exception("Failed to send keyboard shortcut. Make sure xdotool is installed.")

    time.sleep(2)  # Wait for Grok to open

    # Step 2: Type the prompt
    print("2️⃣  Typing prompt...")
    if not type_text(GROK_PROMPT):
        raise Exception("Failed to type prompt")

    time.sleep(1)

    # Step 3: Press Enter to submit
    print("3️⃣  Submitting prompt (Enter)...")
    send_keys('Return')

    # Step 4: Wait for response
    print("4️⃣  Waiting for Grok to respond...")
    print("    (This may take 10-30 seconds...)")
    time.sleep(25)  # Wait longer for Grok to generate response

    # Step 5: Select all text and copy
    print("5️⃣  Copying response...")
    send_keys('ctrl+a')  # Select all
    time.sleep(0.5)
    send_keys('ctrl+c')  # Copy
    time.sleep(0.5)

    # Step 6: Get clipboard content
    print("6️⃣  Retrieving from clipboard...")
    response = get_clipboard()

    # Step 7: Close Grok window
    print("7️⃣  Closing Grok (Escape)...")
    send_keys('Escape')
    time.sleep(0.5)

    if not response:
        raise Exception("Failed to get response from clipboard")

    # Clean up the response - remove the prompt if it was included
    response = response.strip()

    # Try to extract just the chronicle entry (after the prompt)
    if GROK_PROMPT in response:
        response = response.split(GROK_PROMPT)[-1].strip()

    # Remove common prefixes
    prefixes = ["Here's a chronicle entry:", "Chronicle entry:", "Here is the entry:"]
    for prefix in prefixes:
        if response.startswith(prefix):
            response = response[len(prefix):].strip()

    return response

def main():
    try:
        print("🧙 Grand Magus Alistair's Grok Blog Generator")
        print("=" * 50)
        print("")

        response = generate_with_grok()

        print("")
        print("✅ Success! Generated chronicle entry:")
        print("=" * 50)
        print(response)
        print("=" * 50)

        # Output as JSON for easy parsing by Node.js
        output = {"content": response}
        print("")
        print("JSON:", json.dumps(output))

        return 0

    except Exception as e:
        print(f"❌ Error: {e}")
        return 1

if __name__ == '__main__':
    sys.exit(main())
