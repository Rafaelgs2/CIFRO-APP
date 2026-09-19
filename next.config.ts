import type {NextConfig} from 'next';

const supabaseUrl=process.env.NEXT_PUBLIC_SUPABASE_URL;
const connectSources=["'self'"];

if(supabaseUrl){
  try{
    const url=new URL(supabaseUrl);
    connectSources.push(url.origin);
    if(url.protocol==='https:')connectSources.push(`wss://${url.host}`);
  }catch{
    // Runtime validation reports an actionable error if the public URL is invalid.
  }
}

const scriptSources=["'self'","'unsafe-inline'"];
if(process.env.NODE_ENV!=='production')scriptSources.push("'unsafe-eval'");

const contentSecurityPolicy=[
  "default-src 'self'",
  `script-src ${scriptSources.join(' ')}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src ${[...new Set(connectSources)].join(' ')}`,
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "manifest-src 'self'",
].join('; ');

const securityHeaders=[
  {key:'Content-Security-Policy',value:contentSecurityPolicy},
  {key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},
  {key:'X-Content-Type-Options',value:'nosniff'},
  {key:'X-Frame-Options',value:'DENY'},
  {key:'Cross-Origin-Opener-Policy',value:'same-origin'},
  {key:'Permissions-Policy',value:'camera=(), microphone=(), geolocation=(), payment=()'},
  {key:'Strict-Transport-Security',value:'max-age=31536000; includeSubDomains'},
];

const nextConfig:NextConfig={
  poweredByHeader:false,
  turbopack:{root:process.cwd()},
  async headers(){
    return [{source:'/:path*',headers:securityHeaders}];
  },
};

export default nextConfig;
