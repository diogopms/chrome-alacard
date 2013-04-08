#!/bin/bash
mkdir -p build
zip -r build/chrome-alacard-$1.zip manifest.json popup.html options.html js/ img/ css/ -x .DS_Store .gitignore \*/.DS_Store
