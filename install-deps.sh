#!/bin/bash

echo "📦 Installing dependencies for Grok keyboard automation..."
echo ""

# Install xdotool for keyboard simulation
if ! command -v xdotool &> /dev/null; then
    echo "Installing xdotool..."
    sudo pacman -S --noconfirm xdotool
else
    echo "✅ xdotool already installed"
fi

# Install xclip for clipboard access
if ! command -v xclip &> /dev/null; then
    echo "Installing xclip..."
    sudo pacman -S --noconfirm xclip
else
    echo "✅ xclip already installed"
fi

echo ""
echo "✅ All dependencies installed!"
echo ""
echo "Test Grok generation with:"
echo "  python3 grok-keyboard.py"
