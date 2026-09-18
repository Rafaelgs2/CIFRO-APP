'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
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
    const normalizedEmail = email.trim();

    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
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
    window.setTimeout(() => {
      router.push('/dashboard');
    }, 850);
  }

  return (
    <main className="login-page">
      <section className="login-brand-panel" aria-labelledby="login-brand-title">
        <div className="login-brand-inner">
          <Brand className="login-brand" />

          <div className="login-story">
            <div className="login-story-copy">
              <p className="login-eyebrow">Clareza para suas escolhas</p>
              <h1 id="login-brand-title">
                Suas finanças<br />mais conectadas.
              </h1>
              <p className="login-intro">
                Organize sua vida financeira de forma simples e tenha uma visão clara do seu dinheiro.
              </p>
            </div>

            <div className="finance-preview" aria-label="Resumo financeiro ilustrativo">
              <article className="preview-card preview-balance">
                <div className="preview-card-top">
                  <span>Saldo disponível</span>
                  <span className="preview-period">Setembro</span>
                </div>
                <strong>R$ 8.420,00</strong>
                <span className="preview-positive">↗ 12,4% este mês</span>
                <div className="preview-bars" aria-hidden="true">
                  <i style={{ height: '34%' }} />
                  <i style={{ height: '48%' }} />
                  <i style={{ height: '42%' }} />
                  <i style={{ height: '66%' }} />
                  <i style={{ height: '57%' }} />
                  <i style={{ height: '84%' }} />
                  <i style={{ height: '76%' }} />
                </div>
              </article>

              <article className="preview-card preview-income">
                <span>Receitas</span>
                <strong>R$ 5.800</strong>
                <small>+ R$ 640 este mês</small>
              </article>

              <article className="preview-card preview-expense">
                <span>Gastos</span>
                <strong>R$ 3.140</strong>
                <small>37% do saldo</small>
              </article>
            </div>
          </div>

          <p className="login-brand-footnote">CIFRO · Controle financeiro pessoal</p>
        </div>
      </section>

      <section className="login-form-panel" aria-labelledby="login-title">
        <div className="login-mobile-brand">
          <Brand />
        </div>

        <div className="login-form-wrap">
          <header className="login-form-header">
            <p className="login-form-kicker">Sua conta</p>
            <h2 id="login-title">Bem-vindo de volta</h2>
            <p>Entre na sua conta para continuar.</p>
          </header>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <div className="login-field">
              <label htmlFor="email">E-mail</label>
              <input
                id="email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="seuemail@exemplo.com"
                value={email}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'email-error' : undefined}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (errors.email) setErrors((current) => ({ ...current, email: undefined }));
                }}
              />
              {errors.email && <p id="email-error" className="login-field-error">{errors.email}</p>}
            </div>

            <div className="login-field">
              <label htmlFor="password">Senha</label>
              <div className="password-field">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Digite sua senha"
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
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
              {errors.password && <p id="password-error" className="login-field-error">{errors.password}</p>}
            </div>

            <a className="forgot-password" href="#recuperar-senha" onClick={(event) => event.preventDefault()}>
              Esqueci minha senha
            </a>

            <button className="login-submit" type="submit" disabled={loading}>
              {loading && <span className="login-spinner" aria-hidden="true" />}
              <span>{loading ? 'Entrando...' : 'Entrar'}</span>
            </button>

            <p className="login-signup">
              Ainda não possui uma conta?{' '}
              <a href="#criar-conta" onClick={(event) => event.preventDefault()}>Criar conta</a>
            </p>
          </form>
        </div>

        <p className="login-form-footnote">Ao entrar, você concorda com os termos de uso e privacidade.</p>
      </section>
    </main>
  );
}
