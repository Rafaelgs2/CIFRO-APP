'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Brand } from './brand';

type FieldErrors = {
  email?: string;
  password?: string;
};

export function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const nextErrors: FieldErrors = {};

    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      nextErrors.email = 'Insira um e-mail válido.';
    }

    if (!password) {
      nextErrors.password = 'Insira sua senha.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;

    setLoading(true);
    window.setTimeout(() => router.push('/dashboard'), 850);
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

        <header className="login-brand-lockup">
          <Brand className="login-brand" />
          <p>Suas finanças mais conectadas</p>
        </header>

        <div className="login-heading">
          <p className="login-kicker">Acesso seguro</p>
          <h1 id="login-title">Bem-vindo de volta</h1>
          <p>Acesse sua conta para continuar</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="login-field">
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
                  if (errors.email) setErrors((current) => ({ ...current, email: undefined }));
                }}
              />
            </div>
            {errors.email && <p id="email-error" className="login-field-error">{errors.email}</p>}
          </div>

          <div className="login-field">
            <label htmlFor="password">Senha</label>
            <div className="login-input-shell password-field">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? 'password-error' : undefined}
                onChange={(event) => {
                  setPassword(event.target.value);
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
          </div>

          <div className="login-options">
            <label className="login-remember">
              <input type="checkbox" name="remember" />
              <span className="login-checkbox" aria-hidden="true" />
              <span>Lembrar de mim</span>
            </label>
            <a href="#recuperar-senha" onClick={(event) => event.preventDefault()}>
              Esqueci minha senha
            </a>
          </div>

          <button className="login-submit" type="submit" disabled={loading}>
            {loading ? (
              <>
                <span className="login-spinner" aria-hidden="true" />
                <span>Entrando...</span>
              </>
            ) : (
              <>
                <span>Entrar</span>
                <ArrowRight aria-hidden="true" />
              </>
            )}
          </button>

          <p className="login-signup">
            Ainda não possui uma conta?{' '}
            <a href="#criar-conta" onClick={(event) => event.preventDefault()}>Criar conta</a>
          </p>
        </form>
      </section>

      <p className="login-trust"><span aria-hidden="true" /> Ambiente protegido e seguro</p>
    </main>
  );
}
