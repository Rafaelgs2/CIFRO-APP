import {authenticatedContext} from '@/lib/supabase/server';

export const dynamic='force-dynamic';

const reply=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'private, no-store'}});

async function requestContext(request:Request){
  const context=await authenticatedContext(request).catch((error:unknown)=>{console.error('Telegram authentication failed',error);return undefined;});
  if(context===undefined)return {response:reply({error:'Não foi possível validar sua sessão. Tente novamente.'},503)};
  if(!context)return {response:reply({error:'Autenticação necessária.'},401)};
  return {context};
}

const sameOrigin=(request:Request)=>{const origin=request.headers.get('origin');return Boolean(origin)&&origin===new URL(request.url).origin};

export async function GET(request:Request){
  const authenticated=await requestContext(request);
  if('response'in authenticated)return authenticated.response;
  const {data,error}=await authenticated.context.supabase.rpc('telegram_link_status');
  if(error){console.error('Telegram status failed',{code:error.code,message:error.message});return reply({error:'Não foi possível consultar a conexão. Tente novamente.'},503);}
  return reply(data);
}

export async function POST(request:Request){
  if(!sameOrigin(request))return reply({error:'Origem da solicitação inválida.'},403);
  const authenticated=await requestContext(request);
  if('response'in authenticated)return authenticated.response;

  const botUsername=process.env.TELEGRAM_BOT_USERNAME;
  if(!botUsername||!/^[A-Za-z0-9_]{5,32}$/.test(botUsername)){
    console.error('TELEGRAM_BOT_USERNAME is missing or invalid');
    return reply({error:'A conexão com o Telegram ainda não está disponível.'},503);
  }

  let body:{accountId?:unknown};
  try{body=await request.json()}
  catch{return reply({error:'Dados inválidos.'},400)}
  const accountId=body?.accountId;
  if(typeof accountId!=='string'||!accountId)return reply({error:'Escolha uma conta.'},400);

  const {data,error}=await authenticated.context.supabase.rpc('start_telegram_link',{p_account_id:accountId});
  if(error){
    if(error.code==='22023'||error.code==='22P02')return reply({error:'Escolha uma conta ativa.'},400);
    console.error('Telegram link failed',{code:error.code,message:error.message});
    return reply({error:'Não foi possível conectar o Telegram. Tente novamente.'},503);
  }
  // appUrl opens the installed app directly, for browsers or networks where t.me does not load.
  return reply({url:`https://t.me/${botUsername}?start=${data}`,appUrl:`tg://resolve?domain=${botUsername}&start=${data}`});
}

export async function PATCH(request:Request){
  if(!sameOrigin(request))return reply({error:'Origem da solicitação inválida.'},403);
  const authenticated=await requestContext(request);
  if('response'in authenticated)return authenticated.response;

  let body:{accountId?:unknown};
  try{body=await request.json()}
  catch{return reply({error:'Dados inválidos.'},400)}
  const accountId=body?.accountId;
  if(typeof accountId!=='string'||!accountId)return reply({error:'Escolha uma conta.'},400);

  const {error}=await authenticated.context.supabase.rpc('update_telegram_account',{p_account_id:accountId});
  if(error){
    if(error.code==='P0002')return reply({error:'O Telegram não está mais conectado. Recarregue a página.'},409);
    if(error.code==='22023'||error.code==='22P02')return reply({error:'Escolha uma conta ativa.'},400);
    console.error('Telegram account update failed',{code:error.code,message:error.message});
    return reply({error:'Não foi possível alterar a conta. Tente novamente.'},503);
  }
  return reply({linked:true,accountId});
}

export async function DELETE(request:Request){
  if(!sameOrigin(request))return reply({error:'Origem da solicitação inválida.'},403);
  const authenticated=await requestContext(request);
  if('response'in authenticated)return authenticated.response;
  const {error}=await authenticated.context.supabase.rpc('unlink_telegram');
  if(error){console.error('Telegram unlink failed',{code:error.code,message:error.message});return reply({error:'Não foi possível desconectar o Telegram. Tente novamente.'},503);}
  return reply({linked:false});
}
