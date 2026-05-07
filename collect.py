from kiwipiepy import Kiwi
from collections import Counter
from datetime import datetime, timedelta, timezone
from urllib.parse import quote
from supabase import create_client
import feedparser
import anthropic
import json
import os
import html

stopwords = {
    # 기본
    '경제', '뉴스', '기자', '한국', '지역', '사회', '국제', '관련',
    '한겨레', '조선', '중앙', '동아', '연합', '일보', '신문', '방송',
    '재경부', '관리관', '국장', '개발', '활성', '지성', '서울', '대한',
    '이후', '올해', '지난', '이번', '최근', '오늘', '내일',
    '연합인포맥스', '아시아경제', '브릿지', '한국경제', '불교방송',
    '센터', '브리핑', '강화', '대책',
    '개최', '점검', '회의', '공동', '가동', '진행', '추진', '실시',
    '참석', '발표', '논의', '강조', '예정', '확인', '지원', '운영',
    '도약', '장기', '민간', '공공', '분야', '상황', '문제', '방안',
    '계획', '목표', '효과', '결과', '사업', '행사', '기관', '현장',
    '기술', '외교', '협력', '통합', '시행',
    '대응', '혁신', '글로벌', '실용', '장관',
    '헤럴드', '총리', '본부', '위원', '의원', '대표', '회장', '사장',
    '부장', '차관', '장관', '대통령', '후보', '선거', '전시', '총력',
    # 언론사
    '뉴시스', '감독', '네이트', '포토', '내외', '연예인',
    '연합인포맥스', '아시아경제', '브릿지', '한국경제', '불교방송',
    '헤럴드', '파이낸셜포스트', '지디넷코리아', '경남일보',
    '연합뉴스', '시사저널', '아이티데일리',
    # IT 노이즈
    '미래', '인사이트', '리포트', '뉴스룸', '핵심', '유통',
    '전략', '도입', '가능', '트렌드', '접목', '전망', '공략',
    '브런치', '변경', '계열사', '기반', '연구',
    # 연예 노이즈
    '앨리', '리스트', '싱글', '발매', '미소', '문화', '플러스',
    '오프', '온', '남자', '현장포토', '영상', '사랑', '지급',
    # 경제 노이즈
    '세계', '구윤철',
    # 형식적 단어
    '개최', '점검', '회의', '공동', '가동', '진행', '추진', '실시',
    '참석', '발표', '논의', '강조', '예정', '확인', '지원', '운영',
    '도약', '장기', '민간', '공공', '분야', '상황', '문제', '방안',
    '계획', '목표', '효과', '결과', '사업', '행사', '기관', '현장',
    '활용', '시장', '제시', '전속', '계약', '모집',
    '환경', '디지털', '교육', '경제자유구역',
    '기업', '첨단', '물류', '융합', '산업',
    '역량', '시대', '변화', '연예', '사진',
}

def fetch_articles_google(keyword, count, used_links):
    url = f"https://news.google.com/rss/search?q={quote(keyword)}&when=1d&hl=ko&gl=KR&ceid=KR:ko"
    feed = feedparser.parse(url)
    articles = []
    for entry in feed.entries:
        if len(articles) >= count:
            break
        if entry.link in used_links:
            continue
        used_links.add(entry.link)
        articles.append({
            "title": html.unescape(entry.title),
            "link": entry.link,
            "source": entry.get("source", {}).get("title", ""),
        })
    return articles

def extract_keywords(titles):
    nouns = []
    for title in titles:
        tokens = kiwi.tokenize(title)
        for token in tokens:
            if token.tag in ('NNG', 'NNP') and len(token.form) > 1:
                if token.form not in stopwords:
                    nouns.append(token.form)
    return Counter(nouns).most_common(5)

def generate_summary(keywords, category):
    lines = []
    for item in keywords:
        titles = " / ".join(a["title"] for a in item["articles"][:2])
        lines.append(f"- {item['word']}: {titles}")
    articles_text = "\n".join(lines)
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
    return message.content[0].text

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
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

# ===== 경제 =====
print("=== 경제 Top 5 키워드 ===")
feed = feedparser.parse(f"https://news.google.com/rss/search?q={quote('주식 증시 코스피 환율 금리 부동산')}&when=1d&hl=ko&gl=KR&ceid=KR:ko")
top5_economy = extract_keywords([e.title for e in feed.entries])

used_links = set()
keywords_economy = []
for i, (word, count) in enumerate(top5_economy):
    article_count = 3 if i == 0 else 1
    articles = fetch_articles_google(word, article_count, used_links)
    keywords_economy.append({"rank": i+1, "word": word, "count": count, "articles": articles})
    print(f"\n{i+1}위. {word} ({count}회) — 기사 {article_count}개")
    for a in articles:
        print(f"  - {a['title']}")

# ===== IT =====
print("\n=== IT Top 5 키워드 ===")
feed_it = feedparser.parse(f"https://news.google.com/rss/search?q={quote('인공지능 AI 반도체 빅테크 스타트업')}&when=1d&hl=ko&gl=KR&ceid=KR:ko")
top5_it = extract_keywords([e.title for e in feed_it.entries])

used_links_it = set()
keywords_it = []
for i, (word, count) in enumerate(top5_it):
    article_count = 3 if i == 0 else 1
    articles = fetch_articles_google(word, article_count, used_links_it)
    keywords_it.append({"rank": i+1, "word": word, "count": count, "articles": articles})
    print(f"\n{i+1}위. {word} ({count}회) — 기사 {article_count}개")
    for a in articles:
        print(f"  - {a['title']}")

# ===== 연예 =====
print("\n=== 연예 Top 5 키워드 ===")
feed_ent = feedparser.parse(f"https://news.google.com/rss/search?q={quote('아이돌 케이팝 드라마 영화 배우 가수')}&when=1d&hl=ko&gl=KR&ceid=KR:ko")
top5_ent = extract_keywords([e.title for e in feed_ent.entries])

used_links_ent = set()
keywords_ent = []
for i, (word, count) in enumerate(top5_ent):
    article_count = 3 if i == 0 else 1
    articles = fetch_articles_google(word, article_count, used_links_ent)
    keywords_ent.append({"rank": i+1, "word": word, "count": count, "articles": articles})
    print(f"\n{i+1}위. {word} ({count}회) — 기사 {article_count}개")
    for a in articles:
        print(f"  - {a['title']}")

# ===== 요약 생성 =====
summaries = {}
for category, keywords in [("경제", keywords_economy), ("IT", keywords_it), ("연예", keywords_ent)]:
    summary = generate_summary(keywords, category)
    summaries[category] = summary
    print(f"{category} 요약: {summary}")

# ===== keywords.json 저장 (summary 포함) =====
result = {
    "date": today,
    "categories": {
        "경제": {
            "summary": summaries["경제"],
            "keywords": keywords_economy,
        },
        "IT": {
            "summary": summaries["IT"],
            "keywords": keywords_it,
        },
        "연예": {
            "summary": summaries["연예"],
            "keywords": keywords_ent,
        },
    }
}

os.makedirs("data", exist_ok=True)
with open("data/keywords.json", "w", encoding="utf-8") as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

print(f"\n{today} 키워드 저장 완료!")

# ===== Supabase 저장 =====
try:
    for category, keywords in [("경제", keywords_economy), ("IT", keywords_it), ("연예", keywords_ent)]:
        for item in keywords:
            supabase.table("keywords").insert({
                "date": today,
                "rank": item["rank"],
                "word": item["word"],
                "category": category,
            }).execute()

        supabase.table("daily_summary").insert({
            "date": today,
            "category": category,
            "summary": summaries[category],
        }).execute()

    print("Supabase 저장 완료!")
except Exception as e:
    print(f"Supabase 저장 실패 (무시하고 계속): {e}")