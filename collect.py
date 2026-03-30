from kiwipiepy import Kiwi
from collections import Counter
from datetime import datetime, timedelta, timezone, date
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
    '부장', '차관', '장관', '대통령', '후보', '선거',
}

def fetch_articles(keyword, count, used_links=set()):
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

print(f"ANTHROPIC_API_KEY 존재 여부: {bool(os.environ.get('ANTHROPIC_API_KEY'))}") # 디버깅용 출력

def generate_summary(keywords):
    words = [item["word"] for item in keywords]
    message = anthropic_client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=100,
        messages=[
            {
                "role": "user",
                "content": f"다음 경제 뉴스 키워드들을 보고 오늘의 경제 이슈를 15자 이내로 한 줄 요약해줘. 키워드: {', '.join(words)}. 요약문만 출력해줘."
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

# 경제 키워드 수집
url = f"https://news.google.com/rss/search?q={quote('경제')}&hl=ko&gl=KR&ceid=KR:ko"
feed = feedparser.parse(url)
titles = [entry.title for entry in feed.entries]

nouns = []
for title in titles:
    tokens = kiwi.tokenize(title)
    for token in tokens:
        if token.tag in ('NNG', 'NNP') and len(token.form) > 1:
            if token.form not in stopwords:
                nouns.append(token.form)

counter = Counter(nouns)
top5 = counter.most_common(5)

print("=== 경제 Top 5 키워드 ===")
keywords_with_articles = []

# used_links를 공유하도록 수정
used_links = set()

for i, (word, count) in enumerate(top5):
    article_count = 3 if i == 0 else 1
    articles = fetch_articles(word, article_count, used_links)
    keywords_with_articles.append({
        "rank": i + 1,
        "word": word,
        "count": count,
        "articles": articles
    })
    print(f"\n{i+1}위. {word} ({count}회) — 기사 {article_count}개")
    for a in articles:
        print(f"  - {a['title']}")

result = {
    "date": yesterday,
    "category": "경제",
    "keywords": keywords_with_articles
}

os.makedirs("data", exist_ok=True)
with open("data/keywords.json", "w", encoding="utf-8") as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

print(f"\n{yesterday} 키워드 저장 완료!")

# 요약 생성
summary = generate_summary(keywords_with_articles)
print(f"오늘의 요약: {summary}")

# Supabase에 저장
for item in keywords_with_articles:
    supabase.table("keywords").insert({
        "date": yesterday,
        "rank": item["rank"],
        "word": item["word"],
        "summary": summary,
    }).execute()