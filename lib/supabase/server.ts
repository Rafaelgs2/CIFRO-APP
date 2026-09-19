import {createClient} from '@supabase/supabase-js';

function config(){
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if(!url||!key)throw Error('Supabase não está configurado no ambiente do servidor.');
  return {url,key};
}

export function supabaseRequestContext(request:Request){
  const authorization=request.headers.get('authorization');
  const token=authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if(!token)return null;
  const {url,key}=config();
  const supabase=createClient(url,key,{
    auth:{persistSession:false,autoRefreshToken:false},
    global:{headers:{Authorization:`Bearer ${token}`}},
  });
  return {supabase,token};
}

export async function authenticatedContext(request:Request){
  const context=supabaseRequestContext(request);
  if(!context)return null;
  const {supabase,token}=context;
  const {data:{user},error}=await supabase.auth.getUser(token);
  return error||!user?null:{user,supabase};
}
