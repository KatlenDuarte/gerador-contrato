"use client";

import React, { useState, useEffect } from 'react';
import Image from "next/image";
import {
  User, Briefcase, Settings, ArrowRight, ArrowLeft,
  CheckCircle2, AlertCircle, Lock, ShieldCheck, FileText, Scale,
  HelpCircle, Info, ChevronDown
} from 'lucide-react';
import jsPDF from 'jspdf';
import toast, { Toaster } from 'react-hot-toast';

interface ContractData {
  contratanteNome: string; contratanteDoc: string; contratanteEndereco: string;
  contratanteCidade: string; contratanteEstado: string; contratadoNome: string;
  contratadoDoc: string; contratadoEndereco: string; contratadoCidade: string;
  contratadoEstado: string; descricaoServico: string; valor: string;
  formaPagamento: string; dataInicio: string; prazoEntrega: string;
  multaRescisoria: string; localData: string;
}

export default function Home() {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<ContractData>({
    contratanteNome: '', contratanteDoc: '', contratanteEndereco: '',
    contratanteCidade: '', contratanteEstado: '', contratadoNome: '',
    contratadoDoc: '', contratadoEndereco: '', contratadoCidade: '',
    contratadoEstado: '', descricaoServico: '', valor: '',
    formaPagamento: '', dataInicio: '', prazoEntrega: '',
    multaRescisoria: '10', localData: ''
  });

  // Validação Segura via API (Protege seu token mestre)
  useEffect(() => {
    const validate = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      if (!token) { setLoading(false); return; }

      try {
        const res = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }, // ADICIONE ISSO
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (data.valid) setHasAccess(true);
      } catch (e) { console.error("Erro na validação:", e); }
      setLoading(false);
    };
    validate();
  }, []);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generatePDF = () => {
    if (!formData.contratanteNome || !formData.contratadoNome || !formData.valor) {
      toast.error("Campos essenciais estão vazios!");
      return;
    }
    // ... (Lógica do jspdf mantida conforme sua versão anterior)
    toast.success('Documento pronto para baixar!');
  };

  if (loading) return null;

  if (!hasAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-6 text-center">
        <div className="max-w-sm space-y-6">
          <div className="mx-auto w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl font-black">Link Expirado ou Inválido</h1>
          <p className="text-zinc-500 text-sm">Verifique o link enviado no seu e-mail ou chat de compra. O acesso é exclusivo para clientes.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100">
      <Toaster />

      <header className="w-full pt-12 pb-8 px-6 text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">
          Premium Access
        </div>
        <h1 className="text-4xl font-black tracking-tighter sm:text-5xl">Smart Contract<span className="text-blue-600">.</span></h1>
        <p className="text-zinc-500 text-sm max-w-xs mx-auto">Gere contratos juridicamente revisados em menos de 3 minutos.</p>
      </header>

      <main className="max-w-2xl mx-auto px-5 pb-20">

        {/* Guia de Preenchimento */}
        <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl flex gap-4 items-start">
          <Info className="text-blue-600 shrink-0 mt-1" size={20} />
          <div className="text-xs leading-relaxed text-blue-800 dark:text-blue-300">
            <strong>Dica de Especialista:</strong> Certifique-se de que os números de CPF/CNPJ estejam corretos. Erros de digitação nestes campos podem invalidar a execução do contrato judicialmente.
          </div>
        </div>

        {/* Card Principal */}
        <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-6 sm:p-12 shadow-2xl border border-zinc-100 dark:border-zinc-800 transition-all">

          <div className="flex gap-2 mb-10">
            {[1, 2, 3].map(n => (
              <div key={n} className={`h-1.5 flex-1 rounded-full ${step >= n ? 'bg-blue-600' : 'bg-zinc-100 dark:bg-zinc-800'}`} />
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <SectionHeader
                icon={<User />}
                title="Dados do Contratante"
                desc="Insira os dados de quem está pagando pelo serviço."
              />
              <div className="grid gap-5">
                <CustomInput label="Nome Completo ou Razão Social" name="contratanteNome" value={formData.contratanteNome} onChange={handleChange} hint="Ex: João da Silva ou Empresa X LTDA" />
                <CustomInput label="CPF ou CNPJ" name="contratanteDoc" value={formData.contratanteDoc} onChange={handleChange} />
                <div className="grid grid-cols-2 gap-4">
                  <CustomInput label="Cidade" name="contratanteCidade" value={formData.contratanteCidade} onChange={handleChange} />
                  <CustomInput label="Estado (UF)" name="contratanteEstado" value={formData.contratanteEstado} onChange={handleChange} maxLength={2} />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <SectionHeader
                icon={<Briefcase />}
                title="Dados do Prestador"
                desc="Insira os seus dados ou os da sua empresa."
              />
              <div className="grid gap-5">
                <CustomInput label="Seu Nome / Nome Fantasia" name="contratadoNome" value={formData.contratadoNome} onChange={handleChange} />
                <CustomInput label="Seu CPF ou CNPJ" name="contratadoDoc" value={formData.contratadoDoc} onChange={handleChange} />
                <CustomInput label="Endereço Profissional" name="contratadoEndereco" value={formData.contratadoEndereco} onChange={handleChange} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <SectionHeader
                icon={<Settings />}
                title="Detalhes do Acordo"
                desc="Defina valores, prazos e penalidades."
              />
              <div className="grid gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Descrição do Serviço</label>
                  <textarea
                    name="descricaoServico"
                    value={formData.descricaoServico}
                    onChange={handleChange}
                    placeholder="Seja específico. Ex: Gestão de 3 redes sociais com 12 posts mensais..."
                    className="w-full rounded-2xl bg-zinc-50 dark:bg-zinc-800 p-5 outline-none focus:ring-2 focus:ring-blue-600/20 text-sm min-h-[120px]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <CustomInput label="Valor do Serviço" name="valor" value={formData.valor} onChange={handleChange} placeholder="R$ 1.500,00" />
                  <CustomInput label="Multa Rescisória (%)" name="multaRescisoria" value={formData.multaRescisoria} onChange={handleChange} hint="Padrão de mercado: 10%" />
                </div>
                <CustomInput label="Data e Local" name="localData" value={formData.localData} onChange={handleChange} placeholder="São Paulo, 27 de Fevereiro de 2026" />
              </div>
            </div>
          )}

          <div className="mt-12 flex gap-4">
            {step > 1 && (
              <button onClick={() => setStep(step - 1)} className="flex-1 p-5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 font-bold text-sm transition-transform active:scale-95">
                Voltar
              </button>
            )}
            <button
              onClick={step === 3 ? generatePDF : () => setStep(step + 1)}
              className="flex-[2] bg-blue-600 text-white p-5 rounded-2xl font-bold text-sm shadow-xl shadow-blue-200 dark:shadow-none transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {step === 3 ? <><ShieldCheck size={18} /> Finalizar Contrato</> : <>Próximo Passo <ArrowRight size={18} /></>}
            </button>
          </div>
        </div>

        {/* SEÇÃO DE EXPLICAÇÕES (FAQ) */}
        <section className="mt-20 space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-black italic tracking-tight">Dúvidas Frequentes</h2>
            <p className="text-zinc-500 text-sm">Tudo o que você precisa saber sobre seu contrato</p>
          </div>

          <div className="grid gap-4">
            <FAQItem
              q="Este contrato tem validade jurídica?"
              a="Sim. No Brasil, contratos particulares assinados entre as partes (e preferencialmente com duas testemunhas ou assinatura digital) têm plena validade jurídica conforme o Código Civil."
            />
            <FAQItem
              q="Preciso registrar em cartório?"
              a="Não é obrigatório para a validade, mas o reconhecimento de firma ajuda a comprovar a autenticidade das assinaturas caso o contrato seja questionado judicialmente."
            />
            <FAQItem
              q="Como assinar este PDF?"
              a="Você pode imprimir e assinar manualmente ou utilizar plataformas de assinatura digital gratuita, como o portal Gov.br, que possui validade legal ICP-Brasil."
            />
          </div>
        </section>

      </main>
    </div>
  );
}

// Sub-componentes para organização
function SectionHeader({ icon, title, desc }: any) {
  return (
    <div className="flex gap-5 items-center">
      <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100 dark:shadow-none">
        {React.cloneElement(icon, { size: 22 })}
      </div>
      <div>
        <h2 className="text-xl font-black tracking-tight">{title}</h2>
        <p className="text-zinc-500 text-xs">{desc}</p>
      </div>
    </div>
  );
}

function CustomInput({ label, hint, ...props }: any) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center px-1">
        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{label}</label>
        {hint && <span className="text-[9px] text-blue-500 font-bold">{hint}</span>}
      </div>
      <input
        {...props}
        className="w-full rounded-2xl border-none bg-zinc-50 dark:bg-zinc-800 p-4 outline-none focus:ring-2 focus:ring-blue-600/20 text-sm font-medium transition-all"
      />
    </div>
  );
}

function FAQItem({ q, a }: { q: string, a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden cursor-pointer" onClick={() => setOpen(!open)}>
      <div className="p-5 flex justify-between items-center">
        <span className="font-bold text-sm">{q}</span>
        <ChevronDown size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </div>
      {open && <div className="px-5 pb-5 text-xs text-zinc-500 leading-relaxed animate-in slide-in-from-top-2">{a}</div>}
    </div>
  );
}