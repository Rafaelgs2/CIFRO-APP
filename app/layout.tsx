import type { Metadata, Viewport } from 'next';
import {MobileViewport} from './mobile-viewport';
import { AppThemeProvider } from './theme-controls';
import './globals.css';
import './login.css';
import './landing.css';
export const metadata:Metadata={
  title:{default:'CIFRO',template:'%s · CIFRO'},
  applicationName:'CIFRO',
  description:'Suas finanças mais conectadas.',
  manifest:'/manifest.webmanifest',
  icons:{icon:'/favicon.svg?v=2',apple:'/icons/apple-touch-icon.png'},
  appleWebApp:{capable:true,title:'CIFRO',statusBarStyle:'default'},
  openGraph:{
    type:'website',
    locale:'pt_BR',
    siteName:'CIFRO',
    title:'CIFRO',
    description:'Suas finanças mais conectadas.',
  },
  twitter:{card:'summary',title:'CIFRO',description:'Suas finanças mais conectadas.'},
  robots:{index:true,follow:true},
};
export const viewport:Viewport={
  width:'device-width',
  initialScale:1,
  viewportFit:'cover',
  interactiveWidget:'resizes-content',
  themeColor:[
    {media:'(prefers-color-scheme: light)',color:'#f4f7fa'},
    {media:'(prefers-color-scheme: dark)',color:'#111820'},
  ],
};
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {return <html lang="pt-BR" suppressHydrationWarning><body><MobileViewport/><AppThemeProvider>{children}</AppThemeProvider></body></html>;}
