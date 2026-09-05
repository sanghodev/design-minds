import Link from "next/link";
import framework from "@/creative-system/research-framework.json";
import PrintButton from "./PrintButton";
import s from "./archive.module.css";
export default function ResearchPage() {
  return <main className={s.page} lang="ko">
    <nav className={s.nav}><Link className={s.brand} href="/">DESIGN MINDS</Link><div><Link href="/">작품 색인</Link><Link href="/book">출판 원고</Link></div></nav>
    <article className={s.document}><p className={s.kicker}>RESEARCH FRAMEWORK · {framework.date} · V{framework.version}</p><h1>{framework.title}</h1><p className={s.lede}>{framework.subtitle}</p>
    <div className={s.actions}><a href="/research/design-minds-research-framework.md" download>연구 설계 문서 다운로드 ↓</a><PrintButton/></div>
    <div className={s.toc}>{framework.sections.map((x,i)=><a key={x.title} href={"#section-"+i}>{x.title}</a>)}</div>
    {framework.sections.map((x,i)=><section key={x.title} id={"section-"+i}><h2>{x.title}</h2>{x.paragraphs.map(p=><p key={p}>{p}</p>)}</section>)}
    <h2>확인한 출처</h2>{framework.sources.map(x=><div className={s.source} key={x.url}><h3><a href={x.url}>{x.title} ↗</a></h3><small>{x.publisher} · {x.date} · 확인 {x.accessed}</small><p>{x.note}</p></div>)}
    </article>
  </main>;
}
