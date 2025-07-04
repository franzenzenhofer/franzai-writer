**JIRA Story**

---

### Key Fields

| Field          | Value                                     |
| -------------- | ----------------------------------------- |
| **Ticket ID**  | `PR‑WF‑001`                               |
| **Title**      | **Create Perfect Press‑Release Workflow** |
| **Type**       | Story                                     |
| **Reporter**   | Product/Comms Guild                       |
| **Priority**   | P1 – blocks July launch                   |
| **Epic Link**  | AI Writer 2.0                             |
| **Sprint**     | 2025‑07‑08 (Sprint 32)                    |
| **Components** | Workflows · Prompt‑Engineering · Testing  |
| **Labels**     | `press_release` `workflow_v2` `ai_writer` |

---

## 1  Business Context

Marketing, PR and customers want a **one‑screen brief → auto‑cascade workflow** that spits out a *publication‑ready* press release (any single language the user requests), matching corporate tone, fully fact‑checked, with newsroom‑ready hero images and multi‑format export.
The current prototype is fragmented, over‑long, and fails automated tests.

---

## 2  Objectives / Outcome

* **Single minimal form** → all other stages autorun.
* **Language‑aware generation** (EN, DE, FR out‑of‑the‑box; any future language via list).
* **Three‑step image chain** (brief → prompt → generation) identical to existing pattern.
* **Strict AP/DACH press standards**: inverted pyramid, boilerplate, media contact, ###.
* **Zero circular deps**; workflow passes updated Jest suite.
* **Exports**: styled HTML, clean HTML, MD, PDF, DOCX with branding block.

---

## 3  Deliverables

1. **`src/workflows/press-release-perfect/workflow.json`** (full listing below).
2. **14 prompt markdown files** in `…/prompts/` (full text below).
3. **Updated unit‑test set** (`__tests__/*`) – green on `npm test`.
4. **README** explaining env vars, manual QA checklist.

---

## 4  Acceptance Criteria

| #  | Criterion                                                                                                                                          |
| -- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| A1 | Filling *only* the “Press‑Release Brief” form triggers every subsequent stage automatically.                                                       |
| A2 | Workflow supports `language` field (`en`, `de`, `fr` for v1); output is generated *directly* in that language – **no separate translation stage**. |
| A3 | Image pipeline contains exactly **three** consecutive stages: `press-photo-briefing` → `create-press-image-prompt` → `generate-press-photo`.       |
| A4 | Fact‑check stage blocks if `verdict != "APPROVED"` (frontend already listens for that flag).                                                       |
| A5 | HTML preview renders without external assets, JS or class‑attributes in body.                                                                      |
| A6 | `npm test -- src/workflows/press-release-perfect/__tests__/` passes (config, execution, template, prompt‑quality).                                 |
| A7 | Docs: README explains how to add another language in < 10 min.                                                                                     |

---

## 5  Implementation Details

### 5.1 workflow\.json (**complete**)

```json
{
  "id": "press-release-perfect",
  "shortName": "press-release",
  "name": "Press Release Generator (Perfect)",
  "description": "One‑form, auto‑cascade workflow that outputs a newsroom‑ready press release with brand‑matched tone, fact‑check, hero image and multi‑format exports.",
  "config": {
    "setTitleFromStageOutput": "headline-facts",
    "finalOutputStageId": "html-preview",
    "showThinking": false,
    "autoScroll": { "enabled": true, "scrollToAutorun": true },
    "progressAnimation": { "dynamicSpeed": true, "singleCycle": false }
  },

  "stages": [
    /** ----------------------------------------------------------------
     * 0 – MINIMAL BRIEF (only manual stage)
     * ---------------------------------------------------------------- */
    {
      "id": "brief",
      "name": "Press‑Release Brief",
      "inputType": "form",
      "outputType": "json",
      "autoRun": false,
      "formFields": [
        { "name": "company",      "label": "Company Name",      "type": "text",     "validation": { "required": true } },
        { "name": "website",      "label": "Company Website",   "type": "text",     "placeholder": "https://…", "validation": { "required": false } },
        { "name": "announcement", "label": "Announcement (What)", "type": "textarea", "validation": { "required": true, "minLength": 20 } },
        { "name": "why",          "label": "Why It Matters",    "type": "textarea", "validation": { "required": true, "minLength": 30 } },
        { "name": "location",     "label": "Dateline Location", "type": "text",     "placeholder": "Vienna, Austria", "validation": { "required": true } },
        { "name": "releaseDate",  "label": "Release / Embargo", "type": "text",     "placeholder": "YYYY‑MM‑DD or \"immediate\"", "validation": { "required": true } },
        { "name": "language",     "label": "Language",          "type": "select",   "defaultValue": "en", "options": [
              { "value": "en", "label": "English" },
              { "value": "de", "label": "Deutsch" },
              { "value": "fr", "label": "Français" }
        ] }
      ]
    },

    /** ----------------------------------------------------------------
     * 1 – STYLE CORPUS (auto scrape last 5 releases)
     * ---------------------------------------------------------------- */
    {
      "id": "style-corpus",
      "name": "Collect Past Releases",
      "description": "Grabs recent press releases from the company site (if available).",
      "inputType": "none",
      "outputType": "context",
      "model": "gemini-2.5-flash",
      "grounding": { "urlContext": true },
      "autoRun": true,
      "activationDependencies": ["brief"],
      "promptFile": "prompts/01_style_corpus.md"
    },

    /** ----------------------------------------------------------------
     * 2 – STYLE PROFILE
     * ---------------------------------------------------------------- */
    {
      "id": "style-profile",
      "name": "Derive Tone & Boilerplate",
      "inputType": "none",
      "outputType": "json",
      "model": "gemini-2.5-flash",
      "temperature": 0.25,
      "autoRun": true,
      "activationDependencies": ["style-corpus"],
      "promptFile": "prompts/02_style_profile.md",
      "jsonFields": [
        { "key": "tone",        "label": "Tone",        "type": "text" },
        { "key": "style_rules","label": "Style Rules",  "type": "textarea" },
        { "key": "boilerplate","label": "Boilerplate",  "type": "textarea" }
      ]
    },

    /** ----------------------------------------------------------------
     * 3 – RESEARCH
     * ---------------------------------------------------------------- */
    {
      "id": "research",
      "name": "Company & Market Research",
      "inputType": "none",
      "outputType": "json",
      "model": "gemini-2.5-flash",
      "temperature": 0.3,
      "grounding": { "googleSearch": true, "urlContext": true },
      "autoRun": true,
      "activationDependencies": ["brief"],
      "promptFile": "prompts/03_research.md",
      "jsonFields": [
        { "key": "background", "label": "Background", "type": "textarea" },
        { "key": "industry",   "label": "Industry",   "type": "textarea" },
        { "key": "recent",     "label": "Recent",     "type": "textarea" },
        { "key": "stats",      "label": "Stats",      "type": "textarea" }
      ]
    },

    /** ----------------------------------------------------------------
     * 4 – HEADLINE & FACTS
     * ---------------------------------------------------------------- */
    {
      "id": "headline-facts",
      "name": "Headline & Key Facts",
      "inputType": "none",
      "outputType": "json",
      "model": "gemini-2.5-flash",
      "temperature": 0.3,
      "autoRun": true,
      "activationDependencies": ["research","style-profile"],
      "promptFile": "prompts/04_headline_facts.md",
      "jsonFields": [
        { "key": "headline",   "label": "Headline",   "type": "text" },
        { "key": "subheadline","label": "Subheadline","type": "text" },
        { "key": "bullets",    "label": "Key Points", "type": "textarea" },
        { "key": "quotes",     "label": "Quotes",     "type": "textarea" },
        { "key": "metrics",    "label": "Statistics", "type": "textarea" }
      ],
      "aiRedoEnabled": true,
      "editEnabled": true,
      "copyable": true
    },

    /** ----------------------------------------------------------------
     * 5 – CONTACTS
     * ---------------------------------------------------------------- */
    {
      "id": "contacts",
      "name": "Media Contact",
      "inputType": "none",
      "outputType": "json",
      "model": "gemini-2.5-flash",
      "temperature": 0.15,
      "autoRun": true,
      "activationDependencies": ["brief"],
      "promptFile": "prompts/05_contacts.md",
      "jsonFields": [
        { "key": "name",  "label": "Name",  "type": "text" },
        { "key": "title", "label": "Title", "type": "text" },
        { "key": "email", "label": "Email", "type": "text" },
        { "key": "phone", "label": "Phone", "type": "text" }
      ],
      "editEnabled": true
    },

    /** ----------------------------------------------------------------
     * 6 – FACT CHECK
     * ---------------------------------------------------------------- */
    {
      "id": "fact-check",
      "name": "Automated Fact‑Check",
      "inputType": "none",
      "outputType": "json",
      "model": "gemini-2.5-flash",
      "temperature": 0.1,
      "grounding": { "googleSearch": true },
      "autoRun": true,
      "activationDependencies": ["headline-facts"],
      "promptFile": "prompts/06_fact_check.md",
      "jsonFields": [
        { "key": "verdict", "label": "Verdict", "type": "text" },
        { "key": "fixes",   "label": "Fixes Needed", "type": "textarea" }
      ]
    },

    /** ----------------------------------------------------------------
     * 7 – DRAFT RELEASE
     * ---------------------------------------------------------------- */
    {
      "id": "draft-release",
      "name": "Draft Press Release",
      "inputType": "none",
      "outputType": "markdown",
      "model": "gemini-2.5-flash",
      "temperature": 0.35,
      "autoRun": true,
      "activationDependencies": ["style-profile","headline-facts","contacts","fact-check"],
      "promptFile": "prompts/07_draft_release.md",
      "aiRedoEnabled": true,
      "editEnabled": true,
      "copyable": true
    },

    /** ----------------------------------------------------------------
     * 8 – PRESS PHOTO BRIEF  (1st of 3‑step image chain)
     * ---------------------------------------------------------------- */
    {
      "id": "press-photo-briefing",
      "name": "Press Photo Briefing",
      "inputType": "none",
      "outputType": "json",
      "model": "gemini-2.5-flash",
      "temperature": 0.3,
      "autoRun": true,
      "activationDependencies": ["draft-release"],
      "promptFile": "prompts/08_press_photo_briefing.md",
      "jsonFields": [
        { "key": "description",   "label": "Description",   "type": "textarea" },
        { "key": "aspect",        "label": "Aspect Ratio",  "type": "text" },
        { "key": "numImages",     "label": "Number",        "type": "text" }
      ]
    },

    /** ----------------------------------------------------------------
     * 9 – CREATE IMAGE PROMPT (2/3)
     * ---------------------------------------------------------------- */
    {
      "id": "create-press-image-prompt",
      "name": "Create Imagen Prompt",
      "inputType": "none",
      "outputType": "json",
      "model": "gemini-2.5-flash",
      "temperature": 0.7,
      "autoRun": true,
      "activationDependencies": ["press-photo-briefing"],
      "promptFile": "prompts/09_create_press_image_prompt.md",
      "jsonFields": [
        { "key": "prompt",    "label": "Imagen Prompt", "type": "textarea" },
        { "key": "filenames", "label": "Filenames",     "type": "text" }
      ]
    },

    /** ----------------------------------------------------------------
     * 10 – GENERATE PRESS PHOTO (3/3)
     * ---------------------------------------------------------------- */
    {
      "id": "generate-press-photo",
      "name": "Generate Press Photo",
      "inputType": "none",
      "outputType": "image",
      "model": "imagen-3.0-generate-002",
      "provider": "imagen",
      "autoRun": true,
      "activationDependencies": ["create-press-image-prompt"],
      "promptTemplate": "{{create-press-image-prompt.output.prompt}}",
      "imageGenerationSettings": {
        "provider": "imagen",
        "aspectRatio": "{{press-photo-briefing.output.aspect}}",
        "numberOfImages": "{{press-photo-briefing.output.numImages}}",
        "filenames": "{{create-press-image-prompt.output.filenames}}",
        "imagen": { "personGeneration": "allow_adult" }
      },
      "hideImageMetadata": true
    },

    /** ----------------------------------------------------------------
     * 11 – HTML PREVIEW
     * ---------------------------------------------------------------- */
    {
      "id": "html-preview",
      "name": "Generate HTML Preview",
      "inputType": "none",
      "outputType": "html",
      "model": "gemini-2.5-flash",
      "temperature": 0.25,
      "autoRun": true,
      "activationDependencies": ["draft-release","generate-press-photo"],
      "promptFile": "prompts/11_html_preview.md",
      "aiRedoEnabled": true
    },

    /** ----------------------------------------------------------------
     * 12 – EXPORT
     * ---------------------------------------------------------------- */
    {
      "id": "export",
      "stageType": "export",
      "title": "Export & Publish",
      "inputType": "none",
      "outputType": "export-interface",
      "activationDependencies": ["html-preview"],
      "triggerButton": { "label": "Export & Publish", "variant": "hero", "size": "large" },
      "exportConfig": {
        "aiModel": "gemini-2.5-flash",
        "formats": {
          "html-styled": { "enabled": true, "promptFile": "prompts/12_html_styled_template.md" },
          "html-clean":  { "enabled": true, "promptFile": "prompts/12_html_clean_template.md" },
          "markdown":    { "enabled": true, "deriveFrom": "html-clean" },
          "pdf":         { "enabled": true, "deriveFrom": "html-styled" },
          "docx":        { "enabled": true, "deriveFrom": "html-styled" }
        },
        "publishing": {
          "enabled": true,
          "instant": true,
          "formats": ["html-styled","html-clean"],
          "features": { "seo": { "openGraph": true, "structuredData": true } }
        }
      }
    }
  ]
}
```

---

### 5.2 Prompt Files (full text ⬇)

> **Note:** The text mirrors your previous quality‑guard prompts, updated for new variable paths and language selection.

<details>
<summary>01_style_corpus.md</summary>

```
You are a crawler. Fetch up to 5 recent press releases from {{brief.output.website}} (english or target language) …
Return ONLY raw concatenated text – no analysis.
```

</details>

<details>
<summary>02_style_profile.md</summary>

```
You are a corporate tone analyst. Using the raw corpus:

1. **tone** – brief descriptor  
2. **style_rules** – bullet list (sentence length, voice, jargon, quote formatting)  
3. **boilerplate** – one paragraph “About {{brief.output.company}}”.

Return JSON:
{
  "tone": "",
  "style_rules": "",
  "boilerplate": ""
}
```

</details>

<details>
<summary>03_research.md</summary>

```
Language: {{brief.output.language}}

Use Google search + provided site to compile:

• background • industry • recent • stats

Return JSON with those four keys (strings).
```

</details>

<details>
<summary>04_headline_facts.md</summary>

```
Language: {{brief.output.language}}
Tone rules: {{style-profile.output.style_rules}}

Generate:
- headline (≤12 words)
- subheadline (15‑25 words)
- bullets (5‑7 key facts, newline separated)
- quotes (2 exec quotes, newline separated)
- metrics (3‑5 stats, newline separated)

Return JSON.
```

</details>

<details>
<summary>05_contacts.md</summary>

```
Language: {{brief.output.language}}
Generate realistic EU media contact JSON {name,title,email,phone}.
```

</details>

<details>
<summary>06_fact_check.md</summary>

```
Check all claims from headline‑facts against web (Google).  
Return JSON {verdict: APPROVED/REVISE, fixes: "…"}.
```

</details>

<details>
<summary>07_draft_release.md</summary>

```
Language: {{brief.output.language}}  
Follow AP style (or APA for DE/FR as appropriate).

Inputs:
- headline‑facts
- research
- style‑profile
- contacts
- fact‑check.fixes

Write 450‑600 word press release with:
FOR IMMEDIATE RELEASE  
Dateline ({{brief.output.location}}, {{brief.output.releaseDate}})  
Headline, subheadline, body, quotes, stats, boilerplate, media contact, ###.  
Return pure Markdown.
```

</details>

<details>
<summary>08_press_photo_briefing.md</summary>

```
Summarise release & create default hero‑image specs.

Return JSON:
{
  "description": "Corporate concept illustrating {{brief.output.announcement}}",
  "aspect": "16:9",
  "numImages": "1"
}
```

</details>

<details>
<summary>09_create_press_image_prompt.md</summary>

```
Create detailed Imagen prompt (no text in image).  
Generate exactly {{press-photo-briefing.output.numImages}} unique 3‑word filenames.  
Return JSON {prompt, filenames}
```

</details>

<details>
<summary>11_html_preview.md</summary>

```
Convert {{draft-release}} to responsive HTML (no external CSS/JS).  
Embed first image from {{generate-press-photo}} with responsive <img>.  
Use language {{brief.output.language}} for all UI strings.  
Return ONLY complete HTML document.
```

</details>

<details>
<summary>12_html_styled_template.md / 12_html_clean_template.md</summary>

*(Copy your existing poem templates, replace variable ids, keep constraints re CSS, classes, meta tags, etc.)*

</details>

---

### 5.3 Unit‑Test Updates

* Duplicate existing suites under `press-release-perfect/__tests__/`.
* Adjust expected stage arrays to 13 stages.
* Update stage IDs in all regex checks.

---

## 6  Tasks

| Key    | Task                                       | Owner       | Est. |
| ------ | ------------------------------------------ | ----------- | ---- |
| **T1** | Draft & commit `workflow.json`             | FE‑Workflow | 4 h  |
| **T2** | Write 14 prompt `.md` files                | Prompt‑Eng  | 6 h  |
| **T3** | Update / add Jest tests                    | QA Eng      | 3 h  |
| **T4** | Refactor export templates (styled / clean) | Frontend    | 2 h  |
| **T5** | Manual QA run (EN, DE)                     | QA          | 2 h  |
| **T6** | Docs & README                              | Tech‑Writer | 1 h  |

Total ≈ **18 h**.

---

## 7  Definition of Done

* All ACs met; workflow usable by non‑tech user in < 5 min.
* Tests green, PR merged to `main`.
* Demo given to Comms team; sign‑off received.
* Ticket closed in JIRA.

---

### 🎉  When merged, users will click “Press‑Release”, fill seven fields, and receive a ready‑to‑publish, on‑brand release complete with hero image and multi‑format exports—no further clicks required.
