import {ZodError} from 'zod';
import {type State,validateState} from '../../../lib/finance';
import {authenticatedContext} from '../../../lib/supabase/server';

export const dynamic='force-dynamic';

const MAX_BODY_BYTES=3_000_000;

const reply=(data:unknown,status=200)=>Response.json(data,{
  status,
  headers:{'Cache-Control':'private, no-store'},
});

function validationMessage(error:unknown){
  if(error instanceof ZodError)return 'Confira os valores e os campos obrigatórios.';
  if(error instanceof Error)return error.message;
  return 'Dados inválidos.';
}

function parseState(input:unknown):{state:State}|{response:Response}{
  try{return {state:validateState(input)}}
  catch(error){return {response:reply({error:validationMessage(error)},400)}}
}

function isAuthError(error:{code?:string;message?:string}){
  return error.code==='PGRST301'||/jwt|auth/i.test(error.message??'');
}

async function requestContext(request:Request){
  try{
    const context=await authenticatedContext(request);
    return context?{context}:{response:reply({error:'Autenticação necessária.'},401)};
  }catch(error){
    console.error('Finance authentication failed',error);
    return {response:reply({error:'Não foi possível validar sua sessão. Tente novamente.'},503)};
  }
}

export async function GET(request:Request){
  const authenticated=await requestContext(request);
  if('response'in authenticated)return authenticated.response;
  const {context}=authenticated;

  try{
    const {data,error}=await context.supabase.rpc('finance_state_payload');
    if(error){
      if(isAuthError(error))return reply({error:'Autenticação necessária.'},401);
      console.error('Finance load failed',{code:error.code,message:error.message});
      return reply({error:'Não foi possível carregar seus dados. Tente novamente.'},503);
    }

    const payload=data as {state:unknown;revision:unknown}|null;
    if(!payload||!Number.isInteger(payload.revision)){
      console.error('Finance load returned an invalid payload');
      return reply({error:'Não foi possível carregar seus dados. Tente novamente.'},503);
    }

    const parsed=parseState(payload.state);
    if('response'in parsed){
      console.error('Finance load returned an invalid financial state');
      return reply({error:'Não foi possível carregar seus dados. Tente novamente.'},503);
    }

    return reply({state:parsed.state,revision:payload.revision});
  }catch(error){
    console.error('Finance load failed',error);
    return reply({error:'Não foi possível carregar seus dados. Tente novamente.'},503);
  }
}

export async function PUT(request:Request){
  const origin=request.headers.get('origin');
  if(!origin||origin!==new URL(request.url).origin){
    return reply({error:'Origem da solicitação inválida.'},403);
  }

  if(!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')){
    return reply({error:'Envie os dados em formato JSON.'},415);
  }

  const contentLength=Number(request.headers.get('content-length')??0);
  if(!Number.isFinite(contentLength)||contentLength>MAX_BODY_BYTES){
    return reply({error:'O conjunto de dados é muito grande.'},413);
  }

  const authenticated=await requestContext(request);
  if('response'in authenticated)return authenticated.response;
  const {context}=authenticated;

  let raw:string;
  try{
    raw=await request.text();
  }catch{
    return reply({error:'Não foi possível ler os dados enviados.'},400);
  }
  if(new TextEncoder().encode(raw).byteLength>MAX_BODY_BYTES){
    return reply({error:'O conjunto de dados é muito grande.'},413);
  }

  let body:unknown;
  try{body=JSON.parse(raw)}
  catch{return reply({error:'Dados inválidos.'},400)}

  if(!body||typeof body!=='object')return reply({error:'Dados inválidos.'},400);
  const candidate=body as {revision?:unknown;state?:unknown};
  if(!Number.isInteger(candidate.revision)||(candidate.revision as number)<0){
    return reply({error:'Versão inválida. Atualize a página.'},400);
  }

  const parsed=parseState(candidate.state);
  if('response'in parsed)return parsed.response;

  try{
    const {data,error}=await context.supabase.rpc('save_finance_state',{
      p_state:parsed.state,
      p_expected_revision:candidate.revision as number,
    });
    if(error){
      if(error.code==='40001'){
        return reply({error:'Seus dados mudaram em outra aba. Recarregue os dados antes de salvar.'},409);
      }
      if(isAuthError(error))return reply({error:'Autenticação necessária.'},401);
      console.error('Finance save failed',{code:error.code,message:error.message});
      return reply({error:'Não foi possível salvar seus dados. Tente novamente.'},503);
    }

    const payload=data as {state:unknown;revision:unknown}|null;
    if(!payload||!Number.isInteger(payload.revision)){
      console.error('Finance save returned an invalid payload');
      return reply({error:'Não foi possível confirmar o salvamento. Recarregue seus dados.'},503);
    }

    const saved=parseState(payload.state);
    if('response'in saved){
      console.error('Finance save returned an invalid financial state');
      return reply({error:'Não foi possível confirmar o salvamento. Recarregue seus dados.'},503);
    }

    return reply({state:saved.state,revision:payload.revision});
  }catch(error){
    console.error('Finance save failed',error);
    return reply({error:'Não foi possível salvar seus dados. Tente novamente.'},503);
  }
}
