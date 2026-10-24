'use client';
import {toast} from 'sonner';
import {type State,today} from '@/lib/finance';
import {buildMonthlyReport,buildFullReport} from '@/lib/report';
import {renderReportHtml} from '@/lib/report-html';

function download(blob:Blob,filename:string){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}

/** Must run synchronously inside the click handler so the new tab is not blocked as a pop-up. */
export function openReport(state:State,kind:'monthly'|'full',month:string,demo:boolean){
 const report=kind==='monthly'?buildMonthlyReport(state,month):buildFullReport(state);
 const html=renderReportHtml(report,{name:state.profile.name,demo,origin:location.origin});
 const blob=new Blob([html],{type:'text/html;charset=utf-8'});
 const url=URL.createObjectURL(blob);
 const tab=window.open(url,'_blank');
 if(tab){setTimeout(()=>URL.revokeObjectURL(url),60_000);return;}
 URL.revokeObjectURL(url);
 download(blob,`cifro-relatorio-${kind==='monthly'?month:'completo'}-${today()}.html`);
 toast('O navegador bloqueou a nova aba. O relatório foi baixado como arquivo HTML.');
}

export function downloadBackup(state:State,demo:boolean){
 download(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),`cifro-backup-${demo?'demonstracao':'dados'}-${today()}.json`);
}
