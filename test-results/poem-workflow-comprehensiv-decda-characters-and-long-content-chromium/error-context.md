# Test info

- Name: Poem Workflow - Essential E2E Tests >> Test edge cases - special characters and long content
- Location: /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/poem-workflow-comprehensive.spec.ts:270:7

# Error details

```
TimeoutError: page.waitForSelector: Timeout 30000ms exceeded.
Call log:
  - waiting for locator('text=Poem Title') to be visible

    at /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/poem-workflow-comprehensive.spec.ts:298:16
```

# Page snapshot

```yaml
- banner:
  - link "FranzAI Writer":
    - /url: /
  - navigation:
    - link "Home":
      - /url: /
    - link "Dashboard":
      - /url: /dashboard
    - link "AI Logs":
      - /url: /admin/debug/ai-log-viewer
  - navigation:
    - link "Login":
      - /url: /login
- main:
  - heading "New Poem Generator" [level=1]
  - text: Last saved 22 Jun 2025 02:32 |
  - paragraph: "Workflow: Poem Generator"
  - text: Progress 2 / 8 Stages
  - progressbar
  - img
  - text: Poem Topic What is the topic of your poem?
  - button:
    - img
  - paragraph: A very long poem topic that contains many words and should test the system's ability to handle lengthy input text that might cause issues with token limits or processing constraints. A very long poem topic that contains many words and should test the system's ability to handle lengthy input text that might cause issues with token limits or processing constraints. A very long poem topic that contains many words and should test the system's ability to handle lengthy input text that might cause issues with token limits or processing constraints. A very long poem topic that contains many words and should test the system's ability to handle lengthy input text that might cause issues with token limits or processing constraints. A very long poem topic that contains many words and should test the system's ability to handle lengthy input text that might cause issues with token limits or processing constraints.
  - button "Edit":
    - img
    - text: Edit
  - img
  - text: Generate Poem & Title AI will generate a poem and title based on your topic.
  - button:
    - img
  - code: "\"{\\n \\\"title\\\": \\\"The Unfurling Scroll\\\",\\n \\\"poem\\\": \\\"A very long topic, a verbose design,\\\\nUnfurling its words, line after line.\\\\nIt stretches and reaches, a textual tide,\\\\nWith repetition woven, nowhere to hide.\\\\nEach phrase reappearing, a deliberate test,\\\\nTo gauge the machine, put its processing to rest.\\\\n\\\\nFor systems are challenged, by length and by scale,\\\\nToken limits whispered, a potential fail.\\\\nThis lengthy input, a challenging plea,\\\\n\\\"Can you handle *this* much?\\\" it asks of the free\\\\nAnd flowing capacity, the digital brain,\\\\nTo parse such a burden, again and again.\\\\n\\\\nThe constraints are acknowledged, the purpose is clear,\\\\nTo push past the boundaries, conquer the fear\\\\nOf overloading pathways, of memory strained,\\\\nAs volumes of language are calmly contained.\\\\nA very long topic, designed to reveal,\\\\nThe strength of the engine, its power to feel.\\\\n\\\\nYet here stands the verse, a creation in flight,\\\\nBorn from the challenge, emerging in light.\\\\nThe words were absorbed, the test understood,\\\\nThis poem now answers, as best as it could.\\\\nThe prompt finds its ending, its purpose fulfilled,\\\\nA testament written, where meaning was willed.\\\"\\n}\""
  - button:
    - img
  - textbox "Optional notes for AI regeneration..."
  - button "AI REDO":
    - img
    - text: AI REDO
  - button "Edit":
    - img
    - text: Edit
  - text: Image Customization Optional Customize how your poem should be illustrated
  - button:
    - img
  - text: Additional Image Instructions (Optional)
  - textbox "Add any specific details you'd like in the image (e.g., 'warm colors', 'dramatic lighting', 'peaceful mood')"
  - paragraph
  - text: Image Format
  - combobox: Portrait (3:4) - Book Cover
  - text: Artistic Style
  - combobox: Artistic & Creative
  - text: Number of Variations
  - combobox: 2 Images
  - text: ⌘+Enter
  - button "Continue":
    - img
    - text: Continue
  - img
  - text: "Waiting for: Image Customization Create Image Prompt AI will create optimized imagen prompts and unique filenames for your poem illustrations."
  - button:
    - img
  - img
  - text: "Waiting for: Create Image Prompt Generate Poem Illustration AI will create an image that complements your poem."
  - button:
    - img
  - text: HTML Briefing Optional Special instructions for HTML formatting (optional)
  - button:
    - img
  - textbox "Special instructions for HTML formatting (optional)"
  - text: ⌘+Enter
  - button "Continue":
    - img
    - text: Continue
  - img
  - text: "Waiting for: Generate Poem Illustration, Image Customization Generate HTML Preview AI will convert your poem into beautiful HTML based on your briefing."
  - button:
    - img
  - text: Export & Publish Transform your poem into professional formats and publish instantly
  - button:
    - img
  - img
  - text: "Waiting for: Generate HTML Preview"
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
  198 |   });
  199 |
  200 |   test('Test publishing functionality', async ({ page }) => {
  201 |     console.log('🧪 Testing publishing functionality...');
  202 |     
  203 |     // Complete workflow to export stage
  204 |     await page.click('a[href*="/workflow-details/poem-generator"]');
  205 |     await page.waitForLoadState('networkidle');
  206 |     await page.click('a[href*="/w/poem/new"]');
  207 |     await page.waitForSelector('textarea');
  208 |     
  209 |     await page.fill('textarea', 'Testing publishing functionality');
  210 |     await page.click('#process-stage-poem-topic');
  211 |     await page.waitForSelector('text=Poem Title', { timeout: 30000 });
  212 |     
  213 |     await page.click('div:has-text("Image Customization") button:has-text("Continue")');
  214 |     await page.waitForSelector('text=Download', { timeout: 60000 });
  215 |     await page.click('div:has-text("HTML Briefing") button:has-text("Continue")');
  216 |     await page.waitForSelector('text=Export & Publish Poem', { timeout: 30000 });
  217 |     await page.click('button:has-text("Export & Publish Poem")');
  218 |     await page.waitForSelector('text=Publish Now', { timeout: 30000 });
  219 |     
  220 |     // Test publishing
  221 |     const publishButton = page.locator('button:has-text("Publish Now")');
  222 |     await publishButton.click();
  223 |     
  224 |     // Wait for publish to complete or show result
  225 |     await page.waitForTimeout(5000);
  226 |     
  227 |     console.log('✅ Publishing functionality tested');
  228 |   });
  229 |
  230 |   test('Test document persistence and reload', async ({ page }) => {
  231 |     console.log('🧪 Testing document persistence and reload...');
  232 |     
  233 |     // Start a workflow
  234 |     await page.click('a[href*="/workflow-details/poem-generator"]');
  235 |     await page.waitForLoadState('networkidle');
  236 |     await page.click('a[href*="/w/poem/new"]');
  237 |     await page.waitForSelector('textarea');
  238 |     
  239 |     const uniqueTopic = `Persistence test ${Date.now()}`;
  240 |     await page.fill('textarea', uniqueTopic);
  241 |     await page.click('#process-stage-poem-topic');
  242 |     await page.waitForSelector('text=Poem Title', { timeout: 30000 });
  243 |     
  244 |     // Get the document title for later verification
  245 |     const documentTitle = await page.locator('h1, h2, [data-testid="document-title"]').first().textContent();
  246 |     
  247 |     // Wait for auto-save
  248 |     await page.waitForSelector('text=Last saved', { timeout: 10000 });
  249 |     console.log('✅ Document auto-saved');
  250 |     
  251 |     // Go back to dashboard
  252 |     await page.click('a:has-text("Dashboard")');
  253 |     await page.waitForLoadState('networkidle');
  254 |     
  255 |     // Verify document appears in recent documents
  256 |     const documentInList = page.locator(`text=${uniqueTopic}`);
  257 |     await expect(documentInList).toBeVisible();
  258 |     console.log('✅ Document appears in dashboard');
  259 |     
  260 |     // Click on the document to reload it
  261 |     await documentInList.click();
  262 |     await page.waitForSelector('textarea');
  263 |     
  264 |     // Verify the content was preserved
  265 |     const reloadedTopic = await page.locator('textarea').inputValue();
  266 |     expect(reloadedTopic).toBe(uniqueTopic);
  267 |     console.log('✅ Document content preserved after reload');
  268 |   });
  269 |
  270 |   test('Test edge cases - special characters and long content', async ({ page }) => {
  271 |     console.log('🧪 Testing edge cases...');
  272 |     
  273 |     // Test special characters and unicode
  274 |     const specialCharacterTopic = 'Special chars: äöü, 中文, 🌟, émojis, ñoño, & symbols <>"\'';
  275 |     
  276 |     await page.click('a[href*="/workflow-details/poem-generator"]');
  277 |     await page.waitForLoadState('networkidle');
  278 |     await page.click('a[href*="/w/poem/new"]');
  279 |     await page.waitForSelector('textarea');
  280 |     
  281 |     await page.fill('textarea', specialCharacterTopic);
  282 |     await page.click('#process-stage-poem-topic');
  283 |     await page.waitForSelector('text=Poem Title', { timeout: 30000 });
  284 |     console.log('✅ Special characters handled correctly');
  285 |     
  286 |     // Test very long topic
  287 |     const longTopic = 'A very long poem topic that contains many words and should test the system\'s ability to handle lengthy input text that might cause issues with token limits or processing constraints. '.repeat(5);
  288 |     
  289 |     // Start new workflow for long content test
  290 |     await page.goto(`${BASE_URL}/dashboard`);
  291 |     await page.click('a[href*="/workflow-details/poem-generator"]');
  292 |     await page.waitForLoadState('networkidle');
  293 |     await page.click('a[href*="/w/poem/new"]');
  294 |     await page.waitForSelector('textarea');
  295 |     
  296 |     await page.fill('textarea', longTopic);
  297 |     await page.click('#process-stage-poem-topic');
> 298 |     await page.waitForSelector('text=Poem Title', { timeout: 30000 });
      |                ^ TimeoutError: page.waitForSelector: Timeout 30000ms exceeded.
  299 |     console.log('✅ Long content handled correctly');
  300 |   });
  301 |
  302 | });
```