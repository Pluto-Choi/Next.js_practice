#!/usr/bin/env python3
"""급상승(오늘의 이슈) 키워드 본문(sections) 생성용 결정적 I/O 헬퍼.

본문 텍스트 자체는 구독 플랜의 에이전트(Claude Code 세션)가 web_search로 근거를
모아 작성한다. 이 스크립트는 AI 호출을 하지 않는다 — 무엇을 써야 하는지 목록을 주고
(list), 에이전트가 만든 결과를 받아 파일에 안전하게 기록(write)하고, 오래된 항목을
정리(prune)하는 일만 한다. 비용이 드는 부분은 전부 구독 세션 쪽에 있다.

data/sections.json 스키마 (키워드 단어 → 엔트리):
  { "<word>": { "sections": [{heading, body}...],
                "sources": [{title, url}...],
                "headline": "<생성 당시 헤드라인>",
                "generated_at": "YYYY-MM-DD HH:MM KST" } }

headline을 같이 저장해, 다음 수집에서 같은 헤드라인이면 본문을 재사용(스킵)한다.

사용법:
  python generate_sections.py list            # 본문이 필요한 급상승 키워드 JSON 출력
  python generate_sections.py write <word>    # stdin {sections, sources} JSON을 기록
  python generate_sections.py prune           # 현재 급상승에 없는 항목 제거
"""
import json
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent / "data"
KEYWORDS_PATH = DATA_DIR / "keywords.json"
SECTIONS_PATH = DATA_DIR / "sections.json"
ISSUE_CATEGORY = "오늘의 이슈"
KST = timezone(timedelta(hours=9))


def _load_json(path: Path, default):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError):
        return default


def _issue_keywords():
    data = _load_json(KEYWORDS_PATH, {})
    return data.get("categories", {}).get(ISSUE_CATEGORY, {}).get("keywords", [])


def cmd_list():
    """본문이 없거나(신규) 헤드라인이 바뀐(갱신 필요) 급상승 키워드를 출력한다."""
    sections = _load_json(SECTIONS_PATH, {})
    needed = []
    for k in _issue_keywords():
        word = k.get("word")
        if not word:
            continue
        entry = sections.get(word)
        headline = k.get("headline") or ""
        if entry and entry.get("headline") == headline and entry.get("sections"):
            continue  # 같은 헤드라인 = 같은 이슈 → 재사용
        needed.append({
            "word": word,
            "rank": k.get("rank"),
            "headline": headline,
            "description": k.get("description") or "",
            "article_titles": [a.get("title", "") for a in k.get("articles", [])],
        })
    json.dump(needed, sys.stdout, ensure_ascii=False, indent=2)
    sys.stdout.write("\n")


def cmd_write(word):
    """stdin의 {sections, sources} JSON을 받아 sections.json[word]에 기록한다."""
    payload = json.load(sys.stdin)
    secs = payload.get("sections")
    if not isinstance(secs, list) or not secs:
        sys.stderr.write("ERROR: 'sections' 배열이 비어 있습니다\n")
        sys.exit(1)
    for s in secs:
        if not (isinstance(s, dict) and s.get("heading") and s.get("body")):
            sys.stderr.write("ERROR: 각 section은 heading/body가 필요합니다\n")
            sys.exit(1)

    headline = next((k.get("headline", "") for k in _issue_keywords()
                     if k.get("word") == word), "")
    sections = _load_json(SECTIONS_PATH, {})
    sections[word] = {
        "sections": secs,
        "sources": payload.get("sources", []),
        "headline": headline,
        "generated_at": datetime.now(KST).strftime("%Y-%m-%d %H:%M KST"),
    }
    SECTIONS_PATH.write_text(
        json.dumps(sections, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(f"OK: '{word}' 본문 {len(secs)}개 섹션 기록")


def cmd_prune():
    """현재 급상승 키워드 목록에 없는 sections.json 항목을 제거한다."""
    sections = _load_json(SECTIONS_PATH, {})
    current = {k.get("word") for k in _issue_keywords()}
    removed = [w for w in sections if w not in current]
    for w in removed:
        del sections[w]
    SECTIONS_PATH.write_text(
        json.dumps(sections, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(f"OK: {len(removed)}개 제거 ({', '.join(removed) or '없음'})")


def main():
    if len(sys.argv) < 2:
        sys.stderr.write(__doc__)
        sys.exit(2)
    cmd = sys.argv[1]
    if cmd == "list":
        cmd_list()
    elif cmd == "write":
        if len(sys.argv) < 3:
            sys.stderr.write("ERROR: write 명령에는 <word> 인자가 필요합니다\n")
            sys.exit(2)
        cmd_write(sys.argv[2])
    elif cmd == "prune":
        cmd_prune()
    else:
        sys.stderr.write(f"알 수 없는 명령: {cmd}\n")
        sys.exit(2)


if __name__ == "__main__":
    main()
