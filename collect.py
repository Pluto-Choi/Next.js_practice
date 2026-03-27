import feedparser
from kiwipiepy import Kiwi
from urllib.parse import quote
from collections import Counter
from datetime import datetime, timedelta
import json
import os

categories = {
    "경제": "경제",
    "정치": "정치",
    "사회": "사회",
    "IT":   "IT",
    "국제": "국제",
}

stopwords = {
    # 기존
    '경제', '정치', '사회', '뉴스', '기자', '한국', '지역', '국제', '관련',
    '한겨레', '조선', '중앙', '동아', '연합', '일보', '신문', '방송',
    '재경부', '관리관', '국장', '개발', '활성', '지성', '서울', '대한',
    '이후', '올해', '지난', '이번', '최근', '오늘', '내일',
    '연합인포맥스', '아시아경제', '브릿지', '한국경제', '불교방송',
    '센터', '브리핑', '강화', '대책',
    '개최', '점검', '회의', '공동', '가동', '진행', '추진', '실시',
    '참석', '발표', '논의', '강조', '예정', '확인', '지원', '운영',
    '도약', '장기', '민간', '공공', '분야', '상황', '문제', '방안',
    '계획', '목표', '효과', '결과', '사업', '행사', '기관', '현장',
    # 검색어 자체
    '기술', '외교', '협력', '통합', '시행',
    # 형식적 단어 추가
    '대응', '혁신', '글로벌', '실용', '장관',
}

kiwi = Kiwi()
yesterday = (datetime.now() - timedelta(1)).strftime('%Y-%m-%d')
result = {"date": yesterday, "categories": {}}

for category, query in categories.items():
    url = f"https://news.google.com/rss/search?q={quote(query)}&hl=ko&gl=KR&ceid=KR:ko"
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
    top5 = [{"word": word, "count": count} for word, count in counter.most_common(5)]
    result["categories"][category] = top5

    print(f"\n=== {category} Top 5 ===")
    for item in top5:
        print(f"{item['word']}: {item['count']}회")

os.makedirs("data", exist_ok=True)
with open("data/keywords.json", "w", encoding="utf-8") as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

print(f"\n{yesterday} 키워드 저장 완료!")