import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title: 'CIRFRO · Seu dinheiro, com clareza', description: 'Suas contas, cartões e planos em um só lugar. Gestão financeira pessoal.', icons: {icon: '/favicon.svg'}};
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {return <html lang="pt-BR"><body>{children}</body></html>;}