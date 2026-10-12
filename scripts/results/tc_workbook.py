#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
tc_workbook.py — TC 워크북을 **인입 파일 기준**으로 읽는 공용 헬퍼 (컬럼 인덱스 하드코딩 금지).

왜: 워크북마다 앞쪽 빈 컬럼 유무·시트명·부가 컬럼이 달라 컬럼의 '위치(index)'가 흔들린다
    (예: v3.0.6은 맨 앞 빈 컬럼 때문에 `기능테스트 ID`가 index 2, v4.0은 index 1).
    헤더 '이름'은 두 파일이 동일하므로, **행1 헤더를 읽어 이름으로 컬럼을 해석**하면 형식에 무관해진다.

제공:
  - find_workbook(path=None, root=None)   -> 워크북 경로 자동 탐색
  - pick_sheet(wb, prefer=None)           -> TC 시트 자동 감지(openpyxl Workbook)
  - resolve_columns(ws)                   -> {정규필드: 1-based 컬럼} (헤더 이름 기반)
  - load_tcs(path=None, sheet=None)       -> 정규화된 TC dict 리스트 (LLM 작성 시 사용)

의존성: Python 3 + openpyxl
"""
import os, re, glob

# 정규필드 -> 허용 헤더 별칭(정규화 후 비교: 공백제거 + 소문자 + 꼬리 기호 제거)
FIELD_ALIASES = {
    "id":        ["기능테스트id", "테스트id", "tcid", "tc id"],
    "featureId": ["기능id"],
    "screenId":  ["화면id"],
    "priority":  ["우선순위"],
    "portal":    ["포탈"],
    "solution":  ["솔루션"],
    "depth1":    ["depth1"],
    "depth2":    ["depth2"],
    "depth3":    ["depth3"],
    "depth4":    ["depth4"],
    "area":      ["영역"],
    "precond":   ["사전조건", "전제조건"],
    "testdata":  ["테스트데이터", "데이터"],
    "steps":     ["절차", "테스트절차", "수행절차"],
    "expected":  ["예상결과", "기대결과"],
    "result":    ["테스트결과", "결과"],
    "tester":    ["수행자", "테스터"],
    "date":      ["수행일자", "수행일"],
    "remark":    ["비고"],
}


def _norm(s):
    """헤더 비교용 정규화: str화 → 공백 전부 제거 → 소문자 → 꼬리 기호(` * . 등) 제거."""
    if s is None:
        return ""
    t = re.sub(r"\s+", "", str(s)).lower()
    return t.strip("`*.-_:")


def _row_cells(ws, r):
    for row in ws.iter_rows(min_row=r, max_row=r):
        # read_only 빈 시트는 .column 없는 EmptyCell을 주므로 위치는 enumerate로 매긴다.
        return [(i, getattr(c, "value", None)) for i, c in enumerate(row, start=1)]
    return []


def find_header_row(ws, max_scan=10):
    """헤더 행 번호. 워크북에 따라 1행(v3.0.6·v4.0 원본) 또는 2행(v3.0.5, 위에 안내 문구가 있는 시트)이라
    상단 max_scan 행에서 '기능테스트 ID' 류 헤더가 있는 첫 행을 찾는다. 없으면 1."""
    ids = {_norm(x) for x in FIELD_ALIASES["id"]}
    for r in range(1, max_scan + 1):
        if any(_norm(v) in ids for _, v in _row_cells(ws, r) if v):
            return r
    return 1


def _header_cells(ws, row=None):
    """헤더 행 셀을 (1-based 컬럼번호, 값) 리스트로 반환. row 미지정 시 헤더 행 자동 감지."""
    return _row_cells(ws, row or find_header_row(ws))


def find_workbook(path=None, root=None):
    """명시 경로가 있으면 그대로, 없으면 흔한 위치에서 *.xlsx TC 워크북을 찾는다."""
    if path and os.path.exists(path):
        return path
    root = root or os.getcwd()
    patterns = [
        os.path.join(root, "workspace_claude", "*TC*.xlsx"),
        os.path.join(root, "workspace_claude", "*테스트*.xlsx"),
        os.path.join(root, "data", "*.xlsx"),
        os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "data", "*.xlsx"),
    ]
    hits = []
    for p in patterns:
        hits += [h for h in glob.glob(p) if "~$" not in os.path.basename(h)]
    # 결과 사본(TC_결과_*.xlsx)은 제외
    hits = [h for h in hits if not os.path.basename(h).startswith("TC_결과")]
    return hits[0] if hits else None


def _sheet_score(ws):
    """행1 헤더에 TC 핵심 필드가 얼마나 있는지로 'TC 시트다움'을 점수화."""
    names = {_norm(v) for _, v in _header_cells(ws) if v}
    need = ("id", "steps", "depth1")
    got = 0
    for f in need:
        if any(a in names for a in (_norm(x) for x in FIELD_ALIASES[f])):
            got += 1
    return got


def pick_sheet(wb, prefer=None):
    """
    TC 시트를 고른다. 우선순위:
      1) prefer 로 지정된 시트가 있으면 그것
      2) 'TC 시트다운'(기능테스트 ID+절차+Depth1 헤더 보유) 시트 중 탭 순서상 가장 왼쪽 것
         (현행 버전 시트가 앞에 오고 과거 버전·개인 사본이 뒤에 쌓이는 관례 — 행 수 기준은 옛 시트를 고르는 일이 있었다)
    반환: (worksheet, [후보 시트명들])
    """
    if prefer and prefer in wb.sheetnames:
        return wb[prefer], [prefer]
    candidates = [name for name in wb.sheetnames if _sheet_score(wb[name]) >= 3]  # id + steps + depth1 모두 존재
    if not candidates:
        raise ValueError(
            "TC 시트를 찾지 못했습니다(상단 행에 '기능테스트 ID/절차/Depth1' 헤더 없음). "
            f"시트: {wb.sheetnames}"
        )
    return wb[candidates[0]], candidates


def resolve_columns(ws):
    """행1 헤더를 읽어 {정규필드: 1-based 컬럼번호} 반환(헤더 이름 기반)."""
    by_norm = {}
    for col, val in _header_cells(ws):
        if val is not None and str(val).strip() != "":
            by_norm.setdefault(_norm(val), col)  # 첫 등장 우선
    cols = {}
    for field, aliases in FIELD_ALIASES.items():
        for a in aliases:
            c = by_norm.get(_norm(a))
            if c:
                cols[field] = c
                break
    return cols


def load_tcs(path=None, sheet=None, root=None):
    """
    워크북을 읽어 정규화된 TC dict 리스트 반환. (LLM 작성 단계에서 사용)
    각 dict: id, priority, depth1..4, area, precond, testdata, steps, expected, ... (없으면 "")
    """
    import openpyxl
    wb_path = find_workbook(path, root)
    if not wb_path:
        raise FileNotFoundError("TC 워크북을 찾지 못했습니다. path= 로 명시하세요.")
    wb = openpyxl.load_workbook(wb_path, read_only=True, data_only=True)
    ws, candidates = pick_sheet(wb, sheet)
    cols = resolve_columns(ws)
    if "id" not in cols:
        raise ValueError(f"'기능테스트 ID' 헤더를 찾지 못했습니다(시트 {ws.title}).")
    id_idx = cols["id"] - 1  # values_only는 0-based
    out = []
    for row in ws.iter_rows(min_row=find_header_row(ws) + 1, values_only=True):
        tid = row[id_idx] if len(row) > id_idx else None
        if not tid or not str(tid).strip():
            continue
        rec = {"_sheet": ws.title, "_workbook": wb_path}
        for field, col in cols.items():
            i = col - 1
            v = row[i] if len(row) > i else None
            rec[field] = "" if v is None else str(v).strip()
        out.append(rec)
    wb.close()
    return out


if __name__ == "__main__":
    # 자가검증/디버그: `python tc_workbook.py [워크북경로] [시트명]`
    import sys
    p = sys.argv[1] if len(sys.argv) > 1 else None
    s = sys.argv[2] if len(sys.argv) > 2 else None
    tcs = load_tcs(p, s)
    print(f"workbook={tcs[0]['_workbook'] if tcs else '?'}  sheet={tcs[0]['_sheet'] if tcs else '?'}")
    print(f"TC rows: {len(tcs)}")
    if tcs:
        print("resolved fields:", ", ".join(k for k in tcs[0] if not k.startswith('_')))
        print("sample:", {k: tcs[0][k][:24] for k in ("id", "priority", "depth1", "steps", "expected") if k in tcs[0]})
