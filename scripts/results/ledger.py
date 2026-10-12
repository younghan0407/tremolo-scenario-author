#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ledger.py — 실행 결과 원장(results/runs/*.json)과 담당자 판정(results/verdicts.json)을 읽고 TC 결과를 집계한다.
원장이 결과의 원본(SoT)이고, 워크북은 원장을 그린 것(언제든 build 로 다시 그릴 수 있음).

TC 판정 규칙 (references/results-recording.md 와 동일하게 유지할 것)
  스텝: success → 통과 / warning·failed → 실패 / pending·running → 미실행
  TC (한 시나리오 안): 그 TC 를 note 에 단 스텝 중 실패가 하나라도 → Fail, 전부 통과 → Pass, 그 외(미실행 포함) → N-T
     TC 를 단 스텝이 없으면: 시나리오 전체 통과 → Pass, 아니면 N-T('스텝 매핑 없음')
  TC (한 실행 안, 여러 시나리오): Fail > Pass > N-T (가장 나쁜 쪽)
  TC 최근 결과: Pass/Fail 이 나온 가장 최근 실행 기준. 실행된 적 없으면 N-T.
"""
import glob
import json
import os

RANK = {"Fail": 2, "Pass": 1, "N-T": 0}

VERDICT_CHOICES = ["결함(버그 등록)", "TC 수정 필요", "스크립트 수정 필요", "환경·데이터 문제", "정상(Pass 인정)"]


def load_runs(P):
    runs = []
    for p in glob.glob(os.path.join(P.runs_dir, "*.json")):
        with open(p, encoding="utf-8") as f:
            runs.append(json.load(f))
    runs.sort(key=lambda r: r.get("startedAt") or "")
    return runs


def run_file(P, run_id, started_at):
    return os.path.join(P.runs_dir, f"{(started_at or '')[:10]}_{run_id}.json")


def load_verdicts(P):
    if not os.path.exists(P.verdicts_path):
        return {}
    with open(P.verdicts_path, encoding="utf-8") as f:
        return json.load(f)


def vkey(run_id, tc, scenario):
    """판정 키 = 실행 + TC + 시나리오 (같은 실행에서 한 TC 가 두 시나리오에서 실패할 수 있음)."""
    return f"{run_id}|{tc}|{scenario}"


def run_tc_results(run):
    """한 실행의 TC → {result, scenarios, steps(실패 스텝), known} (시나리오 간 최악값)."""
    out = {}
    for sc in run.get("scenarios", []):
        if sc.get("mapping") != "ok":
            continue
        for tc, v in sc.get("tcs", {}).items():
            cur = out.get(tc)
            if cur is None or RANK[v["result"]] > RANK[cur["result"]]:
                out[tc] = {"result": v["result"], "reason": v.get("reason", ""), "scenario": sc["name"],
                           "failSteps": v.get("failSteps", []), "known": v.get("known", False),
                           "evidence": v.get("evidence")}
    return out


def latest_by_tc(runs):
    """TC → {result, run, info}. Pass/Fail 이 나온 가장 최근 실행 우선, 없으면 가장 최근 N-T."""
    latest = {}
    for run in runs:  # 오래된 → 최근
        for tc, info in run_tc_results(run).items():
            prev = latest.get(tc)
            if info["result"] != "N-T" or prev is None or prev["result"] == "N-T":
                latest[tc] = {"result": info["result"], "run": run, "info": info}
    return latest


def pending_reviews(runs, verdicts):
    """판정필요 행(Fail) 목록 — 실행·TC 단위."""
    rows = []
    for run in runs:
        for sc in run.get("scenarios", []):
            if sc.get("mapping") != "ok":
                continue
            for tc, v in sc.get("tcs", {}).items():
                if v["result"] != "Fail":
                    continue
                rows.append({"run": run, "scenario": sc, "tc": tc, "v": v,
                             "verdict": verdicts.get(vkey(run["runId"], tc, sc["name"]), {})})
    return rows
