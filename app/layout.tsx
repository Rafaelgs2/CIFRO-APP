import type { Metadata, Viewport } from 'next';
import {MobileViewport} from './mobile-viewport';
import { AppThemeProvider } from './theme-controls';
import './globals.css';
export const metadata: Metadata = {title: 'CIFRO · Suas finanças mais conectadas', description: 'Contas, despesas e objetivos em um só lugar.', icons: {icon: '/favicon.svg'}};
export const viewport:Viewport={width:'device-width',initialScale:1,viewportFit:'cover',interactiveWidget:'resizes-content'};
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {return <html lang="pt-BR" suppressHydrationWarning><body><MobileViewport/><AppThemeProvider>{children}</AppThemeProvider></body></html>;}
