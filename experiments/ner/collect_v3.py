# -*- coding: utf-8 -*-
"""v3 하이브리드: 작품(AF)·이벤트(EV) 잡는 모두-NER(15태그) 적용 + 이슈 LLM힌트 풀.
- 연예: modu-ner, keep PS/AF/OG/EV (인물+작품+기획사+이벤트). bespin(인물만)과 대조.
- 경제: Kiwi 전용.
- 이슈: Kiwi 우선 풀 + modu 개체명 힌트(덮어쓰기 X) — LLM에 넘어갈 후보풀을 그대로 출력.
로컬 API키 없음 -> 이슈 최종 LLM 선별은 프로덕션에서. 여기선 풀+힌트만 검증."""
import json, re, sys, warnings
from collections import Counter, defaultdict
warnings.filterwarnings('ignore')

SNAP = json.load(open('experiments/ner/feed_snapshot.json', encoding='utf-8'))
sys.path.insert(0, '.')
import collect
CAT_SW = {'오늘의 이슈': collect.stopwords_common,
          '경제': collect.stopwords_economy,
          '연예': collect.stopwords_entertainment}

def kiwi_candidates(cat, titles, n=30):
    c = collect.extract_keywords(titles, CAT_SW[cat], n=40)
    c = collect.merge_fragment_candidates(c, titles)
    c = collect.drop_interior_fragments(c, titles)
    return [(w, cnt) for w, cnt in c[:n]]

_PUNCT = re.compile(r"^[\s'\"‘’“”·,\.\-…]+|[\s'\"‘’“”·,\.\-…]+$")
def _norm(s): return s.replace(' ', '')
def _clean(s): return _PUNCT.sub('', s.replace('##', '').strip())

def ner_candidates(nlp, titles, keep, n=40):
    freq = Counter(); first = {}; surf = defaultdict(Counter); typ = {}
    for i, t in enumerate(titles):
        ct = collect.clean_title(t); seen = set()
        for e in nlp(ct):
            g = e['entity_group']
            base = g.split('-')[-1]            # B-AF/I-AF/AF -> AF
            if base not in keep: continue
            s = _clean(ct[e['start']:e['end']])
            if len(s) < 2: continue
            k = _norm(s); surf[k][s] += 1
            if k not in seen:
                seen.add(k); freq[k] += 1
                first.setdefault(k, i + 1); typ.setdefault(k, base)
    out = []
    for k, c in sorted(freq.items(), key=lambda kv: (-kv[1], first[kv[0]])):
        out.append((surf[k].most_common(1)[0][0], c, typ[k], first[k]))
    return out[:n]

def load(mid):
    from transformers import pipeline
    return pipeline('token-classification', model=mid, aggregation_strategy='simple')

def show(title, rows):
    print(f'\n-- {title} --')
    for r in rows:
        if len(r) == 2: print(f'   {r[0]} ({r[1]})')
        else: print(f'   {r[0]} ({r[1]}) [{r[2]}]')

def main():
    print('[load] bespin (인물만)', flush=True)
    bespin = load('bespin-global/klue-roberta-base-ner')
    print('[load] modu (15태그, AF/EV 포함)', flush=True)
    modu = load('Leo97/KoELECTRA-small-v3-modu-ner')
    out = {}

    # 연예: bespin vs modu 대조
    titles = SNAP['categories']['연예']
    print('\n' + '=' * 64); print(f'[연예] titles={len(titles)}'); print('=' * 64)
    show('현재(Kiwi)', kiwi_candidates('연예', titles)[:12])
    show('bespin (PS/OG/LC)', [(w,c,t) for w,c,t,_ in ner_candidates(bespin, titles, {'PS','OG','LC'}, 12)])
    modu_ent = ner_candidates(modu, titles, {'PS','AF','OG','EV'}, 12)
    show('modu (PS/AF/OG/EV)', [(w,c,t) for w,c,t,_ in modu_ent])
    out['연예'] = {'kiwi': kiwi_candidates('연예', titles)[:12],
                   'modu': [(w,c,t) for w,c,t,_ in modu_ent]}

    # 경제: Kiwi
    titles = SNAP['categories']['경제']
    print('\n' + '=' * 64); print(f'[경제] titles={len(titles)}'); print('=' * 64)
    show('현재=하이브리드(Kiwi)', kiwi_candidates('경제', titles)[:10])
    out['경제'] = {'kiwi': kiwi_candidates('경제', titles)[:10]}

    # 이슈: Kiwi 우선 풀 + modu 힌트 (덮어쓰기 X)
    titles = SNAP['categories']['오늘의 이슈']
    print('\n' + '=' * 64); print(f'[오늘의 이슈] titles={len(titles)}'); print('=' * 64)
    kiwi = kiwi_candidates('오늘의 이슈', titles, n=14)
    ent = ner_candidates(modu, titles, {'PS','OG','LC','EV','AF'}, 40)
    ent_by_norm = {_norm(w): t for w, c, t, _ in ent}
    pool = []
    for w, c in kiwi:                       # Kiwi 우선(빈도신호 보존), 개체명이면 태그 주석
        tag = ent_by_norm.get(_norm(w))
        pool.append((w, c, tag or '-'))
    used = {_norm(w) for w, _ in kiwi}
    extra = [(w, c, t) for w, c, t, _ in ent if _norm(w) not in used][:8]  # NER 전용 개체 추가
    print('\n-- LLM에 넘어갈 후보풀 (Kiwi 우선 + NER태그) --')
    for w, c, t in pool: print(f'   {w} ({c}) [{t}]')
    print('   --- NER 전용 추가 개체명 ---')
    for w, c, t in extra: print(f'   {w} ({c}) [{t}]')
    out['오늘의 이슈'] = {'pool': pool, 'ner_extra': extra}

    json.dump(out, open('experiments/ner/collect_v3_result.json','w',encoding='utf-8'),
              ensure_ascii=False, indent=2)
    print('\nsaved experiments/ner/collect_v3_result.json')

if __name__ == '__main__':
    main()
