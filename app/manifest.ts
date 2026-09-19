import type {MetadataRoute} from 'next';

export default function manifest():MetadataRoute.Manifest{
  return {
    name:'CIFRO',
    short_name:'CIFRO',
    description:'Suas finanças mais conectadas.',
    start_url:'/',
    display:'standalone',
    background_color:'#f4f7fa',
    theme_color:'#0755d9',
    lang:'pt-BR',
    icons:[
      {
        src:'/favicon.svg',
        sizes:'any',
        type:'image/svg+xml',
        purpose:'any',
      },
      {
        src:'/favicon.svg',
        sizes:'any',
        type:'image/svg+xml',
        purpose:'maskable',
      },
    ],
  };
}
