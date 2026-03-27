import feedparser
from kiwipiepy import Kiwi
from collections import Counter
from datetime import datetime, timedelta
import json
import os

url = "https://news.google.com/rss/search?q=경제&hl=ko&gl=KR&ceid=KR:ko"
feed = feedparser.parse(url)

titles = [entry.title for entry in feed.entries]
print(f"가져온 기사 수: {len(titles)}개\n")

stopwords = {
    '경제', '뉴스', '기자', '한국', '지역', '사회', '국제', '관련',
    '한겨레', '조선', '중앙', '동아', '연합', '일보', '신문', '방송',
    '재경부', '관리관', '국장', '개발', '활성', '지성', '서울', '대한',
    '정책', '대응', '관리', '이후', '올해', '지난', '이번', '최근'
}

kiwi = Kiwi()
nouns = []

for title in titles:
    tokens = kiwi.tokenize(title)
    for token in tokens:
        if token.tag in ('NNG', 'NNP') and len(token.form) > 1:
            if token.form not in stopwords:
                nouns.append(token.form)

counter = Counter(nouns)
top20 = [{"word": word, "count": count} for word, count in counter.most_common(20)]

yesterday = (datetime.now() - timedelta(1)).strftime('%Y-%m-%d')
result = {
    "date": yesterday,
    "keywords": top20
}

os.makedirs("data", exist_ok=True)
with open("data/keywords.json", "w", encoding="utf-8") as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

print(f"{yesterday} 키워드 저장 완료!")
print(json.dumps(top20[:5], ensure_ascii=False, indent=2))