# Legacy Chorus2 Code

This directory contains the original Chorus2 codebase for reference and backward compatibility.

## Contents

- **src/** - Original CoffeeScript source code
- **dist/** - Compiled distribution files
- **Gruntfile.js** - Original Grunt build configuration
- **package.json** - Original dependencies (npm + Ruby gems)
- **build.sh** - Original build script

## Building Legacy Code

If you need to build or maintain the legacy Chorus2 code:

```bash
cd legacy

# Install dependencies
npm install
bundle install

# Build
grunt build

# Development watch mode
grunt
```

## Note

This code is preserved for reference only. All new development should be done in the modern Verse codebase (root directory).

For more information about Verse, see the main [README.md](../README.md) and [PROJECT_PLAN.md](../PROJECT_PLAN.md).
