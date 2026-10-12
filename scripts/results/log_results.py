#!/usr/bin/env python3
"""
log_results.py  —  자동화 커버리지 & 결과를 TC 워크북 **사본**에 기입 (원본 불변).

생성된 시나리오(meta.json)의 스텝 note에서 커버한 TC ID(UNT-CON-####)를 모아, 기능 TC 워크북의
**일시별 사본**에 아래를 기록한다:
  - (신규 컬럼) '자동화'        : 자동화 스크립트로 커버되면 ✓
  - (신규 컬럼) '포함 스크립트' : 해당 TC를 커버하는 스크립트 '파일명' + '작성날짜' (줄바꿈)
  - (기존 컬럼) '테스트 결과 / 수행일자 / 수행자 / 비고' : 실행 결과가 있으면(--results) 기입

의존성: Python 3 + openpyxl  (Windows: `pip install openpyxl`)

Usage:
  python log_results.py [--scenarios <dir>] [--workbook <xlsx>] [--sheet 3.0.6]
                        [--out-dir <dir>] [--tester h.jee] [--results results.json]
"""
import argparse, glob, json, os, re, shutil, sys
from datetime import datetime

def find_repo_root(start):
    d = os.path.abspath(start)
    for _ in range(12):
        if os.path.exists(os.path.join(d, "workspace_claude")) or \
           os.path.exists(os.path.join(d, "src", "main", "services", "scenarioService.ts")):
            return d
        p = os.path.dirname(d)
        if p == d: break
        d = p
    return None

def main():
    here = os.path.dirname(os.path.abspath(__file__))
    root = os.environ.get("TREMOLO_ROOT") or find_repo_root(here) or os.getcwd()
    ap = argparse.ArgumentParser()
    ap.add_argument("--scenarios", default=os.path.join(root, "workspace_claude", "output", "scenarios"))
    ap.add_argument("--workbook", default=None, help="TC 워크북 경로(미지정 시 자동 탐색)")
    ap.add_argument("--sheet", default=None, help="TC 시트명(미지정 시 헤더 기준 자동 감지)")
    ap.add_argument("--out-dir", default=os.path.join(root, "workspace_claude", "output", "results"))
    ap.add_argument("--tester", default="h.jee")
    ap.add_argument("--results", default=None)
    a = ap.parse_args()

    try:
        import openpyxl
        from openpyxl.styles import Alignment, Font, PatternFill
    except ImportError:
        print("[log_results] openpyxl 필요: pip install openpyxl", file=sys.stderr); sys.exit(2)

    # 컬럼/시트는 인덱스 하드코딩 대신 헤더 이름 기준으로 인식(인입 파일별 상이 대응).
    sys.path.insert(0, here)
    from tc_workbook import find_workbook, pick_sheet, resolve_columns, _header_cells, find_header_row

    a.workbook = find_workbook(a.workbook, root)
    if not a.workbook:
        print("[log_results] TC 워크북을 찾지 못했습니다. --workbook 로 지정하세요.", file=sys.stderr); sys.exit(2)

    results_map = {}
    if a.results and os.path.exists(a.results):
        results_map = json.load(open(a.results, encoding="utf-8"))

    # 1) meta.json → {TC: [(script_filename, 작성날짜)]}
    tc_re = re.compile(r"UNT-CON-\d+")
    tc_to_scripts, tc_to_names, derived = {}, {}, []
    for meta in glob.glob(os.path.join(a.scenarios, "**", "*.spec.ts.meta.json"), recursive=True):
        doc = json.load(open(meta, encoding="utf-8"))
        name = os.path.basename(meta).replace(".spec.ts.meta.json", "")
        spec_file = name + ".spec.ts"
        date = (doc.get("updatedAt") or "")[:10] or datetime.fromtimestamp(os.path.getmtime(meta)).strftime("%Y-%m-%d")
        # 커버로 인정: note에서 "확인 필요 / 참고: / deferred" 마커 앞부분의 TC만
        # (그 뒤에 언급된 TC는 미검증/연기이므로 자동화 커버로 세지 않는다 — 과대 표기 방지).
        tcs = set()
        for s in doc.get("steps", []):
            head = re.split(r"확인 필요|참고:|deferred", s.get("note", "") or "")[0]
            tcs |= set(tc_re.findall(head))
        if tcs:
            for tc in tcs:
                tc_to_scripts.setdefault(tc, []).append((spec_file, date))
                tc_to_names.setdefault(tc, []).append(name)
        elif any("derived:" in (s.get("note", "") or "") for s in doc.get("steps", [])):
            derived.append(name)
    if not tc_to_scripts:
        print("[log_results] 커버된 TC 없음 (meta note에 UNT-CON-#### 없음).")

    # 2) 사본 생성
    os.makedirs(a.out_dir, exist_ok=True)
    stamp = datetime.now().strftime("%Y%m%d-%H%M")
    out = os.path.join(a.out_dir, f"TC_결과_{stamp}.xlsx")
    shutil.copyfile(a.workbook, out)

    wb = openpyxl.load_workbook(out)
    ws, _cands = pick_sheet(wb, a.sheet)   # a.sheet=None이면 헤더 기준 자동 감지
    cols = resolve_columns(ws)             # 정규필드 -> 1-based 컬럼(헤더 이름 기반)
    hr = find_header_row(ws)               # 헤더 행(1행 또는 2행 — 워크북마다 다름)
    # 신규 커버리지 컬럼(자동화/포함 스크립트) 배치용: 리터럴 헤더명 -> 컬럼, 마지막 사용 컬럼
    hdr, max_used = {}, 0
    for col, val in _header_cells(ws):
        if val not in (None, ""):
            hdr.setdefault(str(val).strip(), col)
            max_used = max(max_used, col)

    # 3) 신규 컬럼 2개 추가 (자동화 / 포함 스크립트)
    c_auto = hdr.get("자동화") or (max_used + 1)
    c_scripts = hdr.get("포함 스크립트") or (max_used + 2)
    head_font = Font(bold=True)
    center = Alignment(horizontal="center", vertical="center")
    wrap = Alignment(wrap_text=True, vertical="top")
    fill = PatternFill("solid", fgColor="E8F5E9")
    ws.cell(hr, c_auto).value = "자동화";        ws.cell(hr, c_auto).font = head_font;    ws.cell(hr, c_auto).alignment = center
    ws.cell(hr, c_scripts).value = "포함 스크립트"; ws.cell(hr, c_scripts).font = head_font; ws.cell(hr, c_scripts).alignment = center
    try:
        ws.column_dimensions[openpyxl.utils.get_column_letter(c_scripts)].width = 34
        ws.column_dimensions[openpyxl.utils.get_column_letter(c_auto)].width = 8
    except Exception:
        pass

    # 4) 기존 결과 컬럼(있으면) + 신규 커버리지 컬럼 기입 — 컬럼은 헤더 기준 resolver로 인식
    need = {
        "기능테스트 ID": cols.get("id"),
        "테스트 결과":   cols.get("result"),
        "수행자":        cols.get("tester"),
        "수행일자":      cols.get("date"),
        "비고":          cols.get("remark"),
    }
    if not need["기능테스트 ID"]:
        print("[log_results] '기능테스트 ID' 헤더 못 찾음.", file=sys.stderr); sys.exit(2)
    today = datetime.now().strftime("%Y-%m-%d")
    covered = 0
    for r in range(hr + 1, ws.max_row + 1):
        tc = ws.cell(r, need["기능테스트 ID"]).value
        tc = str(tc).strip() if tc is not None else ""
        if tc not in tc_to_scripts:
            continue
        covered += 1
        # 자동화 ✓
        ws.cell(r, c_auto).value = "✓"; ws.cell(r, c_auto).alignment = center
        # 포함 스크립트: "파일명\n작성 YYYY-MM-DD" (여러 개면 빈 줄로 구분)
        cellval = "\n\n".join(f"{fn}\n작성 {dt}" for fn, dt in tc_to_scripts[tc])
        ws.cell(r, c_scripts).value = cellval; ws.cell(r, c_scripts).alignment = wrap
        for c in (c_auto, c_scripts):
            ws.cell(r, c).fill = fill
        # 실행 결과(있으면)
        if need["테스트 결과"]:
            rs = [results_map.get(n, "N-T") for n in tc_to_names[tc]]
            status = "Fail" if "Fail" in rs else ("Pass" if rs and all(x == "Pass" for x in rs) else "N-T")
            ws.cell(r, need["테스트 결과"]).value = status
            if need["수행자"]: ws.cell(r, need["수행자"]).value = a.tester
            if need["수행일자"]: ws.cell(r, need["수행일자"]).value = today if status in ("Pass", "Fail") else None

    wb.save(out)
    print(f"[log_results] 사본 생성: {out}")
    print(f"  워크북: {os.path.basename(a.workbook)}  시트(자동감지): {ws.title}")
    print(f"  자동화 커버 TC {covered}건 표시(✓) + 포함 스크립트 기입.  신규 컬럼: '자동화'={c_auto}, '포함 스크립트'={c_scripts}")
    if derived:
        print(f"  참고: 워크북 밖 파생(EP/BVA) 시나리오 {len(derived)}건은 TC 매핑 없음(derived).")

if __name__ == "__main__":
    main()
