# Ticket #119: Research & Implement Copyright Attribution for Imagen-Generated Images

**Priority:** Medium  
**Type:** Legal Compliance / UX Enhancement  
**Components:** Export Stage, Imagen Image Generation, Templates, Documentation  
**Status:** Open

---

## Objective

Ensure every image generated via the **Imagen** provider is accompanied by the correct copyright/licence notice in **Styled HTML**, **Clean HTML**, **Markdown**, **PDF**, **DOCX**, and any future export formats—**without degrading visual experience**.

---

## Tasks

### 1. Legal Research (Blocking Step)
1. **Identify authoritative sources** (Google/Imagen documentation, licence terms, TOS).  
2. **Clarify ownership**: Who holds copyright? – User, Google, or shared.  
3. **Determine required attribution wording** (if any) & placement guidelines.  
4. **Verify commercial usage limits** & mandatory disclaimers (e.g., "May not depict real people").  
5. **Document findings** in `docs/imagen-copyright.md`.

### 2. Attribution Strategy & UX Principles
1. **Global attribute object** in export stage output:  
   ```json
   "imageAttribution": {
     "provider": "Imagen",
     "licenceUrl": "https://[link]",
     "copyrightText": "© 2025 Imagen–Google. Used under licence.",
     "additionalNotes": "Generated with AI; no real persons depicted."
   }
   ```
2. **Unobtrusive Placement Rules**:
   - **Styled HTML**: small `<figcaption>` or footer note, 0.75rem font, muted colour, ARIA labelled.
   - **Clean HTML**: plain text in `<figcaption>` or `<footer>`; no inline styles.
   - **Markdown**: footnote-style `[1]` at bottom; or inline after image `*© Imagen–Google*`.
   - **PDF/DOCX**: footer line on page or below image, 9 pt grey.
   - **SEO Safe**: add `<meta name="copyright" content="…">` when allowed; OpenGraph `og:image:alt`.
3. **No disruptive reflows**: use flex-end alignment or footers outside primary flow.
4. **Toggle** via export config `styling.imageAttribution: 'auto' | 'hide' | 'show'` (default `auto`, show when required by licence).

### 3. Prompt / Template Updates (Non-Breaking)
1. Add placeholder `{{imageAttribution}}` in `html-styled-template.md` & `html-clean-template.md` (optional, rendered empty when not provided).  
2. Update markdown/PDF/DOCX converters to append attribution when present.

### 4. Implementation Plan (Non-Breaking)
1. **Phase 1**: Research & documentation (Legal).  
2. **Phase 2**: Add attribution fields to export pipeline (parser default → empty).  
3. **Phase 3**: Update templates & converters to insert unobtrusively.  
4. **Phase 4**: Write unit tests verifying attribution appears in all formats when flag set.  
5. **Phase 5**: Update UI copy (tooltips/help) about image licensing.

### 5. Acceptance Criteria
- ✅ Legal source confirmed & documented.  
- ✅ Attribution text + link appears in all export formats when required.  
- ✅ No layout shift or design guideline violations.  
- ✅ Option to hide attribution only when licence explicitly allows.  
- ✅ Unit & e2e tests cover presence/absence scenarios.

---

**Estimated Effort:** 5-7 hours (research) + 6-8 hours (implementation & testing)  
**Impact:** Medium – ensures legal compliance and sets precedent for future image providers. 