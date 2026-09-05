import Archive from "./Archive";
import { experiments } from "@/data/experiments";

export default function Home() {
  const entries=experiments.filter(e=>e.status==="published").map(e=>({
    status:e.status,day:e.day,date:e.date,mind:e.mind,title:e.title,discipline:e.discipline,hypothesis:e.hypothesis,
    notebook:e.notebook ? {category:e.notebook.category,tags:e.notebook.tags,summary:e.notebook.summary} : undefined
  }));
  return <Archive entries={entries}/>;
}
