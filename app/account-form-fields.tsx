'use client';

import {MoneyInput} from './money-input';
import {Field,Picker} from './finance-ui';
import {accountKinds,type Account} from '@/lib/finance';

export type AccountFormValue=Pick<Account,'name'|'kind'|'initial'|'date'>;

export function AccountFormFields({value,onChange}: {value:AccountFormValue;onChange:<Key extends keyof AccountFormValue>(key:Key,value:AccountFormValue[Key])=>void}){
  return <>
    <Field label="Nome da conta"><input required autoFocus maxLength={100} placeholder="Ex.: Conta do salário" value={value.name} onChange={event=>onChange('name',event.target.value)}/></Field>
    <Picker id="account-kind" label="Finalidade" value={value.kind} onChange={kind=>onChange('kind',kind as Account['kind'])} options={Object.entries(accountKinds).map(([option,label])=>({value:option,label}))}/>
    <Field label="Saldo inicial"><MoneyInput label="Saldo inicial" value={value.initial} onChange={initial=>onChange('initial',initial)} allowNegative/></Field>
    <Field label="Data de referência do saldo"><input required type="date" value={value.date} onChange={event=>onChange('date',event.target.value)}/></Field>
    <p className="form-hint">Registre somente movimentações a partir desta data. O saldo inicial não conta como receita.</p>
  </>;
}
