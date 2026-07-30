const FAQ_ITEMS = [
  {
    question: "Como funciona o aluguel de um consultório?",
    answer:
      "Você escolhe um consultório, envia uma proposta com data, turno e (opcionalmente) o procedimento que pretende realizar, sugerindo um valor. O anfitrião pode aceitar, recusar ou negociar o valor com você pelo chat.",
  },
  {
    question: "Posso propor um valor diferente do tabelado?",
    answer:
      "Sim. O campo de oferta já vem preenchido com o valor tabelado do turno ou procedimento, mas você pode alterá-lo livremente antes de enviar a proposta.",
  },
  {
    question: "Posso ter duas reservas no mesmo horário?",
    answer:
      "Não. Se você já tem uma proposta pendente ou aceita em um determinado dia e turno, o sistema bloqueia o envio de uma nova proposta para o mesmo dia e turno em outro consultório.",
  },
  {
    question: "Como eu anuncio meu próprio consultório?",
    answer:
      'Clique em "Anuncie seu Consultório" no topo da página (disponível para qualquer usuário logado) e preencha o formulário de cadastro com endereço, equipamentos, dias disponíveis e procedimentos oferecidos.',
  },
  {
    question: "Meu anúncio precisa de aprovação?",
    answer:
      "Sim. Todo consultório novo passa por uma moderação da equipe do DentSpot antes de aparecer na busca pública. Você pode acompanhar o status em Gerenciar Clínicas.",
  },
];

export default function Help() {
  return (
    <div className="container">
      <div className="section-title">
        <h2>Central de Ajuda</h2>
      </div>

      <div className="help-faq-list">
        {FAQ_ITEMS.map((item) => (
          <div className="help-faq-item" key={item.question}>
            <strong>{item.question}</strong>
            <p>{item.answer}</p>
          </div>
        ))}
      </div>

      <p className="helper-text" style={{ marginTop: 20 }}>
        Não encontrou o que precisava? Em breve você poderá abrir um chamado diretamente por aqui.
      </p>
    </div>
  );
}
