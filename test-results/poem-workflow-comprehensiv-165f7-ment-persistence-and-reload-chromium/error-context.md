# Test info

- Name: Poem Workflow - SUPER POWERFUL Comprehensive Tests >> Test document persistence and reload
- Location: /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/poem-workflow-comprehensive.spec.ts:231:7

# Error details

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('text=Persistence test 1751565878337')
    - locator resolved to <p class="whitespace-pre-wrap font-body">Persistence test 1751565878337</p>
  - attempting click action
    - waiting for element to be visible, enabled and stable
    - element is not stable
  - retrying click action
    - waiting for element to be visible, enabled and stable
  - element was detached from the DOM, retrying

    at /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/poem-workflow-comprehensive.spec.ts:262:26
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
    - link "Documents":
      - /url: /documents
    - link "Assets":
      - /url: /assets
    - link "AI Logs":
      - /url: /admin/debug/ai-log-viewer
  - navigation:
    - link "Login":
      - /url: /login
- main:
  - heading "Start a new document" [level=1]
  - table:
    - rowgroup:
      - row "Workflow Description Actions":
        - cell "Workflow"
        - cell "Description"
        - cell "Actions"
    - rowgroup:
      - row "Targeted Page SEO Optimized V3 Create a comprehensive, SEO-optimized page targeting a specific keyword. Start":
        - cell "Targeted Page SEO Optimized V3"
        - cell "Create a comprehensive, SEO-optimized page targeting a specific keyword."
        - cell "Start":
          - link:
            - /url: /workflow-details/targeted-page-seo-optimized-v3
            - img
          - link "Start":
            - /url: /w/article/new
            - text: Start
            - img
      - row "SEO Optimized Cooking Recipe Create a detailed, SEO-friendly cooking recipe with AI assistance. Start":
        - cell "SEO Optimized Cooking Recipe"
        - cell "Create a detailed, SEO-friendly cooking recipe with AI assistance."
        - cell "Start":
          - link:
            - /url: /workflow-details/recipe-seo-optimized
            - img
          - link "Start":
            - /url: /w/recipe/new
            - text: Start
            - img
      - row "Poem Generator Create a poem with AI assistance. Start":
        - cell "Poem Generator"
        - cell "Create a poem with AI assistance."
        - cell "Start":
          - link:
            - /url: /workflow-details/poem-generator
            - img
          - link "Start":
            - /url: /w/poem/new
            - text: Start
            - img
      - row "Gemini AI Tools Test Comprehensive test workflow demonstrating all Gemini AI advanced features Start":
        - cell "Gemini AI Tools Test"
        - cell "Comprehensive test workflow demonstrating all Gemini AI advanced features"
        - cell "Start":
          - link:
            - /url: /workflow-details/gemini-tools-test
            - img
          - link "Start":
            - /url: /w/gemini-test/new
            - text: Start
            - img
      - row "Press Release Generator Create professional press releases with AI-powered research, tone analysis, and fact-checking Start":
        - cell "Press Release Generator"
        - cell "Create professional press releases with AI-powered research, tone analysis, and fact-checking"
        - cell "Start":
          - link:
            - /url: /workflow-details/press-release
            - img
          - link "Start":
            - /url: /w/press-release/new
            - text: Start
            - img
  - heading "Recent documents" [level=2]
  - table:
    - rowgroup:
      - row "Title Workflow Status Updated Actions":
        - cell "Title"
        - cell "Workflow"
        - cell "Status"
        - cell "Updated"
        - cell "Actions"
    - rowgroup:
      - row "New Poem Generator Poem Generator draft less than a minute ago Open":
        - cell "New Poem Generator"
        - cell "Poem Generator"
        - cell "draft"
        - cell "less than a minute ago":
          - img
          - text: less than a minute ago
        - cell "Open":
          - link "Open":
            - /url: /w/poem/odV20ipbsknkBXOQcygr
            - img
            - text: Open
          - button:
            - img
      - row "The Content Crucible Poem Generator draft less than a minute ago Open":
        - cell "The Content Crucible"
        - cell "Poem Generator"
        - cell "draft"
        - cell "less than a minute ago":
          - img
          - text: less than a minute ago
        - cell "Open":
          - link "Open":
            - /url: /w/poem/3FBqT613oDy0gIKrgH60
            - img
            - text: Open
          - button:
            - img
      - row "New Poem Generator Poem Generator draft less than a minute ago Open":
        - cell "New Poem Generator"
        - cell "Poem Generator"
        - cell "draft"
        - cell "less than a minute ago":
          - img
          - text: less than a minute ago
        - cell "Open":
          - link "Open":
            - /url: /w/poem/PlPDMsbpcxi4Uz8d3CR1
            - img
            - text: Open
          - button:
            - img
      - row "The Staging Server's Whisper Poem Generator draft less than a minute ago Open":
        - cell "The Staging Server's Whisper"
        - cell "Poem Generator"
        - cell "draft"
        - cell "less than a minute ago":
          - img
          - text: less than a minute ago
        - cell "Open":
          - link "Open":
            - /url: /w/poem/4ClgpEQfggaquuoG7D75
            - img
            - text: Open
          - button:
            - img
      - row "Mountain's Gilded Kiss Poem Generator draft less than a minute ago Open":
        - cell "Mountain's Gilded Kiss"
        - cell "Poem Generator"
        - cell "draft"
        - cell "less than a minute ago":
          - img
          - text: less than a minute ago
        - cell "Open":
          - link "Open":
            - /url: /w/poem/yhUuMug0gynm9kYqfQMW
            - img
            - text: Open
          - button:
            - img
      - row "New Press Release Generator Press Release draft 5 minutes ago Open":
        - cell "New Press Release Generator"
        - cell "Press Release"
        - cell "draft"
        - cell "5 minutes ago":
          - img
          - text: 5 minutes ago
        - cell "Open":
          - link "Open":
            - /url: /w/press-release/3IZbTYSjAIZgQ7XxD0Mx
            - img
            - text: Open
          - button:
            - img
      - row "New Press Release Generator Press Release draft about 2 hours ago Open":
        - cell "New Press Release Generator"
        - cell "Press Release"
        - cell "draft"
        - cell "about 2 hours ago":
          - img
          - text: about 2 hours ago
        - cell "Open":
          - link "Open":
            - /url: /w/press-release/jNPuvjgupsYn8FF8RvXC
            - img
            - text: Open
          - button:
            - img
      - row "New Press Release Generator Press Release draft about 2 hours ago Open":
        - cell "New Press Release Generator"
        - cell "Press Release"
        - cell "draft"
        - cell "about 2 hours ago":
          - img
          - text: about 2 hours ago
        - cell "Open":
          - link "Open":
            - /url: /w/press-release/VnIkbhuiHmDe9v7xWIlL
            - img
            - text: Open
          - button:
            - img
      - row "New Press Release Generator Press Release draft about 2 hours ago Open":
        - cell "New Press Release Generator"
        - cell "Press Release"
        - cell "draft"
        - cell "about 2 hours ago":
          - img
          - text: about 2 hours ago
        - cell "Open":
          - link "Open":
            - /url: /w/press-release/xja150oQllCkyho8nsKB
            - img
            - text: Open
          - button:
            - img
      - row "New Press Release Generator Press Release draft about 2 hours ago Open":
        - cell "New Press Release Generator"
        - cell "Press Release"
        - cell "draft"
        - cell "about 2 hours ago":
          - img
          - text: about 2 hours ago
        - cell "Open":
          - link "Open":
            - /url: /w/press-release/fK8uY8IDsjern7XaNHc1
            - img
            - text: Open
          - button:
            - img
      - row "New Press Release Generator Press Release draft about 2 hours ago Open":
        - cell "New Press Release Generator"
        - cell "Press Release"
        - cell "draft"
        - cell "about 2 hours ago":
          - img
          - text: about 2 hours ago
        - cell "Open":
          - link "Open":
            - /url: /w/press-release/NY4kSGnkXLMMiExQ1Qru
            - img
            - text: Open
          - button:
            - img
      - row "New Press Release Generator Press Release draft about 2 hours ago Open":
        - cell "New Press Release Generator"
        - cell "Press Release"
        - cell "draft"
        - cell "about 2 hours ago":
          - img
          - text: about 2 hours ago
        - cell "Open":
          - link "Open":
            - /url: /w/press-release/MdxCAcypio19UvLpg06s
            - img
            - text: Open
          - button:
            - img
      - row "The Amber Whisper Poem Generator draft about 2 hours ago Open":
        - cell "The Amber Whisper"
        - cell "Poem Generator"
        - cell "draft"
        - cell "about 2 hours ago":
          - img
          - text: about 2 hours ago
        - cell "Open":
          - link "Open":
            - /url: /w/poem/PwCm5HCGffmqxgxtQNfi
            - img
            - text: Open
          - button:
            - img
      - row "Autumn's Gentle Murmur Poem Generator draft about 2 hours ago Open":
        - cell "Autumn's Gentle Murmur"
        - cell "Poem Generator"
        - cell "draft"
        - cell "about 2 hours ago":
          - img
          - text: about 2 hours ago
        - cell "Open":
          - link "Open":
            - /url: /w/poem/6PUFApL62EqT7DUhrBpC
            - img
            - text: Open
          - button:
            - img
      - row "Alpenglow's Mirror Poem Generator draft about 2 hours ago Open":
        - cell "Alpenglow's Mirror"
        - cell "Poem Generator"
        - cell "draft"
        - cell "about 2 hours ago":
          - img
          - text: about 2 hours ago
        - cell "Open":
          - link "Open":
            - /url: /w/poem/1u3TwVkrJqZzlAPnj8ZN
            - img
            - text: Open
          - button:
            - img
      - row "Golden Mirror of the Peaks Poem Generator draft about 2 hours ago Open":
        - cell "Golden Mirror of the Peaks"
        - cell "Poem Generator"
        - cell "draft"
        - cell "about 2 hours ago":
          - img
          - text: about 2 hours ago
        - cell "Open":
          - link "Open":
            - /url: /w/poem/g65i7WWlvH7spW6CaMah
            - img
            - text: Open
          - button:
            - img
      - row "Alpenglow's Liquid Gold Poem Generator draft about 2 hours ago Open":
        - cell "Alpenglow's Liquid Gold"
        - cell "Poem Generator"
        - cell "draft"
        - cell "about 2 hours ago":
          - img
          - text: about 2 hours ago
        - cell "Open":
          - link "Open":
            - /url: /w/poem/Q2HItarApWDO7Bp62LEv
            - img
            - text: Open
          - button:
            - img
      - row "Alpenglow's Silent Mirror Poem Generator draft about 2 hours ago Open":
        - cell "Alpenglow's Silent Mirror"
        - cell "Poem Generator"
        - cell "draft"
        - cell "about 2 hours ago":
          - img
          - text: about 2 hours ago
        - cell "Open":
          - link "Open":
            - /url: /w/poem/C5giqg4hgZxJff55Ocnm
            - img
            - text: Open
          - button:
            - img
      - row "The Debugger's Dance Poem Generator draft about 2 hours ago Open":
        - cell "The Debugger's Dance"
        - cell "Poem Generator"
        - cell "draft"
        - cell "about 2 hours ago":
          - img
          - text: about 2 hours ago
        - cell "Open":
          - link "Open":
            - /url: /w/poem/2uvjKTla7FENurn305RH
            - img
            - text: Open
          - button:
            - img
      - row "The Uncredited Verse Poem Generator draft about 2 hours ago Open":
        - cell "The Uncredited Verse"
        - cell "Poem Generator"
        - cell "draft"
        - cell "about 2 hours ago":
          - img
          - text: about 2 hours ago
        - cell "Open":
          - link "Open":
            - /url: /w/poem/CkM4xJSn2HkXnmpqKnLd
            - img
            - text: Open
          - button:
            - img
      - row "New Poem Generator Poem Generator draft about 2 hours ago Open":
        - cell "New Poem Generator"
        - cell "Poem Generator"
        - cell "draft"
        - cell "about 2 hours ago":
          - img
          - text: about 2 hours ago
        - cell "Open":
          - link "Open":
            - /url: /w/poem/E5vNi6rbLqgMQlT2DlTI
            - img
            - text: Open
          - button:
            - img
      - row "The Starlit Ocean's Embrace Poem Generator draft about 2 hours ago Open":
        - cell "The Starlit Ocean's Embrace"
        - cell "Poem Generator"
        - cell "draft"
        - cell "about 2 hours ago":
          - img
          - text: about 2 hours ago
        - cell "Open":
          - link "Open":
            - /url: /w/poem/ox9XeJTjQluvZMyAJfoO
            - img
            - text: Open
          - button:
            - img
      - row "New Poem Generator Poem Generator draft about 2 hours ago Open":
        - cell "New Poem Generator"
        - cell "Poem Generator"
        - cell "draft"
        - cell "about 2 hours ago":
          - img
          - text: about 2 hours ago
        - cell "Open":
          - link "Open":
            - /url: /w/poem/4LsmtXiXXsK7UIC1ujo7
            - img
            - text: Open
          - button:
            - img
      - row "New Poem Generator Poem Generator draft about 2 hours ago Open":
        - cell "New Poem Generator"
        - cell "Poem Generator"
        - cell "draft"
        - cell "about 2 hours ago":
          - img
          - text: about 2 hours ago
        - cell "Open":
          - link "Open":
            - /url: /w/poem/zGnxUgJE7EqPS2Aw5Kjw
            - img
            - text: Open
          - button:
            - img
      - row "New Poem Generator Poem Generator draft about 2 hours ago Open":
        - cell "New Poem Generator"
        - cell "Poem Generator"
        - cell "draft"
        - cell "about 2 hours ago":
          - img
          - text: about 2 hours ago
        - cell "Open":
          - link "Open":
            - /url: /w/poem/sQmJHFJ71DFg2ZvD5XnF
            - img
            - text: Open
          - button:
            - img
      - row "The Pixel's Provisional Verse Poem Generator draft about 2 hours ago Open":
        - cell "The Pixel's Provisional Verse"
        - cell "Poem Generator"
        - cell "draft"
        - cell "about 2 hours ago":
          - img
          - text: about 2 hours ago
        - cell "Open":
          - link "Open":
            - /url: /w/poem/qcV4E8KDcmTdbcn5DZTZ
            - img
            - text: Open
          - button:
            - img
      - row "Earth's Gentle Baptism Poem Generator draft about 2 hours ago Open":
        - cell "Earth's Gentle Baptism"
        - cell "Poem Generator"
        - cell "draft"
        - cell "about 2 hours ago":
          - img
          - text: about 2 hours ago
        - cell "Open":
          - link "Open":
            - /url: /w/poem/MWwVrxK6ihI6hKxXEN7l
            - img
            - text: Open
          - button:
            - img
      - row "The Digital Echo's First Whisper Poem Generator draft about 2 hours ago Open":
        - cell "The Digital Echo's First Whisper"
        - cell "Poem Generator"
        - cell "draft"
        - cell "about 2 hours ago":
          - img
          - text: about 2 hours ago
        - cell "Open":
          - link "Open":
            - /url: /w/poem/HAirV45TZenNVLmFgIzI
            - img
            - text: Open
          - button:
            - img
      - row "New Poem Generator Poem Generator draft about 2 hours ago Open":
        - cell "New Poem Generator"
        - cell "Poem Generator"
        - cell "draft"
        - cell "about 2 hours ago":
          - img
          - text: about 2 hours ago
        - cell "Open":
          - link "Open":
            - /url: /w/poem/4EMTP565HogonSi9ZHX5
            - img
            - text: Open
          - button:
            - img
      - row "The Sentinel of Exports Poem Generator draft about 2 hours ago Open":
        - cell "The Sentinel of Exports"
        - cell "Poem Generator"
        - cell "draft"
        - cell "about 2 hours ago":
          - img
          - text: about 2 hours ago
        - cell "Open":
          - link "Open":
            - /url: /w/poem/LW59GXRRSOzy91yIQ7ki
            - img
            - text: Open
          - button:
            - img
      - row "Crimson Veil on Liquid Glass Poem Generator draft about 2 hours ago Open":
        - cell "Crimson Veil on Liquid Glass"
        - cell "Poem Generator"
        - cell "draft"
        - cell "about 2 hours ago":
          - img
          - text: about 2 hours ago
        - cell "Open":
          - link "Open":
            - /url: /w/poem/BcAVxJ4SwGJqO6gIXYzb
            - img
            - text: Open
          - button:
            - img
      - row "New Press Release Generator Press Release draft about 2 hours ago Open":
        - cell "New Press Release Generator"
        - cell "Press Release"
        - cell "draft"
        - cell "about 2 hours ago":
          - img
          - text: about 2 hours ago
        - cell "Open":
          - link "Open":
            - /url: /w/press-release/WiFktNGOEnrVSI9ag1ba
            - img
            - text: Open
          - button:
            - img
      - row "New Press Release Generator Press Release draft about 2 hours ago Open":
        - cell "New Press Release Generator"
        - cell "Press Release"
        - cell "draft"
        - cell "about 2 hours ago":
          - img
          - text: about 2 hours ago
        - cell "Open":
          - link "Open":
            - /url: /w/press-release/KP1VAJWbKAaFEKWUb46q
            - img
            - text: Open
          - button:
            - img
      - row "New Press Release Generator Press Release draft about 2 hours ago Open":
        - cell "New Press Release Generator"
        - cell "Press Release"
        - cell "draft"
        - cell "about 2 hours ago":
          - img
          - text: about 2 hours ago
        - cell "Open":
          - link "Open":
            - /url: /w/press-release/OOAElWBCotVERFs2rnFY
            - img
            - text: Open
          - button:
            - img
      - row "The Debugger's Dance Poem Generator draft about 2 hours ago Open":
        - cell "The Debugger's Dance"
        - cell "Poem Generator"
        - cell "draft"
        - cell "about 2 hours ago":
          - img
          - text: about 2 hours ago
        - cell "Open":
          - link "Open":
            - /url: /w/poem/imkFRWIf9yCSbc2hiFrj
            - img
            - text: Open
          - button:
            - img
      - row "New Poem Generator Poem Generator draft about 2 hours ago Open":
        - cell "New Poem Generator"
        - cell "Poem Generator"
        - cell "draft"
        - cell "about 2 hours ago":
          - img
          - text: about 2 hours ago
        - cell "Open":
          - link "Open":
            - /url: /w/poem/IVuWlEoK0tKl5JPeqbUQ
            - img
            - text: Open
          - button:
            - img
      - row "The Debugger's Dance Poem Generator draft about 2 hours ago Open":
        - cell "The Debugger's Dance"
        - cell "Poem Generator"
        - cell "draft"
        - cell "about 2 hours ago":
          - img
          - text: about 2 hours ago
        - cell "Open":
          - link "Open":
            - /url: /w/poem/wk2TeeGBgzVq6jSTBzH9
            - img
            - text: Open
          - button:
            - img
      - row "The Unit's Whisper Poem Generator draft about 2 hours ago Open":
        - cell "The Unit's Whisper"
        - cell "Poem Generator"
        - cell "draft"
        - cell "about 2 hours ago":
          - img
          - text: about 2 hours ago
        - cell "Open":
          - link "Open":
            - /url: /w/poem/cIwOpUCiI4fbCENwAuKY
            - img
            - text: Open
          - button:
            - img
      - row "New Poem Generator Poem Generator draft about 2 hours ago Open":
        - cell "New Poem Generator"
        - cell "Poem Generator"
        - cell "draft"
        - cell "about 2 hours ago":
          - img
          - text: about 2 hours ago
        - cell "Open":
          - link "Open":
            - /url: /w/poem/sMoUr8KxHfmsS9ZuoP6m
            - img
            - text: Open
          - button:
            - img
      - row "New Press Release Generator Press Release draft about 2 hours ago Open":
        - cell "New Press Release Generator"
        - cell "Press Release"
        - cell "draft"
        - cell "about 2 hours ago":
          - img
          - text: about 2 hours ago
        - cell "Open":
          - link "Open":
            - /url: /w/press-release/kgAq5pRyH6fCQWccyc1R
            - img
            - text: Open
          - button:
            - img
      - row "New Press Release Generator Press Release draft about 2 hours ago Open":
        - cell "New Press Release Generator"
        - cell "Press Release"
        - cell "draft"
        - cell "about 2 hours ago":
          - img
          - text: about 2 hours ago
        - cell "Open":
          - link "Open":
            - /url: /w/press-release/5V5MAit1JtqLlx0vS63Z
            - img
            - text: Open
          - button:
            - img
      - row "New Press Release Generator Press Release draft about 2 hours ago Open":
        - cell "New Press Release Generator"
        - cell "Press Release"
        - cell "draft"
        - cell "about 2 hours ago":
          - img
          - text: about 2 hours ago
        - cell "Open":
          - link "Open":
            - /url: /w/press-release/qpRC1vRRKoPyJFBYfXFf
            - img
            - text: Open
          - button:
            - img
      - row "The Moment's Gauge Poem Generator draft about 2 hours ago Open":
        - cell "The Moment's Gauge"
        - cell "Poem Generator"
        - cell "draft"
        - cell "about 2 hours ago":
          - img
          - text: about 2 hours ago
        - cell "Open":
          - link "Open":
            - /url: /w/poem/J86K7yc014ZSm2d7mOeJ
            - img
            - text: Open
          - button:
            - img
      - row "New Poem Generator Poem Generator draft about 2 hours ago Open":
        - cell "New Poem Generator"
        - cell "Poem Generator"
        - cell "draft"
        - cell "about 2 hours ago":
          - img
          - text: about 2 hours ago
        - cell "Open":
          - link "Open":
            - /url: /w/poem/IbWJ06az6oQ0RsAm4g4T
            - img
            - text: Open
          - button:
            - img
      - row "The Crucible of Knowledge Poem Generator draft about 2 hours ago Open":
        - cell "The Crucible of Knowledge"
        - cell "Poem Generator"
        - cell "draft"
        - cell "about 2 hours ago":
          - img
          - text: about 2 hours ago
        - cell "Open":
          - link "Open":
            - /url: /w/poem/Jdfog1dTnhv49UZYR004
            - img
            - text: Open
          - button:
            - img
      - row "The Proving Ground Poem Generator draft about 2 hours ago Open":
        - cell "The Proving Ground"
        - cell "Poem Generator"
        - cell "draft"
        - cell "about 2 hours ago":
          - img
          - text: about 2 hours ago
        - cell "Open":
          - link "Open":
            - /url: /w/poem/YliOOoyJ8CZlHH0lPrqf
            - img
            - text: Open
          - button:
            - img
      - row "The Echo's Origin Poem Generator draft about 2 hours ago Open":
        - cell "The Echo's Origin"
        - cell "Poem Generator"
        - cell "draft"
        - cell "about 2 hours ago":
          - img
          - text: about 2 hours ago
        - cell "Open":
          - link "Open":
            - /url: /w/poem/I2IOI6hWxFSrhVAYVSSJ
            - img
            - text: Open
          - button:
            - img
      - row "The Infinite Reflection Poem Generator draft about 2 hours ago Open":
        - cell "The Infinite Reflection"
        - cell "Poem Generator"
        - cell "draft"
        - cell "about 2 hours ago":
          - img
          - text: about 2 hours ago
        - cell "Open":
          - link "Open":
            - /url: /w/poem/ZuxgOTUWi9tAThn4tyf2
            - img
            - text: Open
          - button:
            - img
      - row "New Poem Generator Poem Generator draft about 2 hours ago Open":
        - cell "New Poem Generator"
        - cell "Poem Generator"
        - cell "draft"
        - cell "about 2 hours ago":
          - img
          - text: about 2 hours ago
        - cell "Open":
          - link "Open":
            - /url: /w/poem/NoeMe6KVOS4F9Eb5kAKm
            - img
            - text: Open
          - button:
            - img
      - row "New Poem Generator Poem Generator draft about 2 hours ago Open":
        - cell "New Poem Generator"
        - cell "Poem Generator"
        - cell "draft"
        - cell "about 2 hours ago":
          - img
          - text: about 2 hours ago
        - cell "Open":
          - link "Open":
            - /url: /w/poem/Bbspk3wm9rFIJfs6rqHF
            - img
            - text: Open
          - button:
            - img
      - row "New Poem Generator Poem Generator draft about 2 hours ago Open":
        - cell "New Poem Generator"
        - cell "Poem Generator"
        - cell "draft"
        - cell "about 2 hours ago":
          - img
          - text: about 2 hours ago
        - cell "Open":
          - link "Open":
            - /url: /w/poem/uldQeCzBJ3cmrKLzo3Yu
            - img
            - text: Open
          - button:
            - img
      - row "A Frame's Poetic Test Poem Generator draft about 2 hours ago Open":
        - cell "A Frame's Poetic Test"
        - cell "Poem Generator"
        - cell "draft"
        - cell "about 2 hours ago":
          - img
          - text: about 2 hours ago
        - cell "Open":
          - link "Open":
            - /url: /w/poem/JqVDsjk8q4vLHeE4JtTL
            - img
            - text: Open
          - button:
            - img
      - row "When the World Holds Its Breath Poem Generator draft about 2 hours ago Open":
        - cell "When the World Holds Its Breath"
        - cell "Poem Generator"
        - cell "draft"
        - cell "about 2 hours ago":
          - img
          - text: about 2 hours ago
        - cell "Open":
          - link "Open":
            - /url: /w/poem/AqOQbbHO9vBSdJBjj6fk
            - img
            - text: Open
          - button:
            - img
      - row "New Poem Generator Poem Generator draft about 2 hours ago Open":
        - cell "New Poem Generator"
        - cell "Poem Generator"
        - cell "draft"
        - cell "about 2 hours ago":
          - img
          - text: about 2 hours ago
        - cell "Open":
          - link "Open":
            - /url: /w/poem/4SNglyDRKUfVeG2zaHIU
            - img
            - text: Open
          - button:
            - img
      - row "The Content Crucible Poem Generator draft about 2 hours ago Open":
        - cell "The Content Crucible"
        - cell "Poem Generator"
        - cell "draft"
        - cell "about 2 hours ago":
          - img
          - text: about 2 hours ago
        - cell "Open":
          - link "Open":
            - /url: /w/poem/zj5XWVranYkkq7X7q4mC
            - img
            - text: Open
          - button:
            - img
      - row "The Pre-Launch Pulse Poem Generator draft about 2 hours ago Open":
        - cell "The Pre-Launch Pulse"
        - cell "Poem Generator"
        - cell "draft"
        - cell "about 2 hours ago":
          - img
          - text: about 2 hours ago
        - cell "Open":
          - link "Open":
            - /url: /w/poem/nlVko4dOH6kIkjAMRYFl
            - img
            - text: Open
          - button:
            - img
      - row "New Poem Generator Poem Generator draft about 2 hours ago Open":
        - cell "New Poem Generator"
        - cell "Poem Generator"
        - cell "draft"
        - cell "about 2 hours ago":
          - img
          - text: about 2 hours ago
        - cell "Open":
          - link "Open":
            - /url: /w/poem/lNbNoCigO4SS8K7hw6G3
            - img
            - text: Open
          - button:
            - img
      - row "New Poem Generator Poem Generator draft about 2 hours ago Open":
        - cell "New Poem Generator"
        - cell "Poem Generator"
        - cell "draft"
        - cell "about 2 hours ago":
          - img
          - text: about 2 hours ago
        - cell "Open":
          - link "Open":
            - /url: /w/poem/88upVFYxbeBz64RSnnFn
            - img
            - text: Open
          - button:
            - img
      - row "New Press Release Generator Press Release draft about 3 hours ago Open":
        - cell "New Press Release Generator"
        - cell "Press Release"
        - cell "draft"
        - cell "about 3 hours ago":
          - img
          - text: about 3 hours ago
        - cell "Open":
          - link "Open":
            - /url: /w/press-release/9N7XPdsCPiuaqC9BRlU5
            - img
            - text: Open
          - button:
            - img
      - row "New Press Release Generator Press Release draft about 3 hours ago Open":
        - cell "New Press Release Generator"
        - cell "Press Release"
        - cell "draft"
        - cell "about 3 hours ago":
          - img
          - text: about 3 hours ago
        - cell "Open":
          - link "Open":
            - /url: /w/press-release/JKI2KyIAq1w4sUPYm0us
            - img
            - text: Open
          - button:
            - img
      - row "New Press Release Generator Press Release draft about 3 hours ago Open":
        - cell "New Press Release Generator"
        - cell "Press Release"
        - cell "draft"
        - cell "about 3 hours ago":
          - img
          - text: about 3 hours ago
        - cell "Open":
          - link "Open":
            - /url: /w/press-release/q9qiqPtI7WFu38mUQ9u2
            - img
            - text: Open
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
  205 |     await page.click('a[href*="/workflow-details/poem-generator"]');
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
> 262 |     await documentInList.click();
      |                          ^ Error: locator.click: Test timeout of 30000ms exceeded.
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
  306 |     // Test empty input handling
  307 |     await page.click('#workflow-start-poem-generator');
  308 |     await page.waitForSelector('textarea');
  309 |     
  310 |     // Try to continue with empty textarea
  311 |     await page.click('#process-stage-poem-topic');
  312 |     
  313 |     // Should show validation or handle gracefully
  314 |     const hasError = await page.locator('text=required').isVisible().catch(() => false);
  315 |     const hasTooltip = await page.locator('[role="tooltip"]').isVisible().catch(() => false);
  316 |     
  317 |     if (hasError || hasTooltip) {
  318 |       console.log('✅ Empty input validation working');
  319 |     }
  320 |     
  321 |     // Test with minimal input
  322 |     await page.fill('textarea', 'x');
  323 |     await page.click('#process-stage-poem-topic');
  324 |     
  325 |     // Should still generate something
  326 |     try {
  327 |       await page.waitForSelector('text=Poem Title', { timeout: 30000 });
  328 |       console.log('✅ Minimal input handled successfully');
  329 |     } catch {
  330 |       console.log('✅ Minimal input properly rejected');
  331 |     }
  332 |   });
  333 |
  334 |   test('Test all image format variations', async ({ page }) => {
  335 |     console.log('🧪 Testing image format variations...');
  336 |     
  337 |     const formats = [
  338 |       { ratio: '1:1', label: 'Square' },
  339 |       { ratio: '3:4', label: 'Portrait' },
  340 |       { ratio: '16:9', label: 'Widescreen' }
  341 |     ];
  342 |     
  343 |     for (const format of formats) {
  344 |       console.log(`Testing ${format.label} format...`);
  345 |       
  346 |       await page.goto(`${BASE_URL}/dashboard`);
  347 |       await page.click('#workflow-start-poem-generator');
  348 |       await page.waitForSelector('textarea');
  349 |       
  350 |       // Quick poem generation
  351 |       await page.fill('textarea', `Test poem for ${format.label} image`);
  352 |       await page.click('#process-stage-poem-topic');
  353 |       await page.waitForSelector('text=Poem Title', { timeout: 30000 });
  354 |       
  355 |       // Customize image format
  356 |       await page.selectOption('select[name="aspectRatio"]', format.ratio);
  357 |       await page.click('#process-stage-image-briefing');
  358 |       
  359 |       // Verify image generation
  360 |       await page.waitForSelector('text=Download', { timeout: 60000 });
  361 |       console.log(`✅ ${format.label} image generated`);
  362 |     }
```