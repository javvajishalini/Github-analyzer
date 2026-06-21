# --------------------------------------------------------------
# commit-theme.ps1
# --------------------------------------------------------------
# 1️⃣  Commit the Teal‑Mint theme (already in index.css)
# 2️⃣  Restore the Monochrome palette and commit it
# 3️⃣  Push both commits to GitHub
# --------------------------------------------------------------

# ----- 1️⃣ Commit Teal‑Mint palette --------------------------------
Write-Host "📦 Staging Teal‑Mint theme changes..." -ForegroundColor Cyan
git add frontend/src/index.css
git commit -m "style: apply Teal-Mint theme"

# ----- 2️⃣ Restore Monochrome palette -------------------------------
# Below is the full Monochrome CSS block. It will replace the
# current :root and :root.light sections in index.css.
$monoCss = @'
:root {
  /* Dark Mode (default) */
  --bg-primary: #111111;
  --bg-gradient: radial-gradient(circle at top left, #1c1c1c 0%, #111111 55%, #0a0a0a 100%);
  --text-primary: #f5f5f5;
  --text-secondary: #d1d5db;
  --text-muted: #9ca3af;

  --card-bg: rgba(30, 30, 30, 0.78);
  --card-border: rgba(255, 255, 255, 0.12);
  --card-border-hover: rgba(99, 102, 241, 0.35);
  --card-shadow: 0 12px 40px -12px rgba(0, 0, 0, 0.75);
  --card-shadow-hover: 0 16px 48px -8px rgba(99, 102, 241, 0.2);

  --input-bg: rgba(30, 30, 30, 0.65);
  --input-border: rgba(255, 255, 255, 0.12);
  --table-border: rgba(255, 255, 255, 0.06);
  --table-border-header: rgba(255, 255, 255, 0.08);
  --text-gradient: linear-gradient(135deg, #6366f1 0%, #818cf8 100%);
  --divider: rgba(255, 255, 255, 0.08);

  --sidebar-item-bg: rgba(255, 255, 255, 0.04);
  --sidebar-item-border: rgba(255, 255, 255, 0.08);

  transition: background-color 0.3s ease, color 0.3s ease;
}

:root.light {
  /* Light Mode */
  --bg-primary: #ffffff;
  --bg-gradient: radial-gradient(circle at top left, #f9fafb 0%, #ffffff 55%, #e5e7eb 100%);
  --text-primary: #111827;
  --text-secondary: #4b5563;
  --text-muted: #6b7280;

  --card-bg: rgba(255, 255, 255, 0.94);
  --card-border: rgba(0, 0, 0, 0.08);
  --card-border-hover: rgba(99, 102, 241, 0.4);
  --card-shadow: 0 12px 35px -8px rgba(0, 0, 0, 0.06);
  --card-shadow-hover: 0 18px 45px -6px rgba(99, 102, 241, 0.12);

  --input-bg: rgba(255, 255, 255, 0.96);
  --input-border: rgba(0, 0, 0, 0.1);
  --table-border: rgba(0, 0, 0, 0.05);
  --table-border-header: rgba(0, 0, 0, 0.08);
  --text-gradient: linear-gradient(135deg, #6366f1 0%, #818cf8 100%);
  --divider: rgba(0, 0, 0, 0.08);

  --sidebar-item-bg: rgba(0, 0, 0, 0.04);
  --sidebar-item-border: rgba(0, 0, 0, 0.08);
}
'@

Write-Host "🛠️ Restoring Monochrome palette..." -ForegroundColor Cyan
# Replace the existing :root / :root.light blocks with $monoCss
(Get-Content frontend/src/index.css) -replace '(?s):root\s*\{.*?\}\s*\n\s*:root\.light\s*\{.*?\}', $monoCss |
  Set-Content -Path frontend/src/index.css -Encoding utf8

# ----- 2️⃣ Commit the revert ---------------------------------------
Write-Host "📦 Staging Monochrome revert..." -ForegroundColor Cyan
git add frontend/src/index.css
git commit -m "style: revert to Monochrome theme (option 4)"

# ----- Push both commits -------------------------------------------
Write-Host "🚀 Pushing commits to GitHub..." -ForegroundColor Yellow
git push origin main

Write-Host "✅ All theme changes have been committed and pushed!" -ForegroundColor Green
