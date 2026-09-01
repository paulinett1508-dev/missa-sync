export type MassSection = {
  id: "introductory-rites" | "liturgy-of-the-word" | "liturgy-of-the-eucharist" | "concluding-rites";
  title: string;
  shortTitle: string;
  description: string;
  guidance: readonly string[];
};

export const massSections: readonly MassSection[] = [
  { id: "introductory-rites", title: "Ritos iniciais", shortTitle: "Iniciais", description: "A assembleia se reúne e se dispõe a celebrar.", guidance: ["Canto de entrada e procissão", "Saudação e ato penitencial", "Hino de louvor e oração do dia"] },
  { id: "liturgy-of-the-word", title: "Liturgia da Palavra", shortTitle: "Palavra", description: "Escuta-se e responde-se à Palavra de Deus.", guidance: ["Leituras, salmo e aclamação", "Proclamação do Evangelho", "Homilia, profissão de fé e preces"] },
  { id: "liturgy-of-the-eucharist", title: "Liturgia Eucarística", shortTitle: "Eucaristia", description: "Os dons são apresentados, consagrados e partilhados.", guidance: ["Apresentação das oferendas", "Oração eucarística", "Comunhão e ação de graças"] },
  { id: "concluding-rites", title: "Ritos finais", shortTitle: "Finais", description: "A celebração se conclui e envia a comunidade em missão.", guidance: ["Avisos, quando houver", "Bênção", "Despedida e canto final"] },
];

export const clampSectionIndex = (index: number): number => Math.max(0, Math.min(index, massSections.length - 1));
export const progressForSection = (index: number): number => ((clampSectionIndex(index) + 1) / massSections.length) * 100;
