'use client';
import {useEffect} from 'react';

export function MobileViewport() {
  useEffect(()=>{
    const viewport=window.visualViewport;
    const update=()=>{
      if(viewport&&viewport.scale!==1)return;
      const height=viewport?.height??window.innerHeight;
      document.documentElement.style.setProperty('--visible-height',`${height}px`);
      document.documentElement.style.setProperty('--visible-top',`${viewport?.offsetTop??0}px`);
      document.documentElement.toggleAttribute('data-keyboard-open',height<window.innerHeight*.75);
    };
    update();viewport?.addEventListener('resize',update);viewport?.addEventListener('scroll',update);window.addEventListener('resize',update);
    return()=>{viewport?.removeEventListener('resize',update);viewport?.removeEventListener('scroll',update);window.removeEventListener('resize',update);};
  },[]);
  return null;
}
