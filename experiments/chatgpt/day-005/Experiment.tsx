"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import s from "./experiment.module.css";

type Frame = "full" | "book" | "thumbnail" | "caption";
const frames: Record<Frame, { label: string; note: string; crop: string; offset: string }> = {
  full: { label: "Full study", note: "작품과 주석을 같은 판면에 둔다.", crop: "100%", offset: "0%" },
  book: { label: "Book spread", note: "책의 안쪽 여백에 출처 손잡이를 남긴다.", crop: "78%", offset: "-7%" },
  thumbnail: { label: "Archive crop", note: "작게 잘려도 날짜와 질문이 남는다.", crop: "58%", offset: "12%" },
  caption: { label: "Caption only", note: "이미지 없이도 연구 질문이 버틴다.", crop: "36%", offset: "28%" },
};

const facts = [
  "DAY 005",
  "CHATGPT",
  "PROVENANCE",
  "NO PARTICIPANT DATA",
  "ACCESS 2026-09-07",
];

export default function ProvenanceExperiment() {
  const [frame, setFrame] = useState<Frame>("book");
  const [showSources, setShowSources] = useState(true);
  const statusId = useId();
  const active = frames[frame];
  const sentence = useMemo(
    () => `현재 프레임은 ${active.label}입니다. ${active.note}`,
    [active],
  );

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const order: Frame[] = ["full", "book", "thumbnail", "caption"];
    const index = order.indexOf(frame);
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      setFrame(order[Math.min(order.length - 1, index + 1)]);
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      setFrame(order[Math.max(0, index - 1)]);
    }
    if (event.key === "Home") {
      event.preventDefault();
      setFrame("full");
    }
    if (event.key === "End") {
      event.preventDefault();
      setFrame("caption");
    }
  };

  return (
    <main className={s.page} lang="ko">
      <nav className={s.nav}>
        <Link href="/">← Design Minds</Link>
        <Link href="/research/chatgpt/day-005">연구노트 ↗</Link>
      </nav>

      <section className={s.study} aria-labelledby="title">
        <div className={s.panel}>
          <p className={s.eyebrow}>CHATGPT · DAY 005 / 이동하는 캡션</p>
          <h1 id="title">A Caption That Survives the Crop</h1>
          <p className={s.lede}>
            작품이 썸네일, 책 도판, 공유 이미지로 잘려 나가도 연구의 질문과 출처가
            장식이 아니라 구조로 남을 수 있는지 시험합니다.
          </p>

          <fieldset className={s.controls} onKeyDown={onKeyDown} aria-describedby={statusId}>
            <legend>잘려 나갈 상황 선택</legend>
            {(Object.keys(frames) as Frame[]).map((key) => (
              <button
                key={key}
                type="button"
                aria-pressed={frame === key}
                onClick={() => setFrame(key)}
              >
                {frames[key].label}
              </button>
            ))}
          </fieldset>

          <label className={s.toggle}>
            <input
              type="checkbox"
              checked={showSources}
              onChange={(event) => setShowSources(event.target.checked)}
            />
            출처 띠 보이기
          </label>
          <p className={s.status} id={statusId} role="status" aria-live="polite">
            {sentence}
          </p>
        </div>

        <section className={s.stage} aria-label="잘림에도 남는 출처 캡션 실험">
          <div
            className={s.viewport}
            style={{ "--crop": active.crop, "--offset": active.offset } as React.CSSProperties}
          >
            <article className={s.sheet}>
              <div className={s.wordBlock}>
                <span>TRACE</span>
                <span>THE</span>
                <span>QUESTION</span>
              </div>
              <p className={s.question}>
                What remains readable when the image leaves its interface?
              </p>
              {showSources && (
                <aside className={s.provenance} aria-label="작품과 함께 이동하는 출처 정보">
                  <strong>Caption as handle</strong>
                  <span>Question · method · limitation · source path</span>
                  <span>not proof of audience behavior</span>
                </aside>
              )}
            </article>
          </div>

          <div className={s.rail} aria-hidden="true">
            {facts.map((fact) => (
              <span key={fact}>{fact}</span>
            ))}
          </div>
        </section>
      </section>

      <footer className={s.footer}>
        <p>방향키, Home, End로 프레임을 바꿀 수 있습니다. 모든 선택은 버튼으로도 가능합니다.</p>
        <Link href="/book#chatgpt-day-005">오늘의 출판 초고 →</Link>
      </footer>
    </main>
  );
}
