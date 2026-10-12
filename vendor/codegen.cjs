var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// ../../tmp/tremolo-codegen-cache/entry.ts
var entry_exports = {};
__export(entry_exports, {
  generateSpecFromSteps: () => generateSpecFromSteps,
  makeScenarioStableId: () => makeScenarioStableId,
  parseSpecToSteps: () => parseSpecToSteps
});
module.exports = __toCommonJS(entry_exports);

// src/shared/constants.ts
var TREMOLO_ROW_LABEL_PREFIX = "\u27E6tmlo-row\u27E7 ";
var TREMOLO_TABLE_ACTION_PREFIX = "\u27E6tmlo-table-action\u27E7 ";
var TREMOLO_SWITCH_LABEL_PREFIX = "\u27E6tmlo-switch\u27E7 ";
var TREMOLO_MODAL_ACTION_PREFIX = "\u27E6tmlo-modal-action\u27E7 ";
var TREMOLO_DRAWER_CONTROL_PREFIX = "\u27E6tmlo-drawer-control\u27E7 ";
var TREMOLO_CODEMIRROR_PREFIX = "\u27E6tmlo-codemirror\u27E7 ";
var TREMOLO_MONACO_PREFIX = "\u27E6tmlo-monaco:";

// src/shared/stepLabels.ts
var STEP_ACTION_LABEL = {
  goto: "\uC774\uB3D9",
  fill: "\uC785\uB825",
  type: "\uD0C0\uC774\uD551 \uC785\uB825",
  press: "\uD0A4 \uB204\uB974\uAE30",
  click: "\uD074\uB9AD",
  select: "\uC635\uC158 \uC120\uD0DD",
  upload: "\uD30C\uC77C \uC5C5\uB85C\uB4DC",
  check: "\uCCB4\uD06C",
  uncheck: "\uCCB4\uD06C \uD574\uC81C",
  scroll: "\uC2A4\uD06C\uB864",
  assert: "\uAC80\uC99D",
  antdSelect: "AntD Select \uC120\uD0DD",
  antdTableSelect: "AntD \uD45C \uD589 \uC120\uD0DD"
};

// src/shared/stepDefaults.ts
var DEFAULT_STEP_TIMEOUT_MS = 15e3;
var DEFAULT_STEP_TIMEOUT_SECONDS = DEFAULT_STEP_TIMEOUT_MS / 1e3;
function normalizeStepTimeoutMs(timeoutMs) {
  if (!Number.isFinite(timeoutMs) || !timeoutMs || timeoutMs <= 0) {
    return DEFAULT_STEP_TIMEOUT_MS;
  }
  return Math.max(1, Math.round(timeoutMs));
}

// src/shared/locatorTarget.ts
function getOrderFields(t) {
  return {
    ...t.order ? { order: t.order } : {},
    ...typeof t.nth === "number" ? { nth: t.nth } : {}
  };
}
function escDquote(s) {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}
function escSquote(s) {
  return s.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}
function escRegexLiteralBody(s) {
  return s.replace(/[\\^$.*+?()[\]{}|/]/g, "\\$&").replace(/\r/g, "\\r").replace(/\n/g, "\\n");
}
function renderLocatorArg(value, exact) {
  if (!exact) return `'${escSquote(value)}'`;
  const normalized = value.trim();
  const body = normalized.split(/\s+/).filter(Boolean).map(escRegexLiteralBody).join("\\s+");
  const hasTerminalPunctuation = /[.!?。．｡！？…:;]$/.test(normalized);
  const optionalTerminalDot = normalized && !hasTerminalPunctuation ? "\\.?" : "";
  return body ? `/^\\s*${body}${optionalTerminalDot}\\s*$/` : `/^\\s*$/`;
}
function normalizeNth(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.floor(value ?? 0));
}
function applyOrder(expr, t) {
  if (t.kind === "chain") return expr;
  if (t.order === "first") return `${expr}.first()`;
  if (t.order === "nth") return `${expr}.nth(${normalizeNth(t.nth)})`;
  return expr;
}
var BROAD_TEXT_CONTAINER_SELECTORS = /* @__PURE__ */ new Set([
  "body",
  "main",
  "table",
  "thead",
  "tbody",
  "tfoot"
]);
function hasDynamicToken(value) {
  return /\{[A-Z][A-Z0-9_]*\}/.test(value);
}
function normalizeContainerSelector(selector) {
  return selector.trim().replace(/^css=/i, "").replace(/^xpath=/i, "").replace(/^\/\//, "").replace(/^\.\/\//, "").replace(/\s+/g, " ").toLowerCase();
}
function isBroadTextContainerTarget(target, locator = "") {
  const effectiveTarget = target?.kind === "chain" ? void 0 : target;
  const raw = effectiveTarget?.kind === "css" || effectiveTarget?.kind === "xpath" ? effectiveTarget.selector : locator;
  if (!raw) return false;
  return BROAD_TEXT_CONTAINER_SELECTORS.has(normalizeContainerSelector(raw));
}
function textAssertionVisibilityTarget(target, locator, expected, match) {
  if (!expected || hasDynamicToken(expected)) return null;
  if (isBroadTextContainerTarget(target, locator ?? "")) {
    return { kind: "text", text: expected, exact: match === "equals" };
  }
  const effectiveTarget = target?.kind === "chain" ? void 0 : target;
  if (effectiveTarget?.kind === "text" && effectiveTarget.text === expected) {
    return { kind: "text", text: expected, exact: match === "equals", ...getOrderFields(effectiveTarget) };
  }
  return null;
}
var STATE_ASSERTION_OWNER_PREDICATE = '@disabled or @aria-disabled or self::button or self::input or self::select or self::textarea or self::option or @role="button" or @role="menuitem" or @role="option" or @role="checkbox" or @role="radio" or @role="switch"';
var STATE_ASSERTION_OWNER_XPATH = `xpath=(ancestor-or-self::*[${STATE_ASSERTION_OWNER_PREDICATE}][1] | self::*[not(ancestor-or-self::*[${STATE_ASSERTION_OWNER_PREDICATE}])])`;
function stateAssertionTargetExpression(locatorExpr) {
  return `${locatorExpr}.locator('${escSquote(STATE_ASSERTION_OWNER_XPATH)}')`;
}
function disabledAssertionTargetExpression(locatorExpr) {
  return stateAssertionTargetExpression(locatorExpr);
}
function enabledAssertionTargetExpression(locatorExpr) {
  return stateAssertionTargetExpression(locatorExpr);
}
function formatTargetAsLocatorString(t) {
  if (t.kind === "chain") {
    return t.chain.map(formatTargetAsLocatorString).join(" >> ");
  }
  switch (t.kind) {
    case "role": {
      if (t.name) return `role=${t.role}[name="${escDquote(t.name)}"]`;
      return `role=${t.role}`;
    }
    case "text":
      return `text="${escDquote(t.text)}"`;
    case "label":
      return `label="${escDquote(t.label)}"`;
    case "placeholder":
      return `placeholder="${escDquote(t.placeholder)}"`;
    case "title":
      return `title="${escDquote(t.title)}"`;
    case "altText":
      return `alt="${escDquote(t.alt)}"`;
    case "testId":
      return `testid="${escDquote(t.testId)}"`;
    case "css":
      return t.selector;
    case "xpath":
      return t.selector.startsWith("//") || t.selector.startsWith("xpath=") ? t.selector : `xpath=${t.selector}`;
  }
}
function renderTargetExpression(t) {
  if (t.kind === "chain") {
    if (t.chain.length === 0) return `page.locator('')`;
    const [first, ...rest] = t.chain;
    return rest.reduce((expr, child) => renderTargetExpressionForBase(child, expr), renderTargetExpressionForBase(first, "page"));
  }
  return renderTargetExpressionForBase(t, "page");
}
function renderTargetExpressionForBase(t, base) {
  switch (t.kind) {
    case "role": {
      if (t.name) {
        return applyOrder(`${base}.getByRole('${escSquote(t.role)}', { name: ${renderLocatorArg(t.name, t.exact)} })`, t);
      }
      return applyOrder(`${base}.getByRole('${escSquote(t.role)}')`, t);
    }
    case "text":
      return applyOrder(`${base}.getByText(${renderLocatorArg(t.text, t.exact)})`, t);
    case "label":
      return applyOrder(`${base}.getByLabel(${renderLocatorArg(t.label, t.exact)})`, t);
    case "placeholder":
      return applyOrder(`${base}.getByPlaceholder(${renderLocatorArg(t.placeholder, t.exact)})`, t);
    case "title":
      return applyOrder(`${base}.getByTitle(${renderLocatorArg(t.title, t.exact)})`, t);
    case "altText":
      return applyOrder(`${base}.getByAltText(${renderLocatorArg(t.alt, t.exact)})`, t);
    case "testId":
      return applyOrder(`${base}.getByTestId('${escSquote(t.testId)}')`, t);
    case "css":
      return applyOrder(`${base}.locator('${escSquote(t.selector)}')`, t);
    case "xpath":
      return applyOrder(`${base}.locator('${escSquote(t.selector)}')`, t);
  }
}
function parseLocatorString(s) {
  if (!s || s === "-") return null;
  const role = s.match(/^role=([a-zA-Z0-9_-]+)(?:\[name=(?:"((?:\\"|[^"])*?)"|'((?:\\'|[^'])*?)')\s*])?$/);
  if (role) {
    const rawName = role[2] ?? role[3];
    const name = rawName != null ? rawName.replace(/\\(['"])/g, "$1") : void 0;
    return { kind: "role", role: role[1], ...name ? { name } : {} };
  }
  const simple = s.match(/^(text|placeholder|label|title|alt|testid)=(?:"((?:\\"|[^"])*?)"|'((?:\\'|[^'])*?)')$/);
  if (simple) {
    const kind = simple[1];
    const raw = (simple[2] ?? simple[3] ?? "").replace(/\\(['"])/g, "$1");
    switch (kind) {
      case "text":
        return { kind: "text", text: raw };
      case "placeholder":
        return { kind: "placeholder", placeholder: raw };
      case "label":
        return { kind: "label", label: raw };
      case "title":
        return { kind: "title", title: raw };
      case "alt":
        return { kind: "altText", alt: raw };
      case "testid":
        return { kind: "testId", testId: raw };
    }
  }
  if (s.startsWith("xpath=")) {
    return { kind: "xpath", selector: s.slice(6) };
  }
  if (s.startsWith("//") || s.startsWith("(//")) {
    return { kind: "xpath", selector: s };
  }
  return { kind: "css", selector: s };
}

// src/shared/scenarioIdentity.ts
function makeScenarioStableId(solution, version, name) {
  return [solution, version ?? "", name].map((part) => encodeURIComponent(part)).join("::");
}

// src/main/services/scenarioService.ts
var activeParseSpecOptions = {};
var HIDDEN_ASSERTION_SETTLE_MS = 500;
function hiddenAssertionReadinessHelperText() {
  return [
    `async function waitForHiddenAssertionReady(page: any, timeout: number) {`,
    `  const startedAt = Date.now();`,
    `  const remaining = () => Math.max(1, timeout - (Date.now() - startedAt));`,
    `  await page.waitForFunction(() => document.readyState === 'complete', null, { timeout: remaining() });`,
    `  await page.waitForFunction(() => !document.querySelector('[aria-busy="true"]'), null, { timeout: remaining() });`,
    `  await page.waitForFunction((quietMs: number) => new Promise<boolean>((resolve) => {`,
    `    const root = document.body || document.documentElement;`,
    `    let timer: number | undefined;`,
    `    let done = false;`,
    `    const finish = () => {`,
    `      if (done) return;`,
    `      done = true;`,
    `      if (timer != null) window.clearTimeout(timer);`,
    `      observer.disconnect();`,
    `      resolve(true);`,
    `    };`,
    `    const observer = new MutationObserver(() => {`,
    `      if (timer != null) window.clearTimeout(timer);`,
    `      timer = window.setTimeout(finish, quietMs);`,
    `    });`,
    `    observer.observe(root, { childList: true, subtree: true, attributes: true });`,
    `    timer = window.setTimeout(finish, quietMs);`,
    `  }), ${HIDDEN_ASSERTION_SETTLE_MS}, { timeout: remaining() });`,
    `}`
  ].join("\n");
}
function hiddenAssertionReadinessCall(timeoutMs) {
  return `await waitForHiddenAssertionReady(page, ${timeoutMs});`;
}
function isStableRootExpr(rootExpr) {
  if (/\bgetBy(Label|Role|TestId|Placeholder|Title|AltText)\s*\(/.test(rootExpr)) {
    if (/\bgetByRole\s*\(/.test(rootExpr) && !/name\s*:/.test(rootExpr)) return false;
    return true;
  }
  const locatorArg = rootExpr.match(/\blocator\s*\(\s*['"]([^'"]+)['"]\s*\)/);
  if (locatorArg) {
    const sel = locatorArg[1];
    if (/#rc_select_\d+/.test(sel)) return false;
    if (/^\.ant-select(\s*$|\s*>>)/.test(sel)) return false;
    if (/\[role=combobox\]/.test(sel)) return false;
    if (/\[data-[\w-]+=/.test(sel)) return true;
    if (/^#[\w-]+$/.test(sel)) return true;
    return false;
  }
  return false;
}
function normalizeReselectText(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}
function compactReselectText(value) {
  return normalizeReselectText(value).replace(/[\s_-]+/g, "").toLowerCase();
}
function sameReselectText(a, b) {
  const normalizedA = normalizeReselectText(a).toLowerCase();
  const normalizedB = normalizeReselectText(b).toLowerCase();
  if (!normalizedA || !normalizedB) return false;
  return normalizedA === normalizedB || compactReselectText(a) === compactReselectText(b);
}
function compatibleAntdOptionText(a, b) {
  if (sameReselectText(a, b)) return true;
  const normalizedA = normalizeReselectText(a).toLowerCase();
  const normalizedB = normalizeReselectText(b).toLowerCase();
  if (!normalizedA || !normalizedB) return false;
  const compactA = compactReselectText(a);
  const compactB = compactReselectText(b);
  const minLength = Math.min(normalizedA.length, normalizedB.length);
  return minLength >= 6 && (normalizedA.startsWith(normalizedB) || normalizedB.startsWith(normalizedA) || compactA.startsWith(compactB) || compactB.startsWith(compactA));
}
function targetDisplayText(step) {
  if (!step) return "";
  const target = step.target;
  if (target?.kind === "text") return target.text;
  if (target?.kind === "role") return target.name ?? "";
  if (target?.kind === "label") return target.label;
  if (target?.kind === "placeholder") return target.placeholder;
  if (target?.kind === "title") return target.title;
  if (target?.kind === "altText") return target.alt;
  const textSelector = step.locator.match(/^text=(?:"((?:\\"|[^"])*?)"|'((?:\\'|[^'])*?)')$/);
  return (textSelector?.[1] ?? textSelector?.[2] ?? "").replace(/\\(["'])/g, "$1");
}
function isTextValueClickStep(step) {
  if (!step || step.type !== "click") return false;
  return Boolean(targetDisplayText(step));
}
function isTextOrLabelClickStep(step) {
  if (!step || step.type !== "click") return false;
  return step.target?.kind === "text" || step.target?.kind === "label";
}
function isOrderedTextOrLabelOptionStep(step) {
  if (!isTextOrLabelClickStep(step)) return false;
  const target = step.target;
  return (target?.kind === "text" || target?.kind === "label") && target.order === "nth";
}
function optionDisplayText(step) {
  if (!step) return "";
  return isAntdDropdownOptionStep(step) ? antdOptionDisplayText(step) : targetDisplayText(step);
}
function renumberSteps(steps) {
  return steps.map((step, idx) => ({ ...step, id: `s${idx + 1}` }));
}
function makeAntdSelectStepFromClick(source, root, prefix, optionText) {
  const safeAntd = { by: "auto" };
  if (root.antd?.expectedLabel) safeAntd.expectedLabel = root.antd.expectedLabel;
  if (root.antd?.allowVirtualScrollFallback === false) safeAntd.allowVirtualScrollFallback = false;
  return {
    ...source,
    type: "antdSelect",
    title: `${prefix || "AntD Select"}: ${optionText} \uC120\uD0DD`,
    locator: root.locator,
    target: root.target,
    value: optionText,
    antd: safeAntd,
    assertion: {
      ...source.assertion ?? { enabled: false },
      enabled: false,
      inputValue: "",
      expected: "",
      componentType: "",
      state: ""
    }
  };
}
function dropDuplicateAntdOptionClicks(steps) {
  const out = [];
  let changed = false;
  for (const step of steps) {
    const previous = out[out.length - 1];
    const optionText = optionDisplayText(step);
    if (previous?.type === "antdSelect" && (isAntdDropdownOptionStep(step) || isOrderedTextOrLabelOptionStep(step)) && compatibleAntdOptionText(previous.value, optionText)) {
      changed = true;
      continue;
    }
    out.push(step);
  }
  return changed ? renumberSteps(out) : steps;
}
function isLikelySameSelectStandaloneOption(step, previous) {
  if (previous.type !== "antdSelect" || !isTextOrLabelClickStep(step)) return false;
  const optionText = targetDisplayText(step);
  if (!optionText || compatibleAntdOptionText(previous.value, optionText)) return false;
  const currentLooksLikeLongOption = /\s+-\s+/.test(optionText);
  const previousLooksLikeLongOption = /\s+-\s+/.test(previous.value ?? "");
  return currentLooksLikeLongOption && previousLooksLikeLongOption;
}
function collapseStandaloneAntdOptionClicks(steps) {
  const out = [];
  let changed = false;
  for (const step of steps) {
    const previous = out[out.length - 1];
    if (previous?.type === "antdSelect" && isLikelySameSelectStandaloneOption(step, previous)) {
      const optionText = targetDisplayText(step);
      out.push(makeAntdSelectStepFromClick(
        step,
        previous,
        antdReselectTitlePrefix(previous, optionText),
        optionText
      ));
      changed = true;
      continue;
    }
    out.push(step);
  }
  return changed ? renumberSteps(out) : steps;
}
function antdReselectTitlePrefix(previous, fallback) {
  const title = previous.title || "";
  const value = normalizeReselectText(previous.value);
  if (value) {
    const exactSuffix = `: ${value} \uC120\uD0DD`;
    if (title.endsWith(exactSuffix)) return title.slice(0, -exactSuffix.length) || fallback;
    const looseSuffix = `${value} \uC120\uD0DD`;
    if (title.endsWith(looseSuffix)) {
      return title.slice(0, -looseSuffix.length).replace(/[:\s]+$/, "") || fallback;
    }
  }
  return fallback || "AntD Select";
}
function collapseAntdReselectSteps(steps) {
  const out = [];
  let changed = false;
  for (let i = 0; i < steps.length; i += 1) {
    const previous = out[out.length - 1];
    const hostClick = steps[i];
    const optionClick = steps[i + 1];
    const hostText = targetDisplayText(hostClick);
    const optionText = targetDisplayText(optionClick);
    if (previous?.type === "antdSelect" && isTextValueClickStep(hostClick) && isTextValueClickStep(optionClick) && Boolean(normalizeReselectText(hostText)) && Boolean(normalizeReselectText(optionText)) && sameReselectText(previous.value, hostText) && !sameReselectText(hostText, optionText)) {
      const safeAntd = { by: "auto" };
      if (previous.antd?.expectedLabel) safeAntd.expectedLabel = previous.antd.expectedLabel;
      if (previous.antd?.allowVirtualScrollFallback === false) safeAntd.allowVirtualScrollFallback = false;
      const reusePreviousRoot = shouldReusePreviousReselectRoot(previous, hostText);
      const prefix = reusePreviousRoot ? antdReselectTitlePrefix(previous, hostText) : hostText;
      out.push({
        ...hostClick,
        type: "antdSelect",
        title: `${prefix}: ${optionText} \uC120\uD0DD`,
        locator: reusePreviousRoot ? previous.locator : hostClick.locator,
        target: reusePreviousRoot ? previous.target : hostClick.target,
        value: optionText,
        antd: safeAntd,
        assertion: {
          ...hostClick.assertion ?? { enabled: false },
          enabled: false,
          inputValue: "",
          expected: "",
          componentType: "",
          state: ""
        }
      });
      i += 1;
      changed = true;
      continue;
    }
    out.push(hostClick);
  }
  return changed ? renumberSteps(out) : steps;
}
function collapseAntdSelectHostOptionSteps(steps) {
  const out = [];
  let changed = false;
  for (let i = 0; i < steps.length; i += 1) {
    const previous = out[out.length - 1];
    const hostClick = steps[i];
    const optionClick = steps[i + 1];
    const hostText = targetDisplayText(hostClick);
    const optionLooksLikeAntd = isAntdDropdownOptionStep(optionClick) || isOrderedTextOrLabelOptionStep(optionClick);
    const optionText = optionLooksLikeAntd ? optionDisplayText(optionClick) : "";
    const usePreviousRoot = previous?.type === "antdSelect" && compatibleAntdOptionText(hostText, optionText);
    const hostLooksLikeAntdSelect = isLikelyAntdSelectHostStep(hostClick) || usePreviousRoot;
    if (isTextValueClickStep(hostClick) && optionLooksLikeAntd && hostLooksLikeAntdSelect && Boolean(normalizeReselectText(hostText)) && Boolean(normalizeReselectText(optionText)) && (!compatibleAntdOptionText(hostText, optionText) || usePreviousRoot)) {
      const root = usePreviousRoot ? previous : hostClick;
      const selectedOptionText = usePreviousRoot && compatibleAntdOptionText(hostText, optionText) ? hostText : optionText;
      const prefix = usePreviousRoot ? antdReselectTitlePrefix(previous, hostText) : hostText;
      out.push(makeAntdSelectStepFromClick(hostClick, root, prefix, selectedOptionText));
      i += 1;
      changed = true;
      continue;
    }
    out.push(hostClick);
  }
  return changed ? renumberSteps(out) : steps;
}
function shouldReusePreviousReselectRoot(previous, currentSelectedText) {
  if (!previous.locator || previous.locator === "-") return false;
  if (previous.target?.kind === "text" || /^text=/.test(previous.locator)) {
    const previousText = targetDisplayText(previous);
    return Boolean(previousText && sameReselectText(previousText, currentSelectedText));
  }
  return true;
}
function isAntdDropdownOptionStep(step) {
  if (!step || step.type !== "click") return false;
  if (step.assertion?.componentType === "option") return true;
  return /ant-select-dropdown|ant-select-item-option/.test(step.locator);
}
function antdOptionDisplayText(step) {
  if (!step) return "";
  const displayed = targetDisplayText(step);
  if (displayed) return displayed;
  const fromLocator = extractAntdOptionLabelFromLocator(step.locator);
  if (fromLocator) return fromLocator;
  if (step.assertion?.componentType === "option") {
    const title = normalizeReselectText(step.title);
    const clicked = title.match(/^(.+?)\s+클릭$/);
    if (clicked) return clicked[1].trim();
  }
  return "";
}
function extractAntdOptionLabelFromLocator(locator) {
  if (!/ant-select-dropdown|ant-select-item-option/.test(locator)) return null;
  const compactSingle = locator.match(/translate\(normalize-space\(\.\), ' ', ''\)='((?:\\'|[^'])+)'/);
  if (compactSingle) return unescapeStringLiteral(compactSingle[1]);
  const compactDouble = locator.match(/translate\(normalize-space\(\.\), ' ', ''\)="((?:\\"|[^"])+)"/);
  if (compactDouble) return unescapeStringLiteral(compactDouble[1]);
  return null;
}
function normalizeAntdSelectStepSequence(steps) {
  return dropDuplicateAntdOptionClicks(
    collapseStandaloneAntdOptionClicks(
      collapseAntdReselectSteps(
        collapseAntdSelectSearchSteps(
          collapseAntdSelectHostOptionSteps(
            dropDuplicateAntdOptionClicks(steps)
          )
        )
      )
    )
  );
}
function antdSelectRootKey(step) {
  if (!step) return "";
  if (step.target?.kind === "css") return `css:${step.target.selector}`;
  if (step.target?.kind === "role" && step.target.role === "combobox") {
    return `role:combobox:${step.target.name ?? ""}`;
  }
  return step.locator || "";
}
function isAntdSelectRootStep(step) {
  if (!step) return false;
  const key = antdSelectRootKey(step);
  return /#rc_select_\d+\b/.test(key) || /(?:^|[.#\s])ant-select\b|ant-select-selector|ant-select-selection/i.test(key);
}
function isLikelyAntdSelectHostStep(step) {
  if (!step || step.type !== "click") return false;
  if (isAntdSelectRootStep(step)) return true;
  if (step.target?.kind === "css" && /(?:^|[.#\s])ant-select\b/.test(step.target.selector)) return true;
  return /(?:^|[.#\s])ant-select\b|ant-select-selector|ant-select-selection/i.test(step.locator ?? "");
}
function collapseAntdSelectSearchSteps(steps) {
  const out = [];
  let changed = false;
  for (let i = 0; i < steps.length; i += 1) {
    const hostClick = steps[i];
    const searchInput = steps[i + 1];
    const selectStep = steps[i + 2];
    if (hostClick?.type === "click" && isAntdSelectRootStep(hostClick) && (searchInput?.type === "fill" || searchInput?.type === "type") && isAntdSelectRootStep(searchInput) && selectStep?.type === "antdSelect" && antdSelectRootKey(hostClick) === antdSelectRootKey(searchInput) && antdSelectRootKey(searchInput) === antdSelectRootKey(selectStep) && searchInput.value && searchInput.value !== "-") {
      out.push({
        ...selectStep,
        antd: {
          ...selectStep.antd ?? { by: "auto" },
          search: true,
          searchText: searchInput.value
        }
      });
      i += 2;
      changed = true;
      continue;
    }
    out.push(hostClick);
  }
  return changed ? renumberSteps(out) : steps;
}
function inputTargetKey(target) {
  if (!target) return "";
  if (target.kind === "chain") return "";
  let raw = "";
  if (target.kind === "placeholder") raw = target.placeholder;
  else if (target.kind === "role" && /^(textbox|searchbox|spinbutton|combobox)$/i.test(target.role) && target.name) {
    raw = target.name;
  } else {
    return "";
  }
  return raw.trim().replace(/[.!?。．｡！？…:;]+$/, "").replace(/\s+/g, "");
}
function hasLocatorOrder(target) {
  if (!target || target.kind === "chain") return false;
  return target?.order === "first" || target?.order === "nth";
}
function copyLocatorOrder(target, source) {
  if (source.order === "nth") {
    return { ...target, order: "nth", nth: source.nth ?? 0 };
  }
  if (source.order === "first") {
    const { nth: _dropNth, ...rest } = target;
    return { ...rest, order: "first" };
  }
  return target;
}
function isInputInteractionStep(step) {
  return step.type === "click" || step.type === "fill" || step.type === "type" || step.type === "press";
}
function normalizeAdjacentInputTargetOrders(steps) {
  let previousKey = "";
  let previousTarget;
  return steps.map((step) => {
    if (!isInputInteractionStep(step)) {
      previousKey = "";
      previousTarget = void 0;
      return step;
    }
    const key = inputTargetKey(step.target);
    if (!key) {
      previousKey = "";
      previousTarget = void 0;
      return step;
    }
    let next = step;
    if (step.target && step.target.kind !== "chain" && !hasLocatorOrder(step.target) && previousTarget && previousKey === key && hasLocatorOrder(previousTarget)) {
      next = { ...step, target: copyLocatorOrder(step.target, previousTarget) };
    }
    previousKey = key;
    previousTarget = next.target?.kind === "chain" ? void 0 : next.target;
    return next;
  });
}
function unescapeStringLiteral(s) {
  return s.replace(/\\(['"\\nrt])/g, (_m, c) => {
    switch (c) {
      case "n":
        return "\n";
      case "r":
        return "\r";
      case "t":
        return "	";
      default:
        return c;
    }
  });
}
function captureFirstStringArg(call, fnPattern) {
  const dynSingle = call.match(
    new RegExp(fnPattern + `\\(\\s*(?:resolveRuntimeValue|expandDynamicValue)\\(\\s*'((?:\\\\'|[^'])*?)'\\s*\\)`)
  );
  if (dynSingle) return unescapeStringLiteral(dynSingle[1]);
  const dynDouble = call.match(
    new RegExp(fnPattern + `\\(\\s*(?:resolveRuntimeValue|expandDynamicValue)\\(\\s*"((?:\\\\"|[^"])*?)"\\s*\\)`)
  );
  if (dynDouble) return unescapeStringLiteral(dynDouble[1]);
  const single = call.match(new RegExp(fnPattern + `\\(\\s*'((?:\\\\'|[^'])*?)'`));
  if (single) return unescapeStringLiteral(single[1]);
  const dbl = call.match(new RegExp(fnPattern + `\\(\\s*"((?:\\\\"|[^"])*?)"`));
  if (dbl) return unescapeStringLiteral(dbl[1]);
  return null;
}
function captureExactOption(segment, defaultValue = true) {
  const m = segment.match(/\bexact\s*:\s*(true|false)\b/);
  return m ? m[1] === "true" : defaultValue;
}
function defaultExactForRole(role) {
  return role.toLowerCase() === "row" ? false : true;
}
function captureRegexLiteralAt(source, slashIndex) {
  if (source[slashIndex] !== "/") return null;
  let body = "";
  let escaped = false;
  for (let i = slashIndex + 1; i < source.length; i++) {
    const ch = source[i];
    if (escaped) {
      body += "\\" + ch;
      escaped = false;
      continue;
    }
    if (ch === "\\") {
      escaped = true;
      continue;
    }
    if (ch === "/") return { body, end: i };
    body += ch;
  }
  return null;
}
function decodeGeneratedLocatorRegexBody(body) {
  let out = body.trim();
  out = out.replace(/^\^/, "").replace(/\$$/, "");
  out = out.replace(/^\\s\*/, "").replace(/\\s\*$/, "");
  out = out.replace(/\\\.\?$/, "");
  out = out.replace(/\\s\+/g, " ");
  out = out.replace(/\\r/g, "\r").replace(/\\n/g, "\n").replace(/\\t/g, "	").replace(/\\([\\^$.*+?()[\]{}|/])/g, "$1");
  return out;
}
function captureRegexProperty(segment, propName) {
  const prop = segment.match(new RegExp(`\\b${propName}\\s*:`));
  if (!prop || prop.index == null) return null;
  const valueStart = prop.index + prop[0].length;
  const commaIndex = segment.indexOf(",", valueStart);
  const braceIndex = segment.indexOf("}", valueStart);
  const valueEndCandidates = [commaIndex, braceIndex].filter((n) => n >= 0);
  const valueEnd = valueEndCandidates.length ? Math.min(...valueEndCandidates) : segment.length;
  const valueSegment = segment.slice(valueStart, valueEnd);
  const slashOffset = valueSegment.search(/\/(?![/*])/);
  if (slashOffset < 0) return null;
  const slashIndex = valueStart + slashOffset;
  if (slashIndex < 0) return null;
  const literal = captureRegexLiteralAt(segment, slashIndex);
  return literal ? decodeGeneratedLocatorRegexBody(literal.body) : null;
}
function extractObjectPropertyExpression(objectExpr, propName) {
  const trimmed = objectExpr.trim();
  const inner = trimmed.startsWith("{") && trimmed.endsWith("}") ? trimmed.slice(1, -1) : trimmed;
  for (const pair of splitTopLevelArgs(inner)) {
    const m = pair.match(/^([\w$]+)\s*:\s*([\s\S]+)$/);
    if (!m || m[1] !== propName) continue;
    return m[2].trim();
  }
  return null;
}
function parseLocatorValueExpression(expr) {
  const trimmed = expr.trim();
  if (trimmed.startsWith("/")) {
    const literal = captureRegexLiteralAt(trimmed, 0);
    return literal ? decodeGeneratedLocatorRegexBody(literal.body) : null;
  }
  return parseValueExpression(trimmed);
}
function captureFirstLocatorArg(call, fnPattern) {
  const str = captureFirstStringArg(call, fnPattern);
  if (str != null) return { value: str, exact: exactForCall(call, fnPattern) };
  const head = call.match(new RegExp(`${fnPattern}\\(\\s*/`));
  if (!head || head.index == null) return null;
  const slashIndex = head.index + head[0].lastIndexOf("/");
  const literal = captureRegexLiteralAt(call, slashIndex);
  if (!literal) return null;
  const value = decodeGeneratedLocatorRegexBody(literal.body);
  return { value, exact: true };
}
function captureLocatorFilterHasText(line) {
  if (!/\.filter\s*\(/.test(line) || !/\bhasText\s*:/.test(line)) return null;
  const filterEnd = findCallEndIndex(line, "filter");
  const filterStart = line.indexOf("filter(");
  const filterBody = filterEnd >= 0 && filterStart >= 0 ? line.slice(filterStart + "filter(".length, filterEnd) : line;
  const single = filterBody.match(/\bhasText\s*:\s*'((?:\\'|[^'])*?)'/);
  if (single) return { value: unescapeStringLiteral(single[1]), exact: false };
  const dbl = filterBody.match(/\bhasText\s*:\s*"((?:\\"|[^"])*?)"/);
  if (dbl) return { value: unescapeStringLiteral(dbl[1]), exact: false };
  const regex = captureRegexProperty(filterBody, "hasText");
  if (regex != null) return { value: regex, exact: true };
  return null;
}
function splitFileUploadValue(value) {
  return String(value ?? "").split(/\r?\n/).map((part) => part.trim()).filter(Boolean);
}
function isCloudUploadAnchor(anchor) {
  const label = (anchor.label ?? "").trim();
  const locator = (anchor.locator ?? "").trim();
  if (/^cloud_upload$/i.test(label)) return true;
  if (/cloud_upload/i.test(locator)) return true;
  if (anchor.target?.kind === "role" && anchor.target.role === "button" && /^cloud_upload$/i.test(anchor.target.name ?? "")) {
    return true;
  }
  if (anchor.target?.kind === "css" && /cloud_upload/i.test(anchor.target.selector)) return true;
  return false;
}
function isUploadBrowseAnchor(anchor) {
  const label = (anchor.label ?? "").trim();
  const locator = (anchor.locator ?? "").trim();
  if (label === "\uCC3E\uC544\uBCF4\uAE30") return true;
  if (/upload-link/.test(locator)) return true;
  if (anchor.target?.kind === "text" && anchor.target.text === "\uCC3E\uC544\uBCF4\uAE30") return true;
  if (anchor.target?.kind === "css" && /upload-link/.test(anchor.target.selector)) return true;
  if (anchor.target?.kind === "xpath" && /upload-link/.test(anchor.target.selector)) return true;
  return false;
}
function isDirectFileInputAnchor(anchor) {
  const locator = (anchor.locator ?? "").trim();
  if (/input/i.test(locator) && /type\s*=\s*["']?file/i.test(locator)) return true;
  if (anchor.target?.kind === "css" && /input/i.test(anchor.target.selector) && /type\s*=\s*["']?file/i.test(anchor.target.selector)) {
    return true;
  }
  if (anchor.target?.kind === "xpath" && /input/i.test(anchor.target.selector) && /type\s*=\s*["']?file/i.test(anchor.target.selector)) {
    return true;
  }
  return false;
}
function normalizeUploadAnchor(anchor) {
  if (isCloudUploadAnchor(anchor) || isUploadBrowseAnchor(anchor)) {
    const locator = uploadBrowseLinkLocator();
    return {
      mode: "chooser",
      anchor: {
        label: "\uCC3E\uC544\uBCF4\uAE30",
        kind: "upload-link",
        componentType: "file-upload",
        locator,
        target: { kind: "xpath", selector: locator }
      }
    };
  }
  if (isDirectFileInputAnchor(anchor)) {
    return { anchor, mode: "input" };
  }
  return { anchor, mode: "chooser" };
}
function parseStringLiteralExpression(expr) {
  const trimmed = expr.trim();
  const quote = trimmed[0];
  if (quote !== "'" && quote !== '"' || trimmed[trimmed.length - 1] !== quote) return null;
  return unescapeStringLiteral(trimmed.slice(1, -1));
}
function parseValueExpression(expr) {
  const literal = parseStringLiteralExpression(expr);
  if (literal != null) return literal;
  const trimmed = expr.trim();
  if (trimmed.startsWith("expandDynamicValue(") || trimmed.startsWith("resolveRuntimeValue(")) {
    const args = extractFunctionArgs(trimmed, trimmed.startsWith("resolveRuntimeValue(") ? "resolveRuntimeValue" : "expandDynamicValue");
    const first = args?.[0]?.trim();
    return first ? parseStringLiteralExpression(first) : null;
  }
  return null;
}
function parseRuntimeInitializer(line, varName = "__tmloValue") {
  const m = line.match(new RegExp(`\\bconst\\s+${varName}\\s*=\\s*((?:resolveRuntimeValue|expandDynamicValue)\\([\\s\\S]*?\\))\\s*;`));
  if (!m) return null;
  return parseValueExpression(m[1]);
}
function parseRuntimeExport(line) {
  const args = extractFunctionArgs(line, "exportRuntimeValue");
  if (!args || args.length < 2) return null;
  const saveAs = parseStringLiteralExpression(args[0]);
  if (!saveAs) return null;
  const scopeMatch = args[2]?.match(/\bscope\s*:\s*['"](scenario|runSet)['"]/);
  return {
    saveAs,
    scope: scopeMatch?.[1] ?? "runSet"
  };
}
function attachRuntimeExport(step, line) {
  const runtime = parseRuntimeExport(line);
  if (!runtime) return;
  step.runtime = {
    saveAs: runtime.saveAs,
    scope: runtime.scope
  };
}
function extractFunctionArgs(line, functionName) {
  const token = `${functionName}(`;
  const start = line.indexOf(token);
  if (start < 0) return null;
  const end = findCallEndIndex(line, functionName);
  if (end < 0) return null;
  return splitTopLevelArgs(line.slice(start + token.length, end));
}
function extractMethodArgs(line, methodName) {
  const token = `.${methodName}(`;
  const start = line.indexOf(token);
  if (start < 0) return null;
  let depth = 1;
  let inSingle = false;
  let inDouble = false;
  let escaped = false;
  const bodyStart = start + token.length;
  for (let i = bodyStart; i < line.length; i++) {
    const ch = line[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === "\\") {
      escaped = true;
      continue;
    }
    if (inSingle) {
      if (ch === "'") inSingle = false;
      continue;
    }
    if (inDouble) {
      if (ch === '"') inDouble = false;
      continue;
    }
    if (ch === "'") {
      inSingle = true;
      continue;
    }
    if (ch === '"') {
      inDouble = true;
      continue;
    }
    if (ch === "(" || ch === "{" || ch === "[") {
      depth++;
      continue;
    }
    if (ch === ")" || ch === "}" || ch === "]") {
      depth--;
      if (depth === 0) return splitTopLevelArgs(line.slice(bodyStart, i));
    }
  }
  return null;
}
function captureFileUploadValue(line, methodName) {
  const args = extractMethodArgs(line, methodName);
  const firstArg = args?.[0]?.trim();
  if (!firstArg) return captureFirstStringArg(line, `\\.${methodName}`) ?? "";
  if (firstArg.startsWith("[") && firstArg.endsWith("]")) {
    const inner = firstArg.slice(1, -1);
    return splitTopLevelArgs(inner).map(parseStringLiteralExpression).filter((value) => Boolean(value)).join("\n");
  }
  return parseStringLiteralExpression(firstArg) ?? captureFirstStringArg(line, `\\.${methodName}`) ?? "";
}
function extractTimeoutOption(line) {
  const m = line.match(/\btimeout\s*:\s*(\d+)/);
  if (!m) return void 0;
  const value = Number(m[1]);
  return Number.isFinite(value) && value > 0 ? value : void 0;
}
function locatorFilterHasTextXpath(selector, text, exact) {
  const css = selector.trim();
  const tag = css.match(/^([a-zA-Z][\w-]*)(?:$|(?=\.))/)?.[1] ?? "*";
  const classes = Array.from(css.matchAll(/\.([\w-]+)/g)).map((m) => m[1]);
  const predicates = classes.map(
    (name) => `contains(concat(" ", normalize-space(@class), " "), " ${name} ")`
  );
  predicates.push(exact ? xpathCompactEquals(".", text) : xpathCompactContains(".", text));
  return `xpath=//${tag}[${predicates.join(" and ")}]`;
}
function antSelectVisibleOptionLocator(label) {
  const dropdownPredicate = [
    'contains(concat(" ", normalize-space(@class), " "), " ant-select-dropdown ")',
    'not(contains(concat(" ", normalize-space(@class), " "), " ant-select-dropdown-hidden "))'
  ].join(" and ");
  const optionPredicate = [
    '@role="option"',
    'contains(concat(" ", normalize-space(@class), " "), " ant-select-item-option ")'
  ].join(" or ");
  const textPredicate = `${xpathCompactEquals(".", label)} or .//*[${xpathCompactEquals(".", label)}]`;
  return `xpath=(//*[${dropdownPredicate}]//*[(${optionPredicate}) and (${textPredicate})])[last()]`;
}
function antTreeRowPredicate(label) {
  return [
    'contains(concat(" ", normalize-space(@class), " "), " ant-tree-treenode ")',
    `.//*[contains(concat(" ", normalize-space(@class), " "), " ant-tree-title ")][${xpathCompactContains(".", label)}]`
  ].join(" and ");
}
function antTreeSwitcherLocator(label) {
  const row = antTreeRowPredicate(label);
  const switcher = [
    'contains(concat(" ", normalize-space(@class), " "), " ant-tree-switcher ")',
    'not(contains(concat(" ", normalize-space(@class), " "), " ant-tree-switcher-noop "))'
  ].join(" and ");
  return `xpath=((//*[${row}])[last()]//*[${switcher}])[1]`;
}
function antTreeCheckboxLocator(label) {
  const row = antTreeRowPredicate(label);
  const checkbox = [
    'self::input[@type="checkbox"]',
    'contains(concat(" ", normalize-space(@class), " "), " ant-checkbox-wrapper ")',
    'contains(concat(" ", normalize-space(@class), " "), " ant-checkbox ")'
  ].join(" or ");
  return `xpath=((//*[${row}])[last()]//*[${checkbox}])[1]`;
}
function stripTmloStepMarker(value) {
  return value.replace(/^\[TMLO(?::\d+)?\]\s*/i, "").trim();
}
function normalizeRecordedRoleName(role, name) {
  if (role.toLowerCase() !== "link") return name;
  return stripTmloStepMarker(name) || name;
}
function captureRoleNamed(line) {
  const role = captureFirstStringArg(line, "getByRole");
  if (!role) return null;
  const defaultExact = defaultExactForRole(role);
  const args = extractFunctionArgs(line, "getByRole");
  const opts = args?.[1] ?? "";
  const nameExpr = opts ? extractObjectPropertyExpression(opts, "name") : null;
  const parsedName = nameExpr ? parseLocatorValueExpression(nameExpr) : null;
  if (parsedName != null) {
    return {
      role,
      name: normalizeRecordedRoleName(role, parsedName),
      exact: captureExactOption(opts, defaultExact)
    };
  }
  const legacyOpts = line.match(/getByRole\([^)]*?,\s*\{([^}]*)\}/);
  const haystacks = legacyOpts ? [legacyOpts[1]] : [];
  for (const h of haystacks) {
    const single = h.match(/\bname\s*:\s*'((?:\\'|[^'])*?)'/);
    const dbl = h.match(/\bname\s*:\s*"((?:\\"|[^"])*?)"/);
    const name = single ? unescapeStringLiteral(single[1]) : dbl ? unescapeStringLiteral(dbl[1]) : captureRegexProperty(h, "name");
    if (name != null) {
      return {
        role,
        name: normalizeRecordedRoleName(role, name),
        exact: captureExactOption(h, defaultExact)
      };
    }
  }
  return null;
}
var LOCATOR_CHAIN_METHODS = /* @__PURE__ */ new Set([
  "getByRole",
  "getByText",
  "getByLabel",
  "getByPlaceholder",
  "getByTitle",
  "getByAltText",
  "getByTestId",
  "locator"
]);
function findBalancedCloseParen(source, openIndex) {
  let depth = 1;
  let inSingle = false;
  let inDouble = false;
  let inRegex = false;
  let escaped = false;
  for (let i = openIndex + 1; i < source.length; i++) {
    const ch = source[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === "\\") {
      escaped = true;
      continue;
    }
    if (inSingle) {
      if (ch === "'") inSingle = false;
      continue;
    }
    if (inDouble) {
      if (ch === '"') inDouble = false;
      continue;
    }
    if (inRegex) {
      if (ch === "/") inRegex = false;
      continue;
    }
    if (ch === "'") {
      inSingle = true;
      continue;
    }
    if (ch === '"') {
      inDouble = true;
      continue;
    }
    if (ch === "/" && /[(,:]\s*$/.test(source.slice(Math.max(0, i - 4), i))) {
      inRegex = true;
      continue;
    }
    if (ch === "(") {
      depth++;
      continue;
    }
    if (ch === ")") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}
function parseLocatorTargetFromCall(method, argsBody) {
  const args = splitTopLevelArgs(argsBody);
  if (method === "getByRole") {
    const role = parseStringLiteralExpression(args[0] ?? "");
    if (!role) return null;
    const opts = args[1] ?? "";
    const nameExpr = extractObjectPropertyExpression(opts, "name");
    const parsedName = nameExpr ? parseLocatorValueExpression(nameExpr) : null;
    const name = parsedName != null ? normalizeRecordedRoleName(role, parsedName) : null;
    return {
      kind: "role",
      role,
      ...name ? { name, exact: captureExactOption(opts, defaultExactForRole(role)) } : {}
    };
  }
  if (method === "getByTestId") {
    const testId = parseStringLiteralExpression(args[0] ?? "");
    return testId != null ? { kind: "testId", testId } : null;
  }
  if (method === "locator") {
    const selector = parseStringLiteralExpression(args[0] ?? "");
    return selector != null ? parseLocatorString(selector) : null;
  }
  const firstArg = (args[0] ?? "").trim();
  const regexArg = firstArg.startsWith("/") ? captureRegexLiteralAt(firstArg, 0) : null;
  const value = regexArg ? decodeGeneratedLocatorRegexBody(regexArg.body) : parseValueExpression(firstArg);
  if (value == null) return null;
  const exact = captureExactOption(args[1] ?? "", true);
  switch (method) {
    case "getByText":
      return { kind: "text", text: value, exact };
    case "getByLabel":
      return { kind: "label", label: value, exact };
    case "getByPlaceholder":
      return { kind: "placeholder", placeholder: value, exact };
    case "getByTitle":
      return { kind: "title", title: value, exact };
    case "getByAltText":
      return { kind: "altText", alt: value, exact };
    default:
      return null;
  }
}
function consumeLocatorOrder(source, pos) {
  let cursor = pos;
  while (/\s/.test(source[cursor] ?? "")) cursor++;
  const first = source.slice(cursor).match(/^\.first\(\s*\)/);
  if (first) return { order: { order: "first" }, pos: cursor + first[0].length };
  const nth = source.slice(cursor).match(/^\.nth\(\s*(\d+)\s*\)/);
  if (nth) return { order: { order: "nth", nth: Number(nth[1]) }, pos: cursor + nth[0].length };
  return { order: {}, pos };
}
function parseLocatorChainTarget(source, options = {}) {
  const pageIdx = source.indexOf("page.");
  if (pageIdx < 0) return null;
  let cursor = pageIdx + "page".length;
  const chain = [];
  while (cursor < source.length) {
    while (/\s/.test(source[cursor] ?? "")) cursor++;
    if (source[cursor] !== ".") break;
    const methodMatch = source.slice(cursor + 1).match(/^([A-Za-z_]\w*)\s*\(/);
    if (!methodMatch) break;
    const method = methodMatch[1];
    if (!LOCATOR_CHAIN_METHODS.has(method)) break;
    const open = cursor + 1 + methodMatch[0].lastIndexOf("(");
    const close = findBalancedCloseParen(source, open);
    if (close < 0) return null;
    const target = parseLocatorTargetFromCall(method, source.slice(open + 1, close));
    if (!target) return null;
    const ordered = consumeLocatorOrder(source, close + 1);
    chain.push({ ...target, ...ordered.order });
    cursor = ordered.pos;
  }
  if (options.requireClosingParenAfterChain) {
    while (/\s/.test(source[cursor] ?? "")) cursor++;
    if (source[cursor] !== ")") return null;
  }
  if (chain.length <= 1) return null;
  return { kind: "chain", chain };
}
function getLocatorTargetLabel(target) {
  switch (target.kind) {
    case "role":
      return target.name;
    case "text":
      return target.text;
    case "label":
      return target.label;
    case "placeholder":
      return target.placeholder;
    case "title":
      return target.title;
    case "altText":
      return target.alt;
    case "testId":
      return target.testId;
    case "css":
    case "xpath":
      return void 0;
  }
}
function getLocatorTargetComponentType(target) {
  switch (target.kind) {
    case "role":
      return target.role;
    case "placeholder":
      return "input";
    case "altText":
      return "image";
    case "css":
      return inferComponentType(target.selector);
    case "xpath":
      return "element";
    default:
      return target.kind;
  }
}
function extractScopedComplementaryAnchor(line) {
  const firstRole = captureFirstStringArg(line, "getByRole");
  if (firstRole?.toLowerCase() !== "complementary") return null;
  const firstRoleEnd = findCallEndIndex(line, "getByRole");
  if (firstRoleEnd < 0) return null;
  const tail = line.slice(firstRoleEnd + 1);
  if (!tail.includes(".getBy")) return null;
  const roleNamed = captureRoleNamed(tail);
  if (roleNamed) {
    const order = locatorOrderFromLine(tail, "getByRole");
    return {
      label: roleNamed.name,
      kind: "name",
      componentType: roleNamed.role,
      locator: `role=${roleNamed.role}[name="${roleNamed.name}"]`,
      target: { kind: "role", role: roleNamed.role, name: roleNamed.name, exact: roleNamed.exact, ...order }
    };
  }
  const byTextArg = captureFirstLocatorArg(tail, "getByText");
  if (byTextArg) {
    const order = locatorOrderFromLine(tail, "getByText");
    return {
      label: byTextArg.value,
      kind: "text",
      componentType: "text",
      locator: `text="${byTextArg.value}"`,
      target: { kind: "text", text: byTextArg.value, exact: byTextArg.exact, ...order }
    };
  }
  const byLabelArg = captureFirstLocatorArg(tail, "getByLabel");
  if (byLabelArg) {
    const order = locatorOrderFromLine(tail, "getByLabel");
    return {
      label: byLabelArg.value,
      kind: "label",
      componentType: "label",
      locator: `label="${byLabelArg.value}"`,
      target: { kind: "label", label: byLabelArg.value, exact: byLabelArg.exact, ...order }
    };
  }
  return null;
}
function exactForCall(line, fnName) {
  const idx = line.indexOf(`${fnName}(`);
  if (idx < 0) return true;
  const tail = line.slice(idx);
  const opts = tail.match(/\{([^}]*)\}/);
  return opts ? captureExactOption(opts[1]) : true;
}
function xpathLiteral(value) {
  if (!value.includes("'")) return `'${value}'`;
  if (!value.includes('"')) return `"${value}"`;
  return "concat(" + value.split("'").map((part) => `'${part}'`).join(`, "'", `) + ")";
}
function switchByNearbyLabelLocator(label) {
  const labelNode = `${xpathCompactEquals(".", label)} or ${xpathCompactContains(".", label)}`;
  const rowPredicate = [
    'contains(concat(" ", normalize-space(@class), " "), " ant-flex ")',
    'contains(concat(" ", normalize-space(@class), " "), " ant-row ")',
    'contains(concat(" ", normalize-space(@class), " "), " form-item ")',
    'contains(concat(" ", normalize-space(@class), " "), " ant-form-item ")',
    "self::li",
    "self::tr",
    "self::td",
    "self::div"
  ].join(" or ");
  return `xpath=//button[@role="switch"][ancestor::*[(${rowPredicate}) and (${labelNode})][1][count(.//button[@role="switch"])=1]]`;
}
function compactText(value) {
  return value.replace(/\s+/g, "").trim();
}
function xpathCompactEquals(expr, value) {
  return `translate(normalize-space(${expr}), ' ', '')=${xpathLiteral(compactText(value))}`;
}
function xpathCompactContains(expr, value) {
  return `contains(translate(normalize-space(${expr}), ' ', ''), ${xpathLiteral(compactText(value))})`;
}
function stripDecorativeSvgTextSuffix(value) {
  const trimmed = value.trim();
  if (!trimmed) return value;
  const stripped = trimmed.replace(/(?:\s*0\s+0\s+(?:16|20|24|26|32)(?:\s+(?:16|20|24|26|32))?)$/u, "").trim();
  return stripped || value;
}
function normalizeLocatorTargetText(target) {
  if (target.kind === "chain") {
    return {
      kind: "chain",
      chain: target.chain.map(
        (item) => item.kind === "text" ? { ...item, text: stripDecorativeSvgTextSuffix(item.text) } : item
      )
    };
  }
  if (target.kind === "text") return { ...target, text: stripDecorativeSvgTextSuffix(target.text) };
  return target;
}
function modalActionLocator(dialogLabel, actionLabel) {
  const dialogPredicate = [
    '@role="dialog"',
    '@aria-modal="true"',
    'contains(concat(" ", normalize-space(@class), " "), " ant-modal-content ")',
    'contains(concat(" ", normalize-space(@class), " "), " ant-modal-confirm ")'
  ].join(" or ");
  return `xpath=(//*[${dialogPredicate}][${xpathCompactContains(".", dialogLabel)}]//button[${xpathCompactEquals(".", actionLabel)}])[last()]`;
}
function tableRowActionLocator(rowLabel, actionLabel) {
  const rowPredicate = [
    "self::tr",
    '@role="row"',
    "@data-row-key",
    'contains(concat(" ", normalize-space(@class), " "), " ant-table-row ")'
  ].join(" or ");
  const buttonPredicate = 'self::button or @role="button"';
  const actionPredicate = [
    xpathCompactEquals(".", actionLabel),
    xpathCompactEquals("@aria-label", actionLabel),
    xpathCompactEquals("@title", actionLabel)
  ].join(" or ");
  return `xpath=(//*[${rowPredicate}][${xpathCompactContains(".", rowLabel)}]//*[${buttonPredicate}][${actionPredicate}])[1]`;
}
function drawerControlLocator(drawerLabel, controlLabel, role) {
  const drawerPredicate = [
    '@role="dialog"',
    '@aria-modal="true"',
    'contains(concat(" ", normalize-space(@class), " "), " ant-drawer-content ")',
    'contains(concat(" ", normalize-space(@class), " "), " ant-drawer-content-wrapper ")'
  ].join(" or ");
  const normalizedRole = (role ?? "").toLowerCase();
  const controlPredicate = normalizedRole === "button" ? 'self::button or @role="button"' : normalizedRole === "combobox" ? '@role="combobox" or contains(concat(" ", normalize-space(@class), " "), " ant-select-selector ") or contains(concat(" ", normalize-space(@class), " "), " ant-select ")' : normalizedRole === "checkbox" ? 'self::input[@type="checkbox"] or @role="checkbox"' : normalizedRole === "radio" ? 'self::input[@type="radio"] or @role="radio"' : normalizedRole === "textbox" ? 'self::input or self::textarea or @role="textbox"' : 'self::button or self::input or self::textarea or @role="button" or @role="textbox" or @role="combobox" or contains(concat(" ", normalize-space(@class), " "), " ant-select-selector ")';
  const formLabelPredicate = `ancestor::*[contains(concat(" ", normalize-space(@class), " "), " ant-form-item ")][1]//*[self::label or contains(concat(" ", normalize-space(@class), " "), " ant-form-item-label ")][${xpathCompactContains(".", controlLabel)}]`;
  const namePredicate = [
    xpathCompactEquals("@aria-label", controlLabel),
    xpathCompactEquals("@placeholder", controlLabel),
    xpathCompactEquals("@title", controlLabel),
    xpathCompactEquals(".", controlLabel),
    formLabelPredicate
  ].join(" or ");
  return `xpath=(//*[${drawerPredicate}][${xpathCompactContains(".", drawerLabel)}]//*[(${controlPredicate}) and (${namePredicate})])[last()]`;
}
function codeMirrorLocator(label, placeholder, index) {
  const editorPredicate = 'contains(concat(" ", normalize-space(@class), " "), " CodeMirror ")';
  const conditions = [];
  if (label) {
    conditions.push(`preceding::*[${xpathCompactEquals(".", label)}][1]`);
  }
  if (placeholder) {
    conditions.push(`.//*[contains(concat(" ", normalize-space(@class), " "), " CodeMirror-placeholder ")][${xpathCompactEquals(".", placeholder)}]`);
  }
  const predicate = conditions.length ? `[${conditions.join(" and ")}]` : "";
  if (!predicate && Number.isInteger(index) && index != null && index >= 0) {
    return `xpath=(//div[${editorPredicate}])[${index + 1}]`;
  }
  return `xpath=//div[${editorPredicate}]${predicate}`;
}
function monacoIndexFromLabel(value) {
  if (!value.startsWith(TREMOLO_MONACO_PREFIX)) return void 0;
  const match = value.slice(TREMOLO_MONACO_PREFIX.length).match(/^(\d+)\u27e7$/);
  return match ? Number(match[1]) : void 0;
}
function monacoLocator(index) {
  const safeIndex = Number.isInteger(index) && index >= 0 ? index : 0;
  const editorPredicate = 'contains(concat(" ", normalize-space(@class), " "), " monaco-editor ")';
  return `xpath=(//*[${editorPredicate}])[${safeIndex + 1}]`;
}
function codeMirrorAncestorFromPreLocator(nth) {
  const preIndex = Number.isInteger(nth) && nth != null && nth >= 0 ? nth + 1 : 1;
  return `xpath=(//pre)[${preIndex}]/ancestor::*[contains(concat(" ", normalize-space(@class), " "), " CodeMirror ")][1]`;
}
function isCodeMirrorLocator(locator) {
  return /CodeMirror|codemirror/i.test(locator ?? "");
}
function normalizeLegacyCodeMirrorPreClicks(steps) {
  let changed = false;
  const normalized = steps.map((step) => {
    if (step.type !== "click" || step.target?.kind !== "css" || step.target.selector !== "pre") {
      return step;
    }
    const locator = codeMirrorAncestorFromPreLocator(step.target.nth);
    changed = true;
    return {
      ...step,
      title: step.title === "element \uD074\uB9AD" ? "CodeMirror \uD074\uB9AD" : step.title,
      locator,
      target: { kind: "xpath", selector: locator },
      assertion: {
        ...step.assertion ?? { enabled: false },
        enabled: false,
        componentType: "codemirror"
      }
    };
  });
  return changed ? renumberSteps(normalized) : steps;
}
function rowLabelFromSegmentedStep(step) {
  if (!step) return "";
  const titleMatch = (step.title ?? "").match(/^(.+?)\s*:\s*.+\s+선택$/);
  if (titleMatch?.[1]) return titleMatch[1].trim();
  const locatorMatch = (step.locator ?? "").match(/ant-tree-title[^\]]*\]\[contains\(normalize-space\(\.\),\s*(['"])((?:\\.|(?!\1).)+)\1\)/);
  return locatorMatch?.[2] ? unescapeStringLiteral(locatorMatch[2]) : "";
}
function isLegacyTreeSwitcherStep(step) {
  if (step.type !== "click") return false;
  const text = targetDisplayText(step).trim().toLowerCase();
  if (/^(arrow_right|keyboard_arrow_right|chevron_right)$/.test(text)) return true;
  if (/arrow_right|keyboard_arrow_right|chevron_right/.test(step.title ?? "")) return true;
  if (/arrow_right|keyboard_arrow_right|chevron_right/.test(step.locator ?? "")) return true;
  return /ant-tree-switcher/.test(step.locator ?? "");
}
function isLegacyTreeCheckboxStep(step) {
  if (step.type !== "click" && step.type !== "check" && step.type !== "uncheck") return false;
  if (/ant-table/.test(step.locator ?? "")) return false;
  if (step.target?.kind === "role" && step.target.role === "checkbox") return true;
  return /ant-checkbox/.test(step.locator ?? "");
}
function treeRowControlFromSyntheticLabel(step) {
  if (step.type !== "click" && step.type !== "check" && step.type !== "uncheck") return null;
  const locator = step.locator ?? "";
  const hasSyntheticLabelTarget = step.target?.kind === "label" || step.target?.kind === "title" || /^(?:label|title)=/.test(locator) || /ant-tree-switcher|arrow_right|keyboard_arrow_right|chevron_right/.test(locator) || /arrow_right|keyboard_arrow_right|chevron_right/.test(step.title ?? "");
  if (!hasSyntheticLabelTarget) return null;
  const candidates = [
    targetDisplayText(step),
    step.title?.replace(/\s+클릭$/, "") ?? ""
  ];
  const locatorLabel = locator.match(/^(?:label|title)=(?:"((?:\\"|[^"])*?)"|'((?:\\'|[^'])*?)')$/);
  if (locatorLabel) candidates.push((locatorLabel[1] ?? locatorLabel[2] ?? "").replace(/\\(["'])/g, "$1"));
  for (const raw of candidates) {
    const text = raw.trim();
    const switcher = text.match(/^(.+?)\s+(?:펼침|확장)$/);
    if (switcher?.[1]) return { label: switcher[1].trim(), control: "switcher" };
    const checkbox = text.match(/^(.+?)\s+체크박스$/);
    if (checkbox?.[1]) return { label: checkbox[1].trim(), control: "checkbox" };
  }
  return null;
}
function normalizeLegacyTreeRowControlSteps(steps) {
  let changed = false;
  const normalized = steps.map((step, index) => {
    const synthetic = treeRowControlFromSyntheticLabel(step);
    if (synthetic?.label) {
      const locator = synthetic.control === "switcher" ? antTreeSwitcherLocator(synthetic.label) : antTreeCheckboxLocator(synthetic.label);
      changed = true;
      return {
        ...step,
        type: "click",
        title: synthetic.control === "switcher" ? `${synthetic.label} \uD3BC\uCE68 \uD074\uB9AD` : `${synthetic.label} \uCCB4\uD06C\uBC15\uC2A4 \uD074\uB9AD`,
        locator,
        target: { kind: "xpath", selector: locator },
        assertion: {
          ...step.assertion ?? { enabled: false },
          enabled: false,
          componentType: synthetic.control === "switcher" ? "tree-switcher" : "tree-checkbox"
        }
      };
    }
    const previousRowLabel = rowLabelFromSegmentedStep(steps[index - 1]);
    if (previousRowLabel && isLegacyTreeSwitcherStep(step)) {
      const locator = antTreeSwitcherLocator(previousRowLabel);
      changed = true;
      return {
        ...step,
        type: "click",
        title: `${previousRowLabel} \uD3BC\uCE68 \uD074\uB9AD`,
        locator,
        target: { kind: "xpath", selector: locator },
        assertion: { ...step.assertion ?? { enabled: false }, enabled: false, componentType: "tree-switcher" }
      };
    }
    const sameRowLabel = rowLabelFromSegmentedStep(step);
    if (sameRowLabel && isLegacyTreeCheckboxStep(step)) {
      const locator = antTreeCheckboxLocator(sameRowLabel);
      changed = true;
      return {
        ...step,
        type: "click",
        title: `${sameRowLabel} \uCCB4\uD06C\uBC15\uC2A4 \uD074\uB9AD`,
        locator,
        target: { kind: "xpath", selector: locator },
        assertion: { ...step.assertion ?? { enabled: false }, enabled: false, componentType: "tree-checkbox" }
      };
    }
    return step;
  });
  return changed ? renumberSteps(normalized) : steps;
}
function uploadBrowseLinkLocator() {
  return `xpath=(//a[contains(concat(" ", normalize-space(@class), " "), " upload-link ")][${xpathCompactEquals(".", "\uCC3E\uC544\uBCF4\uAE30")}])[last()]`;
}
function parsePrefixedJsonLabel(label, prefix) {
  if (!label.startsWith(prefix)) return null;
  try {
    const parsed = JSON.parse(label.slice(prefix.length).trim());
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}
function codeMirrorIndexFromPayload(payload) {
  return Number.isInteger(payload?.index) && payload.index >= 0 ? payload.index : void 0;
}
function drawerAnchorFromPrefixedLabel(prefixedLabel, order) {
  if (!prefixedLabel.startsWith(TREMOLO_DRAWER_CONTROL_PREFIX)) return null;
  const payload = parsePrefixedJsonLabel(prefixedLabel, TREMOLO_DRAWER_CONTROL_PREFIX);
  const drawer = typeof payload?.drawer === "string" ? payload.drawer.trim() : "";
  const control = typeof payload?.control === "string" ? payload.control.trim() : "";
  const role = typeof payload?.role === "string" ? payload.role.trim() : "";
  if (!drawer || !control) return null;
  const locator = drawerControlLocator(drawer, control, role);
  return {
    label: control,
    kind: "drawer-control",
    componentType: role || "control",
    locator,
    target: { kind: "xpath", selector: locator, ...order }
  };
}
function findCallEndIndex(line, fnName) {
  const marker = `${fnName}(`;
  const start = line.indexOf(marker);
  if (start < 0) return -1;
  let depth = 1;
  let quote = null;
  let escaped = false;
  for (let i = start + marker.length; i < line.length; i++) {
    const ch = line[i];
    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === quote) {
        quote = null;
      }
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      quote = ch;
      continue;
    }
    if (ch === "(") depth++;
    if (ch === ")") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}
function locatorOrderFromLine(line, fnName) {
  const end = findCallEndIndex(line, fnName);
  if (end < 0) return {};
  const rest = line.slice(end + 1).trimStart();
  const nth = rest.match(/^\.nth\(\s*(\d+)\s*\)/);
  if (nth) return { order: "nth", nth: Number(nth[1]) };
  if (/^\.first\(\s*\)/.test(rest)) return { order: "first" };
  return {};
}
function extractAnchor(line, options = {}) {
  const scopedComplementary = extractScopedComplementaryAnchor(line);
  if (scopedComplementary) return scopedComplementary;
  const chainTarget = options.parseLocatorChains ?? activeParseSpecOptions.parseLocatorChains ? parseLocatorChainTarget(line) : null;
  if (chainTarget?.kind === "chain") {
    const last = chainTarget.chain[chainTarget.chain.length - 1];
    const label = last ? getLocatorTargetLabel(last) : void 0;
    return {
      ...label ? { label } : {},
      kind: "chain",
      componentType: last ? getLocatorTargetComponentType(last) : "locator",
      locator: formatTargetAsLocatorString(chainTarget),
      target: chainTarget
    };
  }
  const roleNamed = captureRoleNamed(line);
  if (roleNamed) {
    const order = locatorOrderFromLine(line, "getByRole");
    const monacoIndex = monacoIndexFromLabel(roleNamed.name);
    if (monacoIndex != null) {
      const locator = monacoLocator(monacoIndex);
      return {
        label: `Monaco #${monacoIndex + 1}`,
        kind: "monaco",
        componentType: "monaco",
        locator,
        target: { kind: "xpath", selector: locator, ...order }
      };
    }
    if (roleNamed.name.startsWith(TREMOLO_CODEMIRROR_PREFIX)) {
      const payload = parsePrefixedJsonLabel(roleNamed.name, TREMOLO_CODEMIRROR_PREFIX);
      const label = typeof payload?.label === "string" ? payload.label.trim() : "";
      const placeholder = typeof payload?.placeholder === "string" ? payload.placeholder.trim() : "";
      const locator = codeMirrorLocator(label, placeholder, codeMirrorIndexFromPayload(payload));
      return {
        label: label || placeholder || "CodeMirror",
        kind: "codemirror",
        componentType: "codemirror",
        locator,
        target: { kind: "xpath", selector: locator, ...order }
      };
    }
    const drawerAnchor = drawerAnchorFromPrefixedLabel(roleNamed.name, order);
    if (drawerAnchor) return drawerAnchor;
    if (roleNamed.role.toLowerCase() === "button" && roleNamed.name.startsWith(TREMOLO_TABLE_ACTION_PREFIX)) {
      const payload = parsePrefixedJsonLabel(roleNamed.name, TREMOLO_TABLE_ACTION_PREFIX);
      const row = typeof payload?.row === "string" ? payload.row.trim() : "";
      const action = typeof payload?.action === "string" ? payload.action.trim() : "";
      if (row && action) {
        const locator = tableRowActionLocator(row, action);
        return {
          label: action,
          kind: "table-action",
          componentType: "button",
          locator,
          target: { kind: "xpath", selector: locator }
        };
      }
    }
    if (roleNamed.role.toLowerCase() === "button" && roleNamed.name.startsWith(TREMOLO_MODAL_ACTION_PREFIX)) {
      const payload = parsePrefixedJsonLabel(roleNamed.name, TREMOLO_MODAL_ACTION_PREFIX);
      const dialog = typeof payload?.dialog === "string" ? payload.dialog.trim() : "";
      const action = typeof payload?.action === "string" ? payload.action.trim() : "";
      if (dialog && action) {
        const locator = modalActionLocator(dialog, action);
        return {
          label: action,
          kind: "modal-action",
          componentType: "button",
          locator,
          target: { kind: "xpath", selector: locator, ...order }
        };
      }
    }
    if (roleNamed.role.toLowerCase() === "switch" && roleNamed.name.startsWith(TREMOLO_SWITCH_LABEL_PREFIX)) {
      const label = roleNamed.name.slice(TREMOLO_SWITCH_LABEL_PREFIX.length).trim();
      const locator = switchByNearbyLabelLocator(label);
      return {
        label,
        kind: "switch-label",
        componentType: "switch",
        locator,
        target: { kind: "xpath", selector: locator, ...order }
      };
    }
    return {
      label: roleNamed.name,
      kind: "name",
      componentType: roleNamed.role,
      locator: `role=${roleNamed.role}[name="${roleNamed.name}"]`,
      target: { kind: "role", role: roleNamed.role, name: roleNamed.name, exact: roleNamed.exact, ...order }
    };
  }
  const roleOnly = captureFirstStringArg(line, "getByRole");
  if (roleOnly) {
    const order = locatorOrderFromLine(line, "getByRole");
    return {
      kind: "role",
      componentType: roleOnly,
      locator: `role=${roleOnly}`,
      target: { kind: "role", role: roleOnly, ...order }
    };
  }
  const byLabelArg = captureFirstLocatorArg(line, "getByLabel");
  if (byLabelArg) {
    const order = locatorOrderFromLine(line, "getByLabel");
    const byLabel = byLabelArg.value;
    const monacoIndex = monacoIndexFromLabel(byLabel);
    if (monacoIndex != null) {
      const locator = monacoLocator(monacoIndex);
      return {
        label: `Monaco #${monacoIndex + 1}`,
        kind: "monaco",
        componentType: "monaco",
        locator,
        target: { kind: "xpath", selector: locator, ...order }
      };
    }
    if (byLabel.startsWith(TREMOLO_CODEMIRROR_PREFIX)) {
      const payload = parsePrefixedJsonLabel(byLabel, TREMOLO_CODEMIRROR_PREFIX);
      const label = typeof payload?.label === "string" ? payload.label.trim() : "";
      const placeholder = typeof payload?.placeholder === "string" ? payload.placeholder.trim() : "";
      const locator = codeMirrorLocator(label, placeholder, codeMirrorIndexFromPayload(payload));
      return {
        label: label || placeholder || "CodeMirror",
        kind: "codemirror",
        componentType: "codemirror",
        locator,
        target: { kind: "xpath", selector: locator, ...order }
      };
    }
    const drawerAnchor = drawerAnchorFromPrefixedLabel(byLabel, order);
    if (drawerAnchor) return drawerAnchor;
    return {
      label: byLabel,
      kind: "label",
      componentType: "label",
      locator: `label="${byLabel}"`,
      target: { kind: "label", label: byLabel, exact: byLabelArg.exact, ...order }
    };
  }
  const byPhArg = captureFirstLocatorArg(line, "getByPlaceholder");
  if (byPhArg) {
    const order = locatorOrderFromLine(line, "getByPlaceholder");
    const byPh = byPhArg.value;
    return {
      label: byPh,
      kind: "placeholder",
      componentType: "input",
      locator: `placeholder="${byPh}"`,
      target: { kind: "placeholder", placeholder: byPh, exact: byPhArg.exact, ...order }
    };
  }
  const byTextArg = captureFirstLocatorArg(line, "getByText");
  if (byTextArg) {
    const order = locatorOrderFromLine(line, "getByText");
    const byText = byTextArg.value;
    return {
      label: byText,
      kind: "text",
      componentType: "text",
      locator: `text="${byText}"`,
      target: { kind: "text", text: byText, exact: byTextArg.exact, ...order }
    };
  }
  const byTitleArg = captureFirstLocatorArg(line, "getByTitle");
  if (byTitleArg) {
    const order = locatorOrderFromLine(line, "getByTitle");
    const byTitle = byTitleArg.value;
    return {
      label: byTitle,
      kind: "title",
      componentType: "title",
      locator: `title="${byTitle}"`,
      target: { kind: "title", title: byTitle, exact: byTitleArg.exact, ...order }
    };
  }
  const byAltArg = captureFirstLocatorArg(line, "getByAltText");
  if (byAltArg) {
    const order = locatorOrderFromLine(line, "getByAltText");
    const byAlt = byAltArg.value;
    return {
      label: byAlt,
      kind: "alt",
      componentType: "image",
      locator: `alt="${byAlt}"`,
      target: { kind: "altText", alt: byAlt, exact: byAltArg.exact, ...order }
    };
  }
  const byTid = captureFirstStringArg(line, "getByTestId");
  if (byTid) {
    const order = locatorOrderFromLine(line, "getByTestId");
    const monacoIndex = monacoIndexFromLabel(byTid);
    if (monacoIndex != null) {
      const locator = monacoLocator(monacoIndex);
      return {
        label: `Monaco #${monacoIndex + 1}`,
        kind: "monaco",
        componentType: "monaco",
        locator,
        target: { kind: "xpath", selector: locator, ...order }
      };
    }
    if (byTid.startsWith(TREMOLO_CODEMIRROR_PREFIX)) {
      const payload = parsePrefixedJsonLabel(byTid, TREMOLO_CODEMIRROR_PREFIX);
      const label = typeof payload?.label === "string" ? payload.label.trim() : "";
      const placeholder = typeof payload?.placeholder === "string" ? payload.placeholder.trim() : "";
      const locator = codeMirrorLocator(label, placeholder, codeMirrorIndexFromPayload(payload));
      return {
        label: label || placeholder || "CodeMirror",
        kind: "codemirror",
        componentType: "codemirror",
        locator,
        target: { kind: "xpath", selector: locator, ...order }
      };
    }
    const drawerAnchor = drawerAnchorFromPrefixedLabel(byTid, order);
    if (drawerAnchor) return drawerAnchor;
    return {
      label: byTid,
      kind: "testid",
      componentType: "testid",
      locator: `testid="${byTid}"`,
      target: { kind: "testId", testId: byTid, ...order }
    };
  }
  const locatorSelector = captureFirstStringArg(line, "locator");
  if (locatorSelector) {
    const filteredText = captureLocatorFilterHasText(line);
    if (filteredText) {
      const order2 = locatorOrderFromLine(line, "filter");
      const locator = locatorFilterHasTextXpath(locatorSelector, filteredText.value, filteredText.exact);
      return {
        label: filteredText.value,
        kind: "hasText",
        componentType: inferComponentType(locatorSelector),
        locator,
        target: { kind: "xpath", selector: locator, ...order2 }
      };
    }
    const order = locatorOrderFromLine(line, "locator");
    const fromSel = parseSelectorEngine(locatorSelector);
    const target = parseLocatorString(locatorSelector);
    const orderedTarget = target && target.kind !== "chain" ? { ...target, ...order } : target ?? void 0;
    if (fromSel) {
      return { ...fromSel, locator: locatorSelector, target: orderedTarget };
    }
    return { componentType: inferComponentType(locatorSelector), locator: locatorSelector, target: orderedTarget };
  }
  return { locator: "-" };
}
function hasTremoloSyntheticLocatorMarker(line) {
  return [
    TREMOLO_ROW_LABEL_PREFIX,
    TREMOLO_TABLE_ACTION_PREFIX,
    TREMOLO_SWITCH_LABEL_PREFIX,
    TREMOLO_MODAL_ACTION_PREFIX,
    TREMOLO_DRAWER_CONTROL_PREFIX,
    TREMOLO_CODEMIRROR_PREFIX,
    TREMOLO_MONACO_PREFIX
  ].some((prefix) => line.includes(prefix));
}
function extractAssertionAnchor(line) {
  if (!hasTremoloSyntheticLocatorMarker(line)) {
    const chainTarget = parseLocatorChainTarget(line, { requireClosingParenAfterChain: true });
    if (chainTarget?.kind === "chain") {
      const last = chainTarget.chain[chainTarget.chain.length - 1];
      const label = last ? getLocatorTargetLabel(last) : void 0;
      return {
        ...label ? { label } : {},
        kind: "chain",
        componentType: last ? getLocatorTargetComponentType(last) : "locator",
        locator: formatTargetAsLocatorString(chainTarget),
        target: chainTarget
      };
    }
  }
  return extractAnchor(line, { parseLocatorChains: false });
}
function parseSelectorEngine(selector) {
  const role = selector.match(/^role=([a-zA-Z0-9_-]+)(?:\[name=(?:"((?:\\"|[^"])*?)"|'((?:\\'|[^'])*?)')\s*])?/);
  if (role) {
    const name = role[2] ?? role[3];
    if (name != null) {
      return { label: name.replace(/\\(['"])/g, "$1"), kind: "name", componentType: role[1] };
    }
    return { kind: "role", componentType: role[1] };
  }
  const simple = selector.match(/^(text|placeholder|label|title|alt|testid)=(?:"((?:\\"|[^"])*?)"|'((?:\\'|[^'])*?)')/);
  if (simple) {
    const kind = simple[1];
    const value = (simple[2] ?? simple[3] ?? "").replace(/\\(['"])/g, "$1");
    const componentType = kind === "placeholder" ? "input" : kind === "alt" ? "image" : kind;
    return { label: value, kind, componentType };
  }
  return null;
}
function inferComponentType(cssSelector) {
  const s = cssSelector.toLowerCase();
  if (s.includes('input[type="password"]')) return "password";
  if (s.includes('input[type="email"]')) return "email";
  if (s.includes('input[type="checkbox"]')) return "checkbox";
  if (s.includes('input[type="radio"]')) return "radio";
  if (s.includes('input[type="submit"]') || s.startsWith("button") || s.includes(".btn")) return "button";
  if (s.startsWith("input") || s.includes("textarea")) return "input";
  if (s.startsWith("select")) return "select";
  if (s.startsWith("a") || s.includes("link")) return "link";
  if (s.startsWith("form")) return "form";
  const idMatch = cssSelector.match(/^#([\w-]+)/);
  if (idMatch) return idMatch[1];
  const classMatch = cssSelector.match(/\.([\w-]+)/);
  if (classMatch) return classMatch[1];
  return "element";
}
var ACTION_LABEL = STEP_ACTION_LABEL;
function assertionFromMatcher(matcher, expected) {
  switch (matcher) {
    case "toBeVisible":
      return { kind: "visible", matcher };
    case "toBeHidden":
      return { kind: "hidden", matcher };
    case "toContainText":
      return { kind: "text", match: "contains", matcher, expected };
    case "toHaveText":
      return { kind: "text", match: "equals", matcher, expected };
    case "toHaveValue":
      return { kind: "value", match: "equals", matcher, expected };
    case "toBeChecked":
      return { kind: "checked", matcher };
    case "toBeDisabled":
      return { kind: "disabled", matcher };
    case "toBeEnabled":
      return { kind: "enabled", matcher };
    default:
      return { kind: "visible", matcher };
  }
}
function assertionValue(parsed) {
  const esc = (s) => s.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t");
  return parsed.expected != null ? `${parsed.matcher}('${esc(parsed.expected)}')` : `${parsed.matcher}()`;
}
function assertionTitle(anchor, parsed) {
  const target = anchor.label ?? anchor.componentType ?? "\uC694\uC18C";
  if (parsed.kind === "visible") return `${target} \uD45C\uC2DC \uAC80\uC99D`;
  if (parsed.kind === "hidden") return `${target} \uC228\uAE40 \uAC80\uC99D`;
  if (parsed.kind === "text") {
    const mode = parsed.match === "equals" ? "\uC815\uD655\uD788 \uC77C\uCE58" : "\uD3EC\uD568";
    return `${target} \uD14D\uC2A4\uD2B8 ${mode} \uAC80\uC99D`;
  }
  if (parsed.kind === "value") return `${target} \uAC12 \uAC80\uC99D`;
  if (parsed.kind === "checked") return `${target} \uCCB4\uD06C \uC0C1\uD0DC \uAC80\uC99D`;
  if (parsed.kind === "disabled") return `${target} \uBE44\uD65C\uC131 \uC0C1\uD0DC \uAC80\uC99D`;
  if (parsed.kind === "enabled") return `${target} \uD65C\uC131 \uC0C1\uD0DC \uAC80\uC99D`;
  return `${target} \uAC80\uC99D`;
}
function normalizeTextAssertionAnchor(anchor, parsed) {
  if (parsed.kind !== "text" || !parsed.expected) return anchor;
  const isSyntheticTableAction = anchor.kind === "table-action" || anchor.label?.startsWith(TREMOLO_TABLE_ACTION_PREFIX);
  if (isSyntheticTableAction) {
    const target2 = { kind: "text", text: parsed.expected, exact: parsed.match === "equals" };
    return {
      label: parsed.expected,
      kind: "text",
      componentType: "text",
      locator: formatTargetAsLocatorString(target2),
      target: target2
    };
  }
  const target = textAssertionVisibilityTarget(anchor.target, anchor.locator, parsed.expected, parsed.match);
  if (!target) return anchor;
  return {
    label: parsed.expected,
    kind: "text",
    componentType: "text",
    locator: formatTargetAsLocatorString(target),
    target
  };
}
function isAntdTableSelectionCell(locator) {
  if (!locator) return false;
  const hasControl = /ant-(radio|checkbox)\b/.test(locator);
  if (!hasControl) return false;
  return /ant-table-selection-column/.test(locator) || /ant-table-cell-row-hover/.test(locator);
}
function antdTableControlOf(locator) {
  if (!locator) return "auto";
  if (/ant-checkbox\b/.test(locator)) return "checkbox";
  if (/ant-radio\b/.test(locator)) return "radio";
  return "auto";
}
function isComboboxClickLine(line) {
  if (!/\.click\s*\(/.test(line)) return false;
  if (/role=combobox/i.test(line)) return true;
  if (/getByRole\(\s*['"]combobox['"]/i.test(line)) return true;
  if (/#rc_select_\d+/.test(line)) return true;
  if (/\.ant-select\b/.test(line)) return true;
  if (isSimpleIdClickLine(line)) return true;
  if (captureFirstStringArg(line, "locator") && captureLocatorFilterHasText(line)) return true;
  return false;
}
function isExplicitAntdSelectHostClickLine(line) {
  if (!/\.click\s*\(/.test(line)) return false;
  if (/#rc_select_\d+/.test(line)) return true;
  if (/ant-select|ant-select-selector|ant-select-selection/i.test(line)) return true;
  if (isSimpleIdClickLine(line)) return true;
  if (captureFirstStringArg(line, "locator") && captureLocatorFilterHasText(line)) return true;
  return false;
}
function isSimpleIdClickLine(line) {
  if (!/\.click\s*\(/.test(line)) return false;
  const selector = captureFirstStringArg(line, "locator");
  return !!selector && /^#[A-Za-z_][\w:-]*$/.test(selector);
}
function isAntdOptionClickLine(line) {
  if (!/\.click\s*\(/.test(line)) return false;
  if (/ant-select-item-option/i.test(line)) return true;
  if (/getByText\(/.test(line)) return true;
  if (/locator\(\s*['"]text=/.test(line)) return true;
  return false;
}
function isPortalAntdOptionClickLine(line) {
  if (!/\.click\s*\(/.test(line)) return false;
  if (/ant-select-dropdown/i.test(line)) return true;
  if (/ant-select-item-option/i.test(line)) return true;
  return false;
}
function isAntdSelectHostOptionClickPair(hostLine, optionLine) {
  if (!isAntdOptionClickLine(optionLine)) return false;
  if (isExplicitAntdSelectHostClickLine(hostLine)) return true;
  if (isComboboxClickLine(hostLine) && isPortalAntdOptionClickLine(optionLine)) return true;
  return isPotentialDropdownHostClickLine(hostLine) && (isPortalAntdOptionClickLine(optionLine) || isLikelyGeneratedSelectTextPair(hostLine, optionLine));
}
function extractAntdOptionLabel(line) {
  const anchor = extractAnchor(line);
  if (anchor.label) return anchor.label;
  const selector = captureFirstStringArg(line, "locator");
  if (!selector || !isPortalAntdOptionClickLine(line)) return null;
  const compactSingle = selector.match(/translate\(normalize-space\(\.\), ' ', ''\)='((?:\\'|[^'])+)'/);
  if (compactSingle) return unescapeStringLiteral(compactSingle[1]);
  const compactDouble = selector.match(/translate\(normalize-space\(\.\), ' ', ''\)="((?:\\"|[^"])+)"/);
  if (compactDouble) return unescapeStringLiteral(compactDouble[1]);
  return null;
}
function peekNextSignificantLineIndex(lines, startIdx) {
  for (let i = startIdx + 1; i < lines.length; i++) {
    const t = lines[i].trim();
    if (!t) continue;
    if (t.startsWith("//")) continue;
    if (t === "});" || t === "}" || t === "{") continue;
    return i;
  }
  return -1;
}
function peekPreviousSignificantLineIndex(lines, startIdx) {
  for (let i = startIdx - 1; i >= 0; i--) {
    const t = lines[i].trim();
    if (!t) continue;
    if (t.startsWith("//")) continue;
    if (t === "});" || t === "}" || t === "{") continue;
    return i;
  }
  return -1;
}
function isPotentialDropdownHostClickLine(line) {
  if (!/\.click\s*\(/.test(line)) return false;
  if (isComboboxClickLine(line)) return true;
  if (captureFirstStringArg(line, "locator") && captureLocatorFilterHasText(line)) return true;
  if (!/getByText\(/.test(line)) return false;
  return !locatorOrderFromLine(line, "getByText").order;
}
function isLikelyGeneratedSelectTextPair(hostLine, optionLine) {
  const host = extractAnchor(hostLine).label?.trim();
  const option = extractAnchor(optionLine).label?.trim();
  return !!host && !!option && (isLikelyGeneratedSelectValue(host) || isLikelyGeneratedSelectValue(option));
}
function isLikelyGeneratedSelectValue(value) {
  return /^__[^_]+__$/.test(value) || /^-?[\w-]+-\d{6,}$/.test(value);
}
function extractAntdDropdownTextOption(line) {
  if (!/\.click\s*\(/.test(line)) return null;
  const byText = captureFirstLocatorArg(line, "getByText");
  if (!byText) return null;
  const order = locatorOrderFromLine(line, "getByText");
  if (order.order !== "nth") return null;
  return byText.value;
}
function splitTopLevelArgs(body) {
  const args = [];
  let depth = 0;
  let inSingle = false;
  let inDouble = false;
  let escaped = false;
  let buf = "";
  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (escaped) {
      buf += ch;
      escaped = false;
      continue;
    }
    if (ch === "\\") {
      buf += ch;
      escaped = true;
      continue;
    }
    if (inSingle) {
      buf += ch;
      if (ch === "'") inSingle = false;
      continue;
    }
    if (inDouble) {
      buf += ch;
      if (ch === '"') inDouble = false;
      continue;
    }
    if (ch === "'") {
      inSingle = true;
      buf += ch;
      continue;
    }
    if (ch === '"') {
      inDouble = true;
      buf += ch;
      continue;
    }
    if (ch === "(" || ch === "{" || ch === "[") {
      depth++;
      buf += ch;
      continue;
    }
    if (ch === ")" || ch === "}" || ch === "]") {
      depth--;
      buf += ch;
      continue;
    }
    if (ch === "," && depth === 0) {
      const t2 = buf.trim();
      if (t2) args.push(t2);
      buf = "";
      continue;
    }
    buf += ch;
  }
  const t = buf.trim();
  if (t) args.push(t);
  return args;
}
function parseSelectAntdOptionCall(line) {
  const head = line.match(/selectAntdOption\(\s*page\s*,/);
  if (!head) return null;
  const start = head.index + head[0].length;
  let depth = 1;
  let inSingle = false;
  let inDouble = false;
  let escaped = false;
  let endIdx = -1;
  for (let i = start; i < line.length; i++) {
    const ch = line[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === "\\") {
      escaped = true;
      continue;
    }
    if (inSingle) {
      if (ch === "'") inSingle = false;
      continue;
    }
    if (inDouble) {
      if (ch === '"') inDouble = false;
      continue;
    }
    if (ch === "'") {
      inSingle = true;
      continue;
    }
    if (ch === '"') {
      inDouble = true;
      continue;
    }
    if (ch === "(" || ch === "{" || ch === "[") {
      depth++;
      continue;
    }
    if (ch === ")" || ch === "}" || ch === "]") {
      depth--;
      if (depth === 0) {
        endIdx = i;
        break;
      }
    }
  }
  if (endIdx < 0) return null;
  const body = line.slice(start, endIdx).trim();
  if (!body) return null;
  if (body.startsWith("{")) {
    if (!body.endsWith("}")) return null;
    return { kind: "object", objectLiteral: body };
  }
  const args = splitTopLevelArgs(body);
  if (args.length < 2) return null;
  const valueLit = args[1];
  const m = valueLit.match(/^['"]((?:[^'"\\]|\\.)*)['"]$/);
  if (!m) return null;
  const value = m[1].replace(/\\(['"\\])/g, "$1");
  return { kind: "legacy", rootExpr: args[0], value, opts: args[2] };
}
function parseAntdObjectLiteral(literal) {
  const obj = literal.trim();
  if (!obj.startsWith("{") || !obj.endsWith("}")) return {};
  const inner = obj.slice(1, -1).trim();
  const pairs = splitTopLevelArgs(inner);
  const out = {};
  for (const pair of pairs) {
    const m = pair.match(/^([\w$]+)\s*:\s*([\s\S]+)$/);
    if (!m) continue;
    const key = m[1];
    const val = m[2].trim();
    switch (key) {
      case "by": {
        const sm = val.match(/^['"](auto|label|root|rank)['"]$/);
        if (sm) out.by = sm[1];
        break;
      }
      case "label":
      case "option":
      case "expectedLabel":
      case "searchText": {
        const parsedValue = parseValueExpression(val);
        if (parsedValue != null) {
          const unescaped = parsedValue;
          if (key === "label") out.label = unescaped;
          else if (key === "option") out.option = unescaped;
          else if (key === "expectedLabel") out.expectedLabel = unescaped;
          else if (key === "searchText") out.searchText = unescaped;
        }
        break;
      }
      case "rank": {
        const n = Number(val);
        if (Number.isFinite(n)) out.rank = n;
        break;
      }
      case "scope":
        out.scopeExpr = val;
        break;
      case "root":
        out.rootExpr = val;
        break;
      case "search":
        out.search = val === "true";
        break;
      case "allowVirtualScrollFallback":
        out.allowVirtualScrollFallback = val === "true";
        break;
    }
  }
  return out;
}
function extractCallObjectLiteral(line, fnName) {
  const head = line.match(new RegExp(fnName + "\\(\\s*page\\s*,"));
  if (!head || head.index == null) return null;
  const start = head.index + head[0].length;
  let depth = 1;
  let inSingle = false;
  let inDouble = false;
  let escaped = false;
  let endIdx = -1;
  for (let i = start; i < line.length; i++) {
    const ch = line[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === "\\") {
      escaped = true;
      continue;
    }
    if (inSingle) {
      if (ch === "'") inSingle = false;
      continue;
    }
    if (inDouble) {
      if (ch === '"') inDouble = false;
      continue;
    }
    if (ch === "'") {
      inSingle = true;
      continue;
    }
    if (ch === '"') {
      inDouble = true;
      continue;
    }
    if (ch === "(" || ch === "{" || ch === "[") {
      depth++;
      continue;
    }
    if (ch === ")" || ch === "}" || ch === "]") {
      depth--;
      if (depth === 0) {
        endIdx = i;
        break;
      }
    }
  }
  if (endIdx < 0) return null;
  const body = line.slice(start, endIdx).trim();
  return body.startsWith("{") && body.endsWith("}") ? body : null;
}
function parseAntdTableLiteral(literal) {
  const out = { match: [] };
  const obj = literal.trim();
  if (!obj.startsWith("{") || !obj.endsWith("}")) return out;
  const inner = obj.slice(1, -1).trim();
  for (const pair of splitTopLevelArgs(inner)) {
    const m = pair.match(/^([\w$]+)\s*:\s*([\s\S]+)$/);
    if (!m) continue;
    const key = m[1];
    const val = m[2].trim();
    if (key === "match") {
      const arr = val.replace(/^\[/, "").replace(/\]$/, "");
      out.match = splitTopLevelArgs(arr).map((it) => parseValueExpression(it.trim()) ?? "").filter((s) => s.length > 0);
    } else if (key === "control") {
      const sm = val.match(/^['"](auto|radio|checkbox)['"]$/);
      if (sm) out.control = sm[1];
    } else if (key === "action") {
      const sm = val.match(/^['"](check|uncheck|click)['"]$/);
      if (sm) out.action = sm[1];
    }
  }
  return out;
}
function buildStepTitle(type, anchor, value) {
  const action = ACTION_LABEL[type] ?? type;
  if (anchor.label) {
    return `${anchor.label} ${action}`;
  }
  if (anchor.componentType) {
    return `${anchor.componentType} ${action}`;
  }
  if (value) return `${value} ${action}`;
  return action;
}
function parseSpecToSteps(content, options = {}) {
  const previousParseSpecOptions = activeParseSpecOptions;
  activeParseSpecOptions = options;
  try {
    const steps = [];
    const lines = content.split("\n");
    let stepId = 0;
    let currentBlockId = null;
    let currentBlockName;
    const applyBlock = (s) => {
      if (currentBlockId) {
        s.blockId = currentBlockId;
        if (currentBlockName) s.blockName = currentBlockName;
      }
      return s;
    };
    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      const blockStart = trimmed.match(/^\/\/\s*@block-start\s+id=(\S+)(?:\s+(.+))?$/);
      if (blockStart) {
        currentBlockId = blockStart[1];
        currentBlockName = blockStart[2]?.trim() || void 0;
        continue;
      }
      if (/^\/\/\s*@block-end\b/.test(trimmed)) {
        currentBlockId = null;
        currentBlockName = void 0;
        continue;
      }
      if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("import") || trimmed.startsWith("test(") || trimmed.startsWith("test.describe") || trimmed.startsWith("await test.step") || trimmed === "});" || trimmed === "{" || trimmed === "}") continue;
      if (trimmed.includes("selectAntdTableRow(")) {
        const lit = extractCallObjectLiteral(trimmed, "selectAntdTableRow");
        if (lit) {
          const fields = parseAntdTableLiteral(lit);
          const title = fields.match.length ? `AntD \uD45C \uD589 \uC120\uD0DD: ${fields.match.join(", ")}` : "AntD \uD45C \uD589 \uC120\uD0DD (\uD589 \uC2DD\uBCC4 \uD14D\uC2A4\uD2B8 \uC785\uB825 \uD544\uC694)";
          const s = applyBlock(makeStep(++stepId, "antdTableSelect", title, "-", "-"));
          s.antdTable = {
            match: fields.match,
            ...fields.control && fields.control !== "auto" ? { control: fields.control } : {},
            ...fields.action && fields.action !== "check" ? { action: fields.action } : {}
          };
          s.timeout = extractTimeoutOption(trimmed) ?? s.timeout;
          steps.push(s);
          continue;
        }
      }
      if (trimmed.includes("selectAntdOption(")) {
        const call = parseSelectAntdOptionCall(trimmed);
        if (call?.kind === "object") {
          const fields = parseAntdObjectLiteral(call.objectLiteral);
          const option = fields.option ?? parseRuntimeInitializer(trimmed) ?? "";
          const by = fields.by ?? (fields.rootExpr ? "root" : "auto");
          let titlePrefix = "AntD Select";
          let locator = "-";
          let target;
          if (by === "label" && fields.label) {
            titlePrefix = fields.label;
            target = { kind: "label", label: fields.label };
            locator = `label="${fields.label}"`;
          } else if (by === "root" && fields.rootExpr) {
            const anchor = extractAnchor(fields.rootExpr);
            titlePrefix = anchor.label ?? anchor.componentType ?? "AntD Select";
            if (anchor.target) target = anchor.target;
            locator = anchor.locator || "-";
          } else if (by === "auto") {
            if (fields.rootExpr) {
              const anchor = extractAnchor(fields.rootExpr);
              titlePrefix = anchor.label ?? anchor.componentType ?? "AntD Select";
              if (anchor.target) target = anchor.target;
              locator = anchor.locator || "-";
            }
          } else if (by === "rank") {
            titlePrefix = fields.expectedLabel ? `${fields.expectedLabel} (rank ${fields.rank ?? 0})` : `rank ${fields.rank ?? 0}`;
          }
          const title = `${titlePrefix}: ${option} \uC120\uD0DD`;
          const s = applyBlock(makeStep(++stepId, "antdSelect", title, locator, option));
          if (target) s.target = target;
          s.antd = {
            by,
            ...fields.label != null ? { label: fields.label } : {},
            ...fields.rank != null ? { rank: fields.rank } : {},
            ...fields.scopeExpr ? { scopeLocator: fields.scopeExpr } : {},
            ...fields.expectedLabel ? { expectedLabel: fields.expectedLabel } : {},
            ...fields.search ? { search: true } : {},
            ...fields.searchText ? { searchText: fields.searchText } : {},
            ...fields.allowVirtualScrollFallback === false ? { allowVirtualScrollFallback: false } : {}
          };
          attachRuntimeExport(s, trimmed);
          s.timeout = extractTimeoutOption(trimmed) ?? s.timeout;
          steps.push(s);
          continue;
        }
        if (call?.kind === "legacy") {
          const anchor = extractAnchor(call.rootExpr);
          const valueLabel = call.value;
          const hostLabel = anchor.label ?? anchor.componentType ?? "AntD Select";
          const title = `${hostLabel}: ${valueLabel} \uC120\uD0DD`;
          const s = applyBlock(makeStep(++stepId, "antdSelect", title, anchor.locator, valueLabel));
          if (anchor.target) s.target = anchor.target;
          s.antd = isStableRootExpr(call.rootExpr) ? { by: "root" } : { by: "auto" };
          attachRuntimeExport(s, trimmed);
          s.timeout = extractTimeoutOption(trimmed) ?? s.timeout;
          steps.push(s);
          continue;
        }
      }
      if (trimmed.includes("fillMonaco(")) {
        const args = extractFunctionArgs(trimmed, "fillMonaco");
        const anchorExpr = args?.[0]?.trim();
        const valueExpr = args?.[1]?.trim();
        const value = valueExpr ? parseValueExpression(valueExpr) ?? parseRuntimeInitializer(trimmed) : parseRuntimeInitializer(trimmed);
        if (anchorExpr && value != null) {
          const anchor = extractAnchor(anchorExpr);
          const loc = anchor.locator || "-";
          const label = anchor.label || "Monaco";
          const s = applyBlock(makeStep(++stepId, "fill", `${label} input`, loc, value));
          if (anchor.target) s.target = anchor.target;
          else if (loc.startsWith("xpath=")) s.target = { kind: "xpath", selector: loc };
          s.assertion = {
            ...s.assertion,
            enabled: false,
            componentType: "monaco"
          };
          attachRuntimeExport(s, trimmed);
          s.timeout = extractTimeoutOption(trimmed) ?? s.timeout;
          steps.push(s);
          continue;
        }
      }
      if (trimmed.includes("fillCodeMirror(")) {
        const args = extractFunctionArgs(trimmed, "fillCodeMirror");
        const anchorExpr = args?.[0]?.trim();
        const valueExpr = args?.[1]?.trim();
        const value = valueExpr ? parseValueExpression(valueExpr) ?? parseRuntimeInitializer(trimmed) : parseRuntimeInitializer(trimmed);
        if (anchorExpr && value != null) {
          const anchor = extractAnchor(anchorExpr);
          const loc = anchor.locator || "-";
          const label = anchor.label || (isCodeMirrorLocator(loc) ? "CodeMirror" : anchor.componentType) || "CodeMirror";
          const s = applyBlock(makeStep(++stepId, "fill", `${label} \uC785\uB825`, loc, value));
          if (anchor.target) s.target = anchor.target;
          else if (loc.startsWith("xpath=")) s.target = { kind: "xpath", selector: loc };
          s.assertion = {
            ...s.assertion,
            enabled: false,
            componentType: "codemirror"
          };
          attachRuntimeExport(s, trimmed);
          s.timeout = extractTimeoutOption(trimmed) ?? s.timeout;
          steps.push(s);
          continue;
        }
      }
      const gotoValue = captureFirstStringArg(trimmed, "page\\.goto");
      if (gotoValue != null) {
        const s = applyBlock(makeStep(++stepId, "goto", `${gotoValue} \uC774\uB3D9`, "-", gotoValue));
        s.timeout = extractTimeoutOption(trimmed) ?? s.timeout;
        steps.push(s);
        continue;
      }
      if (/waitForEvent\(\s*['"]filechooser['"]/.test(trimmed)) {
        if (/\.click\(/.test(trimmed) && /\.setFiles\(/.test(trimmed)) {
          const { anchor, mode } = normalizeUploadAnchor(extractAnchor(trimmed));
          const value = captureFileUploadValue(trimmed, "setFiles");
          const s = applyBlock(makeStep(
            ++stepId,
            "upload",
            buildStepTitle("upload", anchor, value),
            anchor.locator || "-",
            value || "-"
          ));
          if (anchor.target) s.target = anchor.target;
          if (anchor.componentType) {
            s.assertion = { ...s.assertion, enabled: false, componentType: anchor.componentType };
          }
          s.upload = { mode };
          s.timeout = extractTimeoutOption(trimmed) ?? s.timeout;
          steps.push(s);
          continue;
        }
        const clickIdx = peekNextSignificantLineIndex(lines, i);
        const chooserIdx = clickIdx >= 0 ? peekNextSignificantLineIndex(lines, clickIdx) : -1;
        const setIdx = chooserIdx >= 0 ? peekNextSignificantLineIndex(lines, chooserIdx) : -1;
        const clickLine = clickIdx >= 0 ? lines[clickIdx].trim() : "";
        const setLine = setIdx >= 0 ? lines[setIdx].trim() : "";
        if (/\.click\(/.test(clickLine) && /\.setFiles\(/.test(setLine)) {
          const { anchor, mode } = normalizeUploadAnchor(extractAnchor(clickLine));
          const value = captureFileUploadValue(setLine, "setFiles");
          const s = applyBlock(makeStep(
            ++stepId,
            "upload",
            buildStepTitle("upload", anchor, value),
            anchor.locator || "-",
            value || "-"
          ));
          if (anchor.target) s.target = anchor.target;
          if (anchor.componentType) {
            s.assertion = { ...s.assertion, enabled: false, componentType: anchor.componentType };
          }
          s.upload = { mode };
          s.timeout = extractTimeoutOption(trimmed) ?? extractTimeoutOption(clickLine) ?? extractTimeoutOption(setLine) ?? s.timeout;
          steps.push(s);
          i = setIdx;
          continue;
        }
      }
      const actMatch = trimmed.match(/\.(fill|type|click|press|selectOption|setInputFiles|check|uncheck)\(/);
      if (actMatch) {
        const action = actMatch[1];
        if (action === "click") {
          const nextIdx = peekNextSignificantLineIndex(lines, i);
          if (nextIdx >= 0) {
            const nextTrim = lines[nextIdx].trim();
            if (/\.setInputFiles\(/.test(nextTrim)) {
              const rawAnchor = extractAnchor(trimmed);
              const { anchor: anchor2, mode } = normalizeUploadAnchor(rawAnchor);
              const value2 = captureFileUploadValue(nextTrim, "setInputFiles");
              const s2 = applyBlock(makeStep(
                ++stepId,
                "upload",
                buildStepTitle("upload", anchor2, value2),
                anchor2.locator || "-",
                value2 || "-"
              ));
              if (anchor2.target) s2.target = anchor2.target;
              if (anchor2.componentType) {
                s2.assertion = { ...s2.assertion, enabled: false, componentType: anchor2.componentType };
              }
              s2.upload = { mode };
              s2.timeout = extractTimeoutOption(trimmed) ?? extractTimeoutOption(nextTrim) ?? s2.timeout;
              steps.push(s2);
              i = nextIdx;
              continue;
            }
            if (isAntdSelectHostOptionClickPair(trimmed, nextTrim)) {
              const hostAnchor = extractAnchor(trimmed);
              const value2 = extractAntdOptionLabel(nextTrim) ?? "";
              if (value2) {
                const hostLabel = hostAnchor.label ?? hostAnchor.componentType ?? "AntD Select";
                const title2 = `${hostLabel}: ${value2} \uC120\uD0DD`;
                const s2 = applyBlock(makeStep(
                  ++stepId,
                  "antdSelect",
                  title2,
                  hostAnchor.locator || "-",
                  value2
                ));
                if (hostAnchor.target) {
                  s2.target = hostAnchor.target;
                }
                s2.antd = { by: "auto" };
                steps.push(s2);
                i = nextIdx;
                continue;
              }
            }
          }
        }
        if (action === "click") {
          const optionLabel = extractAntdDropdownTextOption(trimmed);
          const prevIdx = optionLabel ? peekPreviousSignificantLineIndex(lines, i) : -1;
          if (optionLabel && prevIdx >= 0 && isPotentialDropdownHostClickLine(lines[prevIdx].trim())) {
            const locator = antSelectVisibleOptionLocator(optionLabel);
            const s2 = applyBlock(makeStep(
              ++stepId,
              "click",
              `${optionLabel} \uD074\uB9AD`,
              locator,
              "-"
            ));
            s2.target = { kind: "xpath", selector: locator };
            s2.assertion = { ...s2.assertion, enabled: false, componentType: "option" };
            steps.push(s2);
            continue;
          }
        }
        const anchor = extractAnchor(trimmed);
        if ((action === "check" || action === "uncheck" || action === "click") && anchor.label && anchor.label.startsWith(TREMOLO_ROW_LABEL_PREFIX)) {
          const rowText = anchor.label.slice(TREMOLO_ROW_LABEL_PREFIX.length).trim();
          const control = anchor.componentType === "checkbox" ? "checkbox" : anchor.componentType === "radio" ? "radio" : "auto";
          const act = action === "uncheck" ? "uncheck" : action === "click" ? "click" : "check";
          const s2 = applyBlock(makeStep(
            ++stepId,
            "antdTableSelect",
            rowText ? `AntD \uD45C \uD589 \uC120\uD0DD: ${rowText}` : "AntD \uD45C \uD589 \uC120\uD0DD (\uD589 \uC2DD\uBCC4 \uD14D\uC2A4\uD2B8 \uC785\uB825 \uD544\uC694)",
            "-",
            "-"
          ));
          s2.antdTable = { match: rowText ? [rowText] : [], control, action: act };
          steps.push(s2);
          continue;
        }
        if ((action === "check" || action === "uncheck" || action === "click") && isAntdTableSelectionCell(anchor.locator)) {
          const control = antdTableControlOf(anchor.locator);
          const act = action === "uncheck" ? "uncheck" : action === "click" ? "click" : "check";
          const s2 = applyBlock(makeStep(
            ++stepId,
            "antdTableSelect",
            "AntD \uD45C \uD589 \uC120\uD0DD (\uD589 \uC2DD\uBCC4 \uD14D\uC2A4\uD2B8 \uC785\uB825 \uD544\uC694)",
            anchor.locator || "-",
            "-"
          ));
          s2.antdTable = { match: [], control, action: act };
          steps.push(s2);
          continue;
        }
        const value = parseRuntimeInitializer(trimmed) ?? captureFirstStringArg(trimmed, `\\.${action}`) ?? "";
        const stepType = action === "selectOption" ? "select" : action === "setInputFiles" ? "upload" : action;
        const uploadNormalized = stepType === "upload" ? normalizeUploadAnchor(anchor) : null;
        const finalAnchor = uploadNormalized?.anchor ?? anchor;
        let title = buildStepTitle(stepType, finalAnchor, value);
        const loc = finalAnchor.locator || "-";
        const uploadValue = action === "setInputFiles" ? captureFileUploadValue(trimmed, "setInputFiles") : value;
        const val = action === "click" || action === "check" || action === "uncheck" ? "-" : uploadValue || "-";
        const isCodeMirrorClick = stepType === "click" && isCodeMirrorLocator(loc);
        if (isCodeMirrorClick && title === "element \uD074\uB9AD") title = "CodeMirror \uD074\uB9AD";
        const s = applyBlock(makeStep(++stepId, stepType, title, loc, val));
        if (finalAnchor.target) s.target = finalAnchor.target;
        if (finalAnchor.componentType) {
          s.assertion = { ...s.assertion, enabled: false, componentType: finalAnchor.componentType };
        }
        if (isCodeMirrorClick) {
          s.assertion = { ...s.assertion, enabled: false, componentType: "codemirror" };
        }
        if (stepType === "upload") s.upload = { mode: uploadNormalized?.mode ?? "input" };
        attachRuntimeExport(s, trimmed);
        s.timeout = extractTimeoutOption(trimmed) ?? s.timeout;
        steps.push(s);
        continue;
      }
      const expectMatch = trimmed.match(/\bexpect\s*\(.*\)\.(toBeVisible|toBeHidden|toHaveText|toContainText|toHaveValue|toBeChecked|toBeDisabled|toBeEnabled)\s*\(/);
      if (expectMatch) {
        const rawAnchor = extractAssertionAnchor(trimmed);
        const matcher = expectMatch[1];
        const expected = captureFirstStringArg(trimmed, `\\.${matcher}`) ?? void 0;
        const parsed = assertionFromMatcher(matcher, expected);
        const anchor = normalizeTextAssertionAnchor(rawAnchor, parsed);
        const s = applyBlock(makeStep(
          ++stepId,
          "assert",
          assertionTitle(anchor, parsed),
          anchor.locator,
          assertionValue(parsed)
        ));
        if (anchor.target) s.target = anchor.target;
        s.assertion = {
          ...s.assertion,
          enabled: true,
          kind: parsed.kind,
          match: parsed.match,
          expected: parsed.expected ?? "",
          inputValue: parsed.expected ?? "",
          componentType: anchor.componentType ?? "",
          state: parsed.kind ?? ""
        };
        s.timeout = extractTimeoutOption(trimmed) ?? s.timeout;
        steps.push(s);
        continue;
      }
    }
    const normalizedSteps = normalizeAntdSelectStepSequence(
      normalizeLegacyTreeRowControlSteps(normalizeAdjacentInputTargetOrders(normalizeLegacyCodeMirrorPreClicks(steps)))
    );
    if (!options.stripDecorativeSvgTextSuffix) return normalizedSteps;
    return normalizedSteps.map((step) => {
      if (!step.target) return step;
      const target = normalizeLocatorTargetText(step.target);
      return { ...step, target, locator: formatTargetAsLocatorString(target) };
    });
  } finally {
    activeParseSpecOptions = previousParseSpecOptions;
  }
}
function makeStep(id, type, title, locator, value) {
  return {
    id: `s${id}`,
    type,
    title,
    locator,
    value,
    timeout: DEFAULT_STEP_TIMEOUT_MS,
    waitCondition: "visible",
    screenshot: "on_failure",
    onFailure: "fail",
    retry: { enabled: false, count: 3 },
    assertion: { enabled: type === "assert", kind: type === "assert" ? "visible" : void 0, inputValue: "", expected: "", componentType: "", state: "" },
    note: ""
  };
}
var CHECKABLE_ROLES = /* @__PURE__ */ new Set([
  "checkbox",
  "radio",
  "menuitemcheckbox",
  "menuitemradio",
  "switch"
]);
function getStepRole(step) {
  if (step.target?.kind === "role") return step.target.role;
  if (step.target?.kind === "chain") {
    const roleTarget = step.target.chain.find((target) => target.kind === "role");
    if (roleTarget?.kind === "role") return roleTarget.role;
  }
  const m = step.locator?.match(/^role=([a-zA-Z0-9_-]+)/);
  return m ? m[1] : null;
}
function legacyAssertionExpected(assertion) {
  const single = assertion.match(/\(\s*'((?:\\'|[^'])*?)'/);
  if (single) return unescapeStringLiteral(single[1]);
  const dbl = assertion.match(/\(\s*"((?:\\"|[^"])*?)"/);
  if (dbl) return unescapeStringLiteral(dbl[1]);
  return "";
}
function renderStepAction(step) {
  const esc = (s) => (s ?? "").replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t");
  const val = esc(step.value);
  const stepTimeout = normalizeStepTimeoutMs(step.timeout);
  const timeoutOption = `{ timeout: ${stepTimeout} }`;
  const hasRuntimeTemplate = (raw) => /\{[A-Z][A-Z0-9_]*\}/.test(raw ?? "") || /\{\{\s*[A-Za-z][A-Za-z0-9_-]{1,31}\s*\}\}/.test(raw ?? "");
  const valueExpression = (raw) => {
    const escaped = esc(raw);
    return hasRuntimeTemplate(raw) ? `resolveRuntimeValue('${escaped}')` : `'${escaped}'`;
  };
  const applyLocatorOrder = (expr, target) => {
    if (target.order === "first") return `${expr}.first()`;
    if (target.order === "nth") {
      const nth = Number.isFinite(target.nth) ? Math.max(0, Math.floor(target.nth ?? 0)) : 0;
      return `${expr}.nth(${nth})`;
    }
    return expr;
  };
  const targetHasRuntimeTemplate = (target) => {
    if (target.kind === "chain") return target.chain.some(targetHasRuntimeTemplate);
    switch (target.kind) {
      case "role":
        return hasRuntimeTemplate(target.name);
      case "text":
        return hasRuntimeTemplate(target.text);
      case "label":
        return hasRuntimeTemplate(target.label);
      case "placeholder":
        return hasRuntimeTemplate(target.placeholder);
      case "title":
        return hasRuntimeTemplate(target.title);
      case "altText":
        return hasRuntimeTemplate(target.alt);
      case "testId":
        return hasRuntimeTemplate(target.testId);
      case "css":
      case "xpath":
        return hasRuntimeTemplate(target.selector);
      default:
        return false;
    }
  };
  const renderSingleTargetExpressionWithRuntime = (target, base) => {
    switch (target.kind) {
      case "role": {
        if (target.name && hasRuntimeTemplate(target.name)) {
          const exactOpt = typeof target.exact === "boolean" ? `, exact: ${target.exact ? "true" : "false"}` : "";
          return applyLocatorOrder(`${base}.getByRole('${esc(target.role)}', { name: ${valueExpression(target.name)}${exactOpt} })`, target);
        }
        return renderTargetExpression(target).replace(/^page/, base);
      }
      case "text":
        if (hasRuntimeTemplate(target.text)) {
          const exactOpt = typeof target.exact === "boolean" ? `, { exact: ${target.exact ? "true" : "false"} }` : "";
          return applyLocatorOrder(`${base}.getByText(${valueExpression(target.text)}${exactOpt})`, target);
        }
        return renderTargetExpression(target).replace(/^page/, base);
      case "label":
        if (hasRuntimeTemplate(target.label)) {
          const exactOpt = typeof target.exact === "boolean" ? `, { exact: ${target.exact ? "true" : "false"} }` : "";
          return applyLocatorOrder(`${base}.getByLabel(${valueExpression(target.label)}${exactOpt})`, target);
        }
        return renderTargetExpression(target).replace(/^page/, base);
      case "placeholder":
        if (hasRuntimeTemplate(target.placeholder)) {
          const exactOpt = typeof target.exact === "boolean" ? `, { exact: ${target.exact ? "true" : "false"} }` : "";
          return applyLocatorOrder(`${base}.getByPlaceholder(${valueExpression(target.placeholder)}${exactOpt})`, target);
        }
        return renderTargetExpression(target).replace(/^page/, base);
      case "title":
        if (hasRuntimeTemplate(target.title)) {
          const exactOpt = typeof target.exact === "boolean" ? `, { exact: ${target.exact ? "true" : "false"} }` : "";
          return applyLocatorOrder(`${base}.getByTitle(${valueExpression(target.title)}${exactOpt})`, target);
        }
        return renderTargetExpression(target).replace(/^page/, base);
      case "altText":
        if (hasRuntimeTemplate(target.alt)) {
          const exactOpt = typeof target.exact === "boolean" ? `, { exact: ${target.exact ? "true" : "false"} }` : "";
          return applyLocatorOrder(`${base}.getByAltText(${valueExpression(target.alt)}${exactOpt})`, target);
        }
        return renderTargetExpression(target).replace(/^page/, base);
      case "testId":
        if (hasRuntimeTemplate(target.testId)) {
          return applyLocatorOrder(`${base}.getByTestId(${valueExpression(target.testId)})`, target);
        }
        return renderTargetExpression(target).replace(/^page/, base);
      case "css":
      case "xpath":
        if (hasRuntimeTemplate(target.selector)) {
          return applyLocatorOrder(`${base}.locator(${valueExpression(target.selector)})`, target);
        }
        return renderTargetExpression(target).replace(/^page/, base);
      default:
        return renderTargetExpression(target).replace(/^page/, base);
    }
  };
  const renderLocatorExpressionWithRuntime = (target) => {
    if (!targetHasRuntimeTemplate(target)) return renderTargetExpression(target);
    if (target.kind === "chain") {
      if (target.chain.length === 0) return `page.locator('')`;
      const [first, ...rest] = target.chain;
      return rest.reduce((expr, child) => renderSingleTargetExpressionWithRuntime(child, expr), renderSingleTargetExpressionWithRuntime(first, "page"));
    }
    return renderSingleTargetExpressionWithRuntime(target, "page");
  };
  const locatorExpr = step.target ? renderLocatorExpressionWithRuntime(step.target) : renderLocatorExpression(step.locator);
  const valExpr = valueExpression(step.value);
  const fileInputExpr = (raw) => {
    const files = splitFileUploadValue(raw);
    if (files.length > 1) return `[${files.map(valueExpression).join(", ")}]`;
    return valueExpression(files[0] ?? raw ?? "");
  };
  const runtimeAlias = (step.runtime?.saveAs ?? "").trim();
  const runtimeScope = step.runtime?.scope ?? "runSet";
  const runtimeExportOptions = `{ scope: '${runtimeScope}', source: { stepId: '${esc(step.id)}', title: '${esc(step.title)}' } }`;
  const exportResolvedValue = (valueVar) => runtimeAlias ? ` exportRuntimeValue('${esc(runtimeAlias)}', ${valueVar}, ${runtimeExportOptions});` : "";
  const renderAssertion = () => {
    const assertion = step.assertion;
    const expected = assertion?.expected || assertion?.inputValue || legacyAssertionExpected(step.value || "");
    const kind = assertion?.kind || assertion?.state || "";
    const match = assertion?.match;
    if (kind === "visible") return `await expect(${locatorExpr}).toBeVisible(${timeoutOption});`;
    if (kind === "hidden") return `${hiddenAssertionReadinessCall(stepTimeout)} await expect(${locatorExpr}).toBeHidden(${timeoutOption});`;
    if (kind === "text") {
      const textTarget = hasRuntimeTemplate(expected) ? null : textAssertionVisibilityTarget(step.target, step.locator, expected, match);
      if (textTarget) return `await expect(${renderTargetExpression(textTarget)}).toBeVisible(${timeoutOption});`;
      const matcher = match === "equals" ? "toHaveText" : "toContainText";
      return `await expect(${locatorExpr}).${matcher}(${valueExpression(expected)}, ${timeoutOption});`;
    }
    if (kind === "value") return `await expect(${locatorExpr}).toHaveValue(${valueExpression(expected)}, ${timeoutOption});`;
    if (kind === "checked") return `await expect(${locatorExpr}).toBeChecked(${timeoutOption});`;
    if (kind === "disabled") return `await expect(${disabledAssertionTargetExpression(locatorExpr)}).toBeDisabled(${timeoutOption});`;
    if (kind === "enabled") return `await expect(${enabledAssertionTargetExpression(locatorExpr)}).toBeEnabled(${timeoutOption});`;
    if (/^to[A-Z]\w*\(.*\)$/.test(step.value || "")) return `await expect(${locatorExpr}).${step.value};`;
    if (expected) return `await expect(${locatorExpr}).toHaveValue(${valueExpression(expected)}, ${timeoutOption});`;
    return `await expect(${locatorExpr}).toBeVisible(${timeoutOption});`;
  };
  switch (step.type) {
    case "goto":
      return `await page.goto(${valExpr}, ${timeoutOption});`;
    case "fill": {
      if (runtimeAlias) {
        if (step.assertion?.componentType === "monaco") {
          return `await (async () => { const __tmloValue = ${valExpr}; await fillMonaco(${locatorExpr}, __tmloValue, ${timeoutOption});${exportResolvedValue("__tmloValue")} })();`;
        }
        return step.assertion?.componentType === "codemirror" ? `await (async () => { const __tmloValue = ${valExpr}; await fillCodeMirror(${locatorExpr}, __tmloValue, ${timeoutOption});${exportResolvedValue("__tmloValue")} })();` : `await (async () => { const __tmloValue = ${valExpr}; await ${locatorExpr}.fill(__tmloValue, ${timeoutOption});${exportResolvedValue("__tmloValue")} })();`;
      }
      if (step.assertion?.componentType === "monaco") {
        return `await fillMonaco(${locatorExpr}, ${valExpr}, ${timeoutOption});`;
      }
      return step.assertion?.componentType === "codemirror" ? `await fillCodeMirror(${locatorExpr}, ${valExpr}, ${timeoutOption});` : `await ${locatorExpr}.fill(${valExpr}, ${timeoutOption});`;
    }
    case "type":
      return runtimeAlias ? `await (async () => { const __tmloValue = ${valExpr}; await ${locatorExpr}.type(__tmloValue, ${timeoutOption});${exportResolvedValue("__tmloValue")} })();` : `await ${locatorExpr}.type(${valExpr}, ${timeoutOption});`;
    case "click":
      if ((!step.target || !targetHasRuntimeTemplate(step.target)) && hasRuntimeTemplate(step.value) && step.value && step.value !== "-") {
        const exact = step.target?.kind === "text" && typeof step.target.exact === "boolean" ? step.target.exact : true;
        const orderTarget = step.target?.kind === "text" ? step.target : void 0;
        const dynamicTextExpr = applyLocatorOrder(`page.getByText(${valExpr}, { exact: ${exact ? "true" : "false"} })`, orderTarget ?? { kind: "text", text: "" });
        return `await (async () => { const target = ${dynamicTextExpr}; await target.click(${timeoutOption}).catch(async (e: unknown) => { if (!/strict mode violation/i.test(String((e as Error)?.message || e))) throw e; await target.filter({ visible: true }).last().click(${timeoutOption}); }); })();`;
      }
      if (step.target?.kind === "text") {
        const menuAncestor = `target.locator('xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " ant-menu-submenu-title ") or contains(concat(" ", normalize-space(@class), " "), " ant-menu-item ")][1]')`;
        return `await (async () => { const target = ${locatorExpr}; const menuTarget = ${menuAncestor}; const visibleMenuTarget = menuTarget.filter({ visible: true }); if ((await visibleMenuTarget.count().catch(() => 0)) > 0) { await visibleMenuTarget.last().click(${timeoutOption}); return; } await target.click(${timeoutOption}).catch(async (e: unknown) => { if (!/strict mode violation/i.test(String((e as Error)?.message || e))) throw e; await target.filter({ visible: true }).last().click(${timeoutOption}); }); })();`;
      }
      if (step.target?.kind === "role" && step.target.role === "button") {
        return `await ${locatorExpr}.click(${timeoutOption}).catch(async (e: unknown) => { if (!/strict mode violation/i.test(String((e as Error)?.message || e))) throw e; await ${locatorExpr}.filter({ visible: true }).last().click(${timeoutOption}); });`;
      }
      return `await ${locatorExpr}.click(${timeoutOption});`;
    case "press":
      return `await ${locatorExpr}.press('${val}', ${timeoutOption});`;
    case "select":
      return runtimeAlias ? `await (async () => { const __tmloValue = ${valExpr}; await ${locatorExpr}.selectOption(__tmloValue, ${timeoutOption});${exportResolvedValue("__tmloValue")} })();` : `await ${locatorExpr}.selectOption(${valExpr}, ${timeoutOption});`;
    case "upload": {
      const filesExpr = fileInputExpr(step.value);
      if (step.upload?.mode === "chooser") {
        return `await (async () => { const fileChooserPromise = page.waitForEvent('filechooser', ${timeoutOption}); await ${locatorExpr}.click(${timeoutOption}); const fileChooser = await fileChooserPromise; await fileChooser.setFiles(${filesExpr}); })();`;
      }
      return `await ${locatorExpr}.setInputFiles(${filesExpr}, ${timeoutOption});`;
    }
    case "check":
    case "uncheck": {
      const role = getStepRole(step);
      if (role && !CHECKABLE_ROLES.has(role)) {
        return `await ${locatorExpr}.locator('input[type="checkbox"], input[type="radio"]').first().${step.type}(${timeoutOption});`;
      }
      return `await ${locatorExpr}.${step.type}(${timeoutOption});`;
    }
    case "scroll":
      return `await ${locatorExpr}.scrollIntoViewIfNeeded(${timeoutOption});`;
    case "assert":
      return step.assertion?.enabled === false ? "" : renderAssertion();
    case "antdSelect": {
      const antd = step.antd ?? {};
      const by = antd.by === "label" && (!antd.label || antd.label === "TODO_LABEL") ? "auto" : antd.by ?? "auto";
      const fields = [];
      const pushStr = (k, v) => fields.push(`${k}: '${esc(v)}'`);
      const pushVal = (k, v) => fields.push(`${k}: ${valueExpression(v)}`);
      if (by === "auto") {
        fields.push(`by: 'auto'`);
        if (step.locator && step.locator !== "-") fields.push(`root: ${locatorExpr}`);
        pushVal("option", step.value ?? "");
        if (antd.expectedLabel) pushVal("expectedLabel", antd.expectedLabel);
      } else if (by === "label") {
        const lbl = antd.label ?? "TODO_LABEL";
        fields.push(`by: 'label'`);
        pushVal("label", lbl);
        pushVal("option", step.value ?? "");
      } else if (by === "rank") {
        fields.push(`by: 'rank'`);
        fields.push(`rank: ${antd.rank ?? 0}`);
        if (antd.scopeLocator) fields.push(`scope: ${antd.scopeLocator}`);
        if (antd.expectedLabel) pushVal("expectedLabel", antd.expectedLabel);
        pushVal("option", step.value ?? "");
      } else {
        fields.push(`by: 'root'`);
        fields.push(`root: ${locatorExpr}`);
        pushVal("option", step.value ?? "");
        if (antd.expectedLabel) pushVal("expectedLabel", antd.expectedLabel);
      }
      if (antd.search) fields.push(`search: true`);
      if (antd.searchText) pushVal("searchText", antd.searchText);
      if (antd.allowVirtualScrollFallback === false) fields.push(`allowVirtualScrollFallback: false`);
      fields.push(`timeout: ${stepTimeout}`);
      return runtimeAlias ? `await (async () => { const __tmloValue = ${valueExpression(step.value)}; await selectAntdOption(page, { ${fields.map((field) => field.startsWith("option: ") ? "option: __tmloValue" : field).join(", ")} });${exportResolvedValue("__tmloValue")} })();` : `await selectAntdOption(page, { ${fields.join(", ")} });`;
    }
    case "antdTableSelect": {
      const t = step.antdTable ?? { match: [] };
      const matchArr = (t.match ?? []).map((m) => valueExpression(m)).join(", ");
      const fields = [`match: [${matchArr}]`];
      if (t.control && t.control !== "auto") fields.push(`control: '${t.control}'`);
      if (t.action && t.action !== "check") fields.push(`action: '${t.action}'`);
      fields.push(`timeout: ${stepTimeout}`);
      return `await selectAntdTableRow(page, { ${fields.join(", ")} });`;
    }
    default:
      return "";
  }
}
function renderLocatorExpression(locator) {
  const esc = (s) => s.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
  if (!locator || locator === "-") return `page.locator('${esc(locator || "")}')`;
  const role = locator.match(/^role=([a-zA-Z0-9_-]+)(?:\[name=(?:"((?:\\"|[^"])*?)"|'((?:\\'|[^'])*?)')\s*\])?$/);
  if (role) {
    const name = role[2] ?? role[3];
    if (name != null) {
      const cleanName = name.replace(/\\(['"])/g, "$1");
      return `page.getByRole('${esc(role[1])}', { name: '${esc(cleanName)}' })`;
    }
    return `page.getByRole('${esc(role[1])}')`;
  }
  const simple = locator.match(/^(text|placeholder|label|title|alt|testid)=(?:"((?:\\"|[^"])*?)"|'((?:\\'|[^'])*?)')$/);
  if (simple) {
    const kind = simple[1];
    const raw = (simple[2] ?? simple[3] ?? "").replace(/\\(['"])/g, "$1");
    const fn = kind === "text" ? "getByText" : kind === "placeholder" ? "getByPlaceholder" : kind === "label" ? "getByLabel" : kind === "title" ? "getByTitle" : kind === "alt" ? "getByAltText" : "getByTestId";
    return `page.${fn}('${esc(raw)}')`;
  }
  return `page.locator('${esc(locator)}')`;
}
function generateSpecFromSteps(steps, scenarioName) {
  const usesAntdSelect = steps.some((s) => s.type === "antdSelect");
  const usesAntdTableSelect = steps.some((s) => s.type === "antdTableSelect");
  const usesCodeMirrorFill = steps.some(
    (s) => s.type === "fill" && s.assertion?.componentType === "codemirror"
  );
  const usesMonacoFill = steps.some(
    (s) => s.type === "fill" && s.assertion?.componentType === "monaco"
  );
  const usesHiddenAssertion = steps.some((s) => {
    const kind = s.assertion?.kind || s.assertion?.state;
    return s.type === "assert" && s.assertion?.enabled !== false && kind === "hidden";
  });
  const usesStepRetry = steps.some(
    (s) => !!s.retry?.enabled && Number.isFinite(Number(s.retry.count)) && Number(s.retry.count) > 0
  );
  const runtimeTemplateRe = /\{[A-Z][A-Z0-9_]*\}|\{\{\s*[A-Za-z][A-Za-z0-9_-]{1,31}\s*\}\}/;
  const targetUsesRuntimeValue = (target) => {
    if (!target) return false;
    if (target.kind === "chain") return target.chain.some((item) => targetUsesRuntimeValue(item));
    switch (target.kind) {
      case "role":
        return runtimeTemplateRe.test(target.name ?? "");
      case "text":
        return runtimeTemplateRe.test(target.text);
      case "label":
        return runtimeTemplateRe.test(target.label);
      case "placeholder":
        return runtimeTemplateRe.test(target.placeholder);
      case "title":
        return runtimeTemplateRe.test(target.title);
      case "altText":
        return runtimeTemplateRe.test(target.alt);
      case "testId":
        return runtimeTemplateRe.test(target.testId);
      case "css":
      case "xpath":
        return runtimeTemplateRe.test(target.selector);
      default:
        return false;
    }
  };
  const usesRuntimeValues = steps.some(
    (s) => !!s.runtime?.saveAs || typeof s.locator === "string" && runtimeTemplateRe.test(s.locator) || typeof s.value === "string" && runtimeTemplateRe.test(s.value) || targetUsesRuntimeValue(s.target) || typeof s.assertion?.expected === "string" && runtimeTemplateRe.test(s.assertion.expected) || typeof s.assertion?.inputValue === "string" && runtimeTemplateRe.test(s.assertion.inputValue) || typeof s.assertion?.sourceValue === "string" && runtimeTemplateRe.test(s.assertion.sourceValue) || (s.antdTable?.match ?? []).some((m) => runtimeTemplateRe.test(m)) || typeof s.antd?.label === "string" && runtimeTemplateRe.test(s.antd.label) || typeof s.antd?.expectedLabel === "string" && runtimeTemplateRe.test(s.antd.expectedLabel) || typeof s.antd?.searchText === "string" && runtimeTemplateRe.test(s.antd.searchText)
  );
  const escStepTitle = (s) => s.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/\r/g, "\\r").replace(/\n/g, "\\n").replace(/\t/g, "\\t");
  const lines = [
    `import { test, expect } from '@playwright/test';`
  ];
  if (usesAntdSelect) {
    lines.push(`import { selectAntdOption } from '../../_helpers/antdSelect';`);
  }
  if (usesAntdTableSelect) {
    lines.push(`import { selectAntdTableRow } from '../../_helpers/antdTableRow';`);
  }
  if (usesCodeMirrorFill) {
    lines.push(`import { fillCodeMirror } from '../../_helpers/codeMirror';`);
  }
  if (usesMonacoFill) {
    lines.push(`import { fillMonaco } from '../../_helpers/monaco';`);
  }
  if (usesRuntimeValues) {
    lines.push(`import { resolveRuntimeValue, exportRuntimeValue } from '../../_helpers/dynamicValue';`);
  }
  lines.push("");
  if (usesHiddenAssertion) {
    lines.push(hiddenAssertionReadinessHelperText());
    lines.push("");
  }
  lines.push(`test('${escStepTitle(scenarioName)}', async ({ page }, testInfo) => {`);
  if (usesStepRetry) {
    lines.push(`  const runTmloStepWithRetry = async (action: () => Promise<void>, retryCount: number, stepLabel: string) => {`);
    lines.push(`    const retries = Math.max(0, Math.floor(Number(retryCount) || 0));`);
    lines.push(`    let lastError: unknown;`);
    lines.push(`    for (let attempt = 0; attempt <= retries; attempt += 1) {`);
    lines.push(`      try {`);
    lines.push(`        await action();`);
    lines.push(`        return;`);
    lines.push(`      } catch (e) {`);
    lines.push(`        lastError = e;`);
    lines.push(`        if (attempt >= retries) break;`);
    lines.push(`        const message = e && (e as Error).message ? (e as Error).message : String(e);`);
    lines.push(`        console.warn('[retry] ' + stepLabel + ' failed; retry ' + (attempt + 1) + '/' + retries + ': ' + message);`);
    lines.push(`        await page.waitForTimeout(500);`);
    lines.push(`      }`);
    lines.push(`    }`);
    lines.push(`    throw lastError;`);
    lines.push(`  };`);
    lines.push("");
  }
  let openBlockId = null;
  let logicalStepNo = 0;
  for (const step of steps) {
    logicalStepNo += 1;
    if (step.blockId && step.blockId !== openBlockId) {
      if (openBlockId) lines.push(`  // @block-end`);
      const label = step.blockName ? ` ${step.blockName}` : "";
      lines.push(`  // @block-start id=${step.blockId}${label}`);
      openBlockId = step.blockId;
    } else if (!step.blockId && openBlockId) {
      lines.push(`  // @block-end`);
      openBlockId = null;
    }
    const comment = `  // ${step.title}`;
    lines.push(comment);
    if (step.type === "antdSelect") {
      const antd = step.antd ?? {};
      if (antd.by === "rank" && !antd.expectedLabel) {
        lines.push(`  // WARNING[antdSelect]: rank \uAE30\uBC18\uC740 expectedLabel \uC5C6\uC774\uB294 \uC798\uBABB\uB41C Select \uB97C silent \uD558\uAC8C \uC120\uD0DD\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.`);
      }
    }
    const action = renderStepAction(step);
    const markerTitle = `[TMLO:${logicalStepNo}] ${step.title || step.type}`;
    const stepRetryCount = step.retry?.enabled ? Math.max(0, Math.floor(Number(step.retry.count) || 0)) : 0;
    const actionWithRetry = stepRetryCount > 0 ? `await runTmloStepWithRetry(async () => { ${action} }, ${stepRetryCount}, ${JSON.stringify(markerTitle)});` : action;
    const shotMode = step.screenshot ?? "on_failure";
    const screenshotLine = `await page.screenshot({ path: testInfo.outputPath('step-${step.id}.png') }).catch((e) => console.warn('[screenshot] step #${step.id}: ' + (e && (e.message || e))));`;
    const failShotLine = `await page.screenshot({ path: testInfo.outputPath('step-${step.id}-failed.png') }).catch((e2) => console.warn('[screenshot] step #${step.id}: ' + (e2 && (e2.message || e2))));`;
    lines.push(`  await test.step('${escStepTitle(markerTitle)}', async () => {`);
    if (action) {
      if (step.onFailure === "continue") {
        lines.push(`    try {`);
        lines.push(`      ${actionWithRetry}`);
        lines.push(`    } catch (e) {`);
        if (shotMode === "on_failure") {
          lines.push(`      ${failShotLine}`);
        }
        lines.push(`      console.warn('[onFailure=continue] step #${step.id}: ' + (e && (e.message || e)));`);
        lines.push(`      console.log('__TMLO__' + JSON.stringify({ type: 'step:warning', stepId: ${JSON.stringify(step.id)}, stepNo: ${logicalStepNo}, testTitle: ${JSON.stringify(scenarioName)}, title: ${JSON.stringify(step.title || step.type)}, error: e && (e.message || e) ? String(e.message || e) : '' }));`);
        lines.push(`    }`);
      } else if (shotMode === "always") {
        lines.push(`    try {`);
        lines.push(`      ${actionWithRetry}`);
        lines.push(`    } finally {`);
        lines.push(`      ${screenshotLine}`);
        lines.push(`    }`);
      } else if (shotMode === "on_failure") {
        lines.push(`    try {`);
        lines.push(`      ${actionWithRetry}`);
        lines.push(`    } catch (e) {`);
        lines.push(`      ${failShotLine}`);
        lines.push(`      throw e;`);
        lines.push(`    }`);
      } else {
        lines.push(`    ${actionWithRetry}`);
      }
    } else {
      lines.push(`    // no-op`);
    }
    if (shotMode === "always") {
      if (!action || step.onFailure === "continue") {
        lines.push(`    ${screenshotLine}`);
      }
    }
    lines.push(`  });`);
    lines.push("");
  }
  if (openBlockId) {
    lines.push(`  // @block-end`);
  }
  lines.push("});");
  lines.push("");
  return lines.join("\n");
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  generateSpecFromSteps,
  makeScenarioStableId,
  parseSpecToSteps
});
