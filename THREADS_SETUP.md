# Threads 자동 게시 — 네가 해야 할 일

자비스가 코드(게시 스크립트·워크플로·토큰 갱신)는 다 붙여놨어.
아래 계정/토큰 작업만 네가 하면 자동 게시가 켜져. 안 해도 기존 파이프라인은
멀쩡히 돌아가(토큰 없으면 게시 스텝은 조용히 건너뜀).

## 1. Meta 개발자 앱 만들기
1. https://developers.facebook.com/ 접속 → 로그인 → "내 앱" → 앱 만들기
2. 유스케이스에서 **"Threads API 사용"** 선택
3. 앱 생성 후, 좌측 메뉴에서 **Threads → 설정/사용 사례**로 이동
4. 권한에 `threads_basic`, `threads_content_publish` 추가
   - ※ 본인 계정에만 게시하므로 앱이 **개발(Development) 모드**여도 OK. App Review 불필요.
   - 단, 게시 대상 Threads 계정이 앱에 **역할(관리자/개발자/테스터)**로 연결돼 있어야 함.

## 2. 운영 Threads 계정 연결 + 토큰 발급
1. Threads 앱 설정에서 게시에 쓸 **Threads 계정을 연결**
2. **장기(long-lived) 액세스 토큰** 발급 (60일 유효)
   - Graph API Explorer 또는 Threads 설정 화면에서 토큰 생성
3. 함께 표시되는 **Threads 사용자 ID(숫자)**도 메모

## 3. GitHub Secrets 등록
저장소 → Settings → Secrets and variables → Actions → New repository secret

| 이름 | 값 |
|------|-----|
| `THREADS_USER_ID` | 2번에서 받은 Threads 사용자 ID |
| `THREADS_ACCESS_TOKEN` | 2번에서 받은 장기 액세스 토큰 |
| `GH_PAT` *(선택)* | 토큰 자동 갱신용. `secrets` 쓰기 권한 있는 PAT. 없으면 60일마다 토큰 수동 갱신 |

등록 끝나면 다음 수집 사이클(6시간마다)부터 자동 게시 시작.
**Actions 탭 → "Collect Daily Keywords" → workflow_dispatch**로 즉시 테스트 가능.

## 동작 방식 (참고)
- 게시 시점: 키워드 수집(6시간 주기) 직후, 하루 약 4회
- 중복 방지: 직전 게시와 키워드가 같으면 건너뜀 (`data/threads_state.json`)
- 게시 포맷: 핫이슈/연예/경제 TOP3 + 사이트 링크 (약 130자)
- 실패 처리: 게시 실패해도 수집/배포는 영향 없음 (비치명적)
- 토큰 갱신: 매월 1일 `threads-refresh.yml`이 자동 갱신 (GH_PAT 있을 때)

## 관련 파일
- `post_threads.py` — 게시 스크립트
- `post_threads_refresh.py` — 토큰 갱신
- `.github/workflows/collect.yml` — 게시 스텝 추가됨
- `.github/workflows/threads-refresh.yml` — 월 1회 토큰 갱신
