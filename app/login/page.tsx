import type {Metadata} from 'next';
import {LoginScreen} from '../login-screen';

export const metadata:Metadata={
  title:'Entrar',
  description:'Entre na sua conta CIFRO.',
  robots:{index:false,follow:false},
};

export default function LoginPage(){
  return <LoginScreen initialMode="signIn"/>;
}
