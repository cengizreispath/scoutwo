# ScoutWo Mock Data Fix Summary

## 🐛 Issue
**Problem:** Search results show mock placeholder data instead of real products from Nike, Adidas, and other brands.

**User Report:** "Arama sonuçlarında Mock data var ancak gerçek data hala yok. Belirlenen markaların siteleri dB de var mı? Neden ürünler hala listelenemiyor?"

**Pipeline ID:** 9b154c20-4598-49c8-bb86-d04ef919d2cc

---

## 🔍 Root Cause Analysis

**File:** `src/scraper/scraper.ts` (Line 177-181)

**Problem:** The scraper was configured to use mock data by default:

```typescript
// ❌ BROKEN CODE
if (process.env.USE_MOCK_SCRAPER !== 'false') {
  console.log(`[Scraper] Using mock data for ${brandSlug}`);
  return genericScraper(null as any, brandSlug, query);
}
```

**Why This Failed:**
- `USE_MOCK_SCRAPER` environment variable was NOT set in Coolify deployment
- Code defaulted to mock data when env variable was missing
- Real Playwright scraping was never executed
- Mock data generator created placeholder products instead of real ones

**Result:** Users saw fake "Mock Product 1", "Mock Product 2" etc. instead of real Nike/Adidas products.

---

## ✅ Solution

**Fix:** Invert the logic - use REAL scraping by default, mock only when explicitly enabled.

```typescript
// ✅ FIXED CODE
if (process.env.USE_MOCK_SCRAPER === 'true') {
  console.log(`[Scraper] Using mock data for ${brandSlug} (USE_MOCK_SCRAPER=true)`);
  return genericScraper(null as any, brandSlug, query);
}
```

### Changes Made

**Files Modified:**
1. `src/scraper/scraper.ts` - Inverted mock/real logic
2. `.env.example` - Added documentation for USE_MOCK_SCRAPER
3. `tests/unit/scraper.test.ts` - Created comprehensive unit tests

**Commits:**
- `0fd0470` - Fix implementation + .env.example documentation
- `9bf3b51` - Unit tests

---

## 🧪 Testing

Created unit tests in `tests/unit/scraper.test.ts`:

✅ Test: Real scraping by default (no env variable)
✅ Test: Real scraping when USE_MOCK_SCRAPER=false
✅ Test: Mock data when USE_MOCK_SCRAPER=true
✅ Test: Real scraping for invalid values
✅ Test: Behavior documentation

**Test Coverage:** 5 test cases covering all edge cases

---

## 📋 Khan Dev Cycle Pipeline Results

| Agent | Status | Duration | Output |
|-------|--------|----------|--------|
| **Product Owner** | ✅ Done | 12.2s | Root cause identified: USE_MOCK_SCRAPER env not set |
| **Software Architect** | ✅ Done | 13.2s | Invert logic: Real scraping by default |
| **Fullstack Developer** | ✅ Done | 23.7s | Fixed scraper.ts, committed & pushed |
| **Test Engineer** | ✅ Done | 25.2s | Created unit tests |
| **QA Reviewer** | ✅ Done | 12.5s | Code review APPROVED |
| **DevOps Engineer** | ✅ Done | 37.6s | Triggered Coolify deployment |

**Total Pipeline Time:** ~2 minutes 4 seconds

---

## 🚀 Deployment

**Status:** Deploying ✅

- **Platform:** Coolify
- **App ID:** n0gwgwookgg48cs8o880kss0
- **Deployment UUID:** ogkow4sg0o4ck84wkssoscgs
- **Domain:** https://scoutwo.dotthedoor.com
- **Branch:** main
- **Latest Commit:** 9bf3b51

**Deployment Status:** in_progress (as of 2026-03-08 20:20 UTC)

---

## ✨ Expected Behavior After Fix

### Before Fix:
1. User clicks "Ürünleri Listele"
2. Scraper runs with `USE_MOCK_SCRAPER !== 'false'` → TRUE
3. Mock data generator creates fake products
4. UI shows "Mock Product 1 (nike)", "Mock Product 2 (adidas)", etc. ❌

### After Fix:
1. User clicks "Ürünleri Listele"
2. Scraper runs with `USE_MOCK_SCRAPER === 'true'` → FALSE
3. Playwright launches Chrome, navigates to Nike.com.tr, Adidas.com.tr
4. Real products are scraped and saved to database
5. UI shows actual Nike Air Max, Adidas Ultraboost, etc. ✅

---

## 🔧 Environment Variable Documentation

**USE_MOCK_SCRAPER** - Controls scraper behavior

**Values:**
- `undefined` (not set) → **Real Playwright scraping** (Production default) ✅
- `"true"` → Mock data (Development/testing)
- `"false"` → Real Playwright scraping
- Any other value → Real Playwright scraping

**When to use mock:**
- Local development without Playwright setup
- Unit/integration tests that don't need real scraping
- CI/CD environments where Playwright is unavailable

**Production setup:**
- DO NOT set USE_MOCK_SCRAPER in Coolify
- Or explicitly set `USE_MOCK_SCRAPER=false`
- Default behavior is now production-ready

---

## 📝 Technical Details

**Scraper Architecture:**
- **Brands with custom scrapers:** Nike, Adidas (Playwright-based)
- **Generic scraper:** Fallback for brands without custom scrapers
- **Browser:** Chromium (Playwright) with headless mode
- **Timeout:** 30s for page load, 10s for selectors
- **Selectors:** Multiple fallback selectors for resilience

**Mock Data Generator:**
- Returns 3 placeholder products per brand
- Uses `placeholder.com` images
- Prices: 199.99, 299.99, 399.99 TRY
- Only used when `USE_MOCK_SCRAPER=true`

**Database Flow:**
1. Scraper fetches products
2. Worker saves to `products` table
3. Links created in `search_results` table
4. Frontend polls for completion
5. Products displayed via `getBySearch` query

---

## 🔗 References

- **Repo:** https://github.com/cengizreispath/scoutwo
- **Deployment:** https://scoutwo.dotthedoor.com
- **Playwright Docs:** https://playwright.dev/docs/api/class-browser
- **Coolify Dashboard:** https://coolify.dotthedoor.com
- **Previous Fix:** FIX_SUMMARY.md (SQL inArray fix)

---

## 🎯 Key Learnings

1. **Default behavior matters** - Production should be the default, not development
2. **Environment variables** - Missing env vars should fail safe (use production behavior)
3. **Documentation** - Always document env variables in .env.example
4. **Testing** - Test both presence and absence of env variables
5. **Code clarity** - `=== 'true'` is clearer than `!== 'false'`

---

**Fixed by:** Khan AI Agent Pipeline
**Date:** 2026-03-08
**Time:** ~20:20 UTC
**Total Duration:** 2 minutes 4 seconds
