interface PerformanceMetrics {
  totalChunks: number;
  afterDedupe: number;
  latency: number;
  strategyLevel: string;
}

interface SettingsInput {
  ragStrategy: string;
  chunksPerSearch: number;
  numberOfQueries: number;
  reranking: {
    enabled: boolean;
  };
}

export function calculatePerformanceMetrics(
  settings: SettingsInput
): PerformanceMetrics {
  const { ragStrategy, chunksPerSearch, numberOfQueries, reranking } = settings;

  let totalChunks = chunksPerSearch;
  let afterDedupe = chunksPerSearch;
  let latency = 400; // Base latency
  let strategyLevel = "Basic";

  switch (ragStrategy) {
    case "basic":
      strategyLevel = "Basic";
      break;
    case "hybrid":
      latency = 600;
      strategyLevel = "Intermediate";
      break;
    case "multi-query-vector":
      totalChunks = chunksPerSearch * numberOfQueries;
      afterDedupe = Math.floor(totalChunks * 0.7); // Assume 70% unique
      latency = 800 + numberOfQueries * 200;
      strategyLevel = "Advanced";
      break;
    case "multi-query-hybrid":
      totalChunks = chunksPerSearch * numberOfQueries;
      afterDedupe = Math.floor(totalChunks * 0.7);
      latency = 1000 + numberOfQueries * 300;
      strategyLevel = "Expert";
      break;
  }

  if (reranking.enabled) {
    latency += 200;
  }

  return { totalChunks, afterDedupe, latency, strategyLevel };
}
