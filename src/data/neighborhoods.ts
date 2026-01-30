// ══════════════════════════════════════════════════════════════════════════════
// BAIRROS POR CIDADE - Grande Florianópolis
// Fonte: Pesquisa curada focada em bairros com maior incidência de construção
// de residências de alto padrão
// Última atualização: Janeiro 2025
// ══════════════════════════════════════════════════════════════════════════════

export interface Neighborhood {
  id: string;
  name: string;
  aliases?: string[];
  zone?: 'norte' | 'sul' | 'leste' | 'oeste' | 'centro' | 'continental';
  postalCodePrefix?: string;
}

export interface CityNeighborhoods {
  cityKey: string;
  cityName: string;
  ibgeCode: string;
  source: string;
  lastUpdated: string;
  neighborhoods: Neighborhood[];
}

// ══════════════════════════════════════════════════════════════════════════════
// DADOS DOS BAIRROS
// ══════════════════════════════════════════════════════════════════════════════

export const NEIGHBORHOODS_DATA: Record<string, CityNeighborhoods> = {
  
  // ────────────────────────────────────────────────────────────────────────────
  // FLORIANÓPOLIS
  // ────────────────────────────────────────────────────────────────────────────
  florianopolis: {
    cityKey: "florianopolis",
    cityName: "Florianópolis",
    ibgeCode: "4205407",
    source: "Pesquisa curada - Alto padrão residencial",
    lastUpdated: "2025-01",
    neighborhoods: [
      // Norte da Ilha
      { id: "jurere-internacional", name: "Jurerê Internacional", zone: "norte" },
      { id: "jurere-tradicional", name: "Jurerê Tradicional", zone: "norte" },
      { id: "daniela", name: "Daniela", zone: "norte" },
      { id: "cachoeira-bom-jesus", name: "Cachoeira do Bom Jesus", zone: "norte" },
      { id: "canasvieiras", name: "Canasvieiras", zone: "norte" },
      { id: "ponta-das-canas", name: "Ponta das Canas", zone: "norte" },
      { id: "lagoinha", name: "Lagoinha", zone: "norte" },
      { id: "praia-brava", name: "Praia Brava", zone: "norte" },
      { id: "ingleses", name: "Ingleses do Rio Vermelho", aliases: ["Ingleses"], zone: "norte" },
      { id: "santinho", name: "Santinho", zone: "norte" },
      { id: "rio-vermelho", name: "Rio Vermelho", zone: "norte" },
      { id: "vargem-grande", name: "Vargem Grande", zone: "norte" },
      { id: "vargem-pequena", name: "Vargem Pequena", zone: "norte" },
      { id: "saco-grande", name: "Saco Grande", zone: "norte" },
      { id: "monte-verde", name: "Monte Verde", zone: "norte" },
      { id: "joao-paulo", name: "João Paulo", zone: "norte" },
      { id: "cacupe", name: "Cacupé", zone: "norte" },
      { id: "santo-antonio-lisboa", name: "Santo Antônio de Lisboa", zone: "norte" },
      { id: "sambaqui", name: "Sambaqui", zone: "norte" },
      { id: "ratones", name: "Ratones", zone: "norte" },
      
      // Leste da Ilha
      { id: "lagoa-conceicao", name: "Lagoa da Conceição", zone: "leste" },
      { id: "barra-lagoa", name: "Barra da Lagoa", zone: "leste" },
      { id: "praia-mole", name: "Praia Mole", zone: "leste" },
      { id: "joaquina", name: "Joaquina", zone: "leste" },
      { id: "campeche", name: "Campeche", zone: "leste" },
      { id: "morro-das-pedras", name: "Morro das Pedras", zone: "leste" },
      { id: "rio-tavares", name: "Rio Tavares", zone: "leste" },
      
      // Sul da Ilha
      { id: "ribeirao-ilha", name: "Ribeirão da Ilha", zone: "sul" },
      { id: "carianos", name: "Carianos", zone: "sul" },
      { id: "tapera", name: "Tapera", zone: "sul" },
      { id: "pantano-sul", name: "Pântano do Sul", zone: "sul" },
      { id: "armacao", name: "Armação", zone: "sul" },
      { id: "matadeiro", name: "Matadeiro", zone: "sul" },
      { id: "solidao", name: "Solidão", zone: "sul" },
      { id: "costa-dentro", name: "Costa de Dentro", zone: "sul" },
      { id: "acores", name: "Açores", zone: "sul" },
      
      // Centro e Região
      { id: "centro", name: "Centro", zone: "centro" },
      { id: "agronômica", name: "Agronômica", zone: "centro" },
      { id: "trindade", name: "Trindade", zone: "centro" },
      { id: "itacorubi", name: "Itacorubi", zone: "centro" },
      { id: "corrego-grande", name: "Córrego Grande", zone: "centro" },
      { id: "pantanal", name: "Pantanal", zone: "centro" },
      { id: "carvoeira", name: "Carvoeira", zone: "centro" },
      { id: "santa-monica", name: "Santa Mônica", zone: "centro" },
      
      // Continental
      { id: "estreito", name: "Estreito", zone: "continental" },
      { id: "coqueiros", name: "Coqueiros", zone: "continental" },
      { id: "abraao", name: "Abraão", zone: "continental" },
      { id: "capoeiras", name: "Capoeiras", zone: "continental" },
      { id: "bom-abrigo", name: "Bom Abrigo", zone: "continental" },
      { id: "balneario", name: "Balneário", zone: "continental" },
      { id: "jardim-atlantico", name: "Jardim Atlântico", zone: "continental" },
    ]
  },

  // ────────────────────────────────────────────────────────────────────────────
  // SÃO JOSÉ
  // ────────────────────────────────────────────────────────────────────────────
  sao_jose: {
    cityKey: "sao_jose",
    cityName: "São José",
    ibgeCode: "4216602",
    source: "Pesquisa curada - Alto padrão residencial",
    lastUpdated: "2025-01",
    neighborhoods: [
      { id: "kobrasol", name: "Kobrasol" },
      { id: "campinas", name: "Campinas" },
      { id: "centro-sj", name: "Centro" },
      { id: "fazenda-santo-antonio", name: "Fazenda Santo Antônio" },
      { id: "roçado", name: "Roçado" },
      { id: "barreiros", name: "Barreiros" },
      { id: "bela-vista-sj", name: "Bela Vista" },
      { id: "serraria", name: "Serraria" },
      { id: "praia-comprida", name: "Praia Comprida" },
      { id: "ponta-de-baixo", name: "Ponta de Baixo" },
      { id: "real-parque", name: "Real Parque" },
      { id: "ipiranga-sj", name: "Ipiranga" },
      { id: "areias", name: "Areias" },
      { id: "jardim-cidade", name: "Jardim Cidade de Florianópolis" },
      { id: "picadas-sul", name: "Picadas do Sul" },
      { id: "forquilhas", name: "Forquilhas" },
      { id: "forquilhinhas", name: "Forquilhinhas" },
      { id: "sertao-maruim", name: "Sertão do Maruim" },
      { id: "colonia-santana", name: "Colônia Santana" },
      { id: "potecas", name: "Potecas" },
      { id: "fazenda-rio-tavares", name: "Fazenda Rio Tavares" },
      { id: "santos-saraiva", name: "Santos Saraiva" },
      { id: "flor-campo", name: "Flor de Campo" },
      { id: "bosque-mansoes", name: "Bosque das Mansões" },
      { id: "sertao-imarui", name: "Sertão de Imaruí" },
      { id: "pedregal", name: "Pedregal" },
      { id: "distrito-industrial", name: "Distrito Industrial" },
      { id: "morar-bem", name: "Morar Bem" },
      { id: "jardim-santiago", name: "Jardim Santiago" },
    ]
  },

  // ────────────────────────────────────────────────────────────────────────────
  // PALHOÇA
  // ────────────────────────────────────────────────────────────────────────────
  palhoca: {
    cityKey: "palhoca",
    cityName: "Palhoça",
    ibgeCode: "4211900",
    source: "Pesquisa curada - Alto padrão residencial",
    lastUpdated: "2025-01",
    neighborhoods: [
      { id: "pedra-branca", name: "Pedra Branca" },
      { id: "pagani", name: "Pagani" },
      { id: "aririu", name: "Aririu" },
      { id: "centro-palhoca", name: "Centro" },
      { id: "ponte-imarui", name: "Ponte do Imaruim" },
      { id: "passa-vinte", name: "Passa Vinte" },
      { id: "brejaru", name: "Brejaru" },
      { id: "caminho-novo", name: "Caminho Novo" },
      { id: "praia-fora", name: "Praia de Fora" },
      { id: "bela-vista-palhoca", name: "Bela Vista" },
      { id: "jardim-eldorado", name: "Jardim Eldorado" },
      { id: "jardim-aquarius", name: "Jardim Aquarius" },
      { id: "guarda-embau", name: "Guarda do Embaú" },
      { id: "enseada-brito", name: "Enseada de Brito" },
      { id: "alto-aririú", name: "Alto Aririu" },
      { id: "madri", name: "Madri" },
      { id: "sao-sebastiao", name: "São Sebastião" },
      { id: "coloninha", name: "Coloninha" },
      { id: "brejarú", name: "Brejarú" },
      { id: "pachecos", name: "Pachecos" },
      { id: "jardim-carandaí", name: "Jardim Carandaí" },
      { id: "tres-barras", name: "Três Barras" },
      { id: "frei-damião", name: "Frei Damião" },
      { id: "aririú-formiga", name: "Aririú Formiga" },
      { id: "vila-rica", name: "Vila Rica" },
      { id: "furadinho", name: "Furadinho" },
      { id: "morretes", name: "Morretes" },
      { id: "maciambú", name: "Maciambú" },
      { id: "praia-sonho", name: "Praia do Sonho" },
      { id: "albardão", name: "Albardão" },
      { id: "pacheco", name: "Pacheco" },
      { id: "joao-rosa", name: "João Rosa" },
      { id: "barra-do-aririú", name: "Barra do Aririú" },
    ]
  },

  // ────────────────────────────────────────────────────────────────────────────
  // BIGUAÇU
  // ────────────────────────────────────────────────────────────────────────────
  biguacu: {
    cityKey: "biguacu",
    cityName: "Biguaçu",
    ibgeCode: "4202305",
    source: "Pesquisa curada - Alto padrão residencial",
    lastUpdated: "2025-01",
    neighborhoods: [
      { id: "centro-biguacu", name: "Centro" },
      { id: "vendaval", name: "Vendaval" },
      { id: "rio-caveiras", name: "Rio Caveiras" },
      { id: "jardim-janaina", name: "Jardim Janaína" },
      { id: "fundos", name: "Fundos" },
      { id: "bom-viver", name: "Bom Viver" },
      { id: "prado", name: "Prado" },
      { id: "morro-da-bina", name: "Morro da Bina" },
      { id: "saveiro", name: "Saveiro" },
      { id: "fazendas", name: "Fazendas" },
      { id: "tijuquinhas", name: "Tijuquinhas" },
      { id: "tres-riachos", name: "Três Riachos" },
      { id: "cachoeiras", name: "Cachoeiras" },
      { id: "sorocaba-baixo", name: "Sorocaba do Baixo" },
      { id: "guaporanga", name: "Guaporanga" },
      { id: "sertão-sao-miguel", name: "Sertão de São Miguel" },
      { id: "alto-biguaçu", name: "Alto Biguaçu" },
    ]
  },

  // ────────────────────────────────────────────────────────────────────────────
  // SANTO AMARO DA IMPERATRIZ
  // ────────────────────────────────────────────────────────────────────────────
  santo_amaro: {
    cityKey: "santo_amaro",
    cityName: "Santo Amaro da Imperatriz",
    ibgeCode: "4215703",
    source: "Pesquisa curada - Alto padrão residencial",
    lastUpdated: "2025-01",
    neighborhoods: [
      { id: "centro-santo-amaro", name: "Centro" },
      { id: "caldas-imperatriz", name: "Caldas da Imperatriz" },
      { id: "vargem-grande-sa", name: "Vargem Grande" },
      { id: "varginha", name: "Varginha" },
      { id: "taquaras", name: "Taquaras" },
      { id: "ribeirao-vermelho", name: "Ribeirão Vermelho" },
      { id: "baixo-rio-vermelho", name: "Baixo Rio Vermelho" },
      { id: "ribeirao-do-mato", name: "Ribeirão do Mato" },
      { id: "santo-amaro-serra", name: "Santo Amaro (Serra)" },
      { id: "limoeiro", name: "Limoeiro" },
      { id: "boa-parada", name: "Boa Parada" },
      { id: "sertão-ribeirao", name: "Sertão do Ribeirão" },
      { id: "teresópolis", name: "Teresópolis" },
      { id: "colonia-santana-sa", name: "Colônia Santana" },
      { id: "morro-ceu", name: "Morro do Céu" },
      { id: "posto-branco", name: "Posto Branco" },
    ]
  },
};

// ══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Retorna os bairros de uma cidade específica
 */
export function getNeighborhoodsByCity(cityKey: string): Neighborhood[] {
  return NEIGHBORHOODS_DATA[cityKey]?.neighborhoods || [];
}

/**
 * Busca bairros por nome (case insensitive, inclui aliases)
 */
export function searchNeighborhoods(
  cityKey: string,
  searchTerm: string
): Neighborhood[] {
  const neighborhoods = getNeighborhoodsByCity(cityKey);
  const term = searchTerm.toLowerCase().trim();
  
  if (!term) return neighborhoods;
  
  return neighborhoods.filter(n => {
    const nameMatch = n.name.toLowerCase().includes(term);
    const aliasMatch = n.aliases?.some(a => a.toLowerCase().includes(term)) || false;
    return nameMatch || aliasMatch;
  });
}

/**
 * Retorna um bairro específico pelo ID
 */
export function getNeighborhoodById(
  cityKey: string,
  neighborhoodId: string
): Neighborhood | undefined {
  const neighborhoods = getNeighborhoodsByCity(cityKey);
  return neighborhoods.find(n => n.id === neighborhoodId);
}

/**
 * Retorna todos os cityKeys disponíveis
 */
export function getAvailableCities(): string[] {
  return Object.keys(NEIGHBORHOODS_DATA);
}

/**
 * Verifica se uma cidade tem dados de bairros cadastrados
 */
export function hasCityNeighborhoods(cityKey: string): boolean {
  return cityKey in NEIGHBORHOODS_DATA && NEIGHBORHOODS_DATA[cityKey].neighborhoods.length > 0;
}
