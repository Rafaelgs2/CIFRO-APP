import {authenticatedContext} from '@/lib/supabase/server';

export const dynamic='force-dynamic';

const reply=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'private, no-store'}});

export async function POST(request:Request){
  const origin=request.headers.get('origin');
  if(!origin||origin!==new URL(request.url).origin)return reply({error:'Origem da solicitação inválida.'},403);
  const context=await authenticatedContext(request);
  if(!context)return reply({error:'Autenticação necessária.'},401);

  const {error}=await context.supabase.from('profiles').update({onboarding_completed_at:new Date().toISOString()}).eq('id',context.user.id);
  if(error){console.error('Onboarding completion failed',{code:error.code,message:error.message});return reply({error:'Não foi possível concluir a apresentação. Tente novamente.'},503);}
  return reply({completed:true});
}
