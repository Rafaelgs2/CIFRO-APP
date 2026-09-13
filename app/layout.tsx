import type { Metadata } from 'next';
import { AppThemeProvider } from './theme-controls';
import './globals.css';
export const metadata: Metadata = {title: 'CIFRO · Suas finanças mais conectadas', description: 'Contas, despesas e objetivos em um só lugar.', icons: {icon: '/favicon.svg'}};
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {return <html lang="pt-BR" suppressHydrationWarning><body><AppThemeProvider>{children}</AppThemeProvider></body></html>;}
