import {env} from 'cloudflare:workers';
export function database(){if(!env.DB)throw Error('Armazenamento indisponível. Tente novamente em instantes.');return env.DB;}
