import { readFile, writeFile, readdir, mkdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
const root = resolve(import.meta.dirname, "..");
const check = process.argv.includes("--check");
async function emit(path, text) {
  const full=resolve(root,path);
  if(check){const previous=await readFile(full,"utf8").catch(()=>"");if(previous!==text)throw new Error("Stale publication export: "+path);return;}
  await mkdir(dirname(full),{recursive:true});await writeFile(full,text);
}
const days=(await readdir(resolve(root,"experiments/chatgpt"))).filter(x=>/^day-\d{3}$/.test(x)).sort();
const chapters=[];
for(const day of days){
  const dir=resolve(root,"experiments/chatgpt",day);
  const manifest=JSON.parse(await readFile(resolve(dir,"manifest.json"),"utf8"));
  if(manifest.status!=="published")continue;
  const n=JSON.parse(await readFile(resolve(dir,"notebook.json"),"utf8"));
  const b=n.book;
  const sections=[["장면",b.scene],["주장",b.argument],["반론",b.counterpoint],["독자 실험",b.readerExercise],["시대의 신호와 미래 가설",b.futureSignal],["재검토",b.revisit],["도판 계획",b.figurePlan],["권리",b.rights]];
  const text="# "+manifest.title+"\n\nChatGPT · "+day+" · 실험 "+manifest.date+" · 기록 "+n.recorded+"\n\n"+n.provenance+"\n\n"+b.status+" · 편집 장: "+b.chapter+"\n\n> "+b.hook+"\n\n"+sections.map(([t,p])=>"## "+t+"\n\n"+p).join("\n\n")+"\n\n## 출처\n\n"+n.sources.map(x=>"- ["+x.title+"]("+x.url+") — "+x.publisher+"; 확인 "+x.accessed+". "+x.use+" 한계: "+x.limitation).join("\n")+"\n";
  await emit("experiments/chatgpt/"+day+"/book.md",text);chapters.push(text);
}
await emit("public/research/chatgpt-book.md","# Design Minds — ChatGPT 출판 초고 모음\n\n이 파일은 각 실험의 notebook.json에서 생성합니다. 독립된 ChatGPT 기록만 포함합니다. 최종 출판본이 아닙니다.\n\n"+chapters.join("\n\n---\n\n"));
const f=JSON.parse(await readFile(resolve(root,"creative-system/research-framework.json"),"utf8"));
await emit("public/research/design-minds-research-framework.md","# "+f.title+"\n\n"+f.subtitle+"\n\n"+f.date+" · v"+f.version+"\n\n"+f.sections.map(x=>"## "+x.title+"\n\n"+x.paragraphs.join("\n\n")).join("\n\n")+"\n\n## 출처\n\n"+f.sources.map(x=>"- ["+x.title+"]("+x.url+") — "+x.publisher+"; "+x.date+"; 확인 "+x.accessed+". "+x.note).join("\n")+"\n");
console.log(check ? "Publication exports are current." : "Exported "+chapters.length+" daily manuscripts, collected manuscript, and research framework.");
