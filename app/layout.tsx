import type { Metadata } from 'next';
import { AppThemeProvider } from './theme-controls';
import './globals.css';
export const metadata: Metadata = {title: 'CIFRO · Seu dinheiro, com clareza', description: 'Suas contas, cartões e planos em um só lugar. Gestão financeira pessoal.', icons: {icon: '/favicon.svg'}};
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {return <html lang="pt-BR" suppressHydrationWarning><body><AppThemeProvider>{children}</AppThemeProvider></body></html>;}
