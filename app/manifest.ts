import type {MetadataRoute} from 'next';

export default function manifest():MetadataRoute.Manifest{
  return {
    id:'/',
    name:'CIFRO',
    short_name:'CIFRO',
    description:'Suas finanças mais conectadas.',
    start_url:'/dashboard',
    scope:'/',
    display:'standalone',
    orientation:'portrait',
    background_color:'#f4f7fa',
    theme_color:'#0755d9',
    lang:'pt-BR',
    icons:[
      {src:'/icons/icon-192.png',sizes:'192x192',type:'image/png',purpose:'any'},
      {src:'/icons/icon-512.png',sizes:'512x512',type:'image/png',purpose:'any'},
      {src:'/icons/icon-maskable-512.png',sizes:'512x512',type:'image/png',purpose:'maskable'},
    ],
  };
}
