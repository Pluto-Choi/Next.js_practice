"""
Threads 자동 게시 스크립트.

키워드 수집(collect.py) 직후 실행되어 data/keywords.json의 오늘 키워드를
운영 Threads 계정에 게시한다.

환경변수:
  THREADS_USER_ID       - Threads 사용자 ID (숫자)
  THREADS_ACCESS_TOKEN  - 장기 액세스 토큰

둘 중 하나라도 없으면 조용히 건너뛴다(파이프라인을 깨지 않음).
게시 실패도 비치명적으로 처리하고 종료 코드 0을 반환한다.
직전 게시와 내용이 동일하면(키워드 변동 없음) 중복 게시를 건너뛴다.
"""

import hashlib
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

API = "https://graph.threads.net/v1.0"
SITE = "https://www.whatnewstoday.com"
DATA_PATH = "data/keywords.json"
STATE_PATH = "data/threads_state.json"
TEXT_LIMIT = 490  # Threads 본문 한도 500자보다 여유

HERO_CATEGORY = "오늘의 이슈"
CAT_EMOJI = {"오늘의 이슈": "🔥", "경제": "💰", "연예": "🎤", "스포츠": "⚽"}
CAT_ORDER = ["오늘의 이슈", "경제", "연예", "스포츠"]


def log(msg: str) -> None:
    print(f"[threads] {msg}", flush=True)


def _phrase(k: dict) -> str:
    """키워드에 대해 우리가 자체 생성한 한 줄 구(headline). 없으면 단어로 폴백."""
    return (k.get("headline") or "").strip() or k.get("word", "").strip()


def build_text(data: dict) -> str:
    date = data.get("date", "")
    try:
        _y, m, d = date.split("-")
        md = f"{int(m)}월 {int(d)}일"
    except ValueError:
        md = date

    cats = data.get("categories", {})
    lines = [f"📰 오늘의 뉴스 · {md}", "", "오늘 많이 찾은 이슈 👇", ""]

    # 바로 단어 나열 대신, 각 키워드에 대해 자체 생성한 한 줄 구를 노출한다.
    # 이슈는 2개, 나머지 분야는 1개씩만 뽑아 너무 길지 않게 유지.
    tags = []
    for name in CAT_ORDER:
        kws = cats.get(name, {}).get("keywords", [])
        take = 2 if name == HERO_CATEGORY else 1
        for k in kws[:take]:
            phrase = _phrase(k)
            if phrase:
                lines.append(f"{CAT_EMOJI.get(name, '•')} {phrase}")
            word = k.get("word", "").strip()
            if word:
                tags.append(f"#{word}")

    lines.append("")
    lines.append(f"다른 이슈가 궁금하다면? 👉 {SITE}")
    if tags:
        lines.append("")
        lines.append(" ".join(tags))

    text = "\n".join(lines)
    if len(text) > TEXT_LIMIT:
        text = text[: TEXT_LIMIT - 3] + "..."
    return text


def _post_json(url: str, params: dict) -> dict:
    body = urllib.parse.urlencode(params).encode()
    req = urllib.request.Request(url, data=body, method="POST")
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode())


def publish(user_id: str, token: str, text: str) -> str:
    # 1) 컨테이너 생성
    creation = _post_json(
        f"{API}/{user_id}/threads",
        {"media_type": "TEXT", "text": text, "access_token": token},
    )
    creation_id = creation["id"]
    # 서버 처리 시간 권장 (Meta 문서: 발행 전 약간의 대기)
    time.sleep(3)
    # 2) 발행
    result = _post_json(
        f"{API}/{user_id}/threads_publish",
        {"creation_id": creation_id, "access_token": token},
    )
    return result["id"]


def load_state() -> dict:
    try:
        with open(STATE_PATH, encoding="utf-8") as f:
            return json.load(f)
    except (OSError, ValueError):
        return {}


def save_state(state: dict) -> None:
    with open(STATE_PATH, "w", encoding="utf-8") as f:
        json.dump(state, f, ensure_ascii=False, indent=2)


def main() -> int:
    token = os.environ.get("THREADS_ACCESS_TOKEN")
    user_id = os.environ.get("THREADS_USER_ID")
    if not token or not user_id:
        log("THREADS_ACCESS_TOKEN / THREADS_USER_ID 미설정 → 게시 건너뜀")
        return 0

    try:
        with open(DATA_PATH, encoding="utf-8") as f:
            data = json.load(f)
    except (OSError, ValueError) as e:
        log(f"keywords.json 로드 실패 → 건너뜀: {e}")
        return 0

    text = build_text(data)
    signature = hashlib.sha256(text.encode()).hexdigest()

    state = load_state()
    if state.get("last_signature") == signature:
        log("직전 게시와 동일한 내용 → 중복 게시 건너뜀")
        return 0

    try:
        post_id = publish(user_id, token, text)
        log(f"게시 완료 id={post_id}")
    except urllib.error.HTTPError as e:
        detail = e.read().decode()[:300]
        log(f"::warning:: 게시 실패(HTTP {e.code}): {detail}")
        return 0
    except Exception as e:  # noqa: BLE001 - 게시 실패는 비치명적으로 처리
        log(f"::warning:: 게시 실패: {e}")
        return 0

    save_state(
        {
            "last_signature": signature,
            "last_posted_date": data.get("date", ""),
            "last_post_id": post_id,
        }
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
