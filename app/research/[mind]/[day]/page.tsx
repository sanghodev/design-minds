import Link from "next/link";
import { notFound } from "next/navigation";
import { experiments } from "@/data/experiments";
import PrintButton from "../../PrintButton";
import s from "../../archive.module.css";
export default async function NotebookPage({params}:{params:Promise<{mind:string;day:string}>}) {
  const {mind,day}=await params;
  if (!["chatgpt","gemini"].includes(mind) || !/^day-\d{3}$/.test(day)) notFound();
  const e=experiments.find(e=>e.status!=="scaffold-seed"&&e.mind===mind&&e.day===Number(day.slice(4)));
  if (!e?.notebook) notFound();
  const n=e.notebook;
  return <main className={s.page} lang="ko"><nav className={s.nav}><Link href="/" className={s.brand}>DESIGN MINDS</Link><div><Link href="/research">연구 방향</Link><Link href="/book">출판 원고</Link></div></nav>
  <article className={s.document}><p className={s.kicker}>{mind.toUpperCase()} · {day.toUpperCase()} · {e.date}</p><h1>{e.title}</h1><p className={s.lede}>{n.summary}</p><div className={s.tags}>{[n.category,...n.tags].map(t=><span key={t}>{t}</span>)}</div>
  <div className={s.actions}><Link href={"/"+mind+"/"+day}>{e.status==="published" ? "실험 열기 ↗" : "작품 준비 상태 →"}</Link><Link href={"/book#"+mind+"-"+day}>출판 초고 읽기 →</Link><PrintButton/></div>
  <p className={s.note}>{n.provenance} 기록일: {n.recorded}</p>
  {e.status==="research-only"&&<p className={s.note}>연구글과 출판 초고를 먼저 공개합니다. 작품 실행 파일은 아직 전달되지 않았으며, 아래 구현·관찰·성능에 관한 설명은 Gemini의 원문 기록으로 별도 검증 전입니다.</p>}<h2>연구 질문</h2><p>{n.question}</p><h2>방법과 비교 계획</h2><ol>{n.method.map(p=><li key={p}>{p}</li>)}</ol>
  <h2>관찰과 해석</h2><p>{n.observation}</p><h2>한계와 반론</h2><p>{n.limitation}</p><h2>다음 질문</h2><p>{n.nextQuestion}</p>
  <h2>출처와 적용 범위</h2>{n.sources.map(x=><section className={s.source} key={x.url}><h3><a href={x.url}>{x.title} ↗</a></h3><small>{x.publisher} · {x.kind} · 확인 {x.accessed}</small><p>{x.use}</p><p>한계: {x.limitation}</p></section>)}
  <p className={s.note}>작성 당시의 기본 기록은 <a href={"https://github.com/sanghodev/design-minds/blob/main/experiments/"+mind+"/"+day+"/manifest.json"}>원본 manifest</a>에 보존했습니다. 이 페이지 연결 과정에서 모든 출처와 관찰 결과를 다시 검증한 것은 아닙니다. 숫자 평가는 당시의 주관적 선택 기록이며 연구 성과 지표로 사용하지 않습니다.</p>
  <h2>출판용 도판 계획</h2><p>{n.book.figurePlan}</p><p>{n.book.rights}</p>
  </article></main>;
}
