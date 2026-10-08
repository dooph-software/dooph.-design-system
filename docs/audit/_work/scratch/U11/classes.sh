#!/bin/bash
# Extract className-ish tokens from AIChat non-story files and check each against dist-styles.css / src/styles
cd /c/Users/stick/Github/dooph/dooph-Design-System
files=$(ls src/components/AIChat/*.tsx | grep -v stories)
grep -ohE '"[^"]*"' $files | tr -d '"' | tr ' ' '\n' | grep -E '^[a-z]' | grep -vE '^(\.|react|use|button|submit|span|div|open|closed|responding|filled|empty|simple|skill|active|complete|error|thinking|thought|Enter|aria-label|children|title|variant|color|onSubmit|defaultValue|progress|value)$' | grep -vE '/' | sort -u
