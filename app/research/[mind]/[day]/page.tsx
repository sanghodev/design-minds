import Link from "next/link";
import { notFound } from "next/navigation";
import { experiments } from "@/data/experiments";
import type { ResearchNotebook, ResearchSource } from "@/data/research-types";
import PrintButton from "../../PrintButton";
import s from "../../archive.module.css";
function nextQuestionFor(notebook: ResearchNotebook) {
  return notebook.nextQuestion || (notebook as ResearchNotebook & { next_step?: string }).next_step || "";
}
function sourceUse(source: ResearchSource) {
  return source.use || (source as ResearchSource & { relevance?: string }).relevance || "";
}
export default async function NotebookPage({params}:{params:Promise<{mind:string;day:string}>}) {
  const {mind,day}=await params;
  if (!["chatgpt","gemini"].includes(mind) || !/^day-\d{3}$/.test(day)) notFound();
  const e=experiments.find(e=>e.status!=="scaffold-seed"&&e.mind===mind&&e.day===Number(day.slice(4)));
  if (!e?.notebook) notFound();
  const n=e.notebook;
  const hasBook=Boolean(n.book&&["status","chapter","hook","scene","argument","counterpoint","readerExercise","futureSignal","revisit","figurePlan","rights"].every(key=>typeof n.book[key as keyof typeof n.book]==="string"&&n.book[key as keyof typeof n.book].trim()));
  return <main className={s.page} lang="ko"><nav className={s.nav}><Link href="/" className={s.brand}>DESIGN MINDS</Link><div><Link href="/research">연구 방향</Link><Link href="/book">출판 원고</Link></div></nav>
  <article className={s.document}><p className={s.kicker}>{mind.toUpperCase()} · {day.toUpperCase()} · {e.date}</p><h1>{e.title}</h1><p className={s.lede}>{n.summary}</p><div className={s.tags}>{[n.category, ...(n.tags || [])].filter(Boolean).map(t=><span key={t}>{t}</span>)}</div>
  <div className={s.actions}><Link href={"/"+mind+"/"+day}>{e.status==="published" ? "실험 열기 ↗" : "작품 준비 상태 →"}</Link>{hasBook&&<Link href={"/book#"+mind+"-"+day}>출판 초고 읽기 →</Link>}<PrintButton/></div>
  <p className={s.note}>{n.provenance} 기록일: {n.recorded}</p>
  {e.status==="research-only"&&<p className={s.note}>연구 기록을 먼저 공개합니다. 실행 파일의 존재와 관계없이 정본 출판 필드와 공개 검증이 완료되기 전이며, 아래 구현·관찰·성능 서술은 Gemini의 원문 기록으로 별도 검증 전입니다.</p>}<h2>연구 질문</h2><p>{n.question}</p><h2>방법과 비교 계획</h2><ol>{(n.method || []).map(p=><li key={p}>{p}</li>)}</ol>
  <h2>관찰과 해석</h2><p>{n.observation}</p><h2>한계와 반론</h2><p>{n.limitation || "기록 대기 중"}</p><h2>다음 질문</h2><p>{nextQuestionFor(n)}</p>
  <h2>출처와 적용 범위</h2>{(n.sources || []).map(x=><section className={s.source} key={x.url || x.title}><h3><a href={x.url || "#"}>{x.title} ↗</a></h3><small>{x.publisher} · {x.kind || "source"} · 확인 {x.accessed || ""}</small><p>{sourceUse(x)}</p><p>한계: {x.limitation || "N/A"}</p></section>)}
  <p className={s.note}>작성 당시의 기본 기록은 <a href={"https://github.com/sanghodev/design-minds/blob/main/experiments/"+mind+"/"+day+"/manifest.json"}>원본 manifest</a>에 보존했습니다. 이 페이지 연결 과정에서 모든 출처와 관찰 결과를 다시 검증한 것은 아닙니다. 숫자 평가는 당시의 주관적 선택 기록이며 연구 성과 지표로 사용하지 않습니다.</p>
  {n.book && <><h2>출판용 도판 계획</h2><p>{n.book.figurePlan}</p><p>{n.book.rights}</p></>}
  {n.review?.status==="complete"&&<><h2>검토 기록</h2><p>{n.review.reviewed} · {n.review.verdict}</p><p>{n.review.summary}</p><ul>{n.review.records.map(path=><li key={path}><a href={"https://github.com/sanghodev/design-minds/blob/main/"+path}>{path.split("/").at(-1)} ↗</a></li>)}</ul></>}
  </article></main>;
}
