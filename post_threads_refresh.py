"""
Threads 장기 액세스 토큰 갱신 스크립트.

Threads 장기 토큰은 60일 후 만료되며, 만료 전 갱신할 수 있다(발급 후 24시간 경과 필요).
갱신된 토큰을 GitHub Actions output(new_token)으로 내보내, 워크플로가 시크릿을 업데이트한다.

환경변수:
  THREADS_ACCESS_TOKEN  - 현재 장기 액세스 토큰

토큰이 없으면 조용히 건너뛴다. 갱신 실패도 비치명적으로 처리한다.
"""

import json
import os
import sys
import urllib.error
import urllib.request

REFRESH_URL = "https://graph.threads.net/refresh_access_token"


def log(msg: str) -> None:
    print(f"[threads-refresh] {msg}", flush=True)


def main() -> int:
    token = os.environ.get("THREADS_ACCESS_TOKEN")
    if not token:
        log("THREADS_ACCESS_TOKEN 미설정 → 갱신 건너뜀")
        return 0

    url = f"{REFRESH_URL}?grant_type=th_refresh_token&access_token={token}"
    try:
        with urllib.request.urlopen(url, timeout=30) as resp:
            data = json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        detail = e.read().decode()[:300]
        log(f"::warning:: 갱신 실패(HTTP {e.code}): {detail}")
        return 0
    except Exception as e:  # noqa: BLE001 - 비치명적 처리
        log(f"::warning:: 갱신 실패: {e}")
        return 0

    new_token = data.get("access_token")
    if not new_token:
        log("응답에 새 토큰 없음 → 건너뜀")
        return 0

    # 로그에 토큰이 노출되지 않도록 마스킹
    print(f"::add-mask::{new_token}", flush=True)

    out_path = os.environ.get("GITHUB_OUTPUT")
    if out_path:
        with open(out_path, "a", encoding="utf-8") as f:
            f.write(f"new_token={new_token}\n")

    log(f"갱신 성공 (만료까지 약 {data.get('expires_in', '?')}초)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
