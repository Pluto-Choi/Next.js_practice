from kiwipiepy import Kiwi
from collections import Counter, defaultdict
from datetime import datetime, timedelta, timezone, date as date_cls
from urllib.parse import quote
import feedparser
import anthropic
import json
import re
import os
import html
import shutil
import time

stopwords_common = {
    # 시간
    '이후', '올해', '지난', '이번', '최근', '오늘', '내일', '다음', '출근길',
    # 언론사
    '한겨레', '조선', '중앙', '동아', '연합', '일보', '신문', '방송',
    '뉴시스', '네이트', '내외', '연합인포맥스', '아시아경제', '브릿지',
    '한국경제', '불교방송', '헤럴드', '파이낸셜포스트', '지디넷코리아',
    '경남일보', '연합뉴스', '시사저널', '아이티데일리',
    # 직함
    '대통령', '총리', '장관', '차관', '의원', '대표', '회장', '사장',
    '부장', '위원', '본부', '수석', '시장', '감독',
    # 행위 노이즈
    '개최', '점검', '회의', '공동', '진행', '추진', '실시', '투자',
    '참석', '발표', '논의', '강조', '예정', '확인', '지원', '운영', '응원',
    '통과', '발견', '귀국', '공개', '시작',
    '도약', '민간', '공공', '분야', '상황', '문제', '방안',
    '계획', '목표', '효과', '결과', '사업', '행사', '기관', '현장',
    '대응', '혁신', '시행', '후보', '선거', '전시', '총력',
    '의혹', '논란', '책임', '완료', '조사', '보유', '연속', '투입', '검토',
    '확대', '이전',
    # 가능·계속: 수식·접속 기능어 — 단독 키워드 가치 없음(32강 가능성·비트코인 계속 등 무관 기사에 분산)
    '가능', '계속',
    # 박사: 직함·학위 명사 — 단독으로 사건 주체를 특정하지 못함
    '박사',
    # 수식·클릭베이트성 노이즈(광고문구·헤드라인 감탄어에서 단독 추출되는 형용사성 명사)
    '완벽', '화제', '눈길', '눈앞', '포착', '충격', '깜짝', '감동', '대박', '눈물',
    # 수식 형용사 파편(가짜뉴스·가짜 국가대표 등 항상 더 긴 복합어의 수식어로만 쓰임)
    '가짜',
    # 역대·사상·최대·최고: "역대 최고", "사상 최대", "최대 실적", "낮 최고 33도" 등 최상급·극값 수식어로만 쓰이는 일반 명사 — 단독 키워드 가치 없음
    '역대', '사상', '최대', '최고',
    # 하락: 주가·지지율·환율 등 서로 무관한 여러 지표의 내림을 뭉뚱그리는 분산 노이즈
    '하락',
    # 변수: "태풍 변수", "퇴장 변수", "물가 변수" 등 날씨·스포츠·경제 등 무관한 기사에
    # 수식어로만 등장하는 분산 노이즈
    '변수',
    # 일반 명사 노이즈
    '뉴스', '한국', '지역', '사회', '국제', '관련', '사진', '인기', '본인',
    '이유', '종합', '참고', '세계', '전국', '당시', '경우', '모습',
    '프로그램', '대책', '사람', '위험', '정부',
    # 감정·심리 일반명사: 사과·인터뷰 헤드라인에서 단독 추출되지만 어떤 사건인지 특정 못함
    '마음', '사랑',
    # 범용 수식·행위 명사 — 여러 무관한 기사에 흩어지는 분산 노이즈
    # 필요: "할 필요 있나", "검토 필요" 등 수식어로만 쓰임 / 개선: "X 개선" 형태로 주체를 특정 못함
    # 마비: 시스템·교통·장례 등 무관한 맥락에 분산 / 신고: 세금·범죄·행정 등 다른 맥락에 분산
    '필요', '개선', '마비', '신고',
    # 기사 형식 태그
    '속보',
    # 미래: "미래 먹거리", "미래항공기" 등 항상 더 긴 복합어의 수식어로만 쓰이는 분산 노이즈
    '미래',
    # 아들: 범죄·연예·스포츠 등 여러 카테고리에서 가족 관계 언급 시 단독 추출되는 분산 노이즈
    '아들',
    # 이슈: "심각한 이슈", "주요 이슈" 처럼 기사 문체에서 단독 추출되는 메타어 노이즈
    '이슈',
}

stopwords_economy = stopwords_common | {
    # 금리·주식·환율 등 핵심 경제어는 일부러 막지 않는다(사용자가 가장 보고 싶어하는 주제).
    # 검색 시드가 아니라 토픽피드를 쓰므로, 그날 실제로 많이 다뤄질 때만 자연스럽게 상위에 오른다.
    # 토픽피드 제목에 섞여 들어오는 언론사명·일반 노이즈만 거른다.
    '조선비즈', '머니투데이', '이데일리', '매일경제', '뉴스핌',
    '분기', '월요일', '국내',
    '경제', '재경부', '관리관', '국장', '개발', '활성', '서울', '대한',
    '센터', '브리핑', '강화', '구윤철', '글로벌', '실용',
    '인사이트', '리포트', '뉴스룸', '핵심', '유통',
    '전략', '도입', '트렌드', '접목', '전망', '공략',
    '브런치', '변경', '계열사', '그룹', '기반', '연구',
    '활용', '제시', '전속', '계약', '모집',
    '환경', '디지털', '교육', '경제자유구역',
    '기업', '첨단', '물류', '융합', '산업',
    '역량', '시대', '변화', '기술', '외교', '협력', '통합',
    '가동', '장기',
    '자금',
    # 경제 방향성 동사명사(무엇이 올랐는지/내렸는지가 중요하지 오름·내림 자체는 키워드가 아님)
    '상승', '급등', '폭락', '급락',
    # 주가: "SK하이닉스 주가·샤오미 주가·솔라리스 주가" 처럼 서로 무관한 종목 기사에
    # 흩어지는 분산 노이즈 — 어느 주식인지 특정하지 못함(상승/폭락과 같은 이유)
    '주가',
    # 분산 노이즈 — 무역·이적·외교 등 서로 무관한 협상 기사에 흩어지는 행위명사
    '협상',
    # 규모: "X억 규모" 형태로 각기 다른 기업 발표 기사에 수식어로만 등장하는 분산 노이즈
    '규모',
    # 평균: "다우 평균", "평균 나이", "전국 평균 가격" 등 서로 무관한 기사에 흩어지는 분산 노이즈
    '평균',
}

stopwords_entertainment = stopwords_common | {
    '연예', '연예인', '포토', '현장포토', '영상',
    '아이돌', '케이팝',
    '컴백', '데뷔', '활동', '팬미팅', '콘서트', '공연', '팬',
    '발매', '앨범', '싱글', '미니', '타이틀', '멤버', '그룹', '솔로',
    '출연', '드라마', '영화', '인터뷰', '화보', '스타',
    '남자', '여자', '결혼', '열애', '이별', '교제',
    '문화', '플러스', '앨리', '리스트', '미소', '오프', '온', '지급',
    '시즌', '콘텐츠',
    # 토픽피드(ENTERTAINMENT) 전환 후 올라오는 일반명사·섹션라벨 노이즈
    '근황', '자택', '댓글', '성공', '사태', '스타이슈',
    # 이웃: 노래 제목·법원 판결·생활정보 기사에 흩어지는 분산 노이즈 — 연예 키워드 아님
    '이웃',
    # 이상형: 연예 인터뷰 단골 질문(이상형이 누구냐)에서 반복 추출되는 일반명사 — 특정 인물·사건이 아님
    '이상형',
}

stopwords_sports = stopwords_common | {
    # 스포츠 토픽피드(SPORTS)에 흔한 일반명사·행위·섹션 라벨 노이즈.
    # 선수·구단·대회 같은 구체 개체명만 키워드로 남도록 일반어를 거른다.
    '스포츠', '경기', '선수', '코치', '구단', '대표팀', '국가대표',
    '우승', '준우승', '승리', '패배', '무승부', '승부', '연승', '연패', '득점', '실점',
    '출전', '선발', '교체', '복귀', '부상', '은퇴', '이적', '영입', '발탁', '합류',
    '탈락', '진출', '실패', '사퇴',
    '후반', '전반', '추가시간',  # 경기 시간대 명사 — 어떤 경기인지 특정 못함
    '리그', '결승', '준결승', '예선', '본선', '개막', '폐막', '경기장',
    '기록', '도전', '대회', '메달', '순위', '일정', '명단', '훈련', '소속',
    # 종목명은 그날의 구체 이슈(선수·대회)가 아니라 섹션 분류라 거른다.
    '야구', '축구', '농구', '배구', '골프', '테니스', '배드민턴', '탁구', '육상',
    '프로야구', '프로축구', '프로농구', '메이저리그', '프리미어리그',
    '프로',  # "캄보디아 프로팀"처럼 '프로+종목/팀' 합성어에서 쪼개진 파편
    # 범용 국가/지역명: 스포츠 기사에서 뽑혀도 그 단어로 기사를 재검색하면
    # 스포츠가 아닌 일반 세계뉴스(정치·경제)가 딸려와 노이즈가 된다.
    # (경제·이슈에선 정당하므로 스포츠에만 적용)
    '미국', '중국', '일본', '한국', '북한', '영국', '러시아',
    '아시아',  # 투자·에너지 기사에도 분산 등장 — 스포츠 구체 이슈를 특정하지 못함
}

def parse_feed_with_retry(url, retries=3, delay=3):
    """Google News RSS가 일시적으로 빈 응답을 줄 때 재시도한다."""
    feed = feedparser.parse(url)
    for attempt in range(1, retries):
        if feed.entries:
            return feed
        print(f"  RSS 빈 응답 — 재시도 {attempt}/{retries - 1}")
        time.sleep(delay)
        feed = feedparser.parse(url)
    return feed


def fetch_articles_google(keyword, count, used_links):
    url = f"https://news.google.com/rss/search?q={quote(keyword)}&when=1d&hl=ko&gl=KR&ceid=KR:ko"
    feed = parse_feed_with_retry(url)
    articles = []
    for entry in feed.entries:
        if len(articles) >= count:
            break
        if entry.link in used_links:
            continue
        used_links.add(entry.link)
        articles.append({
            "title": clean_title(html.unescape(entry.title)),
            "link": entry.link,
            "source": entry.get("source", {}).get("title", ""),
        })
    return articles

_DESK_TAG = re.compile(r'^\s*(?:\[[^\]]{1,12}\]|【[^】]{1,12}】)\s*')


def clean_title(title):
    # "기사 제목 - 출처명" 형식에서 출처 제거
    if ' - ' in title:
        title = title.rsplit(' - ', 1)[0]
    # 선두 매체·포맷 데스크 태그 제거([스타투데이]·[OSEN]·【속보】·[종합] 등).
    # 매체 브랜드명이 키워드로 잡히는 노이즈를 근원에서 차단한다(연달아 붙으면 반복 제거).
    while True:
        stripped = _DESK_TAG.sub('', title)
        if stripped == title:
            break
        title = stripped
    return title

def extract_keywords(titles, sw=stopwords_common, n=20):
    nouns = []
    for title in titles:
        tokens = kiwi.tokenize(clean_title(title))
        for token in tokens:
            if token.tag in ('NNG', 'NNP') and len(token.form) > 1:
                if token.form not in sw:
                    nouns.append(token.form)
    return Counter(nouns).most_common(n)

def _candidate_examples(word, titles, k=2):
    """후보 단어가 들어간 기사 제목 예시를 k개까지 모은다(중복 판단·구체성 근거)."""
    ex = []
    for t in titles or []:
        ct = clean_title(t)
        if word in ct and ct not in ex:
            ex.append(ct)
            if len(ex) >= k:
                break
    return ex


def _candidate_feed_position(word, titles):
    """후보 단어가 피드에서 '처음' 등장하는 순서(1부터)를 돌려준다.
    토픽 피드는 구글이 편집적으로 정렬한 헤드라인이므로, 앞쪽에 나올수록
    오늘 더 비중 있게 다뤄진 이슈라는 신호가 된다. 못 찾으면 None."""
    for i, t in enumerate(titles or []):
        if word in clean_title(t):
            return i + 1
    return None


def _candidate_dispersion(word, titles):
    """후보 단어가 등장한 제목들이 '하나의 사건'에 집중됐는지, 아니면
    '서로 무관한 여러 사건'에 흩어졌는지 결정론적으로 측정한다.

    같은 사건을 다룬 기사들은 단어 말고도 공통 맥락 명사(같은 인물·기관·
    장소·소재)를 공유한다. 예: '코스피'가 나온 제목들은 폭락·증시·낙폭을
    함께 나눠 갖는다 → 한 사건에 집중. 반대로 '순간'처럼 여러 무관한
    기사(스포츠·부고·와인…)에 우연히 박힌 일반명사는 자기 자신 말고
    공유하는 명사가 거의 없다 → 분산.

    반환: (등장 제목 수, 집중도). 집중도 = 단어 외 명사 중 '가장 많은
    제목에 공통으로 등장한 명사'가 나온 제목 수 ÷ 등장 제목 수.
    1에 가까울수록 한 사건에 집중, 0에 가까울수록 무관한 사건들에 분산.
    제목이 1개뿐이면 분산을 판단할 수 없어 집중(1.0)으로 둔다."""
    sets = []
    for t in titles or []:
        toks = kiwi.tokenize(clean_title(t))
        nouns = {
            tk.form for tk in toks
            if tk.tag in ('NNG', 'NNP') and len(tk.form) > 1
        }
        if word in nouns:
            nouns.discard(word)
            sets.append(nouns)
    n = len(sets)
    if n < 2:
        return n, 1.0
    shared = Counter()
    for s in sets:
        for noun in s:
            shared[noun] += 1
    top = shared.most_common(1)[0][1] if shared else 0
    return n, top / n


def _is_dispersed(word, titles, min_titles=3, thr=0.5):
    """3개 이상의 제목에 등장하면서 그 제목들이 공통 맥락을 거의 공유하지
    않으면(집중도 < thr) 분산 후보로 본다 → 일반명사 노이즈 의심 신호."""
    n, conc = _candidate_dispersion(word, titles)
    return n >= min_titles and conc < thr


def _title_pos_sets(titles):
    """제목별 (전체 명사집합, 고유명사(NNP)집합) 튜플 리스트를 만든다.
    일반명사가 어떤 고유명사에 들러붙어 있는지 판정하는 데 쓴다."""
    out = []
    for t in titles or []:
        toks = kiwi.tokenize(clean_title(t))
        alln, nnp = set(), set()
        for tk in toks:
            if tk.tag in ('NNG', 'NNP') and len(tk.form) > 1:
                alln.add(tk.form)
                if tk.tag == 'NNP':
                    nnp.add(tk.form)
        out.append((alln, nnp))
    return out


def _dominant_entity(word, pos_sets, min_frac=0.6, min_titles=2):
    """word가 등장한 제목들에서 word를 제외하고 '가장 많은 제목에 공통으로
    나오는 명사'를 찾는다. 그 명사가 word 제목의 min_frac 이상을 점유하면
    (=이 단어의 기사들이 사실은 그 명사를 중심으로 돈다), 그 명사를 반환한다.
    배우→박지훈, 논란→선관위처럼 껍데기 일반명사 뒤의 진짜 주체를
    결정론적으로 끄집어낸다. 한국어 고유명사는 Kiwi가 NNG로 태깅하는 경우가
    많아(선관위·코스피 등) NNP로 제한하지 않고 전체 명사에서 찾는다. 대신
    '껍데기인지 그 자체가 주제인지'(환율·금리)의 최종 판단은 LLM에 맡긴다.
    조건 미달이면 None."""
    with_word = [alln for alln, _ in pos_sets if word in alln]
    n = len(with_word)
    if n < min_titles:
        return None
    cnt = Counter()
    for alln in with_word:
        for e in alln:
            if e != word:
                cnt[e] += 1
    if not cnt:
        return None
    ent, c = cnt.most_common(1)[0]
    return ent if c / n >= min_frac else None


_HANGUL = re.compile(r'[가-힣]')


def _is_interior_fragment(word, titles):
    """후보가 '항상' 더 긴 한글 고유명사의 내부에 갇혀 등장하면 True.
    예: '민주'가 모든 제목에서 '콩고민주공화국'처럼 앞뒤가 모두 한글에
    붙어 나오면(고[민주]공) 더 긴 이름의 내부 파편이라 키워드가 아니다.
    한쪽이라도 경계(공백·문장부호·비한글·문자열 끝)에 닿는 등장이 한 번이라도
    있으면 자립어로 보고 살린다 → '삼성'(삼성전자, 왼쪽 경계),
    '스페이스'(스페이스X, 오른쪽 비한글)는 영향받지 않는다."""
    seen = False
    for t in titles or []:
        ct = clean_title(t)
        start = 0
        while True:
            idx = ct.find(word, start)
            if idx < 0:
                break
            seen = True
            before = ct[idx - 1] if idx > 0 else ""
            after = ct[idx + len(word)] if idx + len(word) < len(ct) else ""
            # 한쪽이라도 한글이 아니면(경계에 닿으면) 자립 등장으로 본다
            if not (_HANGUL.match(before) and _HANGUL.match(after)):
                return False
            start = idx + 1
    return seen


def drop_interior_fragments(candidates, titles):
    """모든 등장이 더 긴 한글 고유명사 내부에 갇힌 후보(민주←콩고민주공화국 등)를
    LLM에 넘기기 전에 결정론적으로 제거한다."""
    if not titles:
        return candidates
    kept = []
    for w, c in candidates:
        if _is_interior_fragment(w, titles):
            print(f"  내부조각 제거: {w}")
            continue
        kept.append((w, c))
    return kept


def _title_noun_sets(titles):
    """각 기사 제목을 형태소 분석해 명사(2글자+) 집합 리스트로 만든다."""
    out = []
    for t in titles or []:
        toks = kiwi.tokenize(clean_title(t))
        out.append({
            tk.form for tk in toks
            if tk.tag in ('NNG', 'NNP') and len(tk.form) > 1
        })
    return out


def _adjacency_ratio(a, b, clean_titles, cooccur_idx):
    """두 후보가 함께 나온 제목들 중, 둘이 공백만 사이에 두고 '붙어서'
    (예: '데몬 헌터스', '삼성 전자') 나타나는 비율. 한 고유명사/합성어가
    형태소로 쪼개진 경우 이 값이 높다."""
    if not cooccur_idx:
        return 0.0
    pat = re.compile(
        rf"{re.escape(a)}\s*{re.escape(b)}|{re.escape(b)}\s*{re.escape(a)}"
    )
    hits = sum(1 for i in cooccur_idx if pat.search(clean_titles[i]))
    return hits / len(cooccur_idx)


def merge_fragment_candidates(
    candidates, titles, contain_thr=0.8, size_ratio=0.6, min_overlap=2,
    adj_ratio=0.5,
):
    """형태소 분석이 한 고유명사 구(句)를 여러 조각으로 쪼갠 경우
    (예: '케이팝 데몬 헌터스' → 데몬/헌터스/케데헌) 같은 기사들에 함께
    등장하는 후보를 묶어 대표 1개만 남긴다. 프롬프트가 아닌 결정론적 처리.

    오탐(이란/미국처럼 관련은 있으나 다른 키워드) 방지를 위해 containment
    가드(inter/min >= contain_thr)는 항상 요구하고, 그 위에서 둘 중 하나면 병합:
      1) 두 후보의 등장 빈도가 비슷하다(min/max >= size_ratio), 또는
      2) 제목에서 둘이 실제로 인접해 나타난다(adjacency >= adj_ratio).
    인접성 조건은 빈도가 크게 달라 (1)에 걸리던 진짜 구(句) 분절
    ('삼성'/'전자', 약어 등)을 구제하되, containment 가드가 유지되므로
    공동출현만 잦은 별개 키워드의 연쇄병합은 막는다.
    """
    if not titles or len(candidates) < 2:
        return candidates
    noun_sets = _title_noun_sets(titles)
    clean_titles = [clean_title(t) for t in titles]
    occ = {
        w: {i for i, s in enumerate(noun_sets) if w in s}
        for w, _ in candidates
    }
    words = [w for w, _ in candidates]
    parent = {w: w for w in words}

    def find(x):
        r = x
        while parent[r] != r:
            r = parent[r]
        while parent[x] != r:
            parent[x], x = r, parent[x]
        return r

    for i in range(len(words)):
        for j in range(i + 1, len(words)):
            a, b = words[i], words[j]
            sa, sb = occ[a], occ[b]
            cooccur = sa & sb
            inter = len(cooccur)
            if inter < min_overlap:
                continue
            lo, hi = min(len(sa), len(sb)), max(len(sa), len(sb))
            if inter / lo < contain_thr:
                continue
            similar_freq = lo / hi >= size_ratio
            adjacent = _adjacency_ratio(a, b, clean_titles, cooccur) >= adj_ratio
            if similar_freq or adjacent:
                ra, rb = find(a), find(b)
                if ra != rb:
                    parent[ra] = rb

    groups = {}
    for w in words:
        groups.setdefault(find(w), []).append(w)
    count_map = dict(candidates)
    result, seen = [], set()
    for w, c in candidates:
        r = find(w)
        if r in seen:
            continue
        seen.add(r)
        members = groups[r]
        if len(members) == 1:
            result.append((w, c))
            continue
        # 대표: 등장 기사 수 최다 → 빈도 최다 → 더 긴(구체적) 표현
        best = max(members, key=lambda x: (len(occ[x]), count_map[x], len(x)))
        union_idx = set().union(*(occ[x] for x in members))
        result.append((best, max(count_map[best], len(union_idx))))
        print(f"  조각 병합: {'/'.join(members)} → {best}")
    return result


# ===== NER(개체명) 추출 — 결정론적 보강 레이어 =====
# 연예는 인물·작품(AF)·이벤트(EV) 중심이라 형태소 빈도보다 개체명이 정확하고,
# 이슈는 Kiwi 빈도신호 위에 개체명 힌트를 얹는다. 추론은 argmax(eval)라
# 같은 제목 입력 → 항상 같은 결과(결정론 유지). 모델은 모두의말뭉치 15태그.
_NER_MODEL_ID = "Leo97/KoELECTRA-small-v3-modu-ner"
_ner_pipe = None
_ner_failed = False


def _get_ner():
    """modu-NER 파이프라인을 1회만 로드(지연). 실패 시 None을 돌려 Kiwi로 폴백."""
    global _ner_pipe, _ner_failed
    if _ner_pipe is not None or _ner_failed:
        return _ner_pipe
    try:
        from transformers import pipeline
        _ner_pipe = pipeline(
            "token-classification", model=_NER_MODEL_ID,
            aggregation_strategy="simple",
        )
    except Exception as e:
        print(f"  NER 모델 로드 실패 — Kiwi로 폴백: {e}")
        _ner_failed = True
    return _ner_pipe


# 개체명 앞뒤에서 떼어낼 문자: 따옴표(직선·곡선), 가운뎃점, 쉼표·마침표·하이픈·말줄임표.
_NER_EDGE_CHARS = "'\"‘’“”·,.-…"
_NER_PUNCT = re.compile(r"^[\s" + re.escape(_NER_EDGE_CHARS) + r"]+|[\s" + re.escape(_NER_EDGE_CHARS) + r"]+$")


def _ner_clean(s):
    return _NER_PUNCT.sub('', s.replace('##', '').strip())


def ner_candidates(titles, keep, n=30):
    """개체명 후보를 (단어, 등장 제목 수, 타입) 리스트로 결정론적으로 추출한다.
    keep: 유지할 태그 집합(예: {'PS','AF','EV'} = 인물·작품·이벤트).
    띄어쓰기 변형(젠슨 황/젠슨황)은 정규화해 합치고, 가장 흔한 표면형을 대표로 쓴다.
    char offset로 표면형을 잘라 ## 서브워드 잔재를 피한다. NER 미가용 시 빈 리스트."""
    pipe = _get_ner()
    if pipe is None:
        return []
    freq = Counter()
    first = {}
    surf = defaultdict(Counter)
    typ = {}
    for i, t in enumerate(titles or []):
        ct = clean_title(t)
        seen = set()
        for e in pipe(ct):
            base = e['entity_group'].split('-')[-1]  # B-AF/I-AF/AF → AF
            if base not in keep:
                continue
            s = _ner_clean(ct[e['start']:e['end']])
            if len(s) < 2:
                continue
            k = s.replace(' ', '')
            surf[k][s] += 1
            if k not in seen:
                seen.add(k)
                freq[k] += 1
                first.setdefault(k, i + 1)
                typ.setdefault(k, base)
    ranked = sorted(freq.items(), key=lambda kv: (-kv[1], first[kv[0]]))
    return [(surf[k].most_common(1)[0][0], c, typ[k]) for k, c in ranked[:n]]


def _event_anchor(word, titles, keep=("PS", "OG", "LC", "AF", "EV")):
    """일반명사 키워드(심장 등)의 관련기사가 무관한 동음 기사로 새는 걸 막는다.
    그 단어가 처음 등장한 헤드라인(피드 중요도 1순위 = 대시보드에 뜨는 그 제목)에서
    핵심 개체명 하나를 뽑아 검색 보조어로 돌려준다(심장 → 에릭센). 결정론적.
    개체명이 없으면 None → 호출부는 단독 검색으로 폴백한다."""
    pipe = _get_ner()
    if pipe is None:
        return None
    wkey = word.replace(" ", "")
    pref = {t: r for r, t in enumerate(keep)}
    for t in titles or []:
        ct = clean_title(t)
        if wkey not in ct.replace(" ", ""):
            continue
        best = None  # (선호순위, 표면형)
        for e in pipe(ct):
            base = e["entity_group"].split("-")[-1]
            if base not in pref:
                continue
            s = _ner_clean(ct[e["start"]:e["end"]])
            if len(s) < 2 or s.replace(" ", "") == wkey:
                continue
            cand = (pref[base], s)
            if best is None or cand[0] < best[0]:
                best = cand
        return best[1] if best else None  # 1순위 제목만 본다(그게 그 키워드의 사건)
    return None


def filter_keywords(candidates, category, titles=None, ner_tags=None):
    if titles:
        # 일반명사 후보 뒤에 숨은 '핵심 고유명사'를 결정론적으로 찾아
        # (배우→박지훈, 논란→선관위), 그 고유명사를 후보 풀에 넣어 선택
        # 가능하게 하고, 일반명사 줄에 힌트로 노출한다.
        pos_sets = _title_pos_sets(titles)
        nnp_words = set().union(*(nnp for _, nnp in pos_sets)) if pos_sets else set()
        cand_words = {w for w, _ in candidates}
        entity_of = {}
        for w, _ in candidates:
            if w in nnp_words:
                continue  # 이미 고유명사인 후보는 치환 대상이 아니다
            ent = _dominant_entity(w, pos_sets)
            if ent and ent != w:
                entity_of[w] = ent
        extra = []
        for ent in dict.fromkeys(entity_of.values()):
            if ent not in cand_words:
                freq = sum(1 for alln, _ in pos_sets if ent in alln)
                extra.append((ent, freq))
                cand_words.add(ent)
        candidates = list(candidates) + extra

        ner_label = {"PS": "인물", "AF": "작품", "OG": "기관", "LC": "지명", "EV": "사건"}

        def _line(i, word, count):
            pos = _candidate_feed_position(word, titles)
            pos_str = f"피드 {pos}번째 첫등장" if pos else "피드 위치 미상"
            ex = " / ".join(_candidate_examples(word, titles) or ["(예시 없음)"])
            disp = " ⚠️분산(무관한 여러 기사에 흩어짐)" if _is_dispersed(word, titles) else ""
            hint = f" 〔핵심대상:{entity_of[word]}〕" if word in entity_of else ""
            t = (ner_tags or {}).get(word)
            tag = f" 🏷️개체명:{ner_label.get(t, t)}" if t else ""
            return f"{i+1}. {word} ({count}회, {pos_str}{disp}{hint}{tag}) — 예: {ex}"
        lines = "\n".join(_line(i, word, count) for i, (word, count) in enumerate(candidates))
    else:
        lines = "\n".join(f"{i+1}. {word} ({count}회)" for i, (word, count) in enumerate(candidates))
    try:
        message = anthropic_client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=120,
            messages=[{
                "role": "user",
                "content": (
                    f"너는 한국 뉴스 편집자다. 아래는 구글 뉴스 '{category}' 피드의 기사 제목들을 "
                    "형태소 분석해 뽑은 키워드 후보 목록이야. 각 줄의 형식은 다음과 같아:\n"
                    "  번호. 단어 (N회, 피드 위치[, ⚠️분산][, 〔핵심대상:X〕]) — 예: 그 단어가 들어간 실제 기사 제목\n"
                    "- N회: 그 단어가 등장한 기사 수(빈도).\n"
                    "- 피드 위치: 구글이 오늘 중요도 순으로 정렬한 헤드라인에서 그 단어가 처음 나온 순서. "
                    "앞쪽(작은 숫자)일수록 오늘 더 크게 다뤄진 이슈다.\n"
                    "- ⚠️분산: 그 단어가 나온 제목들이 '서로 무관한 여러 사건'에 흩어져 있다는 결정론적 신호다. "
                    "제목 예시들을 보면 공통 맥락(같은 인물·기관·사건)이 없을 거야.\n"
                    "- 〔핵심대상:X〕: 그 후보의 기사들이 특정 명사 X(인물·작품·기관) 하나를 중심으로 돈다는 "
                    "결정론적 신호다. 그 후보가 껍데기 일반명사라면 사실은 X 이야기라는 뜻이다. X는 이 후보 목록에 따로 들어 있다.\n"
                    "- 🏷️개체명:타입: 개체명 인식 모델이 그 단어를 실제 고유명사(인물·작품·기관·지명·사건)로 판정했다는 "
                    "결정론적 신호다. 이 태그가 붙은 후보는 두루뭉술한 일반명사가 아니라 구체적 주체일 확률이 높으니, "
                    "태그 없는 일반명사보다 우선해서 골라라. **빈도가 더 낮아도, 같은 사건을 가리키는 껍데기 일반명사 "
                    "(심장·국민·사망·사고처럼 구체적 주체가 빠진 단어)보다 🏷️개체명 태그가 붙은 후보를 골라야 한다.** "
                    "예: '심장(3회)'의 기사가 손흥민·에릭센의 심정지 사건이고 '에릭센(1회) 🏷️개체명:인물'이 후보에 있으면 "
                    "'심장'이 아니라 '에릭센'을 골라라. 특히 작품(드라마·영화·예능)·사건은 그 자체로 좋은 키워드다.\n\n"
                    "★가장 중요한 주의점★ — 이 피드는 구글이 중복을 걸러 큐레이션한 목록이라 빈도가 낮다. "
                    "그래서 '순간·배우·캠프·논란·합의·단독' 같은 두루뭉술한 일반명사가 여러 무관한 기사에 "
                    "한 번씩 박히면서 오히려 높은 빈도를 얻는다. 즉 **높은 빈도 ≠ 중요한 이슈**일 수 있다. "
                    "빈도만 보고 이런 일반명사를 뽑으면 안 된다. 반대로 '코스피'처럼 한 사건(폭락)이 여러 기사에서 "
                    "반복돼 빈도가 쌓인 건 진짜 중요한 이슈다. 둘을 가르는 잣대가 바로 ⚠️분산 신호와 제목 예시다.\n\n"
                    "제목 예시를 직접 읽고, 오늘의 서로 다른 실제 이슈를 대표하는 키워드 5개를 '중요도 순으로' 골라줘.\n\n"
                    "순위 규칙(1위가 가장 중요):\n"
                    "- **1위는 오늘 가장 비중 큰 이슈여야 한다.** 다음 신호를 종합해 판단하라(앞 신호일수록 우선):\n"
                    "  1) 구글 피드 노출 순서 — 피드 앞쪽(작은 숫자)에 처음 등장한 키워드일수록 중요하다.\n"
                    "  2) '한 사건에 집중된' 빈도 — 같은 사건을 다룬 기사가 여럿이라 빈도가 쌓인 건 중요 신호다. "
                    "단, ⚠️분산이 붙어 무관한 기사들에 흩어진 빈도는 중요도로 치지 마라(허수다).\n"
                    "  3) 사회적 파급력 — 더 많은 사람에게 영향을 주거나 관심이 큰 사안일수록 중요하다.\n"
                    "- 1~5위를 위 기준으로 명확히 줄세워라. 후보 목록 순서대로 두지 말고 실제 중요도로 재정렬하라.\n\n"
                    "선정 규칙:\n"
                    "- **〔핵심대상:X〕가 붙은 후보가 껍데기 일반명사면, 그 후보 대신 X를 골라라.** "
                    "예: '배우 〔핵심대상:박지훈〕'이면 '박지훈'을, '논란 〔핵심대상:선관위〕'이면 '선관위'를 골라라. "
                    "껍데기 일반명사가 아니라 그 뒤의 진짜 주체가 키워드다. X가 이미 다른 후보로 뽑혔다면 그 일반명사는 버려라. "
                    "단, 그 후보가 껍데기가 아니라 그 자체로 하나의 주제인 단어(환율·금리·반도체처럼 경제·사회 현상)면 "
                    "〔핵심대상〕이 붙었어도 그대로 두고 X로 바꾸지 마라. 바꿀지는 '껍데기냐 주제냐'로 네가 판단하라.\n"
                    "- **⚠️분산이 붙은 후보가 두루뭉술한 일반명사(순간·배우·캠프·논란·합의·운세·단독 등)면 반드시 제거하라.** "
                    "이건 한 이슈가 아니라 여러 무관한 기사에 우연히 섞인 단어다. 그 단어가 박힌 기사들 각각의 진짜 주제를 "
                    "대표하는 구체적 이름(인물·작품·기업)이 후보 목록에 따로 있으면 그쪽을 골라라.\n"
                    "- 단, ⚠️분산이 붙었어도 그게 '구체적 고유명사'(실존 인물·기업·지명·작품명)라면 — 한 인물/대상이 여러 "
                    "각도의 기사로 다뤄져 분산된 것일 수 있으니 — 제거하지 말고 살려라. 분산 신호는 '일반명사일 때만' 제거 근거다.\n"
                    "- **구체적 고유명사를 우선하라**(인물·기업·지명·작품·사건명). '구속'·'살인'·'여야'·'배우'·'주식' 같은 "
                    "두루뭉술한 일반명사보다, 같은 사건을 가리키는 구체적 이름이 후보에 있으면 그쪽을 골라라.\n"
                    "- **같은 사건을 가리키는 후보가 여러 개면 그중 가장 구체적인 것 하나만 골라라.** "
                    "예: '구속'과 '살인'의 제목 예시가 같은 사건이면 둘 중 하나만. 5개는 5개의 서로 다른 이슈여야 한다.\n"
                    "- 제거: 그룹명·작품명·브랜드명이 분해된 조각(예: '데몬', '헌터스', '스파이더').\n"
                    "- 제거: 단독으로 의미없는 동사성·상태성 명사(예: 검토, 추진, 본격, 시대, 교섭, 누락).\n"
                    "- **제거: 제품·게임·콘텐츠 런칭을 가리키는 일반명사(출시·공개·오픈·발매·론칭·업데이트).** "
                    "이런 단어는 서로 무관한 신제품·신작 홍보 기사들에 한 번씩 박혀 분산되기 쉽다. 그날의 사회 이슈가 "
                    "아니라 마케팅이다. 예: '살로몬 출시'·'발로란트 업데이트'가 한 후보 '출시'로 묶인 거면 그 후보는 거르라. "
                    "특정 신작 하나가 진짜 화제라면 그 작품명(후보에 따로 있을 것)을 골라라.\n"
                    "- 제거: 광고·홍보 문구나 헤드라인 감탄·수사에서 나온 수식성 명사(예: '완벽', '화제', '눈길', '충격', '깜짝'). "
                    "사건의 주체·대상이 아니라 기자의 수사일 뿐인 단어는 키워드가 아니다. 제목 예시가 광고/홍보성이면 그 후보는 거르라.\n"
                    "- **제거: 제목 예시가 관급·홍보·캠페인성 콘텐츠인 후보.** 끝에 '- 영상'이 붙은 영상 게시물, "
                    "'소통·캠페인·홍보·공모전·이벤트·당첨·함께 만든' 같은 표현이 들어간 제목은 그날의 실제 뉴스 이슈가 아니라 "
                    "기관·매체의 홍보물이다. 예: '국민과 함께 만든 소통 대한민국 - 영상'에서 나온 '국민'은 키워드가 아니다. 거르라.\n"
                    "- 경제·사회 현상을 나타내는 핵심 명사(환율·금리 등)는 유지해도 좋다.\n\n"
                    "반드시 위 후보 목록에 있는 단어 중에서만 골라라. JSON 배열로만 답해줘. "
                    "예시: [\"환율\", \"삼성\", \"이란\"]\n\n"
                    f"{lines}"
                )
            }]
        )
        match = re.search(r'\[.*?\]', message.content[0].text, re.DOTALL)
        if match:
            words = json.loads(match.group())
            result = []
            chosen = set()
            for word in words:
                for w, c in candidates:
                    if w == word and w not in chosen:
                        result.append((w, c))
                        chosen.add(w)
                        break
            # LLM이 고른 '서로 다른 이슈'만 신뢰한다. 5개 미만이어도
            # 거절된 빈도순 후보(조각·일반명사 노이즈)로 억지로 채우지 않는다.
            if result:
                return result[:5]
    except Exception as e:
        print(f"  filter_keywords 실패 — 형태소 빈도순 사용: {e}")
    return candidates[:5]

def _looks_like_refusal(text):
    """모델이 본문이 없다며 거절/사과한 응답을 요약으로 저장하지 않도록 감지."""
    if not text:
        return True
    markers = (
        "죄송", "요약이 어렵", "요약하기 어렵", "요약이 불가", "제공해주시면",
        "제공해 주시면", "본문이 필요", "내용이 필요", "기사 내용 없이",
        "실제 기사 내용", "어렵습니다", "어렵네요", "알 수 없",
    )
    return any(m in text for m in markers)


def _parse_json_array(text):
    """모델이 돌려준 JSON 배열을 파싱한다. 출력이 max_tokens에서 잘려 배열이
    닫히지 않은 경우에도, 완성된 {…} 객체만 골라 살려낸다(배치 전체 유실 방지).
    실패 시 None."""
    if not text:
        return None
    start = text.find("[")
    if start == -1:
        return None
    # 1) 정상 경로: 닫힌 배열을 그대로 파싱
    end = text.rfind("]")
    if end > start:
        try:
            return json.loads(text[start:end + 1])
        except json.JSONDecodeError:
            pass
    # 2) 잘림 등으로 실패: 균형 잡힌 최상위 {…} 객체만 개별 파싱해 건져낸다
    salvaged = []
    depth = 0
    obj_start = -1
    in_str = False
    escape = False
    for i in range(start + 1, len(text)):
        ch = text[i]
        if in_str:
            if escape:
                escape = False
            elif ch == "\\":
                escape = True
            elif ch == '"':
                in_str = False
            continue
        if ch == '"':
            in_str = True
        elif ch == "{":
            if depth == 0:
                obj_start = i
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0 and obj_start != -1:
                try:
                    salvaged.append(json.loads(text[obj_start:i + 1]))
                except json.JSONDecodeError:
                    pass
                obj_start = -1
    return salvaged or None


def generate_summary(keywords, category):
    lines = []
    for item in keywords:
        titles = " / ".join(a["title"] for a in item["articles"][:2])
        lines.append(f"- {item['word']}: {titles}")
    articles_text = "\n".join(lines)
    fallback = " · ".join(item["word"] for item in keywords[:5])
    try:
        message = anthropic_client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=150,
            messages=[
                {
                    "role": "user",
                    "content": (
                        f"다음은 오늘의 '{category}' 분야 주요 키워드와 각 키워드의 대표 기사 제목이야. "
                        "이 제목들을 근거로 오늘 이 분야에서 무슨 일이 있었는지 60자 이내 한 문장으로 요약해줘. "
                        "서로 관련 없는 주제가 섞여 있으면 억지로 연결하지 말고 '·'로 구분해. "
                        "제목만으로 단정하기 어려운 부분은 무리하게 지어내지 마. "
                        "사과·변명·부연 설명 없이 요약문 한 줄만 출력해.\n\n"
                        f"{articles_text}"
                    ),
                }
            ]
        )
        result = message.content[0].text.strip()
        if _looks_like_refusal(result):
            print("  generate_summary 거절성 응답 감지 — 키워드 나열로 대체")
            return fallback
        return result
    except Exception as e:
        print(f"  generate_summary 실패 — 키워드 나열로 대체: {e}")
        return fallback

def load_history_ranks(category, lookback_days=14):
    """최근 lookback_days일 history에서 해당 카테고리 키워드별 {날짜: 순위}를 모은다."""
    today_date = datetime.now(KST).date()
    cutoff = today_date - timedelta(days=lookback_days)
    ranks = {}
    try:
        fnames = os.listdir("data/history")
    except OSError:
        return ranks
    for fname in fnames:
        m = re.match(r'(\d{4}-\d{2}-\d{2})\.json$', fname)
        if not m:
            continue
        try:
            d = datetime.strptime(m.group(1), '%Y-%m-%d').date()
        except ValueError:
            continue
        if d < cutoff or d >= today_date:  # 오늘 파일은 제외
            continue
        day = _load_json(os.path.join("data/history", fname), {})
        cat = day.get("categories", {}).get(category, {})
        for kw in cat.get("keywords", []):
            w = kw.get("word")
            if w:
                ranks.setdefault(w, {})[m.group(1)] = kw.get("rank")
    return ranks


def keyword_trend_note(word, today_rank, history_ranks, today_date):
    """history 기반 트렌드 맥락을 계산값으로만 만든다(추측 없음).

    독자에게 의미 있는 신호만 반환하고, 약한 신호는 None으로 죽인다.
    - 처음 등장 / 3일 이상 연속 1위 / 2계단 이상 순위 변동 / 2주간 꾸준히 상위권
    """
    hist = history_ranks.get(word, {})
    if not hist:
        return "오늘 처음 등장한 키워드"

    # 1위 연속 기록 (3일 이상만 노출)
    if today_rank == 1:
        streak = 1
        d = today_date - timedelta(days=1)
        while hist.get(d.isoformat()) == 1:
            streak += 1
            d -= timedelta(days=1)
        if streak >= 3:
            return f"{streak}일 연속 1위"

    # 어제 대비 '상승'만 노출 (2계단 이상). 하락은 독자에게 의미 없는
    # 내부 순위 잡음이고, '17년 최고치인데 등수는 하락'처럼 뉴스와 모순돼
    # 읽히는 경우가 생겨 죽인다. 순위 숫자는 작을수록 상위 → 상승은 감소.
    yesterday = (today_date - timedelta(days=1)).isoformat()
    y_rank = hist.get(yesterday)
    if y_rank is not None and y_rank - today_rank >= 2:
        return f"어제 {y_rank}위 → 오늘 {today_rank}위"

    # 장기 꾸준함 (최근 14일 중 10일 이상 등장)
    if len(hist) >= 10:
        return "최근 2주간 꾸준히 상위권"

    return None  # 노출할 만한 신호 없음


def generate_descriptions(keywords, category, history_ranks, today_date):
    """키워드별 자체 설명문을 생성해 각 dict에 description으로 붙인다(in-place)."""
    if not keywords:
        return
    blocks = []
    for item in keywords:
        titles = "\n".join(f"    · {a['title']}" for a in item["articles"][:3])
        note = keyword_trend_note(item["word"], item["rank"], history_ranks, today_date)
        item["_trend_note"] = note  # 디버그/검증용, 저장 전 제거
        trend_line = f"  트렌드 정보: {note}\n" if note else ""
        blocks.append(
            f"[{item['word']}]\n{trend_line}  기사 제목:\n{titles}"
        )
    joined = "\n\n".join(blocks)
    prompt = (
        f"다음은 오늘의 '{category}' 분야 화제 키워드들이야. 키워드마다 관련 기사 제목과, "
        "있는 경우 트렌드 정보(우리 사이트가 매일 집계한 순위 데이터에서 계산한 값)를 준다.\n\n"
        "키워드마다 두 가지를 만들어줘: (A) headline — 한눈에 사건이 읽히는 짧은 구, "
        "(B) description — 설명문.\n\n"
        "(A) headline 규칙 — 핵심은 '단정형(무슨 일이 일어났는가)'이다:\n"
        "- 키워드(명사)만으론 '무슨 일인지'를 알 수 없다. 그 키워드가 '오늘 왜 화제인지'를 "
        "'주체 + 무슨 일'로 압축한 짧은 구를 만들어라(8~18자 권장, 너무 길게 늘이지 마라).\n"
        "- 반드시 '무슨 일이 일어났는지'를 드러내는 서술 요소(동사·결과·수치)를 하나 이상 담아라. "
        "키워드 단어로 시작해 그 사건의 핵심 동사·결과를 붙이는 걸 기본으로 해라. "
        "예: '코스피' → '코스피 5%대 폭락', '안타'(이정후 기사) → '이정후 15경기 연속안타', "
        "'젠슨 황' → '젠슨 황, AI 버블론 일축', '김수현' → '김수현 활동 재개'.\n"
        "- 명사·수식어만 나열한 중립 명사구는 금지다. (지양: '코스피 변동성·투자심리' → 무슨 일인지 안 보인다. "
        "지향: '코스피 5%대 폭락' → 사건이 또렷하다.) 읽는 순간 '아, 오늘 이거구나' 싶어야 한다.\n"
        "- 기사 제목에서 확인되는 사실만 써라. 과장·추측·없는 숫자 금지. 사실이 불확실하면 "
        "동사를 단정하지 말고 키워드+최소 맥락만 담아라(이때도 명사 나열은 피하라).\n\n"
        "(B) description 규칙 — 뉴스를 보러 온 독자가 한눈에 '오늘 무슨 일인지' 파악하게 하는 게 목적이야:\n\n"
        "1) **첫 문장은 반드시 오늘의 뉴스로 시작**해라. 이 키워드가 오늘 왜 화제인지, "
        "기사 제목에서 확인되는 구체적 사실(인물·사건·수치)을 앞세워라. 사전적 정의로 시작하지 마라.\n"
        "2) **정의는 생략이 기본**이다. 환율·코스피·넷플릭스·방탄소년단처럼 일반 한국인이 다 아는 "
        "단어는 절대 설명하지 마라. 정말 생소한 용어(낯선 기업·기관·전문 용어)일 때만 한 구절로 짧게 곁들여라.\n"
        "3) 트렌드 정보가 주어진 키워드만 마지막에 짧게 한 마디로 덧붙여라(예: '환율 13일 연속 1위'). "
        "트렌드 정보가 없으면 트렌드 얘기를 아예 꺼내지 마라. '지속적인 관심을 받고 있다' 같은 군더더기 표현 금지.\n"
        "4) 날카로운 당일 트리거가 없는 상시 키워드(케이팝·증시 등)는 사소한 기사 하나를 억지로 이유로 만들지 말고, "
        "여러 제목을 관통하는 큰 흐름을 담담히 요약해라.\n\n"
        "분량: 3~5문장, 250자 내외로 충실하게. 이 설명문은 키워드 상세 페이지의 본문으로 쓰이니, "
        "오늘의 사실(첫 문장) 뒤에 사건의 배경·전개·의미를 한 단락으로 자연스럽게 풀어줘라(반복·군더더기 없이).\n\n"
        "엄격한 규칙:\n"
        "- 기사 제목과 트렌드 정보에서 확인되는 사실만 써라. 추측·과장·없는 정보 생성 금지.\n"
        "- 제목만으로 사실이 불확실하면 무리하게 단정하지 마라.\n"
        "- 트렌드 정보(순위/연속 기록)는 제공된 값 그대로만 쓰고 새 숫자를 지어내지 마라.\n\n"
        "JSON 배열로만 답해라. 형식: [{\"word\": \"키워드\", \"headline\": \"헤드라인\", \"description\": \"설명문\"}]\n\n"
        f"{joined}"
    )
    try:
        message = anthropic_client.messages.create(
            model="claude-sonnet-4-6",
            # 5개 키워드×(headline+250자 설명)을 한 JSON으로 받으므로 한국어 기준
            # 3000은 빠듯해 잘리는 날이 있었다. 청구는 실제 생성 토큰 기준이라
            # 천장만 넉넉히 올린다(잘림=배치 전체 유실 방지).
            max_tokens=8000,
            messages=[{"role": "user", "content": prompt}],
        )
        arr = _parse_json_array(message.content[0].text)
        if arr is not None:
            info_map = {
                d["word"]: d
                for d in arr
                if isinstance(d, dict) and d.get("word")
            }
            for item in keywords:
                info = info_map.get(item["word"])
                if not info:
                    continue
                desc = (info.get("description") or "").strip()
                # 요약과 동일하게, 본문이 없다며 거절·사과한 응답은 설명문으로 저장하지 않는다
                if desc and not _looks_like_refusal(desc):
                    item["description"] = desc
                headline = (info.get("headline") or "").strip()
                # 헤드라인도 거절문이면 버리고 키워드(word)로 폴백되게 둔다
                if headline and not _looks_like_refusal(headline):
                    item["headline"] = headline
    except Exception as e:
        print(f"  generate_descriptions 실패({category}): {e}")
    finally:
        for item in keywords:
            item.pop("_trend_note", None)


def generate_briefing(categories_keywords):
    """전 카테고리 상위 키워드를 묶어 '오늘의 브리핑'(3~4문장 종합)을 생성한다.
    각 키워드의 headline/description을 근거로 쓴다. 실패·거절 응답이면 None을 반환해
    프런트에서 브리핑 카드를 숨긴다."""
    blocks = []
    for category, keywords in categories_keywords:
        for item in keywords[:3]:
            label = item.get("headline") or item.get("word")
            desc = (item.get("description") or "").strip()
            line = f"  · [{category}] {label}"
            if desc:
                line += f" — {desc}"
            blocks.append(line)
    if not blocks:
        return None
    joined = "\n".join(blocks)
    prompt = (
        "다음은 오늘 한국에서 화제가 된 분야별 상위 뉴스 키워드와 그 설명이야.\n"
        "이걸 묶어, 한국 독자가 '오늘 무슨 일이 있었는지' 한눈에 잡도록 종합 브리핑을 써줘.\n\n"
        "형식(가독성 최우선 — 한 덩어리 줄글 금지):\n"
        "- 맨 첫 줄: 오늘 가장 큰 이슈 하나를 한 문장으로 압축한 리드.\n"
        "- 그 다음부터는 분야/주제별로 문단을 나눠라. 각 문단은 1~2문장으로 짧게.\n"
        "- 문단과 문단 사이는 반드시 빈 줄 하나로 구분해라(전체를 한 문단으로 붙이지 마라).\n"
        "- 전체 3~4개 문단, 총 5문장 안팎.\n\n"
        "내용 규칙:\n"
        "- 가장 큰 이슈부터. 주어진 사실만 써라. 추측·과장·없는 숫자 금지.\n"
        "- 키워드를 문장에 자연스럽게 녹여라(단순 나열 금지).\n"
        "- 담담한 신문 1면 요약 톤. 제목·머리말·사과·변명·메타설명 없이 브리핑 본문만 출력해라.\n\n"
        f"{joined}"
    )
    try:
        message = anthropic_client.messages.create(
            model="claude-sonnet-4-6",
            # 한국어는 글자당 토큰 소모가 커서 600이면 5문단 브리핑이 문장 중간에
            # 잘린다. 5문단 종합에 충분한 여유를 준다(생성은 하루 2회라 비용 영향 미미).
            max_tokens=1500,
            messages=[{"role": "user", "content": prompt}],
        )
        text = message.content[0].text.strip()
        if not text or _looks_like_refusal(text):
            print("  generate_briefing 거절/빈 응답 — 브리핑 생략")
            return None
        # 안전장치: 그래도 토큰 상한에 걸리면 미완성 마지막 문장을 버려
        # "...16강에 올" 같은 잘림이 배포되지 않게 한다.
        if message.stop_reason == "max_tokens":
            cut = max(text.rfind(c) for c in ("다.", ".", "!", "?", "요."))
            if cut != -1:
                text = text[:cut + 1].rstrip()
            print("  generate_briefing 경고: max_tokens 도달 — 마지막 문장 정리")
        return text
    except Exception as e:
        print(f"  generate_briefing 실패: {e}")
        return None


anthropic_client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

kiwi = Kiwi()

# 형태소 분석기가 쪼개는 복합 명사 등록
compound_words = [
    '인공지능', '머신러닝', '딥러닝', '빅데이터', '블록체인',
    '사물인터넷', '자율주행', '데이터센터', '가상현실', '증강현실',
    '피지컬AI', '생성형AI', '클라우드', '오픈소스', '스타트업',
    '반도체', '사이버보안', '랜섬웨어', '메타버스',
]
for word in compound_words:
    kiwi.add_user_word(word, 'NNG', 0)

KST = timezone(timedelta(hours=9))
today = datetime.now(KST).strftime('%Y-%m-%d')  # yesterday → today로 변경

def _kiwi_candidates(feed_titles, stopwords):
    candidates = extract_keywords(feed_titles, stopwords, n=30)
    candidates = merge_fragment_candidates(candidates, feed_titles)
    return drop_interior_fragments(candidates, feed_titles)


def collect_category(feed_url, stopwords, category_name, strategy="kiwi"):
    """한 카테고리의 키워드+기사를 수집한다. 실패해도 빈 리스트 반환.
    strategy:
      - 'kiwi'   : 형태소 빈도(기존). 경제처럼 개념·섹터가 핵심인 카테고리.
      - 'ner'    : 개체명 전용(PS/AF/EV). 연예처럼 인물·작품이 핵심인 카테고리.
      - 'hybrid' : Kiwi 빈도 풀 + 개체명 보강. 이슈처럼 사건어+인물이 섞인 카테고리.
    NER 미가용(로드 실패) 시 모든 전략은 Kiwi로 폴백한다(사이트가 깨지지 않게)."""
    print(f"=== {category_name} Top 5 키워드 ===")
    try:
        feed = parse_feed_with_retry(feed_url)
        feed_titles = [e.title for e in feed.entries]
        ner_tags = None
        if strategy == "ner":
            ner = ner_candidates(feed_titles, {"PS", "AF", "EV"})
            if ner:
                candidates = [(w, c) for w, c, _ in ner]
                ner_tags = {w: t for w, c, t in ner}
            else:
                candidates = _kiwi_candidates(feed_titles, stopwords)
        elif strategy == "hybrid":
            candidates = _kiwi_candidates(feed_titles, stopwords)
            ner = ner_candidates(feed_titles, {"PS", "OG", "LC", "EV", "AF"})
            ner_tags = {w: t for w, c, t in ner}
            have = {w.replace(" ", "") for w, _ in candidates}
            for w, c, t in ner:  # Kiwi가 못 잡은 개체명만 후보로 보강(빈도신호는 덮지 않음)
                if w.replace(" ", "") not in have:
                    candidates.append((w, c))
                    have.add(w.replace(" ", ""))
        else:
            candidates = _kiwi_candidates(feed_titles, stopwords)
        top5 = filter_keywords(candidates, category_name, feed_titles, ner_tags=ner_tags)
        used_links = set()
        keywords = []
        for i, (word, count) in enumerate(top5):
            article_count = 3  # 모든 키워드 기사 최소 1·최대 3개
            # 개체명 태그가 없는 일반명사(심장 등)는 동음 무관기사가 섞이므로
            # 그 사건의 핵심 개체명을 검색에 붙여 좁힌다(심장 → "심장 에릭센").
            query = word
            if ner_tags is not None and word not in ner_tags:
                anchor = _event_anchor(word, feed_titles)
                if anchor:
                    query = f"{word} {anchor}"
            articles = fetch_articles_google(query, article_count, used_links)
            keywords.append({"rank": i + 1, "word": word, "count": count, "articles": articles})
            print(f"\n{i+1}위. {word} ({count}회, 검색='{query}') — 기사 {article_count}개")
            for a in articles:
                print(f"  - {a['title']}")
        return keywords
    except Exception as e:
        print(f"  {category_name} 수집 실패: {e}")
        return []


# ===== 오래된 history 정리 (날짜 기반) =====
# CI checkout이 파일 mtime을 새로 찍어서 find -mtime 방식은 동작하지 않으므로
# 파일명의 날짜를 직접 파싱해 보관 기간을 넘긴 것만 삭제한다.
HISTORY_RETENTION_DAYS = 365

def prune_history(retention_days=HISTORY_RETENTION_DAYS):
    cutoff = datetime.now(KST).date() - timedelta(days=retention_days)
    removed = 0
    for fname in os.listdir("data/history"):
        m = re.match(r'(\d{4}-\d{2}-\d{2})\.json$', fname)
        if not m:
            continue
        try:
            file_date = datetime.strptime(m.group(1), '%Y-%m-%d').date()
        except ValueError:
            continue
        if file_date < cutoff:
            os.remove(os.path.join("data/history", fname))
            removed += 1
    print(f"오래된 history {removed}개 삭제 (보관 {retention_days}일)")


# ===== 1위 연속기록 집계 (기간별) =====
# 보관 기간이 1년이므로 그 안에서 의미 있는 구간만 노출한다.
STREAK_PERIODS = {"30": 30, "90": 90, "180": 180, "365": 365}
STREAK_TOP_N = 8
STREAK_MIN = 2
STREAK_CACHE_PATH = "data/streak_summaries.json"


def _to_date(s):
    return datetime.strptime(s, '%Y-%m-%d').date()


def compute_streaks(trends, window_days, today_date):
    """기간(window_days) 안에서 키워드×카테고리별 최장 1위 연속 구간을 구한다."""
    cutoff = today_date - timedelta(days=window_days)
    results = []
    for word, entries in trends.items():
        by_cat = {}
        for e in entries:
            if e.get("rank") != 1:
                continue
            d = _to_date(e["date"])
            if d < cutoff or d > today_date:
                continue
            by_cat.setdefault(e["category"], set()).add(e["date"])
        for category, date_set in by_cat.items():
            dates = sorted(date_set)
            best_len, best_start, best_end = 1, dates[0], dates[0]
            cur_len, cur_start = 1, dates[0]
            for i in range(1, len(dates)):
                if (_to_date(dates[i]) - _to_date(dates[i - 1])).days == 1:
                    cur_len += 1
                else:
                    cur_len, cur_start = 1, dates[i]
                if cur_len > best_len:
                    best_len, best_start, best_end = cur_len, cur_start, dates[i]
            if best_len >= STREAK_MIN:
                results.append({
                    "word": word,
                    "category": category,
                    "streak": best_len,
                    "start": best_start,
                    "end": best_end,
                })
    results.sort(key=lambda s: (-s["streak"], s["word"]))
    return results[:STREAK_TOP_N]


def gather_streak_articles(word, category, start, end):
    """연속 구간(start~end)의 history에서 해당 키워드 기사 제목을 모은다."""
    titles = []
    seen = set()
    d, last = _to_date(start), _to_date(end)
    while d <= last:
        path = os.path.join("data/history", f"{d.isoformat()}.json")
        d += timedelta(days=1)
        try:
            with open(path, encoding="utf-8") as f:
                day = json.load(f)
        except (json.JSONDecodeError, OSError):
            continue
        cat = day.get("categories", {}).get(category, {})
        for kw in cat.get("keywords", []):
            if kw.get("word") != word:
                continue
            for a in kw.get("articles", []):
                t = a.get("title")
                if t and t not in seen:
                    seen.add(t)
                    titles.append(t)
    return titles


def streak_ai_summary(word, category, start, end, titles):
    """1위를 오래 유지한 이유를 한 문장으로 요약한다. 실패하면 None."""
    if not titles:
        return None
    joined = "\n".join(f"- {t}" for t in titles[:12])
    try:
        message = anthropic_client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=120,
            messages=[{
                "role": "user",
                "content": (
                    f"'{word}'(이)가 '{category}' 분야에서 {start}부터 {end}까지 여러 날 연속 뉴스 1위 키워드였어.\n"
                    "아래는 그 기간 동안의 기사 제목이야. 왜 이 키워드가 이렇게 오래 화제였는지 핵심 이유를 50자 이내 한 문장으로 설명해줘. 요약문만 출력해줘.\n\n"
                    f"{joined}"
                )
            }]
        )
        return message.content[0].text.strip()
    except Exception as e:
        print(f"  streak 요약 실패({word}): {e}")
        return None


def _load_json(path, default):
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError):
        return default


# ===== 트렌드 집계 (키워드별 시계열 + 기간별 연속기록) =====
def build_trends():
    trends = {}
    files = sorted(
        f for f in os.listdir("data/history")
        if re.match(r'\d{4}-\d{2}-\d{2}\.json$', f)
    )
    for fname in files:
        date = fname[:-5]
        try:
            with open(os.path.join("data/history", fname), encoding="utf-8") as f:
                day = json.load(f)
        except (json.JSONDecodeError, OSError):
            continue
        for category, cat in day.get("categories", {}).items():
            for kw in cat.get("keywords", []):
                word = kw.get("word")
                if not word:
                    continue
                trends.setdefault(word, []).append({
                    "date": date,
                    "category": category,
                    "rank": kw.get("rank"),
                    "count": kw.get("count"),
                })

    today_date = datetime.now(KST).date()

    # 기간별 연속기록 계산 (중복 구간은 한 번만 AI 요약)
    cache = _load_json(STREAK_CACHE_PATH, {})
    streaks_out = {}
    needed = {}
    for label, win in STREAK_PERIODS.items():
        lst = compute_streaks(trends, win, today_date)
        streaks_out[label] = lst
        for s in lst:
            key = f"{s['word']}|{s['category']}|{s['start']}|{s['end']}"
            needed[key] = s

    for key, s in needed.items():
        if key in cache:
            continue
        titles = gather_streak_articles(s["word"], s["category"], s["start"], s["end"])
        cache[key] = streak_ai_summary(s["word"], s["category"], s["start"], s["end"], titles)

    # 더 이상 노출되지 않는 캐시 정리
    cache = {k: v for k, v in cache.items() if k in needed}
    with open(STREAK_CACHE_PATH, "w", encoding="utf-8") as f:
        json.dump(cache, f, ensure_ascii=False, indent=2)

    for lst in streaks_out.values():
        for s in lst:
            s["ai_summary"] = cache.get(f"{s['word']}|{s['category']}|{s['start']}|{s['end']}")

    out = {
        "generated_at": datetime.now(KST).strftime('%Y-%m-%d %H:%M'),
        "days": len(files),
        "keywords": trends,
        "streaks": streaks_out,
    }
    with open("data/trends.json", "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    total_streaks = sum(len(v) for v in streaks_out.values())
    print(f"트렌드 집계 완료: {len(files)}일 / 고유 키워드 {len(trends)}개 / 연속기록 {total_streaks}건")


def main():
    keywords_issue = collect_category(
        "https://news.google.com/rss?hl=ko&gl=KR&ceid=KR:ko",
        stopwords_common,
        "오늘의 이슈",
        strategy="hybrid",  # 사건어(Kiwi) + 인물·사건 개체명(NER) 보강
    )
    # 경제도 검색 시드 대신 BUSINESS 토픽피드를 쓴다.
    # 금리·주식·환율을 stopword로 막지 않고, 그날 실제로 많이 다뤄질 때 자연스럽게 올라오게 한다.
    keywords_economy = collect_category(
        "https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=ko&gl=KR&ceid=KR:ko",
        stopwords_economy,
        "경제",
    )
    # 연예는 검색 쿼리(시드 편향) 대신 토픽피드를 쓴다.
    # 검색 시드(아이돌·K팝·영화 등)에 겹쳐 과대계상되던 키워드(예: 케데헌)를 없애고
    # 중립 표본에서 빈도=중요도 가설이 정직하게 성립하도록 한다.
    keywords_ent = collect_category(
        "https://news.google.com/rss/headlines/section/topic/ENTERTAINMENT?hl=ko&gl=KR&ceid=KR:ko",
        stopwords_entertainment,
        "연예",
        strategy="ner",  # 연예는 인물·작품(AF)·이벤트(EV) 개체명이 핵심
    )
    # 스포츠도 토픽피드(SPORTS)를 쓴다. 선수(PS)·구단(OG)·대회(EV) 개체명이 핵심이고
    # 사건어(Kiwi 빈도)도 섞이므로 이슈와 같은 hybrid 전략.
    keywords_sports = collect_category(
        "https://news.google.com/rss/headlines/section/topic/SPORTS?hl=ko&gl=KR&ceid=KR:ko",
        stopwords_sports,
        "스포츠",
        strategy="hybrid",
    )

    # ===== 요약 생성 =====
    summaries = {}
    for category, keywords in [("오늘의 이슈", keywords_issue), ("경제", keywords_economy), ("연예", keywords_ent), ("스포츠", keywords_sports)]:
        summary = generate_summary(keywords, category)
        summaries[category] = summary
        print(f"{category} 요약: {summary}")

    # ===== 키워드별 자체 설명문 생성 (AdFit 자체 콘텐츠 보강) =====
    today_date = datetime.now(KST).date()
    for category, keywords in [("오늘의 이슈", keywords_issue), ("경제", keywords_economy), ("연예", keywords_ent), ("스포츠", keywords_sports)]:
        history_ranks = load_history_ranks(category)
        generate_descriptions(keywords, category, history_ranks, today_date)
        for item in keywords:
            if item.get("description"):
                print(f"  [{category}] {item['word']}: {item['description']}")

    # ===== 오늘의 브리핑 (전 카테고리 종합) =====
    briefing_text = generate_briefing([
        ("오늘의 이슈", keywords_issue),
        ("경제", keywords_economy),
        ("연예", keywords_ent),
        ("스포츠", keywords_sports),
    ])
    briefing = {
        "text": briefing_text,
        "period": "아침" if datetime.now(KST).hour < 14 else "저녁",
        "generated_at": datetime.now(KST).strftime('%Y-%m-%d %H:%M'),
    } if briefing_text else None
    if briefing:
        print(f"오늘의 브리핑: {briefing_text}")

    # ===== keywords.json 저장 (summary·briefing 포함) =====
    result = {
        "date": today,
        "updated_at": datetime.now(KST).strftime('%Y-%m-%d %H:%M'),
        "briefing": briefing,
        "categories": {
            "오늘의 이슈": {
                "summary": summaries["오늘의 이슈"],
                "keywords": keywords_issue,
            },
            "경제": {
                "summary": summaries["경제"],
                "keywords": keywords_economy,
            },
            "연예": {
                "summary": summaries["연예"],
                "keywords": keywords_ent,
            },
            "스포츠": {
                "summary": summaries["스포츠"],
                "keywords": keywords_sports,
            },
        }
    }

    os.makedirs("data", exist_ok=True)
    with open("data/keywords.json", "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    os.makedirs("data/history", exist_ok=True)
    shutil.copy("data/keywords.json", f"data/history/{today}.json")

    print(f"\n{today} 키워드 저장 완료!")

    prune_history()
    build_trends()


if __name__ == "__main__":
    main()
