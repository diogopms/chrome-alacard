#!/bin/bash
zip -r build/alacard-chrome-$1.zip manifest.json popup.html js/ img/ -x .DS_Store .gitignore \*/.DS_Store
