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
    # 기존
    '경제', '뉴스', '기자', '한국', '지역', '사회', '국제', '관련',
    '한겨레', '조선', '중앙', '동아', '연합', '일보', '신문', '방송',
    '재경부', '관리관', '국장', '개발', '활성', '지성', '서울', '대한',
    '정책', '대응', '관리', '이후', '올해', '지난', '이번', '최근',
    # 언론사
    '헤럴드', '매일', '한경', '파이낸셜', '머니', '이데일리', '아시아',
    '연합인포맥스', '아시아경제', '브릿지',
    # 지역/기관 고유명사
    '부산은행', '도봉구', '아산시', '경남', '전북', '충북', '인천',
    # 형식적 단어
    '개최', '점검', '회의', '공동', '가동', '진행', '추진', '실시',
    '참석', '발표', '논의', '강조', '예정', '확인', '지원', '운영',
    '오늘', '센터', '브리핑', '강화', '대책',
    # 너무 일반적인 단어
    '도약', '장기', '민간', '공공', '분야', '상황', '문제', '방안',
    '계획', '목표', '효과', '결과', '사업', '행사', '기관', '현장',
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