# Unnecessary Files Report

This document lists files and directories that are not needed in the codebase.

## 🔴 High Priority - Remove Immediately

### 1. Next.js Files (Project uses Vite/React, not Next.js)
- ❌ **`app/`** directory - Next.js app router (not used)
  - `app/page.tsx` - Next.js template
  - `app/layout.tsx` - Next.js template
  - `app/globals.css` - Next.js template
  - `app/favicon.ico` - Duplicate
- ❌ **`next.config.ts`** - Next.js configuration
- ❌ **`next-env.d.ts`** - Next.js TypeScript declarations
- ❌ **`.next/`** directory - Next.js build output (should be gitignored)
- ❌ **`eslint.config.mjs`** - Next.js ESLint config (duplicate of `eslint.config.js`)

### 2. Temporary Files
- ❌ **`temp-api-repo/`** directory - Temporary cloned API repository (already gitignored, but should be deleted)

### 3. Next.js Template Assets in public/
- ❌ **`public/next.svg`** - Next.js logo (not used)
- ❌ **`public/vercel.svg`** - Vercel logo (not used)
- ❌ **`public/file.svg`** - Not referenced
- ❌ **`public/window.svg`** - Not referenced
- ❌ **`public/globe.svg`** - Not referenced

### 4. Empty Directories
- ❌ **`netlify/functions/`** - Empty directory

## 🟡 Medium Priority - Review & Clean Up

### 5. Duplicate/Unused Files
- ⚠️ **`fonts.css`** in root directory - Not imported anywhere (fonts are in `public/fonts/` and referenced via `index.html`)

### 6. Build Artifacts (Should be gitignored - already are)
- ⚠️ **`dist/`** directory - Vite build output (already in `.gitignore`, but may exist locally)
- ⚠️ **`.next/`** directory - Next.js build output (already in `.gitignore`, but may exist locally)

## 🟢 Low Priority - Optional Cleanup

### 7. Documentation
- 📝 **`TODO.md`** - Contains completed tasks, might be outdated

## ✅ Files to KEEP

- ✅ `eslint.config.js` - Main ESLint config for Vite
- ✅ `index.html` - Vite entry point (needed)
- ✅ `vite.config.ts` - Vite configuration (needed)
- ✅ `public/fonts/` - Font files (used)
- ✅ `public/fonts.css` - Font CSS (used in index.html via preload)
- ✅ All `src/` files - Actual application code
- ✅ All config files in root (except Next.js ones)

## 📋 Cleanup Commands

```bash
# Remove Next.js files
rm -rf app/
rm next.config.ts
rm next-env.d.ts
rm eslint.config.mjs

# Remove Next.js template assets
rm public/next.svg
rm public/vercel.svg
rm public/file.svg
rm public/window.svg
rm public/globe.svg

# Remove temporary files
rm -rf temp-api-repo/

# Remove empty directories
rm -rf netlify/functions/

# Remove duplicate fonts.css from root
rm fonts.css

# Optional: Remove build artifacts (will be regenerated)
rm -rf dist/
rm -rf .next/
```

## ⚠️ Notes

1. **Before deleting**: Make sure you're not using Next.js for any API routes or server-side features
2. **Backup**: Consider committing changes before cleanup
3. **Fonts**: The root `fonts.css` appears unused - verify no components import it before deleting
4. **TODO.md**: Review and update or delete if no longer needed



