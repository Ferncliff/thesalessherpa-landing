#!/bin/bash

# Create PDF from HTML using headless Chrome (if available)
if command -v /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome &> /dev/null; then
    echo "Creating PDF using Chrome..."
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
        --headless \
        --disable-gpu \
        --print-to-pdf=TheSalesSherpa_Dashboard_Concept.pdf \
        --no-margins \
        --run-all-compositor-stages-before-draw \
        --virtual-time-budget=5000 \
        "file://$(pwd)/TheSalesSherpa_Dashboard_Concept.html"
    
    if [ -f "TheSalesSherpa_Dashboard_Concept.pdf" ]; then
        echo "✅ PDF created successfully!"
        open TheSalesSherpa_Dashboard_Concept.pdf
    else
        echo "❌ PDF creation failed"
    fi
else
    echo "Chrome not found. Opening HTML file for manual PDF export..."
    open TheSalesSherpa_Dashboard_Concept.html
    echo "To create PDF: File → Print → Save as PDF"
fi