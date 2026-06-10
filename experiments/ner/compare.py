# -*- coding: utf-8 -*-
"""NER vs 현재(Kiwi) 키워드 추출 비교 하니스.
고정 피드 스냅샷을 공통 입력으로, 각 방식의 후보를 나란히 뽑는다.
모든 추론은 결정론적(argmax). 라이브 collect.py는 건드리지 않는다."""
import json, re, sys, warnings
from collections import Counter
warnings.filterwarnings('ignore')

SNAP = json.load(open('experiments/ner/feed_snapshot.json', encoding='utf-8'))

# --- 현재 방식(Kiwi) 베이스라인: collect.py 함수 재사용 ---
sys.path.insert(0, '.')
import collect
CAT_SW = {
    '오늘의 이슈': collect.stopwords_common,
    '경제': collect.stopwords_economy,
    '연예': collect.stopwords_entertainment,
}

def kiwi_candidates(cat, titles, n=12):
    cands = collect.extract_keywords(titles, CAT_SW[cat], n=30)
    cands = collect.merge_fragment_candidates(cands, titles)
    cands = collect.drop_interior_fragments(cands, titles)
    return [(w, c) for w, c in cands[:n]]

# --- NER 방식 ---
_PUNCT = re.compile(r"^[\s'\"‘’“”·,\.\-…]+|[\s'\"‘’“”·,\.\-…]+$")
KEEP_PREFIX = ('PS', 'OG', 'LC', 'AF')  # 인물/기관/지명/작품

def _clean_surface(s):
    s = s.replace('##', '').strip()
    return _PUNCT.sub('', s)

def ner_candidates(nlp, titles, n=12):
    title_freq = Counter()   # 개체명이 등장한 '제목 수'
    first_pos = {}
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
            if surf not in seen:
                seen.add(surf)
                title_freq[surf] += 1
                first_pos.setdefault(surf, idx + 1)
                types.setdefault(surf, grp)
    ranked = sorted(title_freq.items(), key=lambda kv: (-kv[1], first_pos[kv[0]]))
    return [(w, c, types[w], first_pos[w]) for w, c in ranked[:n]]

def load_ner(mid):
    from transformers import pipeline
    return pipeline('token-classification', model=mid, aggregation_strategy='simple')

MODELS = {
    'KLUE(bespin)': 'bespin-global/klue-roberta-base-ner',
    'KPF(news)': 'KPF/KPF-bert-ner',
}

def main():
    nlps = {}
    for name, mid in MODELS.items():
        print(f'[load] {name} <- {mid}', flush=True)
        try:
            nlps[name] = load_ner(mid)
            labs = sorted(set(nlps[name].model.config.id2label.values()))
            print(f'   labels: {labs}')
        except Exception as ex:
            print(f'   FAILED: {ex}')
    out = {}
    for cat, titles in SNAP['categories'].items():
        print('\n' + '=' * 70)
        print(f'[{cat}] titles={len(titles)}')
        print('=' * 70)
        print('\n-- 현재(Kiwi) --')
        kc = kiwi_candidates(cat, titles)
        for w, c in kc:
            print(f'   {w} ({c})')
        rec = {'kiwi': kc}
        for name, nlp in nlps.items():
            print(f'\n-- {name} --')
            nc = ner_candidates(nlp, titles)
            for w, c, typ, pos in nc:
                print(f'   {w} ({c}) [{typ}, 피드{pos}]')
            rec[name] = nc
        out[cat] = rec
    json.dump(out, open('experiments/ner/compare_result.json', 'w', encoding='utf-8'),
              ensure_ascii=False, indent=2)
    print('\nsaved experiments/ner/compare_result.json')

if __name__ == '__main__':
    main()
