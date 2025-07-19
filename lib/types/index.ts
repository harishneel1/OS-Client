export interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  clerk_id: string;
}

export interface Chat {
  id: string;
  project_id: string | null;
  title: string;
  created_at: string;
  updated_at: string;
  clerk_id: string;
}

export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  created_at: string;
  chat_id: string;
  clerk_id: string;
}

export interface ChatWithMessages extends Chat {
  messages: Message[];
}

export interface ProjectSettings {
  id: string;
  project_id: string;
  embedding_model: string;
  rag_strategy: string;
  chunks_per_search: number;
  final_context_size: number;
  similarity_threshold: number;
  number_of_queries: number;
  reranking_enabled: boolean;
  reranking_model: string;
  vector_weight: number;
  keyword_weight: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectDocument {
  id: string;
  project_id: string;
  original_filename: string;
  s3_key: string;
  file_size: number;
  file_type: string;
  processing_status: string;
  progress_percentage: number;
  clerk_id: string;
  created_at: string;
  updated_at: string;
}

export interface LocalSettings {
  embeddingModel: string;
  ragStrategy: string;
  chunksPerSearch: number;
  finalContextSize: number;
  similarityThreshold: number;
  numberOfQueries: number;
  reranking: {
    enabled: boolean;
    model: string;
  };
  hybridSearch: {
    vectorWeight: number;
    keywordWeight: number;
  };
}
