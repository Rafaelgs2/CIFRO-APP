import type {Metadata} from 'next';
import {LoginScreen} from '../login-screen';

export const metadata:Metadata={
  title:'Criar conta',
  description:'Crie sua conta CIFRO.',
  robots:{index:false,follow:false},
};

export default function SignupPage(){
  return <LoginScreen initialMode="signUp"/>;
}
