"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  User, Briefcase, Settings, ArrowRight, Lock,
  ShieldCheck, Info, ChevronDown, Scale, FileText, AlertCircle
} from 'lucide-react';
import jsPDF from 'jspdf';
import toast, { Toaster } from 'react-hot-toast';

// --- TIPAGEM DOS ESTADOS ---
type SiglaEstado = 'AC' | 'AL' | 'AP' | 'AM' | 'BA' | 'CE' | 'DF' | 'ES' | 'GO' | 'MA' | 'MT' | 'MS' | 'MG' | 'PA' | 'PB' | 'PR' | 'PE' | 'PI' | 'RJ' | 'RN' | 'RS' | 'RO' | 'RR' | 'SC' | 'SP' | 'SE' | 'TO';

interface DadosContrato {
  contratanteNome: string;
  contratanteDocumento: string;
  contratanteCidade: string;
  contratanteEstado: SiglaEstado | '';
  contratadoNome: string;
  contratadoDocumento: string;
  contratadoEndereco: string;
  descricaoServico: string;
  valor: string;
  formaPagamento: string;
  dataInicio: string;
  prazoEntrega: string;
  multaRescisoria: string;
  localData: string;
}

const DADOS_INICIAIS: DadosContrato = {
  contratanteNome: '', contratanteDocumento: '', contratanteCidade: '', contratanteEstado: '',
  contratadoNome: '', contratadoDocumento: '', contratadoEndereco: '',
  descricaoServico: '', valor: '', formaPagamento: '',
  dataInicio: '', prazoEntrega: '', multaRescisoria: '20', localData: ''
};

export default function PaginaInicial() {
  const [temAcesso, setTemAcesso] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [passo, setPasso] = useState(1);
  const [dadosFormulario, setDadosFormulario] = useState<DadosContrato>(DADOS_INICIAIS);

  // --- FORMATAÇÃO DE CPF/CNPJ ---
  const formatarDocumento = (valor: string) => {
    const v = valor.replace(/\D/g, '');
    if (v.length <= 11) {
      return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/g, '$1.$2.$3-$4').replace(/(-\d{2})\d+?$/, '$1');
    }
    return v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/g, '$1.$2.$3/$4-$5').replace(/(-\d{2})\d+?$/, '$1');
  };

  const aoMudarCampo = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let valorFinal = value;

    if (name.includes('Documento')) valorFinal = formatarDocumento(value);
    if (name === 'contratanteEstado') valorFinal = value.toUpperCase().slice(0, 2);

    setDadosFormulario(anterior => ({ ...anterior, [name]: valorFinal }));
  };

  // --- VALIDAÇÃO ---
  const validarPasso = useCallback(() => {
    const obrigatorios: Record<number, (keyof DadosContrato)[]> = {
      1: ['contratanteNome', 'contratanteDocumento', 'contratanteCidade', 'contratanteEstado'],
      2: ['contratadoNome', 'contratadoDocumento', 'contratadoEndereco'],
      3: ['descricaoServico', 'valor', 'formaPagamento']
    };

    const pendentes = obrigatorios[passo].filter(campo => !dadosFormulario[campo]);

    if (pendentes.length > 0) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return false;
    }

    if (passo === 1 || passo === 2) {
      const doc = passo === 1 ? dadosFormulario.contratanteDocumento : dadosFormulario.contratadoDocumento;
      const digitos = doc.replace(/\D/g, '');
      if (digitos.length !== 11 && digitos.length !== 14) {
        toast.error("CPF ou CNPJ inválido.");
        return false;
      }
    }

    return true;
  }, [passo, dadosFormulario]);

  const proximoPasso = () => { if (validarPasso()) setPasso(p => p + 1); };

  const dataAtual = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  // --- GERADOR DE PDF ---
  const gerarPDF = () => {
    if (!validarPasso()) return;

    const pdf = new jsPDF();
    const margem = 20;
    const larguraPagina = pdf.internal.pageSize.getWidth();
    const larguraMaxima = larguraPagina - margem * 2;
    let yAtual = 20;

    const renderizarTexto = (
      texto: string,
      tamanho = 10,
      negrito = false,
      alinhamento: 'left' | 'center' | 'justify' = 'justify',
      espacamento = 6
    ) => {
      pdf.setFont('helvetica', negrito ? 'bold' : 'normal');
      pdf.setFontSize(tamanho);
      const linhas = pdf.splitTextToSize(texto, larguraMaxima);

      linhas.forEach((linha: string | string[]) => {
        if (yAtual > 275) {
          pdf.addPage();
          yAtual = 20;
        }
        pdf.text(
          linha,
          alinhamento === 'center' ? larguraPagina / 2 : margem,
          yAtual,
          { align: alinhamento }
        );
        yAtual += espacamento;
      });

      yAtual += 4;
    };

    /* ================= TÍTULO ================= */
    renderizarTexto(
      'CONTRATO DE PRESTAÇÃO DE SERVIÇOS PROFISSIONAIS',
      14,
      true,
      'center'
    );

    renderizarTexto(
      'Pelo presente instrumento particular, as partes abaixo identificadas resolvem celebrar o presente Contrato de Prestação de Serviços Profissionais, que será regido pelas cláusulas e condições seguintes.',
      10
    );

    /* ================= CLÁUSULA 1 ================= */
    renderizarTexto('CLÁUSULA PRIMEIRA – DAS PARTES', 11, true);

    renderizarTexto(
      `CONTRATANTE: ${dadosFormulario.contratanteNome.toUpperCase()}, inscrito(a) no CPF/CNPJ sob o nº ${dadosFormulario.contratanteDocumento}, com domicílio em ${dadosFormulario.contratanteCidade}/${dadosFormulario.contratanteEstado}.`
    );

    renderizarTexto(
      `CONTRATADO: ${dadosFormulario.contratadoNome.toUpperCase()}, inscrito(a) no CPF/CNPJ sob o nº ${dadosFormulario.contratadoDocumento}, com endereço profissional em ${dadosFormulario.contratadoEndereco}.`
    );

    /* ================= CLÁUSULA 2 ================= */
    renderizarTexto('CLÁUSULA SEGUNDA – DO OBJETO', 11, true);

    renderizarTexto(
      `O presente contrato tem por objeto a prestação, pelo CONTRATADO, dos seguintes serviços: ${dadosFormulario.descricaoServico}, os quais serão executados com autonomia técnica, sem qualquer vínculo empregatício entre as partes.`
    );

    /* ================= CLÁUSULA 3 ================= */
    renderizarTexto('CLÁUSULA TERCEIRA – DO PRAZO', 11, true);

    renderizarTexto(
      `Os serviços terão início em ${dadosFormulario.dataInicio || 'data da assinatura deste instrumento'} e deverão ser concluídos no prazo de ${dadosFormulario.prazoEntrega || 'a ser definido entre as partes'}, podendo ser prorrogados mediante acordo formal entre as partes.`
    );

    /* ================= CLÁUSULA 4 ================= */
    renderizarTexto('CLÁUSULA QUARTA – DO PREÇO E FORMA DE PAGAMENTO', 11, true);

    renderizarTexto(
      `Pelos serviços ora contratados, o CONTRATANTE pagará ao CONTRATADO o valor total de R$ ${dadosFormulario.valor}, conforme a seguinte condição de pagamento: ${dadosFormulario.formaPagamento}.`
    );

    renderizarTexto(
      'O atraso no pagamento acarretará multa moratória de 2% (dois por cento) sobre o valor devido, acrescida de juros de mora de 1% (um por cento) ao mês, calculados pro rata die.'
    );

    /* ================= CLÁUSULA 5 ================= */
    renderizarTexto('CLÁUSULA QUINTA – DAS OBRIGAÇÕES', 11, true);

    renderizarTexto(
      'São obrigações do CONTRATADO executar os serviços com zelo, qualidade técnica e observância das boas práticas profissionais.'
    );

    renderizarTexto(
      'São obrigações do CONTRATANTE fornecer todas as informações e materiais necessários à execução dos serviços, bem como efetuar os pagamentos nos prazos ajustados.'
    );

    /* ================= CLÁUSULA 6 ================= */
    renderizarTexto('CLÁUSULA SEXTA – DA RESCISÃO', 11, true);

    renderizarTexto(
      `O presente contrato poderá ser rescindido por qualquer das partes mediante aviso prévio de 15 (quinze) dias.`
    );

    renderizarTexto(
      `Em caso de rescisão imotivada ou descumprimento contratual, a parte infratora pagará multa rescisória equivalente a ${dadosFormulario.multaRescisoria}% do valor total do contrato, sem prejuízo de perdas e danos.`
    );

    /* ================= CLÁUSULA 7 ================= */
    renderizarTexto('CLÁUSULA SÉTIMA – DO SIGILO E CONFIDENCIALIDADE', 11, true);

    renderizarTexto(
      'As partes comprometem-se a manter absoluto sigilo sobre todas as informações, dados, documentos e materiais a que tiverem acesso em razão deste contrato, mesmo após o seu término.'
    );

    /* ================= CLÁUSULA 8 ================= */
    renderizarTexto('CLÁUSULA OITAVA – DA INEXISTÊNCIA DE VÍNCULO', 11, true);

    renderizarTexto(
      'O presente contrato não gera qualquer vínculo empregatício, societário ou previdenciário entre as partes, sendo o CONTRATADO responsável por todos os tributos, encargos e obrigações decorrentes de sua atividade.'
    );

    /* ================= CLÁUSULA 9 ================= */
    renderizarTexto('CLÁUSULA NONA – DO FORO', 11, true);

    renderizarTexto(
      `Fica eleito o foro da Comarca de ${dadosFormulario.contratanteCidade}/${dadosFormulario.contratanteEstado}, com renúncia expressa a qualquer outro, por mais privilegiado que seja, para dirimir quaisquer controvérsias oriundas deste contrato.`
    );

    /* ================= ASSINATURAS ================= */
    yAtual += 20;

    renderizarTexto(
      `E, por estarem justas e contratadas, firmam o presente instrumento em ${dadosFormulario.localData || `${dadosFormulario.contratanteCidade}/${dadosFormulario.contratanteEstado}`
      }, aos ${dataAtual}.`,
      10,
      false,
      'center'
    );

    yAtual += 25;

    pdf.line(margem, yAtual, margem + 70, yAtual);
    pdf.line(larguraPagina - margem - 70, yAtual, larguraPagina - margem, yAtual);

    pdf.setFontSize(9);
    pdf.text('CONTRATANTE', margem + 35, yAtual + 6, { align: 'center' });
    pdf.text('CONTRATADO', larguraPagina - margem - 35, yAtual + 6, {
      align: 'center',
    });

    pdf.save(`Contrato_${dadosFormulario.contratanteNome.split(' ')[0]}.pdf`);
    toast.success('Contrato profissional gerado com sucesso!');
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100">
      <Toaster position="bottom-right" />

      <header className="py-12 px-6 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600/10 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-600/20 mb-4">
          Edição Profissional 2026
        </div>
        <h1 className="text-5xl font-black tracking-tighter mb-4">ContratoJá<span className="text-blue-600">.</span></h1>
        <p className="text-zinc-500 text-sm">Gere documentos jurídicos seguros de forma simplificada.</p>
      </header>

      <main className="max-w-2xl mx-auto px-4 pb-20">
        <div className="bg-white dark:bg-zinc-900/50 rounded-[2.5rem] p-6 sm:p-12 shadow-2xl border border-zinc-200 dark:border-zinc-800/50">

          <div className="flex gap-3 mb-12">
            {[1, 2, 3].map(n => (
              <div key={n} className={`h-1.5 flex-1 rounded-full transition-all ${passo >= n ? 'bg-blue-600' : 'bg-zinc-100 dark:bg-zinc-800'}`} />
            ))}
          </div>

          {passo === 1 && (
            <div className="space-y-8 animate-in fade-in">
              <CabecalhoSecao icone={<User />} titulo="Dados do Contratante" descricao="Quem está a contratar o serviço." />
              <div className="grid gap-5">
                <EntradaTexto etiqueta="Nome / Empresa" nome="contratanteNome" valor={dadosFormulario.contratanteNome} aoMudar={aoMudarCampo} obrigatorio />
                <EntradaTexto etiqueta="CPF ou CNPJ" nome="contratanteDocumento" valor={dadosFormulario.contratanteDocumento} aoMudar={aoMudarCampo} obrigatorio />
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <EntradaTexto etiqueta="Cidade" nome="contratanteCidade" valor={dadosFormulario.contratanteCidade} aoMudar={aoMudarCampo} obrigatorio />
                  </div>
                  <EntradaTexto etiqueta="UF" nome="contratanteEstado" valor={dadosFormulario.contratanteEstado} aoMudar={aoMudarCampo} maxLength={2} obrigatorio />
                </div>
              </div>
            </div>
          )}

          {passo === 2 && (
            <div className="space-y-8 animate-in fade-in">
              <CabecalhoSecao icone={<Briefcase />} titulo="Dados do Prestador" descricao="Seus dados para emissão do contrato." />
              <div className="grid gap-5">
                <EntradaTexto etiqueta="Nome do Prestador" nome="contratadoNome" valor={dadosFormulario.contratadoNome} aoMudar={aoMudarCampo} obrigatorio />
                <EntradaTexto etiqueta="Seu CPF ou CNPJ" nome="contratadoDocumento" valor={dadosFormulario.contratadoDocumento} aoMudar={aoMudarCampo} obrigatorio />
                <EntradaTexto etiqueta="Endereço Profissional" nome="contratadoEndereco" valor={dadosFormulario.contratadoEndereco} aoMudar={aoMudarCampo} obrigatorio />
              </div>
            </div>
          )}

          {passo === 3 && (
            <div className="space-y-8 animate-in fade-in">
              <CabecalhoSecao icone={<Scale />} titulo="Termos e Condições" descricao="Detalhes do acordo e valores." />
              <div className="grid gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-400 ml-1">Descrição do Serviço</label>
                  <textarea name="descricaoServico" value={dadosFormulario.descricaoServico} onChange={aoMudarCampo}
                    className="w-full h-32 rounded-2xl bg-zinc-50 dark:bg-zinc-800 p-5 text-sm outline-none focus:ring-2 focus:ring-blue-600/20" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <EntradaTexto etiqueta="Valor (R$)" nome="valor" valor={dadosFormulario.valor} aoMudar={aoMudarCampo} obrigatorio />
                  <EntradaTexto etiqueta="Multa (%)" nome="multaRescisoria" valor={dadosFormulario.multaRescisoria} aoMudar={aoMudarCampo} />
                </div>
                <EntradaTexto etiqueta="Forma de Pagamento" nome="formaPagamento" valor={dadosFormulario.formaPagamento} aoMudar={aoMudarCampo} obrigatorio />
                <div className="grid grid-cols-2 gap-4">
                  <EntradaTexto etiqueta="Início" nome="dataInicio" tipo="date" valor={dadosFormulario.dataInicio} aoMudar={aoMudarCampo} />
                  <EntradaTexto etiqueta="Prazo" nome="prazoEntrega" valor={dadosFormulario.prazoEntrega} aoMudar={aoMudarCampo} />
                </div>
                <EntradaTexto etiqueta="Local e Data" nome="localData" valor={dadosFormulario.localData} aoMudar={aoMudarCampo} />
              </div>
            </div>
          )}

          <div className="flex gap-4 mt-12">
            {passo > 1 && (
              <button onClick={() => setPasso(passo - 1)} className="flex-1 py-5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 font-bold text-xs">VOLTAR</button>
            )}
            <button
              onClick={passo === 3 ? gerarPDF : proximoPasso}
              className="flex-2 bg-blue-600 text-white py-5 rounded-2xl font-bold text-xs shadow-xl flex items-center justify-center gap-2"
            >
              {passo === 3 ? <><ShieldCheck size={18} /> GERAR CONTRATO</> : <>PRÓXIMO <ArrowRight size={18} /></>}
            </button>
          </div>
        </div>

        <section className="mt-24 space-y-8">
          <h3 className="text-2xl font-black text-center italic">Perguntas Frequentes</h3>
          <div className="grid gap-4">
            <ItemFAQ pergunta="Este contrato é válido?" resposta="Sim, tem validade jurídica conforme o Código Civil brasileiro." />
            <ItemFAQ pergunta="Preciso de testemunhas?" resposta="Embora não obrigatório, ter duas testemunhas facilita a execução judicial imediata." />
            <ItemFAQ pergunta="Como assinar digitalmente?" resposta="Pode utilizar o portal Gov.br de forma gratuita e segura." />
          </div>
        </section>
      </main>
    </div>
  );
}

function CabecalhoSecao({ icone, titulo, descricao }: any) {
  return (
    <div className="flex gap-5 items-center">
      <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center">
        {React.cloneElement(icone, { size: 22 })}
      </div>
      <div>
        <h2 className="text-xl font-black">{titulo}</h2>
        <p className="text-zinc-500 text-xs">{descricao}</p>
      </div>
    </div>
  );
}

function EntradaTexto({ etiqueta, obrigatorio, aoMudar, nome, valor, tipo = "text", ...props }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black uppercase text-zinc-400 ml-1">
        {etiqueta} {obrigatorio && <span className="text-red-500">*</span>}
      </label>
      <input
        type={tipo}
        name={nome}
        value={valor}
        onChange={aoMudar}
        className="w-full rounded-2xl bg-zinc-50 dark:bg-zinc-800 p-4 text-sm outline-none focus:ring-2 focus:ring-blue-600/20 font-medium"
        {...props}
      />
    </div>
  );
}

function ItemFAQ({ pergunta, resposta }: { pergunta: string, resposta: string }) {
  const [aberto, setAberto] = useState(false);
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm" onClick={() => setAberto(!aberto)}>
      <div className="p-5 flex justify-between items-center cursor-pointer">
        <span className="font-bold text-sm">{pergunta}</span>
        <ChevronDown size={18} className={`text-blue-600 transition-transform ${aberto ? 'rotate-180' : ''}`} />
      </div>
      {aberto && <div className="px-5 pb-6 text-xs text-zinc-500 leading-relaxed border-t border-zinc-100 dark:border-zinc-800 pt-4">{resposta}</div>}
    </div>
  );
}