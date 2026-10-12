# -*- coding: utf-8 -*-
"""VIOLA V4.0 저작 DSL — steps.json 생성용 소형 빌더.
각 시나리오: sc = Sc(name); sc.goto(...); sc.vis(...); ... ; sc.save()  →  steps/<name>.steps.json 경로를 stdout 에 출력.
note 규약: "[예측] <근거> · 커버 TC: TC_VIO_xxxx"  (실측은 ground --write 가 [실측] 으로 스탬프)
"""
import json, os, sys

SOL, VER = "VIOLA", "V4.0"
BASE = "https://example.invalid/env-2"
OUT = os.environ.get("VIOLA_STEPS_DIR") or os.path.join(os.environ.get("TREMOLO_PROJECT") or os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "steps")
PRED = "[예측] walk 덤프 기반(400tst)"


def C(c):
    return f'contains(concat(" ", normalize-space(@class), " "), " {c} ")'


def q(s):  # xpath 문자열 리터럴
    return '"' + s + '"' if '"' not in s else "'" + s + "'"


# ── 대상(target) ─────────────────────────────────────────────
def tid(x):
    return {"kind": "testId", "testId": x}


def xp(sel, idx=1):
    sel = sel[6:] if sel.startswith("xpath=") else sel
    if idx is not None and not sel.startswith("("):
        sel = f"({sel})[{idx}]"
    return {"kind": "xpath", "selector": "xpath=" + sel}


def css(sel):
    return {"kind": "css", "selector": sel}


def text(t, order=None, exact=True):
    d = {"kind": "text", "text": t, "exact": exact}
    if order:
        d["order"] = order
    return d


def role(r, n, exact=True, order=None):
    d = {"kind": "role", "role": r, "name": n, "exact": exact}
    if order:
        d["order"] = order
    return d


def legacy(t):
    k = t["kind"]
    if k == "testId": return f"testid={t['testId']}"
    if k in ("xpath", "css"): return t["selector"]
    if k == "text": return f'text="{t["text"]}"'
    if k == "role": return f'role={t["role"]}[name="{t["name"]}"]'
    return "-"


def vis_xp(sel):  # 보이는 요소만 (숨은 탭·드롭다운 제외) → css 가 아닌 xpath 에선 불가하므로 활성 패널로 한정해 쓴다
    return sel


ACTIVE_PANE = f'//*[{C("ant-tabs-tabpane-active")}]'


class Sc:
    def __init__(self, name, desc=""):
        self.name, self.desc, self.steps, self.n = name, desc, [], 7
        self.tcs = []

    # 기본 스텝
    def _add(self, typ, title, target=None, value="-", assertion=None, tc=None, note=None, timeout=15000, retry=False, extra=None):
        tcs = [tc] if isinstance(tc, str) else list(tc or [])
        for t in tcs:
            if t not in self.tcs: self.tcs.append(t)
        n = (note or PRED) + ((" · 커버 TC: " + " / ".join(tcs)) if tcs else " (검증 스텝 아님 — setup)")
        s = {"id": f"s{self.n}", "type": typ, "title": title, "locator": legacy(target) if target else "-", "value": value,
             "timeout": timeout, "waitCondition": "visible", "screenshot": "on_failure", "onFailure": "fail",
             "retry": {"enabled": retry, "count": 3},
             "assertion": assertion or {"enabled": False, "inputValue": "", "expected": "", "componentType": "", "state": ""},
             "note": n}
        if target: s["target"] = target
        if extra: s.update(extra)
        self.steps.append(s); self.n += 1
        return s

    def goto(self, path, title=None):
        url = path if path.startswith("http") else BASE + path
        return self._add("goto", title or f"{path} 이동", None, url, note="고정 URL", timeout=30000)

    def click(self, title, t, tc=None, note=None, timeout=15000):
        return self._add("click", title, t, tc=tc, note=note, timeout=timeout)

    def fill(self, title, t, value, tc=None, note=None, save_as=None):
        ex = {"runtime": {"saveAs": save_as}} if save_as else None
        return self._add("fill", title, t, value, tc=tc, note=note, extra=ex)

    def press(self, title, t, key, tc=None, note=None):
        return self._add("press", title, t, key, tc=tc, note=note)

    def check(self, title, t, tc=None, note=None):
        return self._add("check", title, t, tc=tc, note=note)

    def _as(self, kind, state="", expected="", match=None):
        a = {"enabled": True, "kind": kind, "inputValue": "", "expected": expected, "componentType": "", "state": state}
        if match: a["match"] = match
        return a

    def vis(self, title, t, tc=None, note=None, timeout=30000):
        return self._add("assert", title, t, "toBeVisible()", self._as("visible", "visible"), tc, note, timeout, True)

    def hid(self, title, t, tc=None, note=None, timeout=15000):
        return self._add("assert", title, t, "toBeHidden()", self._as("hidden", "hidden"), tc, note, timeout, True)

    def txt(self, title, t, s, tc=None, note=None, timeout=30000):
        return self._add("assert", title, t, f"toContainText('{s}')", self._as("text", "text", s, "contains"), tc, note, timeout, True)

    def enabled(self, title, t, tc=None, note=None):
        return self._add("assert", title, t, "toBeEnabled()", self._as("enabled", "enabled"), tc, note, 30000, True)

    def disabled(self, title, t, tc=None, note=None):
        return self._add("assert", title, t, "toBeDisabled()", self._as("disabled", "disabled"), tc, note, 30000, True)

    def checked(self, title, t, tc=None, note=None):
        return self._add("assert", title, t, "toBeChecked()", self._as("checked", "checked"), tc, note, 30000, True)

    def value(self, title, t, v, tc=None, note=None):
        return self._add("assert", title, t, f"toHaveValue('{v}')", self._as("value", "value", v), tc, note, 30000, True)

    def save(self):
        os.makedirs(OUT, exist_ok=True)
        p = os.path.join(OUT, self.name + ".steps.json")
        with open(p, "w", encoding="utf-8") as f:
            json.dump({"name": self.name, "solution": SOL, "version": VER, "steps": self.steps}, f, ensure_ascii=False, indent=1)
        print(p)
        return p


# ── 커버리지(자동화 불가/보류 TC) 기록 ──────────────────────────
GAPS = []


def gap(tc, tag, why):
    for t in ([tc] if isinstance(tc, str) else tc):
        GAPS.append({"tc": t, "tag": tag, "why": why})


def write_coverage(scs, path):
    cov = {"scenarios": {s.name: s.tcs for s in scs}, "gaps": GAPS}
    with open(path, "w", encoding="utf-8") as f:
        json.dump(cov, f, ensure_ascii=False, indent=1)
