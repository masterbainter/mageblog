#!/usr/bin/env python3

"""
Grok Generator using PyAutoGUI (no sudo required)
Triggers Super+Shift+A to open Grok, then types the prompt
"""

import time
import json
import sys
import subprocess

# Try to import pyautogui, install if not available
try:
    import pyautogui
except ImportError:
    print("📦 Installing pyautogui...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "--user", "pyautogui"])
    import pyautogui

# Try to import pyperclip for clipboard, install if not available
try:
    import pyperclip
except ImportError:
    print("📦 Installing pyperclip...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "--user", "pyperclip"])
    import pyperclip

GROK_PROMPT = """You are Grand Magus Alistair, a wizard who claims to be one of the five most powerful mages, but your "magical" feats are actually just mundane modern activities described in grandiose medieval terms.

Write a short (2-3 sentences) humorous blog post for today's chronicle entry. The post should:
- Describe a mundane daily activity (laundry, grocery shopping, tech support, etc.) as if it were a grand magical quest
- Use dramatic, archaic language
- Include specific details that reveal it's actually something ordinary
- Be funny through the contrast between the grandiose description and mundane reality

Write ONE new chronicle entry for today. Only return the chronicle text, no additional commentary."""

def generate_with_grok():
    """Generate blog post using Grok via keyboard shortcut"""

    print("🤖 Generating with Grok using keyboard shortcut...")
    print("")

    # Give user a moment to see what's happening
    print("⚠️  This will trigger your Super+Shift+A shortcut in 3 seconds...")
    print("   Make sure you're at your desktop!")
    for i in range(3, 0, -1):
        print(f"   {i}...")
        time.sleep(1)

    # Step 1: Open Grok with Super+Shift+A
    print("\n1️⃣  Opening Grok (Super+Shift+A)...")
    pyautogui.hotkey('winleft', 'shift', 'a')
    time.sleep(2)  # Wait for Grok to open

    # Step 2: Type the prompt
    print("2️⃣  Typing prompt...")
    pyautogui.typewrite(GROK_PROMPT, interval=0.01)  # Type with small delay
    time.sleep(0.5)

    # Step 3: Press Enter to submit
    print("3️⃣  Submitting prompt (Enter)...")
    pyautogui.press('return')

    # Step 4: Wait for response
    print("4️⃣  Waiting for Grok to respond...")
    print("    (This may take 10-30 seconds...)")
    time.sleep(20)  # Wait for Grok to generate response

    # Step 5: Select all text and copy
    print("5️⃣  Copying response...")
    pyautogui.hotkey('ctrl', 'a')  # Select all
    time.sleep(0.5)
    pyautogui.hotkey('ctrl', 'c')  # Copy
    time.sleep(0.5)

    # Step 6: Get clipboard content
    print("6️⃣  Retrieving from clipboard...")
    response = pyperclip.paste()

    # Step 7: Close Grok window
    print("7️⃣  Closing Grok (Escape)...")
    pyautogui.press('esc')
    time.sleep(0.5)

    if not response:
        raise Exception("Failed to get response from clipboard")

    # Clean up the response - remove the prompt if it was included
    response = response.strip()

    # Try to extract just the chronicle entry (after the prompt)
    if GROK_PROMPT in response:
        response = response.split(GROK_PROMPT)[-1].strip()

    # Remove common prefixes
    prefixes = ["Here's a chronicle entry:", "Chronicle entry:", "Here is the entry:", "Here you go:"]
    for prefix in prefixes:
        if response.lower().startswith(prefix.lower()):
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
        import traceback
        traceback.print_exc()
        return 1

if __name__ == '__main__':
    sys.exit(main())
