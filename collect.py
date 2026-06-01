from kiwipiepy import Kiwi
from collections import Counter
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
    '이후', '올해', '지난', '이번', '최근', '오늘', '내일',
    # 언론사
    '한겨레', '조선', '중앙', '동아', '연합', '일보', '신문', '방송',
    '뉴시스', '네이트', '내외', '연합인포맥스', '아시아경제', '브릿지',
    '한국경제', '불교방송', '헤럴드', '파이낸셜포스트', '지디넷코리아',
    '경남일보', '연합뉴스', '시사저널', '아이티데일리',
    # 직함
    '대통령', '총리', '장관', '차관', '의원', '대표', '회장', '사장',
    '부장', '위원', '본부',
    # 행위 노이즈
    '개최', '점검', '회의', '공동', '진행', '추진', '실시',
    '참석', '발표', '논의', '강조', '예정', '확인', '지원', '운영',
    '도약', '민간', '공공', '분야', '상황', '문제', '방안',
    '계획', '목표', '효과', '결과', '사업', '행사', '기관', '현장',
    '대응', '혁신', '시행', '후보', '선거', '전시', '총력',
    # 일반 명사 노이즈
    '뉴스', '한국', '지역', '사회', '국제', '관련',
}

stopwords_economy = stopwords_common | {
    '경제', '재경부', '관리관', '국장', '개발', '활성', '서울', '대한',
    '센터', '브리핑', '강화', '대책', '세계', '구윤철', '글로벌', '실용',
    '미래', '인사이트', '리포트', '뉴스룸', '핵심', '유통',
    '전략', '도입', '가능', '트렌드', '접목', '전망', '공략',
    '브런치', '변경', '계열사', '기반', '연구',
    '활용', '시장', '제시', '전속', '계약', '모집',
    '환경', '디지털', '교육', '경제자유구역',
    '기업', '첨단', '물류', '융합', '산업',
    '역량', '시대', '변화', '사진', '기술', '외교', '협력', '통합',
    '가동', '장기',
}

stopwords_entertainment = stopwords_common | {
    '연예', '연예인', '사진', '포토', '현장포토', '영상',
    '컴백', '데뷔', '활동', '팬미팅', '콘서트', '공연', '팬',
    '발매', '앨범', '싱글', '미니', '타이틀', '멤버', '그룹', '솔로',
    '출연', '드라마', '영화', '인터뷰', '화보', '스타',
    '남자', '여자', '사랑', '결혼', '열애', '이별', '교제',
    '문화', '플러스', '앨리', '리스트', '미소', '오프', '온', '지급',
    '감독', '시즌',
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

def clean_title(title):
    # "기사 제목 - 출처명" 형식에서 출처 제거
    if ' - ' in title:
        title = title.rsplit(' - ', 1)[0]
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

def filter_keywords(candidates, category):
    lines = "\n".join(f"{i+1}. {word} ({count}회)" for i, (word, count) in enumerate(candidates))
    try:
        message = anthropic_client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=100,
            messages=[{
                "role": "user",
                "content": (
                    f"다음은 한국 뉴스에서 형태소 분석으로 추출한 '{category}' 키워드 후보야.\n"
                    "아래 기준으로 노이즈를 제거하고 실제 이슈를 대표하는 단어 5개를 순서대로 골라줘.\n"
                    "- 제거: 그룹명·작품명·브랜드명이 분해된 조각 (예: '데몬', '헌터스', '스파이더')\n"
                    "- 제거: 단독으로 의미없는 동사성·상태성 명사 (예: 검토, 추진, 본격, 시대, 교섭, 누락)\n"
                    "- 유지: 사람 이름, 지명, 기업명, 사건명 등 구체적인 고유명사\n"
                    "- 유지: 경제·사회 현상을 나타내는 핵심 명사\n"
                    "JSON 배열로만 답해줘. 예시: [\"환율\", \"삼성\", \"이란\"]\n\n"
                    f"{lines}"
                )
            }]
        )
        match = re.search(r'\[.*?\]', message.content[0].text, re.DOTALL)
        if match:
            words = json.loads(match.group())
            result = []
            for word in words:
                for w, c in candidates:
                    if w == word:
                        result.append((w, c))
                        break
            if result:
                return result[:5]
    except Exception as e:
        print(f"  filter_keywords 실패 — 형태소 빈도순 사용: {e}")
    return candidates[:5]

def generate_summary(keywords, category):
    lines = []
    for item in keywords:
        titles = " / ".join(a["title"] for a in item["articles"][:2])
        lines.append(f"- {item['word']}: {titles}")
    articles_text = "\n".join(lines)
    try:
        message = anthropic_client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=150,
            messages=[
                {
                    "role": "user",
                    "content": f"다음은 오늘의 {category} 뉴스 키워드별 기사 제목이야. 실제 기사 내용을 바탕으로 오늘의 주요 이슈를 60자 이내로 요약해줘. 서로 관련 없는 주제가 섞여 있다면 억지로 연결하지 말고 '·'로 구분해줘. 요약문만 출력해줘.\n\n{articles_text}"
                }
            ]
        )
        return message.content[0].text.strip()
    except Exception as e:
        print(f"  generate_summary 실패 — 키워드 나열로 대체: {e}")
        return " · ".join(item["word"] for item in keywords[:5])

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

def collect_category(feed_url, stopwords, category_name):
    """한 카테고리의 키워드+기사를 수집한다. 실패해도 빈 리스트 반환."""
    print(f"=== {category_name} Top 5 키워드 ===")
    try:
        feed = parse_feed_with_retry(feed_url)
        top5 = filter_keywords(
            extract_keywords([e.title for e in feed.entries], stopwords),
            category_name,
        )
        used_links = set()
        keywords = []
        for i, (word, count) in enumerate(top5):
            article_count = 3 if i == 0 else 1
            articles = fetch_articles_google(word, article_count, used_links)
            keywords.append({"rank": i + 1, "word": word, "count": count, "articles": articles})
            print(f"\n{i+1}위. {word} ({count}회) — 기사 {article_count}개")
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
            model="claude-haiku-4-5-20251001",
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
    )
    keywords_economy = collect_category(
        f"https://news.google.com/rss/search?q={quote('주식 증시 코스피 환율 금리 부동산')}&when=1d&hl=ko&gl=KR&ceid=KR:ko",
        stopwords_economy,
        "경제",
    )
    keywords_ent = collect_category(
        f"https://news.google.com/rss/search?q={quote('아이돌 K팝 드라마 연예인 영화')}&when=1d&hl=ko&gl=KR&ceid=KR:ko",
        stopwords_entertainment,
        "연예",
    )

    # ===== 요약 생성 =====
    summaries = {}
    for category, keywords in [("오늘의 이슈", keywords_issue), ("연예", keywords_ent), ("경제", keywords_economy)]:
        summary = generate_summary(keywords, category)
        summaries[category] = summary
        print(f"{category} 요약: {summary}")

    # ===== keywords.json 저장 (summary 포함) =====
    result = {
        "date": today,
        "updated_at": datetime.now(KST).strftime('%Y-%m-%d %H:%M'),
        "categories": {
            "오늘의 이슈": {
                "summary": summaries["오늘의 이슈"],
                "keywords": keywords_issue,
            },
            "연예": {
                "summary": summaries["연예"],
                "keywords": keywords_ent,
            },
            "경제": {
                "summary": summaries["경제"],
                "keywords": keywords_economy,
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
