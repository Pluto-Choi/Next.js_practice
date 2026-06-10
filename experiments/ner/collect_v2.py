# -*- coding: utf-8 -*-
"""카테고리별 하이브리드 키워드 추출 (실험용, 라이브 collect.py 미수정).
- 연예: NER(KLUE bespin) 전용  -> 인물/작품 중심
- 경제: Kiwi 전용             -> 경제 개념/섹터 (NER은 개념을 못 잡고 깨먹음)
- 이슈: NER 개체명 우선 + Kiwi 보충 -> 검증된 인물이 일반명사 위로
모든 추론 결정론적(argmax). 같은 스냅샷 -> 같은 결과."""
import json, re, sys, warnings
from collections import Counter, defaultdict
warnings.filterwarnings('ignore')

SNAP = json.load(open('experiments/ner/feed_snapshot.json', encoding='utf-8'))
sys.path.insert(0, '.')
import collect

CAT_SW = {
    '오늘의 이슈': collect.stopwords_common,
    '경제': collect.stopwords_economy,
    '연예': collect.stopwords_entertainment,
}

# ---------- Kiwi ----------
def kiwi_candidates(cat, titles, n=30):
    cands = collect.extract_keywords(titles, CAT_SW[cat], n=40)
    cands = collect.merge_fragment_candidates(cands, titles)
    cands = collect.drop_interior_fragments(cands, titles)
    return [(w, c) for w, c in cands[:n]]

# ---------- NER ----------
_PUNCT = re.compile(r"^[\s'\"‘’“”·,\.\-…]+|[\s'\"‘’“”·,\.\-…]+$")
KEEP_PREFIX = ('PS', 'OG', 'LC', 'AF')
def _norm(s): return s.replace(' ', '')
def _clean_surface(s):
    return _PUNCT.sub('', s.replace('##', '').strip())

def ner_candidates(nlp, titles, n=30):
    """띄어쓰기 변형(젠슨 황/젠슨황) 정규화 머지. norm 기준 제목빈도 집계."""
    freq = Counter()                 # norm -> 등장 제목 수
    first_pos = {}                   # norm -> 최초 피드 index
    surf_count = defaultdict(Counter)# norm -> {표면형: 횟수}  (대표표기 선정용)
    types = {}
    for idx, t in enumerate(titles):
        ct = collect.clean_title(t)
        seen = set()
        for e in nlp(ct):
            grp = e['entity_group']
            if not grp.startswith(KEEP_PREFIX):
                continue
            surf = _clean_surface(ct[e['start']:e['end']])
            if len(surf) < 2:
                continue
            key = _norm(surf)
            surf_count[key][surf] += 1
            if key not in seen:
                seen.add(key)
                freq[key] += 1
                first_pos.setdefault(key, idx + 1)
                types.setdefault(key, grp)
    out = []
    for key, c in sorted(freq.items(), key=lambda kv: (-kv[1], first_pos[kv[0]])):
        disp = surf_count[key].most_common(1)[0][0]   # 가장 흔한 표면형
        out.append((disp, c, types[key], first_pos[key]))
    return out[:n]

# ---------- 하이브리드 결합 ----------
def hybrid(cat, kiwi, ner, n=10):
    if cat == '연예':
        return [(w, c, typ) for w, c, typ, _ in ner[:n]]
    if cat == '경제':
        return [(w, c, 'KIWI') for w, c in kiwi[:n]]
    # 이슈: NER 개체명 우선, 그다음 Kiwi로 빈자리 채움(중복 norm 제거)
    res, used = [], set()
    for w, c, typ, _ in ner:
        k = _norm(w)
        if k in used: continue
        used.add(k); res.append((w, c, typ))
        if len(res) >= n: return res
    for w, c in kiwi:
        k = _norm(w)
        if k in used: continue
        used.add(k); res.append((w, c, 'KIWI'))
        if len(res) >= n: return res
    return res

def load_ner(mid):
    from transformers import pipeline
    return pipeline('token-classification', model=mid, aggregation_strategy='simple')

def main():
    print('[load] KLUE(bespin)', flush=True)
    nlp = load_ner('bespin-global/klue-roberta-base-ner')
    out = {}
    for cat, titles in SNAP['categories'].items():
        kiwi = kiwi_candidates(cat, titles)
        ner = ner_candidates(nlp, titles)
        hyb = hybrid(cat, kiwi, ner)
        print('\n' + '=' * 64)
        print(f'[{cat}] titles={len(titles)}')
        print('=' * 64)
        col_k = [f'{w}({c})' for w, c in kiwi[:10]]
        col_h = [f'{w}({c})[{typ}]' for w, c, typ in hyb]
        width = max(len(col_k), len(col_h))
        print(f'{"현재(Kiwi)":<28} | 하이브리드')
        print('-' * 64)
        for i in range(width):
            l = col_k[i] if i < len(col_k) else ''
            r = col_h[i] if i < len(col_h) else ''
            print(f'{l:<28} | {r}')
        out[cat] = {'kiwi': kiwi[:10], 'hybrid': hyb}
    json.dump(out, open('experiments/ner/collect_v2_result.json', 'w', encoding='utf-8'),
              ensure_ascii=False, indent=2)
    print('\nsaved experiments/ner/collect_v2_result.json')

if __name__ == '__main__':
    main()
