import {useId} from 'react';

/** Geometric vector adaptation of the supplied CIFRO brand reference. */
export function BrandSymbol({className=''}:{className?:string}) {
  const id=useId().replace(/:/g,'');
  return <svg className={className} viewBox="0 0 120 88" fill="none" aria-hidden="true">
    <defs><linearGradient id={id+'back'} x1="62" y1="0" x2="99" y2="88" gradientUnits="userSpaceOnUse"><stop stopColor="var(--brand-symbol-light)"/><stop offset="1" stopColor="var(--brand-symbol)"/></linearGradient><linearGradient id={id+'front'} x1="14" y1="30" x2="76" y2="65" gradientUnits="userSpaceOnUse"><stop stopColor="var(--brand-symbol)"/><stop offset="1" stopColor="var(--brand-symbol-deep)"/></linearGradient></defs>
    <path d="M34 28C41 10 55 2 72 2C98 2 118 23 118 51V78Q118 86 110 86H88Q80 86 80 78V56C80 42 69 32 55 32Z" fill={'url(#'+id+'back)'}/>
    <path d="M2 64C2 39 22 25 43 25C61 25 74 33 79 45C55 39 42 56 42 78Q42 86 34 86H10Q2 86 2 78Z" fill={'url(#'+id+'front)'}/>
  </svg>;
}

export function Brand({className=''}:{className?:string}) {
  return <span className={'cifro-logo '+className} role="img" aria-label="CIFRO">
    <BrandSymbol className="cifro-symbol"/>
    <svg className="cifro-wordmark" viewBox="-2 -2 264 66" fill="currentColor" aria-hidden="true">
      <path d="M49.506 10.494A29 29 0 1 0 49.506 51.506L39.607 41.607A15 15 0 1 1 39.607 20.393Z"/>
      <rect x="55" y="2" width="14" height="58" rx="2"/>
      <path d="M79 60V27C79 10 89 2 104 2H125V10Q125 16 119 16H105Q94 16 94 27H119V40H94V60Z"/>
      <path d="M132 2H157C177 2 183 12 183 24C183 35 177 40 169 43L185 60H165L147 39V60H132V30H157Q169 30 169 24Q169 16 157 16H142Q132 16 132 6Z"/>
      <path fillRule="evenodd" d="M224 1A30 30 0 1 1 224 61A30 30 0 1 1 224 1ZM224 15A16 16 0 1 0 224 47A16 16 0 1 0 224 15Z"/>
    </svg>
  </span>;
}
