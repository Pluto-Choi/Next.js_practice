# -*- coding: utf-8 -*-
"""통합 검증: collect.py의 전략별 후보 조립이 v3 실험과 일치하는지 확인.
LLM 키 없이 _line 프롬프트 조립까지 예외 없이 도는지도 본다(결정론 확인)."""
import json, warnings; warnings.filterwarnings('ignore')
import collect
snap = json.load(open('experiments/ner/feed_snapshot.json', encoding='utf-8'))

def kiwi(cat_titles, sw):
    return collect._kiwi_candidates(cat_titles, sw)

# 연예: ner 전략
t = snap['categories']['연예']
ner = collect.ner_candidates(t, {'PS','AF','EV'})
print('[연예/ner] 후보:', [(w,c,ty) for w,c,ty in ner][:12])

# 이슈: hybrid 전략 (collect_category 로직 복제)
t = snap['categories']['오늘의 이슈']
cands = kiwi(t, collect.stopwords_common)
ent = collect.ner_candidates(t, {'PS','OG','LC','EV','AF'})
ner_tags = {w:ty for w,c,ty in ent}
have = {w.replace(' ','') for w,_ in cands}
for w,c,ty in ent:
    if w.replace(' ','') not in have:
        cands.append((w,c)); have.add(w.replace(' ',''))
print('\n[이슈/hybrid] 트럼프 포함?', any(w=='트럼프' for w,_ in cands))
print('[이슈/hybrid] 후보풀:')
for w,c in cands[:18]:
    print(f'   {w} ({c})' + (f' 🏷️{ner_tags[w]}' if w in ner_tags else ''))

print('\n[프롬프트 조립 테스트] filter_keywords 호출 (키 없으면 빈도순 폴백, 예외만 확인)')
top = collect.filter_keywords(cands, '오늘의 이슈', t, ner_tags=ner_tags)
print('  반환:', [w for w,_ in top])
print('OK - 예외 없음')
