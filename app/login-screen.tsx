'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Eye, EyeOff } from '@/components/icons';
import { Brand } from './brand';
import {getSupabaseBrowserClient,isSupabaseConfigured} from '@/lib/supabase/browser';

type FieldErrors = {
  email?: string;
  password?: string;
  confirmPassword?: string;
};

type AuthMode = 'signIn' | 'signUp' | 'forgot' | 'reset';

function authMessage(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes('invalid login credentials')) return 'E-mail ou senha inválidos. Se necessário, redefina sua senha.';
  if (normalized.includes('email not confirmed')) return 'Confirme seu e-mail antes de entrar.';
  if (normalized.includes('user already registered')) return 'Este e-mail já possui uma conta. Entre ou redefina sua senha.';
  if (normalized.includes('email rate limit exceeded') || normalized.includes('over_email_send_rate_limit')) return 'Limite temporário de e-mails atingido. Aguarde e tente novamente mais tarde.';
  return 'Não foi possível concluir a autenticação. Tente novamente.';
}

export function LoginScreen({initialMode='signIn'}:{initialMode?:Extract<AuthMode,'signIn'|'signUp'>}) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [mode,setMode]=useState<AuthMode>(initialMode);
  const [authError,setAuthError]=useState('');
  const [notice,setNotice]=useState('');

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = getSupabaseBrowserClient();
    const {data: {subscription}} = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMode('reset');
        setAuthError('');
        setNotice('Defina uma nova senha para concluir a recuperação.');
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  function validate() {
    const nextErrors: FieldErrors = {};

    if (mode !== 'reset' && !/^\S+@\S+\.\S+$/.test(email.trim())) {
      nextErrors.email = 'Insira um e-mail válido.';
    }

    if (mode !== 'forgot' && !password) {
      nextErrors.password = 'Insira sua senha.';
    } else if((mode==='signUp'||mode==='reset')&&password.length<12) {
      nextErrors.password = 'Use ao menos 12 caracteres.';
    }

    if (mode === 'reset' && confirmPassword !== password) {
      nextErrors.confirmPassword = 'As senhas precisam ser iguais.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;
    if(!isSupabaseConfigured()){setAuthError('Configure o Supabase em .env.local antes de continuar.');return;}
    setAuthError('');
    setNotice('');
    setLoading(true);
    try{
      const supabase=getSupabaseBrowserClient();
      if(mode==='forgot'){
        const {error}=await supabase.auth.resetPasswordForEmail(email.trim(),{redirectTo:`${window.location.origin}/login`});
        if(error)throw error;
        setNotice('Enviamos um link para redefinir sua senha. Confira também a caixa de spam.');
      }else if(mode==='reset'){
        const {error}=await supabase.auth.updateUser({password});
        if(error)throw error;
        router.replace('/dashboard');
      }else if(mode==='signUp'){
        const {data,error}=await supabase.auth.signUp({email:email.trim(),password,options:{emailRedirectTo:`${window.location.origin}/dashboard`}});
        if(error)throw error;
        if(data.session)router.replace('/dashboard');
        else if(data.user&&Array.isArray(data.user.identities)&&data.user.identities.length===0)setAuthError('Este e-mail já possui uma conta. Entre com sua senha ou use "Esqueci minha senha".');
        else setNotice('Confira seu e-mail para confirmar a conta antes de entrar. Confira também a caixa de spam.');
      }else{
        const {error}=await supabase.auth.signInWithPassword({email:email.trim(),password});
        if(error)throw error;
        router.replace('/dashboard');
      }
    }catch(error){setAuthError(error instanceof Error?authMessage(error.message):'Não foi possível concluir a autenticação.');}
    finally{setLoading(false);}
  }

  return (
    <main className="login-page">
      <div className="login-atmosphere" aria-hidden="true">
        <div className="login-grid" />
        <div className="login-glow login-glow-one" />
        <div className="login-glow login-glow-two" />

        <svg className="login-flow" viewBox="0 0 1440 900" fill="none" preserveAspectRatio="xMidYMid slice">
          <path className="flow-path flow-path-soft" d="M-90 698C137 704 188 513 342 482C493 451 506 561 650 511C800 458 742 235 953 174C1140 120 1277 225 1531 182" />
          <path className="flow-path flow-path-wide" d="M-72 226C148 191 250 267 354 381C465 502 522 555 676 493C848 424 865 298 1014 308C1184 320 1247 508 1515 443" />
          <path className="flow-path flow-path-main" d="M-70 547C169 546 242 635 398 608C559 580 533 404 704 397C857 391 900 535 1041 572C1197 613 1316 525 1513 594" />
          <path className="flow-path flow-path-light" d="M64 922C189 730 331 736 435 632C553 515 511 300 694 232C890 159 1006 272 1118 140C1190 56 1268-4 1456-21" />
          <path className="flow-accent" d="M354 381C465 502 522 555 676 493C848 424 865 298 1014 308" />

          <g className="flow-nodes">
            <circle cx="354" cy="381" r="5" />
            <circle cx="676" cy="493" r="7" />
            <circle cx="704" cy="397" r="4" />
            <circle cx="1014" cy="308" r="5" />
            <circle cx="1041" cy="572" r="4" />
          </g>
        </svg>
      </div>

      <section className="login-auth" aria-labelledby="login-title">
        <span className="login-corner login-corner-top" aria-hidden="true" />
        <span className="login-corner login-corner-bottom" aria-hidden="true" />
        <Link className="login-back" href="/"><ArrowLeft aria-hidden="true"/>Voltar</Link>

        <header className="login-brand-lockup">
          <Link href="/" aria-label="Voltar para a página inicial"><Brand className="login-brand" /></Link>
          <p>Suas finanças mais conectadas</p>
        </header>

        <div className="login-heading">
          <p className="login-kicker">Acesso seguro</p>
          <h1 id="login-title">{mode==='signIn'?'Bem-vindo de volta':mode==='signUp'?'Crie sua conta':mode==='forgot'?'Recupere sua senha':'Crie uma nova senha'}</h1>
          <p>{mode==='signIn'?'Acesse sua conta para continuar':mode==='signUp'?'Comece a organizar suas finanças.':mode==='forgot'?'Enviaremos um link seguro para seu e-mail.':'Use uma senha com pelo menos 12 caracteres.'}</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {mode!=='reset'&&<div className="login-field">
            <label htmlFor="email">E-mail</label>
            <div className="login-input-shell">
              <input
                id="email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="seu@email.com"
                value={email}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'email-error' : undefined}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setAuthError('');
                  if (errors.email) setErrors((current) => ({ ...current, email: undefined }));
                }}
              />
            </div>
            {errors.email && <p id="email-error" className="login-field-error">{errors.email}</p>}
          </div>}

          {mode!=='forgot'&&<div className="login-field">
            <label htmlFor="password">{mode==='reset'?'Nova senha':'Senha'}</label>
            <div className="login-input-shell password-field">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete={mode==='reset'||mode==='signUp'?'new-password':'current-password'}
                placeholder="••••••••"
                value={password}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? 'password-error' : undefined}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setAuthError('');
                  if (errors.password) setErrors((current) => ({ ...current, password: undefined }));
                }}
              />
              <button
                type="button"
                className="password-toggle"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((visible) => !visible)}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
            {errors.password && <p id="password-error" className="login-field-error">{errors.password}</p>}
          </div>}

          {mode==='reset'&&<div className="login-field">
            <label htmlFor="confirm-password">Confirme a nova senha</label>
            <div className="login-input-shell">
              <input
                id="confirm-password"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirmPassword}
                aria-invalid={Boolean(errors.confirmPassword)}
                aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  if (errors.confirmPassword) setErrors((current) => ({ ...current, confirmPassword: undefined }));
                }}
              />
            </div>
            {errors.confirmPassword && <p id="confirm-password-error" className="login-field-error">{errors.confirmPassword}</p>}
          </div>}

          {mode==='signIn'&&<div className="login-options">
            <a href="#recuperar-senha" onClick={(event) => {event.preventDefault();setMode('forgot');setErrors({});setAuthError('');setNotice('');}}>
              Esqueci minha senha
            </a>
          </div>}

          {authError&&<p className="login-field-error" role="alert">{authError}</p>}
          {notice&&<p role="status">{notice}</p>}

          <button className="login-submit" type="submit" disabled={loading}>
            {loading ? (
              <>
                <span className="login-spinner" aria-hidden="true" />
                <span>{mode==='signIn'?'Entrando...':mode==='signUp'?'Criando conta...':mode==='forgot'?'Enviando...':'Salvando...'}</span>
              </>
            ) : (
              <>
                <span>{mode==='signIn'?'Entrar':mode==='signUp'?'Criar conta':mode==='forgot'?'Enviar link':'Salvar nova senha'}</span>
                <ArrowRight aria-hidden="true" />
              </>
            )}
          </button>

          {mode!=='reset'&&<p className="login-signup">{mode==='signIn'?'Ainda não possui uma conta? ':mode==='signUp'?'Já possui uma conta? ':'Lembrou sua senha? '}{mode==='forgot'?<button type="button" onClick={()=>{setMode('signIn');setErrors({});setAuthError('');setNotice('');}}>Entrar</button>:<Link href={mode==='signIn'?'/signup':'/login'}>{mode==='signIn'?'Criar conta':'Entrar'}</Link>}</p>}
        </form>
      </section>

      <p className="login-trust"><span aria-hidden="true" /> Ambiente protegido e seguro</p>
    </main>
  );
}
