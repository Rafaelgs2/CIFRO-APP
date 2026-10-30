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

  let body:{chatId?:unknown;accountId?:unknown};
  try{body=await request.json()}
  catch{return reply({error:'Dados inválidos.'},400)}
  const {chatId,accountId}=body??{};
  // Telegram ids fit in 52 bits, but they travel as text so no JSON layer has to care.
  if(typeof chatId!=='string'||!/^-?\d{1,16}$/.test(chatId))return reply({error:'Informe um chat id válido.'},400);
  if(typeof accountId!=='string'||!accountId)return reply({error:'Escolha uma conta.'},400);

  const {data,error}=await authenticated.context.supabase.rpc('link_telegram',{p_chat_id:chatId,p_account_id:accountId});
  if(error){
    if(error.code==='23505')return reply({error:'Este chat já está conectado a outra conta do Cifro.'},409);
    if(error.code==='22023'||error.code==='22P02')return reply({error:'Escolha uma conta ativa.'},400);
    console.error('Telegram link failed',{code:error.code,message:error.message});
    return reply({error:'Não foi possível conectar o Telegram. Tente novamente.'},503);
  }
  return reply({secret:data});
}

export async function DELETE(request:Request){
  if(!sameOrigin(request))return reply({error:'Origem da solicitação inválida.'},403);
  const authenticated=await requestContext(request);
  if('response'in authenticated)return authenticated.response;
  const {error}=await authenticated.context.supabase.rpc('unlink_telegram');
  if(error){console.error('Telegram unlink failed',{code:error.code,message:error.message});return reply({error:'Não foi possível desconectar o Telegram. Tente novamente.'},503);}
  return reply({linked:false});
}
