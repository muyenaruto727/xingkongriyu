# Vocabulary Pitch Input and Example Count Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Store and display vocabulary pitch accents as unmodified text and show the valid example count in the admin vocabulary list, including compatible JSON/CSV import templates.

**Architecture:** Keep the existing database and API shape. Update the shared vocabulary normalizer so only pitch accent bypasses option mapping, update CSV parsing so pitch is scalar text, and add small pure presentation helpers for legacy pitch values and example counting so behavior is directly testable before wiring it into `VocabManager`.

**Tech Stack:** Next.js 15, React 18, Ant Design, CommonJS helper modules, Node `assert` tests.

---

### Task 1: Define raw pitch and example-count behavior

**Files:**
- Create: `lib/vocabPresentation.js`
- Create: `tests/lib/vocabPresentation.test.js`
- Modify: `lib/vocabularyOptions.js`
- Create: `tests/lib/vocabularyOptions.test.js`

- [ ] **Step 1: Write failing tests** asserting `normalizeVocabularyRecord({ pitchAccent: '0型/平板型' }).pitch_accent` remains exactly `0型/平板型`, `formatPitchAccent` preserves scalar text and joins legacy arrays without label lookup, and `countVocabularyExamples` ignores blank array entries while returning `0` for empty input and `1` for a non-empty scalar.
- [ ] **Step 2: Run tests to verify RED** with `node tests/lib/vocabularyOptions.test.js && node tests/lib/vocabPresentation.test.js`; expect failure because raw pitch behavior/helpers are absent.
- [ ] **Step 3: Implement minimal behavior** by treating pitch as a scalar raw string in `normalizeVocabularyRecord` and exporting pure `formatPitchAccent`/`countVocabularyExamples` helpers.
- [ ] **Step 4: Run tests to verify GREEN** with the same command; expect both scripts to exit `0`.

### Task 2: Make CSV/template import use scalar pitch text

**Files:**
- Modify: `lib/vocabCsvImport.js`
- Create: `tests/lib/vocabCsvImport.test.js`

- [ ] **Step 1: Write failing tests** asserting `pitchAccent` and aliased `pitch_accent` parse as a string (including semicolons as literal text), while tag/category/examples remain arrays, and the generated template contains one scalar pitch example per row.
- [ ] **Step 2: Run test to verify RED** with `node tests/lib/vocabCsvImport.test.js`; expect the current parser to return a pitch array.
- [ ] **Step 3: Implement minimal behavior** by removing pitch fields from `MULTI_VALUE_FIELDS` and changing template rows from multi-pitch examples to scalar pitch strings.
- [ ] **Step 4: Run test to verify GREEN** with `node tests/lib/vocabCsvImport.test.js`; expect exit `0`.

### Task 3: Wire the admin UI to text input and count column

**Files:**
- Modify: `components/admin/VocabManager.js`
- Modify: `lib/vocabFormValidation.js`
- Create: `tests/lib/vocabFormValidation.test.js`

- [ ] **Step 1: Write a failing validation test** asserting blank pitch text produces `请输入声调` and non-empty arbitrary pitch text is accepted.
- [ ] **Step 2: Run test to verify RED** with `node tests/lib/vocabFormValidation.test.js`; expect the old select-oriented message to fail.
- [ ] **Step 3: Implement UI changes** by initializing/resetting pitch to `''`, reading legacy pitch with `formatPitchAccent`, rendering an Ant Design `Input`, submitting raw pitch, rendering raw pitch in the list, and adding an “例句条数” column using `countVocabularyExamples`.
- [ ] **Step 4: Update JSON template and import help** so JSON pitch examples are strings and copy only describes semicolon-separated multi-value fields that remain multi-value.
- [ ] **Step 5: Run focused tests** with `node tests/lib/vocabularyOptions.test.js && node tests/lib/vocabPresentation.test.js && node tests/lib/vocabCsvImport.test.js && node tests/lib/vocabFormValidation.test.js`; expect all scripts to exit `0`.

### Task 4: Full verification

**Files:**
- Verify all modified files.

- [ ] **Step 1: Run all repository test scripts** found by `rg --files -g '*.test.js'` via a shell loop; expect every script to exit `0`.
- [ ] **Step 2: Run production build** with `npm run build`; expect exit `0`.
- [ ] **Step 3: Review diff against specification** and confirm form, list, JSON, CSV, and API normalization requirements are all represented with no unrelated edits.
