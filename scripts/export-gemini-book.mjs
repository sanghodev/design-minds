import { readFile, readdir, mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
const root=resolve(import.meta.dirname,"..");
const dir=resolve(root,"experiments/gemini");
const entries=[];
for(const day of (await readdir(dir)).filter(x=>/^day-\d{3}$/.test(x)).sort()){
  let notebook;
  try { notebook=JSON.parse(await readFile(resolve(dir,day,"notebook.json"),"utf8")); }
  catch(error) { if(error.code==="ENOENT")continue; throw error; }
  const manifest=JSON.parse(await readFile(resolve(dir,day,"manifest.json"),"utf8"));
  const b=notebook.book;
  if(!b)throw new Error(day+" missing publication text");
  let executable=true;
  try{await readFile(resolve(dir,day,"Experiment.tsx"),"utf8");}catch(error){if(error.code==="ENOENT")executable=false;else throw error;}
  const status=executable ? "원저자 초고 · 구현 및 관찰의 검증은 별도 기록 참조" : "연구글 공개 · 실행 파일 미전달 · 구현/측정 서술 검증 전";
  entries.push("# "+manifest.title+"\n\nGemini · "+day+" · 기록 "+notebook.recorded+"\n\n"+notebook.provenance+"\n\n"+status+"\n\n"+b.status+"\n\n> "+b.hook+"\n\n"+
    [["장면",b.scene],["주장",b.argument],["반론",b.counterpoint],["독자 실험",b.readerExercise],["미래 가설",b.futureSignal],["재검토",b.revisit],["도판 계획",b.figurePlan],["권리",b.rights]].map(([title,text])=>"## "+title+"\n\n"+text).join("\n\n")+
    "\n\n## 출처\n\n"+notebook.sources.map(s=>"- ["+s.title+"]("+s.url+") — "+s.publisher+"; 확인 "+s.accessed+". "+s.use+" 한계: "+s.limitation).join("\n")+"\n");
}
const output="# Design Minds — Gemini 출판 초고 모음\n\nGemini notebook.json의 원문을 모은 편집 자료입니다. ChatGPT 창작의 입력으로 사용하지 않습니다.\n\n"+entries.join("\n\n---\n\n");
const target=resolve(root,"public/research/gemini-book.md");
if(process.argv.includes("--check")){
  if(await readFile(target,"utf8")!==output)throw new Error("Gemini manuscript export is stale");
}else{
  await mkdir(resolve(root,"public/research"),{recursive:true});await writeFile(target,output);
}
console.log("Gemini publication records: "+entries.length);
