# PCAMAW V4 - Agentic RAG & Web UI Roadmap

**Version 4: Intelligent Document Processing with RAG and Web Interface**

## Overview

PCAMAW V4 transforms the autonomous programming assistant into an intelligent, context-aware system with:
- **Agentic Chunking**: Smart document segmentation using AI agents
- **Agentic RAG**: Retrieval-Augmented Generation with LangChain
- **Context7 Integration**: Up-to-date library documentation retrieval
- **Web UI**: Next.js interface for managing workflows and viewing results
- **Enhanced N8N Workflow**: Extended pipeline with RAG capabilities

---

## Architecture Vision

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Web UI (Next.js)                            │
│  Dashboard | Prompt Input | Patch Browser | RAG Viewer | Settings   │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓ HTTP/WebSocket
┌─────────────────────────────────────────────────────────────────────┐
│                      N8N Workflow (Enhanced)                         │
│                                                                      │
│  Webhook → PCAM Engine → RAG Context Retrieval → Agentic Chunker   │
│              ↓                    ↓                      ↓           │
│         Blueprint         Context7 Library Docs    Document Parser  │
│              ↓                    ↓                      ↓           │
│         Autonomy Gate ← Enhanced Context ← Semantic Chunks          │
│              ↓                                                       │
│         Patch Generator (with RAG-enhanced code)                    │
│              ↓                                                       │
│         .pcamaw/patches/<name>.json                                 │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    Vector Database (Pinecone/Chroma)                │
│   Code Embeddings | Documentation | Project Context | Examples      │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│                        PCAMAW CLI (Enhanced)                         │
│  List → Show → RAG Preview → Open (VS Code) → Apply → Commit        │
└─────────────────────────────────────────────────────────────────────┘
```

---

## V4 Component Breakdown

### 1. Agentic Chunking System

**Purpose**: Intelligently segment code, documentation, and context into meaningful chunks.

#### Components:

**1.1 Document Parser Agent (N8N Node)**
- Accepts: Code files, markdown docs, project blueprints
- Uses: LangChain's `RecursiveCharacterTextSplitter` with semantic awareness
- Output: Structured chunks with metadata

```javascript
// Pseudo-code for N8N node
const agenticChunker = async (documents) => {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
    separators: ["\n\n", "\n", " ", ""],
    // Agentic: AI determines optimal split points
    useSemanticSplitting: true,
    modelName: "gpt-4-turbo"
  });
  
  const chunks = await splitter.splitDocuments(documents);
  
  // Agent analyzes each chunk for context
  const enrichedChunks = await Promise.all(
    chunks.map(chunk => analyzeChunkContext(chunk))
  );
  
  return enrichedChunks;
};
```

**1.2 Chunk Metadata Enrichment**
- Extract: Function signatures, class definitions, imports
- Classify: Code type (component, utility, config, test)
- Tag: Language, framework, dependencies
- Relate: Parent-child relationships between chunks

**1.3 Storage**
```json
{
  "chunkId": "chunk_abc123",
  "content": "export const BlogPost = ({ title, content }) => {...}",
  "metadata": {
    "type": "react_component",
    "framework": "react",
    "dependencies": ["react"],
    "exports": ["BlogPost"],
    "language": "typescript",
    "complexity": "medium",
    "relatedChunks": ["chunk_def456", "chunk_ghi789"]
  },
  "embedding": [0.123, 0.456, ...],
  "timestamp": "2025-10-04T12:00:00Z"
}
```

---

### 2. Agentic RAG System

**Purpose**: Retrieve relevant context and generate enhanced code using RAG.

#### Components:

**2.1 Context Retrieval Agent (N8N Node)**

```javascript
// LangChain RAG implementation in N8N
const retrieveContext = async (prompt, projectPath) => {
  // 1. Generate embedding for the prompt
  const embeddings = new OpenAIEmbeddings();
  const promptEmbedding = await embeddings.embedQuery(prompt);
  
  // 2. Query vector database
  const vectorStore = await Pinecone.fromExistingIndex(
    embeddings,
    { indexName: "pcamaw-context" }
  );
  
  // 3. Retrieve relevant chunks (hybrid search)
  const relevantDocs = await vectorStore.similaritySearchWithScore(
    prompt,
    k: 10,
    filter: { projectPath }
  );
  
  // 4. Agent re-ranks results by relevance
  const rerankedDocs = await reRankAgent.rank(relevantDocs, prompt);
  
  // 5. Build context string
  const context = rerankedDocs
    .map(doc => `[${doc.metadata.type}] ${doc.content}`)
    .join("\n\n");
  
  return {
    context,
    sources: rerankedDocs.map(d => d.metadata)
  };
};
```

**2.2 Context7 Integration (N8N Node)**

Uses the existing `Ultimate_RAG_AI_Agent_V4.json` workflow as foundation:

```javascript
const fetchLibraryDocs = async (libraries) => {
  const context7Results = await Promise.all(
    libraries.map(lib => 
      fetch('https://api.context7.com/docs', {
        method: 'POST',
        body: JSON.stringify({
          library: lib,
          query: prompt,
          maxTokens: 5000
        })
      })
    )
  );
  
  return context7Results.map(r => r.documentation);
};
```

**2.3 Enhanced Code Generation (N8N Node)**

```javascript
const generateWithRAG = async (prompt, ragContext, context7Docs) => {
  const enhancedPrompt = `
# Task
${prompt}

# Project Context (from RAG)
${ragContext}

# Library Documentation (from Context7)
${context7Docs.join('\n\n')}

# Requirements
- Use existing project patterns
- Follow established code style
- Import from correct paths
- Include proper error handling
- Add TypeScript types

Generate production-ready code.
  `;
  
  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [
      { role: "system", content: "You are an expert programmer..." },
      { role: "user", content: enhancedPrompt }
    ]
  });
  
  return response.choices[0].message.content;
};
```

---

### 3. Context7 Integration

**Purpose**: Fetch up-to-date library documentation for accurate code generation.

#### Implementation:

**3.1 Library Detection Agent**
- Parse `package.json` for dependencies
- Analyze import statements in existing code
- Detect frameworks from project structure

**3.2 Context7 Query Builder**
```javascript
const buildContext7Queries = (prompt, detectedLibraries) => {
  return detectedLibraries.map(lib => ({
    library: lib.name,
    version: lib.version,
    query: extractRelevantTopic(prompt, lib),
    maxTokens: 3000
  }));
};
```

**3.3 Documentation Cache**
- Store fetched docs in vector database
- TTL: 7 days for library docs
- Refresh on version change

---

### 4. Web UI (Next.js)

**Purpose**: Provide intuitive interface for managing PCAMAW workflows.

#### Pages & Features:

**4.1 Dashboard** (`app/page.tsx`)
```typescript
// Shows recent patches, activity, statistics
export default function Dashboard() {
  return (
    <div>
      <StatsCards />
      <RecentPatches />
      <ActivityFeed />
      <QuickActions />
    </div>
  );
}
```

**4.2 Prompt Interface** (`app/prompt/page.tsx`)
```typescript
// Main interface for submitting prompts
export default function PromptPage() {
  const [prompt, setPrompt] = useState("");
  const [projectPath, setProjectPath] = useState("");
  const [ragPreview, setRagPreview] = useState(null);
  
  const handleSubmit = async () => {
    // 1. Preview RAG context
    const preview = await fetchRAGPreview(prompt);
    setRagPreview(preview);
    
    // 2. User reviews context
    // 3. Submit to N8N webhook
    const response = await fetch('/api/n8n-webhook', {
      method: 'POST',
      body: JSON.stringify({ prompt, projectPath })
    });
    
    // 4. Show progress
    // 5. Navigate to patch view
  };
  
  return (
    <div>
      <PromptEditor value={prompt} onChange={setPrompt} />
      <ProjectSelector value={projectPath} onChange={setProjectPath} />
      {ragPreview && <RAGContextPreview data={ragPreview} />}
      <SubmitButton onClick={handleSubmit} />
    </div>
  );
}
```

**4.3 Patch Browser** (`app/patches/page.tsx`)
```typescript
// Browse, filter, and manage patches
export default function PatchesPage() {
  return (
    <div>
      <PatchFilters />
      <PatchList>
        {patches.map(patch => (
          <PatchCard
            key={patch.name}
            patch={patch}
            onView={() => router.push(`/patches/${patch.name}`)}
            onApply={() => applyPatch(patch.name)}
          />
        ))}
      </PatchList>
    </div>
  );
}
```

**4.4 RAG Viewer** (`app/rag/page.tsx`)
```typescript
// Visualize RAG context and sources
export default function RAGViewerPage() {
  return (
    <div>
      <RAGContextTree />
      <SourceDocuments />
      <EmbeddingVisualizer />
      <ContextStatistics />
    </div>
  );
}
```

**4.5 Settings** (`app/settings/page.tsx`)
```typescript
// Configure N8N webhook, API keys, preferences
export default function SettingsPage() {
  return (
    <div>
      <N8NConfiguration />
      <VectorDatabaseSettings />
      <Context7APIKey />
      <ChunkingPreferences />
      <CLIIntegration />
    </div>
  );
}
```

#### API Routes:

**`app/api/n8n-webhook/route.ts`**
```typescript
export async function POST(req: Request) {
  const { prompt, projectPath } = await req.json();
  
  // Forward to N8N webhook
  const response = await fetch(process.env.N8N_WEBHOOK_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, projectPath })
  });
  
  return Response.json(await response.json());
}
```

**`app/api/patches/route.ts`**
```typescript
export async function GET() {
  const patches = await readPatchDirectory('.pcamaw/patches');
  return Response.json(patches);
}
```

**`app/api/rag-preview/route.ts`**
```typescript
export async function POST(req: Request) {
  const { prompt } = await req.json();
  
  // Query vector store for preview
  const context = await retrieveContext(prompt);
  
  return Response.json({
    chunks: context.docs,
    sources: context.sources,
    relevanceScores: context.scores
  });
}
```

---

### 5. Enhanced N8N Workflow

**New Nodes to Add:**

1. **Document Indexer** (on project analysis)
   - Chunks all project files
   - Generates embeddings
   - Stores in vector database

2. **RAG Context Retriever** (before PCAM analysis)
   - Queries vector store with prompt
   - Fetches relevant code examples
   - Retrieves similar past patches

3. **Context7 Fetcher** (parallel to Blueprint Loader)
   - Detects libraries from prompt
   - Fetches documentation
   - Caches results

4. **Enhanced Code Generator** (replaces simple planner)
   - Uses RAG context
   - Incorporates Context7 docs
   - Generates smarter code

5. **Embedding Generator** (after patch creation)
   - Embeds new patch for future retrieval
   - Updates project knowledge base

**Updated Workflow:**
```
Webhook Trigger
  ↓
PCAM Decomposition Engine
  ↓
┌──────────────────┴──────────────────┐
│                                     │
Project Blueprint          RAG Context Retriever
Loader                            ↓
│                          Vector Store Query
│                                     ↓
└──────────────────┬──────────────────┘
                   ↓
           Context7 Fetcher
                   ↓
          Autonomy Gate (>55%)
                   ↓
    Enhanced Code Generator (with RAG)
                   ↓
         Safe File Writer
                   ↓
        Patch Generator
                   ↓
    .pcamaw/patches/<name>.json
                   ↓
      Embedding Generator
                   ↓
     Update Vector Store
                   ↓
          Response
```

---

## Implementation Phases

### Phase 1: Foundation (Weeks 1-2)
- [ ] Set up vector database (Pinecone or Chroma)
- [ ] Implement basic LangChain integration in N8N
- [ ] Create document chunking node
- [ ] Build embedding generation pipeline
- [ ] Test with sample codebase

**Deliverables:**
- Vector database configured
- Basic RAG retrieval working
- 100+ code chunks indexed

---

### Phase 2: Agentic Chunking (Weeks 3-4)
- [ ] Implement semantic chunking agent
- [ ] Add metadata extraction
- [ ] Create chunk relationship mapping
- [ ] Build re-ranking agent
- [ ] Optimize chunk sizes

**Deliverables:**
- Intelligent chunking system
- Metadata-enriched chunks
- Relationship graph

---

### Phase 3: Context7 Integration (Weeks 5-6)
- [ ] Integrate Context7 API
- [ ] Build library detection
- [ ] Implement caching layer
- [ ] Create documentation merger
- [ ] Test with popular libraries (React, Next.js, LangChain)

**Deliverables:**
- Context7 integration working
- Documentation cache functional
- Library auto-detection active

---

### Phase 4: Enhanced N8N Workflow (Weeks 7-8)
- [ ] Add RAG retrieval nodes
- [ ] Implement Context7 fetcher node
- [ ] Enhance code generator with RAG
- [ ] Add embedding update node
- [ ] Test end-to-end workflow

**Deliverables:**
- V4 N8N workflow complete
- RAG-enhanced code generation
- Automatic knowledge base updates

---

### Phase 5: Web UI Development (Weeks 9-12)
- [ ] Initialize Next.js project
- [ ] Build dashboard page
- [ ] Create prompt interface with RAG preview
- [ ] Implement patch browser
- [ ] Add RAG viewer
- [ ] Build settings page
- [ ] Create API routes
- [ ] Add real-time updates (WebSocket)
- [ ] Implement authentication
- [ ] Deploy to Vercel

**Deliverables:**
- Functional web UI
- All pages implemented
- API integration complete
- Deployed application

---

### Phase 6: CLI Enhancement (Weeks 13-14)
- [ ] Add `pcamaw rag preview <prompt>` command
- [ ] Implement `pcamaw index <path>` for manual indexing
- [ ] Add `pcamaw search <query>` for vector search
- [ ] Create `pcamaw stats` for RAG statistics
- [ ] Update `pcamaw apply` to show RAG sources

**Deliverables:**
- CLI with RAG commands
- Improved user experience
- Better visibility into RAG process

---

### Phase 7: Testing & Optimization (Weeks 15-16)
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] Vector database tuning
- [ ] Chunk quality evaluation
- [ ] User acceptance testing
- [ ] Documentation updates

**Deliverables:**
- Comprehensive test suite
- Performance benchmarks
- Updated documentation
- Production-ready V4

---

## Technology Stack

### Backend (N8N Workflow)
- **N8N**: Workflow orchestration
- **LangChain**: RAG framework
- **OpenAI GPT-4**: Code generation & chunking
- **Pinecone/Chroma**: Vector database
- **Context7 API**: Library documentation

### Frontend (Web UI)
- **Next.js 14**: React framework (App Router)
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **shadcn/ui**: Component library
- **React Query**: Data fetching
- **Zustand**: State management
- **Socket.io**: Real-time updates

### CLI (Enhanced)
- **Node.js**: Runtime
- **Commander.js**: CLI framework
- **Inquirer**: Interactive prompts
- **Chalk**: Terminal colors
- **Ora**: Spinners & progress

---

## Data Models

### Vector Database Schema

```typescript
interface VectorDocument {
  id: string;
  content: string;
  embedding: number[];
  metadata: {
    type: 'code' | 'documentation' | 'patch' | 'blueprint';
    language?: string;
    framework?: string;
    filePath?: string;
    chunkIndex?: number;
    totalChunks?: number;
    projectPath: string;
    timestamp: string;
    tags: string[];
    complexity?: 'low' | 'medium' | 'high';
    dependencies?: string[];
  };
}
```

### Patch Schema (Enhanced)

```typescript
interface PatchV4 {
  name: string;
  timestamp: number;
  description: string;
  files: Array<{
    path: string;
    operation: 'create' | 'modify' | 'delete';
    content?: string;
    diff?: string;
    size: number;
  }>;
  metadata: {
    ragSources?: Array<{
      chunkId: string;
      relevanceScore: number;
      content: string;
    }>;
    context7Libraries?: string[];
    confidenceScore: number;
    estimatedComplexity: string;
  };
}
```

---

## Configuration Files

### `pcamaw.config.json` (New)

```json
{
  "version": "4.0.0",
  "vectorDatabase": {
    "provider": "pinecone",
    "indexName": "pcamaw-context",
    "dimension": 1536,
    "metric": "cosine"
  },
  "rag": {
    "chunkSize": 1000,
    "chunkOverlap": 200,
    "topK": 10,
    "minRelevanceScore": 0.7,
    "enableReranking": true
  },
  "context7": {
    "enabled": true,
    "cacheDuration": "7d",
    "maxTokensPerLibrary": 3000
  },
  "webUI": {
    "port": 3000,
    "enableAuth": true,
    "theme": "dark"
  },
  "n8n": {
    "webhookUrl": "https://your-n8n.com/webhook/pcamaw",
    "timeout": 300000
  }
}
```

---

## Success Metrics

### V4 Goals:

1. **Code Quality**: 90% of generated code requires <10% manual edits
2. **Context Accuracy**: RAG retrieves relevant context 85%+ of the time
3. **Speed**: Patch generation <30 seconds with RAG
4. **User Adoption**: 80% of users prefer V4 over V3
5. **Documentation Coverage**: Context7 covers 95% of popular libraries

---

## Migration Path (V3 → V4)

Users can adopt V4 incrementally:

1. **V3 Continues**: CLI and workflow work as before
2. **Opt-in RAG**: Enable RAG in config for enhanced results
3. **Web UI Optional**: CLI remains primary interface
4. **Gradual Indexing**: Vector database builds over time
5. **Full V4**: All features enabled, maximum intelligence

---

## Future Enhancements (V4.1+)

- **Multi-Agent Collaboration**: Specialized agents for frontend, backend, testing
- **Self-Healing Code**: Automatically fix errors using RAG
- **Predictive Suggestions**: "Users who wrote X also needed Y"
- **Code Review Agent**: AI reviews patches before application
- **Integration Testing**: Auto-generate tests using RAG examples
- **Performance Profiling**: Suggest optimizations from similar codebases

---

## Resources & References

- **LangChain Docs**: https://docs.langchain.com/
- **Context7 API**: https://context7.com/docs
- **Pinecone**: https://docs.pinecone.io/
- **Chroma**: https://docs.trychroma.com/
- **N8N Community**: https://community.n8n.io/
- **RAG Best Practices**: https://python.langchain.com/docs/use_cases/question_answering/

---

## Getting Started with V4 Development

```bash
# 1. Clone the repo
git clone https://github.com/mostlyfutures/N8N-PCAM_AI-Workflow.git
cd N8N-PCAM_AI-Workflow

# 2. Create V4 branch
git checkout -b v4-development

# 3. Set up vector database
# (Follow Pinecone/Chroma setup guide)

# 4. Install dependencies
npm install langchain @langchain/openai @langchain/pinecone

# 5. Configure environment
cp .env.example .env.v4
# Add: PINECONE_API_KEY, OPENAI_API_KEY, CONTEXT7_API_KEY

# 6. Initialize web UI
cd web-ui
npx create-next-app@latest . --typescript --tailwind --app
npm install @tanstack/react-query zustand socket.io-client

# 7. Start development
npm run dev
```

---

**PCAMAW V4: Intelligent, Context-Aware, Autonomous Programming**

*From simple automation to intelligent assistance with RAG* 🚀
