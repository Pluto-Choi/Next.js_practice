import feedparser
from kiwipiepy import Kiwi
from collections import Counter
from datetime import datetime, timedelta, timezone, date
from urllib.parse import quote
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