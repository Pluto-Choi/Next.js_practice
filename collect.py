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
    '부장', '차관', '장관', '대통령', '후보', '선거', '전시',
    '네이트', '연예', '포토', '공개', '아이돌', '스타',
    '뉴시스', '감독', '네이트', '포토', '내외', '연예인',
    '기업', '첨단', '물류', '융합', '리스트', '싱글',
    '미래', '인사이트', '리포트', '지디넷코리아', '앨리',
    '경제자유구역', '환경', '디지털', '교육', '발매',
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
    words = [item["word"] for item in keywords]
    message = anthropic_client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=100,
        messages=[
            {
                "role": "user",
                "content": f"다음 {category} 뉴스 키워드들을 보고 오늘의 {category} 이슈를 15자 이내로 한 줄 요약해줘. 키워드: {', '.join(words)}. 요약문만 출력해줘."
            }
        ]
    )
    return message.content[0].text

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
anthropic_client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

kiwi = Kiwi()
KST = timezone(timedelta(hours=9))
yesterday = (datetime.now(KST) - timedelta(1)).strftime('%Y-%m-%d')

# ===== 경제 =====
print("=== 경제 Top 5 키워드 ===")
feed = feedparser.parse(f"https://news.google.com/rss/search?q={quote('경제')}&hl=ko&gl=KR&ceid=KR:ko")
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
feed_it = feedparser.parse(f"https://news.google.com/rss/search?q={quote('IT 기술')}&when=1d&hl=ko&gl=KR&ceid=KR:ko")
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
feed_ent = feedparser.parse(f"https://news.google.com/rss/search?q={quote('연예')}&when=1d&hl=ko&gl=KR&ceid=KR:ko")
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

# ===== keywords.json 저장 =====
result = {
    "date": yesterday,
    "categories": {
        "경제": keywords_economy,
        "IT": keywords_it,
        "연예": keywords_ent,
    }
}

os.makedirs("data", exist_ok=True)
with open("data/keywords.json", "w", encoding="utf-8") as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

print(f"\n{yesterday} 키워드 저장 완료!")

# ===== 요약 생성 및 Supabase 저장 =====
for category, keywords in [("경제", keywords_economy), ("IT", keywords_it), ("연예", keywords_ent)]:
    summary = generate_summary(keywords, category)
    print(f"{category} 요약: {summary}")

    for item in keywords:
        supabase.table("keywords").insert({
            "date": yesterday,
            "rank": item["rank"],
            "word": item["word"],
            "category": category,
        }).execute()

    supabase.table("daily_summary").insert({
        "date": yesterday,
        "category": category,
        "summary": summary,
    }).execute()

print("Supabase 저장 완료!")