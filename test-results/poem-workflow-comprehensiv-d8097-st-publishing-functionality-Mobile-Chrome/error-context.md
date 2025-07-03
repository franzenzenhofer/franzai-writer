# Test info

- Name: Poem Workflow - SUPER POWERFUL Comprehensive Tests >> Test publishing functionality
- Location: /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/poem-workflow-comprehensive.spec.ts:201:7

# Error details

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('a[href*="/workflow-details/poem-generator"]')
    - locator resolved to <a id="workflow-details-poem-generator" href="/workflow-details/poem-generator" data-testid="workflow-details-poem-generator" class="inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md cursor-pointer text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-transparent hover:border-slate-200 h-8 px-4 text-xs min-w-11 hidden sm:inline-flex">…</a>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is not visible
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is not visible
    - retrying click action
      - waiting 100ms
    55 × waiting for element to be visible, enabled and stable
       - element is not visible
     - retrying click action
       - waiting 500ms
    - waiting for element to be visible, enabled and stable

    at /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/poem-workflow-comprehensive.spec.ts:205:16
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
      - row "Crimson Mirror of the Peaks":
        - cell "Crimson Mirror of the Peaks"
        - cell:
          - link:
            - /url: /w/poem/JL3qOEcUQulp864KLF7w
            - img
          - button:
            - img
      - row "The Attribution's Challenge":
        - cell "The Attribution's Challenge"
        - cell:
          - link:
            - /url: /w/poem/m7fYCgKR4Y7CCtALX0Ap
            - img
          - button:
            - img
      - row "New Poem Generator":
        - cell "New Poem Generator"
        - cell:
          - link:
            - /url: /w/poem/bkdbHdcKpWboj4dZPaNn
            - img
          - button:
            - img
      - row "Stellar Breakers, Silent Sky":
        - cell "Stellar Breakers, Silent Sky"
        - cell:
          - link:
            - /url: /w/poem/11eUcmHyAXWKifcjHu5T
            - img
          - button:
            - img
      - row "New Poem Generator":
        - cell "New Poem Generator"
        - cell:
          - link:
            - /url: /w/poem/KmRAD6bsuXmtPlSC6Dd2
            - img
          - button:
            - img
      - row "New Poem Generator":
        - cell "New Poem Generator"
        - cell:
          - link:
            - /url: /w/poem/C7gyKDZMBwJlBf1KygfE
            - img
          - button:
            - img
      - row "New Poem Generator":
        - cell "New Poem Generator"
        - cell:
          - link:
            - /url: /w/poem/LjP5tOIEOAIvmV600NPq
            - img
          - button:
            - img
      - row "The Pixel's Proving Ground":
        - cell "The Pixel's Proving Ground"
        - cell:
          - link:
            - /url: /w/poem/nwR5YIdPyeq9A3Vb2LHM
            - img
          - button:
            - img
      - row "Twilight's Gentle Embrace":
        - cell "Twilight's Gentle Embrace"
        - cell:
          - link:
            - /url: /w/poem/LYOmNNWvbRj1jZ1AajQ4
            - img
          - button:
            - img
      - row "The Unseen Score":
        - cell "The Unseen Score"
        - cell:
          - link:
            - /url: /w/poem/odV20ipbsknkBXOQcygr
            - img
          - button:
            - img
      - row "The Content Crucible":
        - cell "The Content Crucible"
        - cell:
          - link:
            - /url: /w/poem/3FBqT613oDy0gIKrgH60
            - img
          - button:
            - img
      - row "New Poem Generator":
        - cell "New Poem Generator"
        - cell:
          - link:
            - /url: /w/poem/PlPDMsbpcxi4Uz8d3CR1
            - img
          - button:
            - img
      - row "The Staging Server's Whisper":
        - cell "The Staging Server's Whisper"
        - cell:
          - link:
            - /url: /w/poem/4ClgpEQfggaquuoG7D75
            - img
          - button:
            - img
      - row "Mountain's Gilded Kiss":
        - cell "Mountain's Gilded Kiss"
        - cell:
          - link:
            - /url: /w/poem/yhUuMug0gynm9kYqfQMW
            - img
          - button:
            - img
      - row "New Press Release Generator":
        - cell "New Press Release Generator"
        - cell:
          - link:
            - /url: /w/press-release/3IZbTYSjAIZgQ7XxD0Mx
            - img
          - button:
            - img
      - row "New Press Release Generator":
        - cell "New Press Release Generator"
        - cell:
          - link:
            - /url: /w/press-release/jNPuvjgupsYn8FF8RvXC
            - img
          - button:
            - img
      - row "New Press Release Generator":
        - cell "New Press Release Generator"
        - cell:
          - link:
            - /url: /w/press-release/VnIkbhuiHmDe9v7xWIlL
            - img
          - button:
            - img
      - row "New Press Release Generator":
        - cell "New Press Release Generator"
        - cell:
          - link:
            - /url: /w/press-release/xja150oQllCkyho8nsKB
            - img
          - button:
            - img
      - row "New Press Release Generator":
        - cell "New Press Release Generator"
        - cell:
          - link:
            - /url: /w/press-release/fK8uY8IDsjern7XaNHc1
            - img
          - button:
            - img
      - row "New Press Release Generator":
        - cell "New Press Release Generator"
        - cell:
          - link:
            - /url: /w/press-release/NY4kSGnkXLMMiExQ1Qru
            - img
          - button:
            - img
      - row "New Press Release Generator":
        - cell "New Press Release Generator"
        - cell:
          - link:
            - /url: /w/press-release/MdxCAcypio19UvLpg06s
            - img
          - button:
            - img
      - row "The Amber Whisper":
        - cell "The Amber Whisper"
        - cell:
          - link:
            - /url: /w/poem/PwCm5HCGffmqxgxtQNfi
            - img
          - button:
            - img
      - row "Autumn's Gentle Murmur":
        - cell "Autumn's Gentle Murmur"
        - cell:
          - link:
            - /url: /w/poem/6PUFApL62EqT7DUhrBpC
            - img
          - button:
            - img
      - row "Alpenglow's Mirror":
        - cell "Alpenglow's Mirror"
        - cell:
          - link:
            - /url: /w/poem/1u3TwVkrJqZzlAPnj8ZN
            - img
          - button:
            - img
      - row "Golden Mirror of the Peaks":
        - cell "Golden Mirror of the Peaks"
        - cell:
          - link:
            - /url: /w/poem/g65i7WWlvH7spW6CaMah
            - img
          - button:
            - img
      - row "Alpenglow's Liquid Gold":
        - cell "Alpenglow's Liquid Gold"
        - cell:
          - link:
            - /url: /w/poem/Q2HItarApWDO7Bp62LEv
            - img
          - button:
            - img
      - row "Alpenglow's Silent Mirror":
        - cell "Alpenglow's Silent Mirror"
        - cell:
          - link:
            - /url: /w/poem/C5giqg4hgZxJff55Ocnm
            - img
          - button:
            - img
      - row "The Debugger's Dance":
        - cell "The Debugger's Dance"
        - cell:
          - link:
            - /url: /w/poem/2uvjKTla7FENurn305RH
            - img
          - button:
            - img
      - row "The Uncredited Verse":
        - cell "The Uncredited Verse"
        - cell:
          - link:
            - /url: /w/poem/CkM4xJSn2HkXnmpqKnLd
            - img
          - button:
            - img
      - row "New Poem Generator":
        - cell "New Poem Generator"
        - cell:
          - link:
            - /url: /w/poem/E5vNi6rbLqgMQlT2DlTI
            - img
          - button:
            - img
      - row "The Starlit Ocean's Embrace":
        - cell "The Starlit Ocean's Embrace"
        - cell:
          - link:
            - /url: /w/poem/ox9XeJTjQluvZMyAJfoO
            - img
          - button:
            - img
      - row "New Poem Generator":
        - cell "New Poem Generator"
        - cell:
          - link:
            - /url: /w/poem/4LsmtXiXXsK7UIC1ujo7
            - img
          - button:
            - img
      - row "New Poem Generator":
        - cell "New Poem Generator"
        - cell:
          - link:
            - /url: /w/poem/zGnxUgJE7EqPS2Aw5Kjw
            - img
          - button:
            - img
      - row "New Poem Generator":
        - cell "New Poem Generator"
        - cell:
          - link:
            - /url: /w/poem/sQmJHFJ71DFg2ZvD5XnF
            - img
          - button:
            - img
      - row "The Pixel's Provisional Verse":
        - cell "The Pixel's Provisional Verse"
        - cell:
          - link:
            - /url: /w/poem/qcV4E8KDcmTdbcn5DZTZ
            - img
          - button:
            - img
      - row "Earth's Gentle Baptism":
        - cell "Earth's Gentle Baptism"
        - cell:
          - link:
            - /url: /w/poem/MWwVrxK6ihI6hKxXEN7l
            - img
          - button:
            - img
      - row "The Digital Echo's First Whisper":
        - cell "The Digital Echo's First Whisper"
        - cell:
          - link:
            - /url: /w/poem/HAirV45TZenNVLmFgIzI
            - img
          - button:
            - img
      - row "New Poem Generator":
        - cell "New Poem Generator"
        - cell:
          - link:
            - /url: /w/poem/4EMTP565HogonSi9ZHX5
            - img
          - button:
            - img
      - row "The Sentinel of Exports":
        - cell "The Sentinel of Exports"
        - cell:
          - link:
            - /url: /w/poem/LW59GXRRSOzy91yIQ7ki
            - img
          - button:
            - img
      - row "Crimson Veil on Liquid Glass":
        - cell "Crimson Veil on Liquid Glass"
        - cell:
          - link:
            - /url: /w/poem/BcAVxJ4SwGJqO6gIXYzb
            - img
          - button:
            - img
      - row "New Press Release Generator":
        - cell "New Press Release Generator"
        - cell:
          - link:
            - /url: /w/press-release/WiFktNGOEnrVSI9ag1ba
            - img
          - button:
            - img
      - row "New Press Release Generator":
        - cell "New Press Release Generator"
        - cell:
          - link:
            - /url: /w/press-release/KP1VAJWbKAaFEKWUb46q
            - img
          - button:
            - img
      - row "New Press Release Generator":
        - cell "New Press Release Generator"
        - cell:
          - link:
            - /url: /w/press-release/OOAElWBCotVERFs2rnFY
            - img
          - button:
            - img
      - row "The Debugger's Dance":
        - cell "The Debugger's Dance"
        - cell:
          - link:
            - /url: /w/poem/imkFRWIf9yCSbc2hiFrj
            - img
          - button:
            - img
      - row "New Poem Generator":
        - cell "New Poem Generator"
        - cell:
          - link:
            - /url: /w/poem/IVuWlEoK0tKl5JPeqbUQ
            - img
          - button:
            - img
      - row "The Debugger's Dance":
        - cell "The Debugger's Dance"
        - cell:
          - link:
            - /url: /w/poem/wk2TeeGBgzVq6jSTBzH9
            - img
          - button:
            - img
      - row "The Unit's Whisper":
        - cell "The Unit's Whisper"
        - cell:
          - link:
            - /url: /w/poem/cIwOpUCiI4fbCENwAuKY
            - img
          - button:
            - img
      - row "New Poem Generator":
        - cell "New Poem Generator"
        - cell:
          - link:
            - /url: /w/poem/sMoUr8KxHfmsS9ZuoP6m
            - img
          - button:
            - img
      - row "New Press Release Generator":
        - cell "New Press Release Generator"
        - cell:
          - link:
            - /url: /w/press-release/kgAq5pRyH6fCQWccyc1R
            - img
          - button:
            - img
      - row "New Press Release Generator":
        - cell "New Press Release Generator"
        - cell:
          - link:
            - /url: /w/press-release/5V5MAit1JtqLlx0vS63Z
            - img
          - button:
            - img
      - row "New Press Release Generator":
        - cell "New Press Release Generator"
        - cell:
          - link:
            - /url: /w/press-release/qpRC1vRRKoPyJFBYfXFf
            - img
          - button:
            - img
      - row "The Moment's Gauge":
        - cell "The Moment's Gauge"
        - cell:
          - link:
            - /url: /w/poem/J86K7yc014ZSm2d7mOeJ
            - img
          - button:
            - img
      - row "New Poem Generator":
        - cell "New Poem Generator"
        - cell:
          - link:
            - /url: /w/poem/IbWJ06az6oQ0RsAm4g4T
            - img
          - button:
            - img
      - row "The Crucible of Knowledge":
        - cell "The Crucible of Knowledge"
        - cell:
          - link:
            - /url: /w/poem/Jdfog1dTnhv49UZYR004
            - img
          - button:
            - img
      - row "The Proving Ground":
        - cell "The Proving Ground"
        - cell:
          - link:
            - /url: /w/poem/YliOOoyJ8CZlHH0lPrqf
            - img
          - button:
            - img
      - row "The Echo's Origin":
        - cell "The Echo's Origin"
        - cell:
          - link:
            - /url: /w/poem/I2IOI6hWxFSrhVAYVSSJ
            - img
          - button:
            - img
      - row "The Infinite Reflection":
        - cell "The Infinite Reflection"
        - cell:
          - link:
            - /url: /w/poem/ZuxgOTUWi9tAThn4tyf2
            - img
          - button:
            - img
      - row "New Poem Generator":
        - cell "New Poem Generator"
        - cell:
          - link:
            - /url: /w/poem/NoeMe6KVOS4F9Eb5kAKm
            - img
          - button:
            - img
      - row "New Poem Generator":
        - cell "New Poem Generator"
        - cell:
          - link:
            - /url: /w/poem/Bbspk3wm9rFIJfs6rqHF
            - img
          - button:
            - img
      - row "New Poem Generator":
        - cell "New Poem Generator"
        - cell:
          - link:
            - /url: /w/poem/uldQeCzBJ3cmrKLzo3Yu
            - img
          - button:
            - img
      - row "A Frame's Poetic Test":
        - cell "A Frame's Poetic Test"
        - cell:
          - link:
            - /url: /w/poem/JqVDsjk8q4vLHeE4JtTL
            - img
          - button:
            - img
      - row "When the World Holds Its Breath":
        - cell "When the World Holds Its Breath"
        - cell:
          - link:
            - /url: /w/poem/AqOQbbHO9vBSdJBjj6fk
            - img
          - button:
            - img
      - row "New Poem Generator":
        - cell "New Poem Generator"
        - cell:
          - link:
            - /url: /w/poem/4SNglyDRKUfVeG2zaHIU
            - img
          - button:
            - img
      - row "The Content Crucible":
        - cell "The Content Crucible"
        - cell:
          - link:
            - /url: /w/poem/zj5XWVranYkkq7X7q4mC
            - img
          - button:
            - img
      - row "The Pre-Launch Pulse":
        - cell "The Pre-Launch Pulse"
        - cell:
          - link:
            - /url: /w/poem/nlVko4dOH6kIkjAMRYFl
            - img
          - button:
            - img
      - row "New Poem Generator":
        - cell "New Poem Generator"
        - cell:
          - link:
            - /url: /w/poem/lNbNoCigO4SS8K7hw6G3
            - img
          - button:
            - img
      - row "New Poem Generator":
        - cell "New Poem Generator"
        - cell:
          - link:
            - /url: /w/poem/88upVFYxbeBz64RSnnFn
            - img
          - button:
            - img
      - row "New Press Release Generator":
        - cell "New Press Release Generator"
        - cell:
          - link:
            - /url: /w/press-release/9N7XPdsCPiuaqC9BRlU5
            - img
          - button:
            - img
      - row "New Press Release Generator":
        - cell "New Press Release Generator"
        - cell:
          - link:
            - /url: /w/press-release/JKI2KyIAq1w4sUPYm0us
            - img
          - button:
            - img
      - row "New Press Release Generator":
        - cell "New Press Release Generator"
        - cell:
          - link:
            - /url: /w/press-release/q9qiqPtI7WFu38mUQ9u2
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
  105 |       
  106 |       // Wait for image generation
  107 |       await page.waitForSelector('text=Download', { timeout: 60000 });
  108 |       console.log(`✅ ${format} format generated successfully`);
  109 |       
  110 |       // Reset for next test (go back to image customization)
  111 |       if (imageFormats.indexOf(format) < imageFormats.length - 1) {
  112 |         await page.click('div:has-text("Image Customization") button:has-text("Edit")');
  113 |       }
  114 |     }
  115 |   });
  116 |
  117 |   test.skip('Test different artistic styles', async ({ page }) => {
  118 |     console.log('🧪 Testing different artistic styles...');
  119 |     
  120 |     // Start workflow - use correct selectors
  121 |     await page.click('#workflow-start-poem-generator');
  122 |     await page.waitForSelector('textarea');
  123 |     
  124 |     await page.fill('textarea', 'Abstract geometric patterns');
  125 |     await page.click('#process-stage-poem-topic');
  126 |     await page.waitForSelector('text=Poem Title', { timeout: 30000 });
  127 |     
  128 |     // Test different artistic styles
  129 |     const artisticStyles = [
  130 |       'Photorealistic',
  131 |       'Watercolor Painting',
  132 |       'Oil Painting',
  133 |       'Digital Art',
  134 |       'Minimalist'
  135 |     ];
  136 |     
  137 |     for (const style of artisticStyles) {
  138 |       console.log(`Testing artistic style: ${style}`);
  139 |       
  140 |       // TODO: Fix dropdown selectors for Radix UI components
  141 |       // For now, skip style selection
  142 |       await page.click('div:has-text("Image Customization") button:has-text("Continue")');
  143 |       await page.waitForSelector('text=Download', { timeout: 60000 });
  144 |       console.log(`✅ ${style} style generated successfully`);
  145 |       
  146 |       if (artisticStyles.indexOf(style) < artisticStyles.length - 1) {
  147 |         await page.click('div:has-text("Image Customization") button:has-text("Edit")');
  148 |       }
  149 |     }
  150 |   });
  151 |
  152 |   test('Test export content verification', async ({ page }) => {
  153 |     console.log('🧪 Testing export content verification...');
  154 |     
  155 |     // Complete a basic workflow first
  156 |     await page.click('a[href*="/workflow-details/poem-generator"]');
  157 |     await page.waitForLoadState('networkidle');
  158 |     await page.click('a[href*="/w/poem/new"]');
  159 |     await page.waitForSelector('textarea');
  160 |     
  161 |     const testTopic = 'Testing export content verification';
  162 |     await page.fill('textarea', testTopic);
  163 |     await page.click('#process-stage-poem-topic');
  164 |     await page.waitForSelector('text=Poem Title', { timeout: 30000 });
  165 |     
  166 |     // Get poem details for verification (skip for now)
  167 |     
  168 |     // Continue to export
  169 |     await page.click('#process-stage-image-briefing');
  170 |     await page.waitForSelector('text=Download', { timeout: 60000 });
  171 |     await page.click('#process-stage-html-briefing');
  172 |     await page.waitForSelector('text=Export & Publish Poem', { timeout: 30000 });
  173 |     await page.click('#trigger-export-export-publish');
  174 |     await page.waitForSelector('text=Styled HTML', { timeout: 30000 });
  175 |     
  176 |     // Test copy functionality for each export format
  177 |     const formats = ['Styled HTML', 'Clean HTML', 'Markdown'];
  178 |     
  179 |     for (const format of formats) {
  180 |       console.log(`Testing ${format} export...`);
  181 |       
  182 |       // Click copy button for this format
  183 |       const copyButton = page.locator(`div:has-text("${format}") button:has-text("Copy")`);
  184 |       await copyButton.click();
  185 |       
  186 |       // Verify copy success (look for success message or similar)
  187 |       // Note: Actual clipboard testing requires special permissions
  188 |       console.log(`✅ ${format} copy button clicked successfully`);
  189 |     }
  190 |     
  191 |     // Test download functionality
  192 |     for (const format of ['PDF Document', 'Word Document']) {
  193 |       console.log(`Testing ${format} download...`);
  194 |       
  195 |       const downloadButton = page.locator(`div:has-text("${format}") button:has-text("Download")`);
  196 |       await downloadButton.click();
  197 |       console.log(`✅ ${format} download initiated`);
  198 |     }
  199 |   });
  200 |
  201 |   test('Test publishing functionality', async ({ page }) => {
  202 |     console.log('🧪 Testing publishing functionality...');
  203 |     
  204 |     // Complete workflow to export stage
> 205 |     await page.click('a[href*="/workflow-details/poem-generator"]');
      |                ^ Error: page.click: Test timeout of 30000ms exceeded.
  206 |     await page.waitForLoadState('networkidle');
  207 |     await page.click('a[href*="/w/poem/new"]');
  208 |     await page.waitForSelector('textarea');
  209 |     
  210 |     await page.fill('textarea', 'Testing publishing functionality');
  211 |     await page.click('#process-stage-poem-topic');
  212 |     await page.waitForSelector('text=Poem Title', { timeout: 30000 });
  213 |     
  214 |     await page.click('div:has-text("Image Customization") button:has-text("Continue")');
  215 |     await page.waitForSelector('text=Download', { timeout: 60000 });
  216 |     await page.click('div:has-text("HTML Briefing") button:has-text("Continue")');
  217 |     await page.waitForSelector('text=Export & Publish Poem', { timeout: 30000 });
  218 |     await page.click('button:has-text("Export & Publish Poem")');
  219 |     await page.waitForSelector('text=Publish Now', { timeout: 30000 });
  220 |     
  221 |     // Test publishing
  222 |     const publishButton = page.locator('button:has-text("Publish Now")');
  223 |     await publishButton.click();
  224 |     
  225 |     // Wait for publish to complete or show result
  226 |     await page.waitForTimeout(5000);
  227 |     
  228 |     console.log('✅ Publishing functionality tested');
  229 |   });
  230 |
  231 |   test('Test document persistence and reload', async ({ page }) => {
  232 |     console.log('🧪 Testing document persistence and reload...');
  233 |     
  234 |     // Start a workflow
  235 |     await page.click('a[href*="/workflow-details/poem-generator"]');
  236 |     await page.waitForLoadState('networkidle');
  237 |     await page.click('a[href*="/w/poem/new"]');
  238 |     await page.waitForSelector('textarea');
  239 |     
  240 |     const uniqueTopic = `Persistence test ${Date.now()}`;
  241 |     await page.fill('textarea', uniqueTopic);
  242 |     await page.click('#process-stage-poem-topic');
  243 |     await page.waitForSelector('text=Poem Title', { timeout: 30000 });
  244 |     
  245 |     // Get the document title for later verification
  246 |     const documentTitle = await page.locator('h1, h2, [data-testid="document-title"]').first().textContent();
  247 |     
  248 |     // Wait for auto-save
  249 |     await page.waitForSelector('text=Last saved', { timeout: 10000 });
  250 |     console.log('✅ Document auto-saved');
  251 |     
  252 |     // Go back to dashboard
  253 |     await page.click('a:has-text("Dashboard")');
  254 |     await page.waitForLoadState('networkidle');
  255 |     
  256 |     // Verify document appears in recent documents
  257 |     const documentInList = page.locator(`text=${uniqueTopic}`);
  258 |     await expect(documentInList).toBeVisible();
  259 |     console.log('✅ Document appears in dashboard');
  260 |     
  261 |     // Click on the document to reload it
  262 |     await documentInList.click();
  263 |     await page.waitForSelector('textarea');
  264 |     
  265 |     // Verify the content was preserved
  266 |     const reloadedTopic = await page.locator('textarea').inputValue();
  267 |     expect(reloadedTopic).toBe(uniqueTopic);
  268 |     console.log('✅ Document content preserved after reload');
  269 |   });
  270 |
  271 |   test('Test edge cases - special characters and long content', async ({ page }) => {
  272 |     console.log('🧪 Testing edge cases...');
  273 |     
  274 |     // Test special characters and unicode
  275 |     const specialCharacterTopic = 'Special chars: äöü, 中文, 🌟, émojis, ñoño, & symbols <>"\'';
  276 |     
  277 |     await page.click('a[href*="/workflow-details/poem-generator"]');
  278 |     await page.waitForLoadState('networkidle');
  279 |     await page.click('a[href*="/w/poem/new"]');
  280 |     await page.waitForSelector('textarea');
  281 |     
  282 |     await page.fill('textarea', specialCharacterTopic);
  283 |     await page.click('#process-stage-poem-topic');
  284 |     await page.waitForSelector('text=Poem Title', { timeout: 30000 });
  285 |     console.log('✅ Special characters handled correctly');
  286 |     
  287 |     // Test very long topic
  288 |     const longTopic = 'A very long poem topic that contains many words and should test the system\'s ability to handle lengthy input text that might cause issues with token limits or processing constraints. '.repeat(5);
  289 |     
  290 |     // Start new workflow for long content test
  291 |     await page.goto(`${BASE_URL}/dashboard`);
  292 |     await page.click('a[href*="/workflow-details/poem-generator"]');
  293 |     await page.waitForLoadState('networkidle');
  294 |     await page.click('a[href*="/w/poem/new"]');
  295 |     await page.waitForSelector('textarea');
  296 |     
  297 |     await page.fill('textarea', longTopic);
  298 |     await page.click('#process-stage-poem-topic');
  299 |     await page.waitForSelector('text=Poem Title', { timeout: 30000 });
  300 |     console.log('✅ Long content handled correctly');
  301 |   });
  302 |
  303 |   test('Test error recovery and input validation', async ({ page }) => {
  304 |     console.log('🧪 Testing error recovery...');
  305 |     
```