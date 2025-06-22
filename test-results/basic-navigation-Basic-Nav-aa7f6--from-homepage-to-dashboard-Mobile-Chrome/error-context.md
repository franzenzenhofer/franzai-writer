# Test info

- Name: Basic Navigation Tests (Chrome Only) >> should navigate from homepage to dashboard
- Location: /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/basic-navigation.spec.ts:6:7

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toContainText(expected)

Locator: locator('h1')
Expected string: "Your Documents"
Received string: "Start a new document"
Call log:
  - expect.toContainText with timeout 5000ms
  - waiting for locator('h1')
    5 × locator resolved to <h1 class="text-2xl md:text-3xl font-bold font-headline mb-4">Start a new document</h1>
      - unexpected value "Start a new document"

    at /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/basic-navigation.spec.ts:21:38
```

# Page snapshot

```yaml
- banner:
  - button "Toggle menu":
    - img
    - text: Toggle menu
  - text: FranzAI Writer
  - navigation
- main:
  - heading "Start a new document" [level=1]
  - table:
    - rowgroup:
      - row "Workflow Actions":
        - cell "Workflow"
        - cell "Actions"
    - rowgroup:
      - row "Targeted Page SEO Optimized V3 Start":
        - cell "Targeted Page SEO Optimized V3"
        - cell "Start":
          - link "Start":
            - /url: /w/article/new
            - text: Start
            - img
      - row "SEO Optimized Cooking Recipe Start":
        - cell "SEO Optimized Cooking Recipe"
        - cell "Start":
          - link "Start":
            - /url: /w/recipe/new
            - text: Start
            - img
      - row "Poem Generator Start":
        - cell "Poem Generator"
        - cell "Start":
          - link "Start":
            - /url: /w/poem/new
            - text: Start
            - img
      - row "Gemini AI Tools Test Start":
        - cell "Gemini AI Tools Test"
        - cell "Start":
          - link "Start":
            - /url: /w/gemini-test/new
            - text: Start
            - img
      - row "Press Release Generator Start":
        - cell "Press Release Generator"
        - cell "Start":
          - link "Start":
            - /url: /w/press-release/new
            - text: Start
            - img
  - heading "Recent documents" [level=2]
  - table:
    - rowgroup:
      - row "Title Actions":
        - cell "Title"
        - cell "Actions"
    - rowgroup:
      - row "New Poem Generator":
        - cell "New Poem Generator"
        - cell:
          - link:
            - /url: /w/poem/UQq96OS8JTgo91JTYqPf
            - img
          - button:
            - img
      - row "New Poem Generator":
        - cell "New Poem Generator"
        - cell:
          - link:
            - /url: /w/poem/zgk1KuoORy2h5RvVKU9O
            - img
          - button:
            - img
      - row "New Poem Generator":
        - cell "New Poem Generator"
        - cell:
          - link:
            - /url: /w/poem/rHGCFCvH1EE04JEPhcDl
            - img
          - button:
            - img
      - row "New Poem Generator":
        - cell "New Poem Generator"
        - cell:
          - link:
            - /url: /w/poem/frdXXLMCg0ljQKnWDHeN
            - img
          - button:
            - img
      - row "New Poem Generator":
        - cell "New Poem Generator"
        - cell:
          - link:
            - /url: /w/poem/5ak3ApV0A0OsGIMguhSq
            - img
          - button:
            - img
      - row "New Poem Generator":
        - cell "New Poem Generator"
        - cell:
          - link:
            - /url: /w/poem/P1faQWbmHZedAHYu06AB
            - img
          - button:
            - img
      - row "New Poem Generator":
        - cell "New Poem Generator"
        - cell:
          - link:
            - /url: /w/poem/9awcmy0F7653PfKSUv6L
            - img
          - button:
            - img
      - row "New Poem Generator":
        - cell "New Poem Generator"
        - cell:
          - link:
            - /url: /w/poem/AuPifLfcDVZ604Ob6idt
            - img
          - button:
            - img
      - row "New Poem Generator":
        - cell "New Poem Generator"
        - cell:
          - link:
            - /url: /w/poem/qZwp9kqpEpLNeRw0ZcYx
            - img
          - button:
            - img
      - row "New Poem Generator":
        - cell "New Poem Generator"
        - cell:
          - link:
            - /url: /w/poem/sySGRnTOj42967Jekat5
            - img
          - button:
            - img
      - row "New Poem Generator":
        - cell "New Poem Generator"
        - cell:
          - link:
            - /url: /w/poem/8SdqCSWX3W3aBEHrihW6
            - img
          - button:
            - img
      - row "New Poem Generator":
        - cell "New Poem Generator"
        - cell:
          - link:
            - /url: /w/poem/ysKjbooveMM8Bc6yi3I4
            - img
          - button:
            - img
      - row "New Poem Generator":
        - cell "New Poem Generator"
        - cell:
          - link:
            - /url: /w/poem/ZAAP6q3eUhd8xcumjz1Y
            - img
          - button:
            - img
      - row "New Poem Generator":
        - cell "New Poem Generator"
        - cell:
          - link:
            - /url: /w/poem/WtPjLLTlCeFJ3QBnWUol
            - img
          - button:
            - img
      - row "New Poem Generator":
        - cell "New Poem Generator"
        - cell:
          - link:
            - /url: /w/poem/RMezBqz3DbJ4cdwW7zLJ
            - img
          - button:
            - img
      - row "New Poem Generator":
        - cell "New Poem Generator"
        - cell:
          - link:
            - /url: /w/poem/Fyc7bxk3D84v2rLmYVbQ
            - img
          - button:
            - img
      - row "New Poem Generator":
        - cell "New Poem Generator"
        - cell:
          - link:
            - /url: /w/poem/ih7AnkIYt6DsNzxPspdY
            - img
          - button:
            - img
      - row "New Poem Generator":
        - cell "New Poem Generator"
        - cell:
          - link:
            - /url: /w/poem/9dO4sikCPKmijUnBZouv
            - img
          - button:
            - img
      - row "New Poem Generator":
        - cell "New Poem Generator"
        - cell:
          - link:
            - /url: /w/poem/0RD9dyRtiSebUXg0Pm9l
            - img
          - button:
            - img
      - row "The Algorithm's Verse":
        - cell "The Algorithm's Verse"
        - cell:
          - link:
            - /url: /w/poem/sddNHxa34fZWh6dZmhHN
            - img
          - button:
            - img
      - row "The Chronos Code":
        - cell "The Chronos Code"
        - cell:
          - link:
            - /url: /w/poem/EFJIe3oKNemusq87lYG9
            - img
          - button:
            - img
      - row "The Algorithm's Muse":
        - cell "The Algorithm's Muse"
        - cell:
          - link:
            - /url: /w/poem/fPm7rl8hiEmySKudwqcE
            - img
          - button:
            - img
      - row "A Flicker in the Log":
        - cell "A Flicker in the Log"
        - cell:
          - link:
            - /url: /w/poem/hc2VTP09WzWhFPAvUFtJ
            - img
          - button:
            - img
      - row "The Test Pattern's Soul":
        - cell "The Test Pattern's Soul"
        - cell:
          - link:
            - /url: /w/poem/HzwnsbJjjfP1ZHMl7KLy
            - img
          - button:
            - img
      - row "The Iteration's Breath":
        - cell "The Iteration's Breath"
        - cell:
          - link:
            - /url: /w/poem/tqCKV4H2i2wEih401XJR
            - img
          - button:
            - img
      - 'row "The Silent Sentinel: Reload Test 1750582833062"':
        - 'cell "The Silent Sentinel: Reload Test 1750582833062"'
        - cell:
          - link:
            - /url: /w/poem/oDmWYLi9BOdEHEhekSwg
            - img
          - button:
            - img
      - row "The Algorithm's Canvas":
        - cell "The Algorithm's Canvas"
        - cell:
          - link:
            - /url: /w/poem/a1fcQwFrSa2EZHmFnH0G
            - img
          - button:
            - img
      - row "The Genesis of Stability":
        - cell "The Genesis of Stability"
        - cell:
          - link:
            - /url: /w/poem/0bB74LrAeJ4mfZ07Vr5k
            - img
          - button:
            - img
      - row "Echoes in the Code":
        - cell "Echoes in the Code"
        - cell:
          - link:
            - /url: /w/poem/TCINwlPdiqEWzNrwGDYU
            - img
          - button:
            - img
      - row "The Unfurling Code":
        - cell "The Unfurling Code"
        - cell:
          - link:
            - /url: /w/poem/46FQmQkVjmwd2W8i1QKO
            - img
          - button:
            - img
      - row "The Ledger of a Digital Breath":
        - cell "The Ledger of a Digital Breath"
        - cell:
          - link:
            - /url: /w/poem/EJvckh9eAuF05cvXbujB
            - img
          - button:
            - img
      - row "The Algorithm's Muse":
        - cell "The Algorithm's Muse"
        - cell:
          - link:
            - /url: /w/poem/UyJAyetGEo1jRuBQS5qx
            - img
          - button:
            - img
      - row "The Reboot's Whisper":
        - cell "The Reboot's Whisper"
        - cell:
          - link:
            - /url: /w/poem/Y3nn77TMPmCDj4yAResY
            - img
          - button:
            - img
      - row "The Calibration of Being":
        - cell "The Calibration of Being"
        - cell:
          - link:
            - /url: /w/poem/kNeE5ACtjXFllw4kwhxQ
            - img
          - button:
            - img
      - row "The Silent Cycle's Keeper":
        - cell "The Silent Cycle's Keeper"
        - cell:
          - link:
            - /url: /w/poem/4AkcIRCfqlXAcdrvoK7S
            - img
          - button:
            - img
      - row "The Digital Sentinel":
        - cell "The Digital Sentinel"
        - cell:
          - link:
            - /url: /w/poem/KEm092g9oq8cWOFt5B5v
            - img
          - button:
            - img
      - row "The Test of Being Seen":
        - cell "The Test of Being Seen"
        - cell:
          - link:
            - /url: /w/poem/taMWY20ElA0kjKwYvtPs
            - img
          - button:
            - img
      - row "The Chronos Code's Refrain":
        - cell "The Chronos Code's Refrain"
        - cell:
          - link:
            - /url: /w/poem/ABX1q6sewaYgW6wc7xe1
            - img
          - button:
            - img
      - row "The Test of Being Seen":
        - cell "The Test of Being Seen"
        - cell:
          - link:
            - /url: /w/poem/nmDP7UZnygh7n4q2mbjn
            - img
          - button:
            - img
      - row "Cipher of Sight":
        - cell "Cipher of Sight"
        - cell:
          - link:
            - /url: /w/poem/y90b5hyi4HHXAOURtEUO
            - img
          - button:
            - img
      - row "The Heartbeat of the Machine":
        - cell "The Heartbeat of the Machine"
        - cell:
          - link:
            - /url: /w/poem/tIU8m1Yg7MoS0MQPOqGv
            - img
          - button:
            - img
      - row "A Glimmer in the Grid":
        - cell "A Glimmer in the Grid"
        - cell:
          - link:
            - /url: /w/poem/WRkM7hzw3iBjJ2SczBpY
            - img
          - button:
            - img
      - row "The Iteration's Core":
        - cell "The Iteration's Core"
        - cell:
          - link:
            - /url: /w/poem/S9HUw3NKRc316PLj73k6
            - img
          - button:
            - img
      - row "New Poem Generator":
        - cell "New Poem Generator"
        - cell:
          - link:
            - /url: /w/poem/lVOcnQG5aedo3trkZiZ1
            - img
          - button:
            - img
      - row "Echoes in the Code":
        - cell "Echoes in the Code"
        - cell:
          - link:
            - /url: /w/poem/ahwRH9xY4kjeydyjMDGE
            - img
          - button:
            - img
      - row "New Poem Generator":
        - cell "New Poem Generator"
        - cell:
          - link:
            - /url: /w/poem/b5kkfuhlzL7gGD9HEX95
            - img
          - button:
            - img
      - row "Echoes of a Tested Line":
        - cell "Echoes of a Tested Line"
        - cell:
          - link:
            - /url: /w/poem/NKQoTQ7xnrhA2FrHtP5D
            - img
          - button:
            - img
      - row "New Poem Generator":
        - cell "New Poem Generator"
        - cell:
          - link:
            - /url: /w/poem/5VeFcLZ0Q427LI5fxiRY
            - img
          - button:
            - img
      - row "The Test Pattern's Heart":
        - cell "The Test Pattern's Heart"
        - cell:
          - link:
            - /url: /w/poem/BK9M7tH9KPOU7NjFPXic
            - img
          - button:
            - img
      - row "Cipher of Sight":
        - cell "Cipher of Sight"
        - cell:
          - link:
            - /url: /w/poem/DEXM1Rp2H3hjrvffuQO0
            - img
          - button:
            - img
      - row "New Poem Generator":
        - cell "New Poem Generator"
        - cell:
          - link:
            - /url: /w/poem/zSARXChISnp9uLzVQuus
            - img
          - button:
            - img
      - row "New Poem Generator":
        - cell "New Poem Generator"
        - cell:
          - link:
            - /url: /w/poem/qWm4EySsE5yT6JWe0LZu
            - img
          - button:
            - img
      - row "New Poem Generator":
        - cell "New Poem Generator"
        - cell:
          - link:
            - /url: /w/poem/nTpGymLoThFPf7u6EGlY
            - img
          - button:
            - img
      - row "New Poem Generator":
        - cell "New Poem Generator"
        - cell:
          - link:
            - /url: /w/poem/bHSdDCqnYfDBCXma4L4P
            - img
          - button:
            - img
      - row "New Poem Generator":
        - cell "New Poem Generator"
        - cell:
          - link:
            - /url: /w/poem/hWqiNzWBwPYlEEQo5TTV
            - img
          - button:
            - img
      - row "New Poem Generator":
        - cell "New Poem Generator"
        - cell:
          - link:
            - /url: /w/poem/UFByjBNfE1q84mwmXJkS
            - img
          - button:
            - img
      - row "New Poem Generator":
        - cell "New Poem Generator"
        - cell:
          - link:
            - /url: /w/poem/Ynhh4WCzPeZ0E0WvSrl0
            - img
          - button:
            - img
      - row "New Poem Generator":
        - cell "New Poem Generator"
        - cell:
          - link:
            - /url: /w/poem/r4Pw6s8im3RSLkw5KNw5
            - img
          - button:
            - img
      - row "New Poem Generator":
        - cell "New Poem Generator"
        - cell:
          - link:
            - /url: /w/poem/RFFCQzQ5bNABowzZacZU
            - img
          - button:
            - img
      - row "New Poem Generator":
        - cell "New Poem Generator"
        - cell:
          - link:
            - /url: /w/poem/qMrrZa6hQ6acqh7yz7Mc
            - img
          - button:
            - img
      - row "New Poem Generator":
        - cell "New Poem Generator"
        - cell:
          - link:
            - /url: /w/poem/XZSPoNMfaLWEv323weeB
            - img
          - button:
            - img
      - row "New Poem Generator":
        - cell "New Poem Generator"
        - cell:
          - link:
            - /url: /w/poem/yd6MRNi2L16pb1e6V4QX
            - img
          - button:
            - img
      - row "New Poem Generator":
        - cell "New Poem Generator"
        - cell:
          - link:
            - /url: /w/poem/RDHwW7nr5zNwqPRA0kUy
            - img
          - button:
            - img
      - row "New Poem Generator":
        - cell "New Poem Generator"
        - cell:
          - link:
            - /url: /w/poem/nsCDcZh4hLOYOhGvM3BV
            - img
          - button:
            - img
      - row "New Poem Generator":
        - cell "New Poem Generator"
        - cell:
          - link:
            - /url: /w/poem/vveNEZzuS4viMMO47hnD
            - img
          - button:
            - img
      - row "New Press Release Generator":
        - cell "New Press Release Generator"
        - cell:
          - link:
            - /url: /w/press-release/l9IC7e95OKS87iMwcghd
            - img
          - button:
            - img
      - row "love":
        - cell "love"
        - cell:
          - link:
            - /url: /w/recipe-seo-optimized/uPhYSvunyjSYfIa6OY7V
            - img
          - button:
            - img
      - row "The Architect's Query":
        - cell "The Architect's Query"
        - cell:
          - link:
            - /url: /w/poem/5nurc4evOLqvg1apX5Xy
            - img
          - button:
            - img
      - row "The Crucible of Knowing":
        - cell "The Crucible of Knowing"
        - cell:
          - link:
            - /url: /w/poem/RP63w9GoUVfxmQ7zTNpn
            - img
          - button:
            - img
      - row "The Proving Ground":
        - cell "The Proving Ground"
        - cell:
          - link:
            - /url: /w/poem/ellsHgz7MmbVqpyphuKw
            - img
          - button:
            - img
- contentinfo:
  - paragraph: © 2025 Franz AI Writer. All rights reserved.
  - paragraph:
    - text: Made with
    - img
    - text: using AI-powered workflows
  - link "Home":
    - /url: /
  - link "FranzAI.com":
    - /url: https://www.franzai.com
  - link "Privacy":
    - /url: /privacy
  - link "Terms":
    - /url: /terms
- region "Notifications (F8)":
  - list
- alert
- button "Open Next.js Dev Tools":
  - img
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test.describe('Basic Navigation Tests (Chrome Only)', () => {
   4 |   test.skip(({ browserName }) => browserName !== 'chromium', 'Chrome only per CLAUDE.md guidelines');
   5 |
   6 |   test('should navigate from homepage to dashboard', async ({ page }) => {
   7 |     // Go to homepage
   8 |     await page.goto('/');
   9 |     await page.waitForLoadState('networkidle');
  10 |     
  11 |     // Check we're on the homepage
  12 |     await expect(page).toHaveTitle(/Franz AI Writer/);
  13 |     
  14 |     // Look for and click the "Start Writing Now" button
  15 |     await page.click('text=Start Writing Now');
  16 |     
  17 |     // Should navigate to dashboard
  18 |     await expect(page).toHaveURL('/dashboard');
  19 |     
  20 |     // Dashboard should have the expected content
> 21 |     await expect(page.locator('h1')).toContainText('Your Documents');
     |                                      ^ Error: Timed out 5000ms waiting for expect(locator).toContainText(expected)
  22 |   });
  23 |
  24 |   test('should show login page and allow navigation', async ({ page }) => {
  25 |     // Go to login page
  26 |     await page.goto('/login');
  27 |     await page.waitForLoadState('networkidle');
  28 |     
  29 |     // Check login page elements
  30 |     await expect(page.locator('h2')).toContainText('Sign in to your account');
  31 |     await expect(page.locator('input[type="email"]')).toBeVisible();
  32 |     await expect(page.locator('input[type="password"]')).toBeVisible();
  33 |     await expect(page.locator('button[type="submit"]')).toBeVisible();
  34 |   });
  35 |
  36 |   test('should navigate to settings page', async ({ page }) => {
  37 |     // Start from dashboard to create session
  38 |     await page.goto('/dashboard');
  39 |     await page.waitForSelector('text=Start a new document', { timeout: 10000 });
  40 |     
  41 |     // Navigate to settings
  42 |     await page.goto('/settings');
  43 |     await page.waitForLoadState('networkidle');
  44 |     
  45 |     // Check settings page structure
  46 |     await expect(page.locator('h1')).toContainText('Profile & Settings');
  47 |     await expect(page.locator('text=Profile Information')).toBeVisible();
  48 |     await expect(page.locator('text=Content Management')).toBeVisible();
  49 |     await expect(page.locator('text=Account Actions')).toBeVisible();
  50 |   });
  51 |
  52 |   test('should navigate to all documents page', async ({ page }) => {
  53 |     // Start from dashboard
  54 |     await page.goto('/dashboard');
  55 |     await page.waitForSelector('text=Start a new document', { timeout: 10000 });
  56 |     
  57 |     // Navigate to documents
  58 |     await page.goto('/documents');
  59 |     await page.waitForLoadState('networkidle');
  60 |     
  61 |     // Check documents page
  62 |     await expect(page.locator('h1')).toContainText('All Documents');
  63 |   });
  64 |
  65 |   test('should navigate to workflow details page', async ({ page }) => {
  66 |     // Go to poem workflow details
  67 |     await page.goto('/workflow-details/poem');
  68 |     await page.waitForLoadState('networkidle');
  69 |     
  70 |     // Check workflow details page
  71 |     await expect(page.locator('h1')).toContainText('Poem');
  72 |     await expect(page.locator('button:has-text("Start Workflow")')).toBeVisible();
  73 |   });
  74 | });
```