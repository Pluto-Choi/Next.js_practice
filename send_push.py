"""매일 낮 12시(KST) 구독자에게 오늘의 키워드 푸시 알림 발송."""
import json
import os
import requests
from pywebpush import webpush, WebPushException

SUPABASE_URL = os.environ["SUPABASE_URL"].rstrip("/")
SUPABASE_SERVICE_KEY = os.environ["SUPABASE_SERVICE_KEY"]
VAPID_PRIVATE_KEY = os.environ["VAPID_PRIVATE_KEY"]
VAPID_SUBJECT = os.environ.get("VAPID_SUBJECT", "mailto:syoung.choi327@gmail.com")
SITE_URL = os.environ.get("SITE_URL", "https://whymystockisboom.vercel.app")

HEADERS = {
    "apikey": SUPABASE_SERVICE_KEY,
    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
    "Content-Type": "application/json",
}


def build_message():
    with open("data/keywords.json", encoding="utf-8") as f:
        data = json.load(f)
    issue = data.get("categories", {}).get("오늘의 이슈", {})
    words = [k["word"] for k in issue.get("keywords", [])[:3]]
    body = " · ".join(words) if words else "오늘의 새 키워드를 확인해보세요."
    return {
        "title": "오늘의 뉴스 🔥",
        "body": f"오늘의 핫이슈: {body}",
        "url": "/",
    }


def get_subscriptions():
    res = requests.get(
        f"{SUPABASE_URL}/rest/v1/push_subscriptions?select=endpoint,p256dh,auth",
        headers=HEADERS,
        timeout=30,
    )
    res.raise_for_status()
    return res.json()


def delete_subscription(endpoint):
    requests.delete(
        f"{SUPABASE_URL}/rest/v1/push_subscriptions",
        headers=HEADERS,
        params={"endpoint": f"eq.{endpoint}"},
        timeout=30,
    )


def main():
    payload = json.dumps(build_message(), ensure_ascii=False)
    subs = get_subscriptions()
    print(f"구독자 {len(subs)}명에게 발송 시작")

    sent, pruned, failed = 0, 0, 0
    for sub in subs:
        subscription_info = {
            "endpoint": sub["endpoint"],
            "keys": {"p256dh": sub["p256dh"], "auth": sub["auth"]},
        }
        try:
            webpush(
                subscription_info=subscription_info,
                data=payload,
                vapid_private_key=VAPID_PRIVATE_KEY,
                vapid_claims={"sub": VAPID_SUBJECT},
                ttl=86400,
                headers={"Urgency": "high"},
            )
            sent += 1
        except WebPushException as e:
            status = getattr(e.response, "status_code", None)
            if status in (404, 410):
                delete_subscription(sub["endpoint"])
                pruned += 1
            else:
                failed += 1
                print(f"발송 실패({status}): {e}")

    print(f"완료 — 발송 {sent}, 만료정리 {pruned}, 실패 {failed}")


if __name__ == "__main__":
    main()
