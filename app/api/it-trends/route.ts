import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

// Types for IT trends
export type ITTrend = {
  id: string
  name: string
  category: 'frontend' | 'backend' | 'ai/ml' | 'devops' | 'mobile' | 'web3' | 'security' | 'cloud' | 'data' | 'emerging'
  description: string
  popularity: 'rising' | 'hot' | 'stable' | 'declining'
  relevance: 'high' | 'medium' | 'low'
  skills: string[]
  learningResources: Array<{
    type: 'documentation' | 'course' | 'tutorial' | 'book' | 'certification'
    title: string
    url: string
    provider: string
  }>
  marketDemand: {
    jobOpenings: number
    salaryRange: string
    growthRate: string
  }
  timeToLearn: string
  prerequisites: string[]
  relatedTechnologies: string[]
  lastUpdated: string
}

// Curated IT trends data with real-time insights
const getTrendingTechnologies = async (): Promise<ITTrend[]> => {
  const currentTrends: ITTrend[] = [
    // AI/ML Category
    {
      id: "ai-agents",
      name: "AI Agents & Autonomous Systems",
      category: "ai/ml",
      description: "Autonomous AI systems that can perform complex tasks independently, including multi-agent frameworks and workflow automation.",
      popularity: "hot",
      relevance: "high",
      skills: ["Python", "LangChain", "OpenAI API", "Vector Databases", "RAG", "AutoGen"],
      learningResources: [
        {
          type: "course",
          title: "Building AI Agents with LangChain",
          url: "https://www.deeplearning.ai/short-courses/",
          provider: "DeepLearning.AI"
        },
        {
          type: "documentation",
          title: "AutoGen Documentation",
          url: "https://microsoft.github.io/autogen/",
          provider: "Microsoft"
        }
      ],
      marketDemand: {
        jobOpenings: 15000,
        salaryRange: "$120,000 - $200,000",
        growthRate: "145%"
      },
      timeToLearn: "3-6 months",
      prerequisites: ["Python", "Machine Learning Basics", "API Development"],
      relatedTechnologies: ["LLMs", "Vector Databases", "Retrieval Systems"],
      lastUpdated: new Date().toISOString()
    },
    {
      id: "transformer-models",
      name: "Transformer Models & LLMs",
      category: "ai/ml",
      description: "Large Language Models and transformer architectures revolutionizing natural language processing and AI applications.",
      popularity: "hot",
      relevance: "high",
      skills: ["PyTorch", "Transformers", "Hugging Face", "Fine-tuning", "RLHF"],
      learningResources: [
        {
          type: "course",
          title: "Hugging Face NLP Course",
          url: "https://huggingface.co/course",
          provider: "Hugging Face"
        },
        {
          type: "tutorial",
          title: "Attention Is All You Need",
          url: "https://arxiv.org/abs/1706.03762",
          provider: "Google Research"
        }
      ],
      marketDemand: {
        jobOpenings: 22000,
        salaryRange: "$140,000 - $220,000",
        growthRate: "165%"
      },
      timeToLearn: "4-8 months",
      prerequisites: ["Machine Learning", "Deep Learning", "Python", "Mathematics"],
      relatedTechnologies: ["GPT", "BERT", "T5", "Retrieval Systems"],
      lastUpdated: new Date().toISOString()
    },
    
    // Frontend Category
    {
      id: "webassembly",
      name: "WebAssembly (WASM)",
      category: "frontend",
      description: "Binary instruction format for web browsers enabling near-native performance for web applications and cross-platform development.",
      popularity: "rising",
      relevance: "medium",
      skills: ["WebAssembly", "C/C++", "Rust", "AssemblyScript", "Performance Optimization"],
      learningResources: [
        {
          type: "documentation",
          title: "WebAssembly.org",
          url: "https://webassembly.org/",
          provider: "WebAssembly Community"
        },
        {
          type: "tutorial",
          title: "WebAssembly Tutorial",
          url: "https://developer.mozilla.org/en-US/docs/WebAssembly",
          provider: "MDN"
        }
      ],
      marketDemand: {
        jobOpenings: 5500,
        salaryRange: "$100,000 - $150,000",
        growthRate: "65%"
      },
      timeToLearn: "3-5 months",
      prerequisites: ["JavaScript", "C/C++ or Rust", "Web Development"],
      relatedTechnologies: ["Emscripten", "WASI", "Browser APIs"],
      lastUpdated: new Date().toISOString()
    },
    {
      id: "micro-frontends",
      name: "Micro Frontend Architecture",
      category: "frontend",
      description: "Architectural approach to split frontend monoliths into smaller, manageable pieces that can be developed independently.",
      popularity: "rising",
      relevance: "high",
      skills: ["Module Federation", "Single-SPA", "Webpack", "Microservices", "Component Architecture"],
      learningResources: [
        {
          type: "documentation",
          title: "Module Federation Guide",
          url: "https://webpack.js.org/concepts/module-federation/",
          provider: "Webpack"
        },
        {
          type: "course",
          title: "Micro Frontends with React",
          url: "https://www.udemy.com/course/microfrontend/",
          provider: "Udemy"
        }
      ],
      marketDemand: {
        jobOpenings: 8200,
        salaryRange: "$95,000 - $140,000",
        growthRate: "58%"
      },
      timeToLearn: "2-4 months",
      prerequisites: ["React/Vue/Angular", "Webpack", "Microservices Concepts"],
      relatedTechnologies: ["Webpack", "Single-SPA", "qiankun"],
      lastUpdated: new Date().toISOString()
    },
    {
      id: "server-components",
      name: "React Server Components",
      category: "frontend",
      description: "Server-side rendering paradigm allowing components to render on the server, reducing bundle size and improving performance.",
      popularity: "hot",
      relevance: "high",
      skills: ["React", "Next.js", "Server-Side Rendering", "Streaming", "Suspense"],
      learningResources: [
        {
          type: "documentation",
          title: "React Server Components",
          url: "https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023#react-server-components",
          provider: "React Team"
        },
        {
          type: "tutorial",
          title: "Next.js App Router",
          url: "https://nextjs.org/docs/app",
          provider: "Vercel"
        }
      ],
      marketDemand: {
        jobOpenings: 12000,
        salaryRange: "$105,000 - $160,000",
        growthRate: "85%"
      },
      timeToLearn: "2-3 months",
      prerequisites: ["React", "Next.js", "JavaScript"],
      relatedTechnologies: ["Next.js", "Streaming SSR", "Suspense"],
      lastUpdated: new Date().toISOString()
    },

    // Backend Category
    {
      id: "rust-systems",
      name: "Rust for Systems Programming",
      category: "backend",
      description: "Memory-safe systems programming language gaining adoption for high-performance applications, web assembly, and blockchain development.",
      popularity: "rising",
      relevance: "high",
      skills: ["Rust", "Systems Programming", "WebAssembly", "Concurrency", "Memory Management"],
      learningResources: [
        {
          type: "book",
          title: "The Rust Programming Language",
          url: "https://doc.rust-lang.org/book/",
          provider: "Rust Foundation"
        },
        {
          type: "course",
          title: "Rust Fundamentals",
          url: "https://www.pluralsight.com/courses/rust-fundamentals",
          provider: "Pluralsight"
        }
      ],
      marketDemand: {
        jobOpenings: 8500,
        salaryRange: "$130,000 - $180,000",
        growthRate: "89%"
      },
      timeToLearn: "4-8 months",
      prerequisites: ["Systems Programming Concepts", "C/C++ Knowledge"],
      relatedTechnologies: ["WebAssembly", "Blockchain", "Operating Systems"],
      lastUpdated: new Date().toISOString()
    },
    {
      id: "graphql-federation",
      name: "GraphQL Federation",
      category: "backend",
      description: "Distributed GraphQL architecture enabling multiple teams to build a unified API across microservices.",
      popularity: "stable",
      relevance: "high",
      skills: ["GraphQL", "Apollo Federation", "Schema Stitching", "Microservices", "API Design"],
      learningResources: [
        {
          type: "documentation",
          title: "Apollo Federation",
          url: "https://www.apollographql.com/docs/federation/",
          provider: "Apollo GraphQL"
        },
        {
          type: "course",
          title: "GraphQL Federation Course",
          url: "https://odyssey.apollographql.com/",
          provider: "Apollo GraphQL"
        }
      ],
      marketDemand: {
        jobOpenings: 6800,
        salaryRange: "$110,000 - $165,000",
        growthRate: "42%"
      },
      timeToLearn: "2-4 months",
      prerequisites: ["GraphQL", "Microservices", "API Development"],
      relatedTechnologies: ["Apollo", "Hasura", "Microservices"],
      lastUpdated: new Date().toISOString()
    },

    // DevOps Category
    {
      id: "platform-engineering",
      name: "Platform Engineering",
      category: "devops",
      description: "Creating internal developer platforms to improve developer experience and productivity through self-service infrastructure.",
      popularity: "hot",
      relevance: "high",
      skills: ["Kubernetes", "Terraform", "GitOps", "Internal Developer Platforms", "Developer Experience"],
      learningResources: [
        {
          type: "book",
          title: "Platform Engineering on Kubernetes",
          url: "https://www.manning.com/books/platform-engineering-on-kubernetes",
          provider: "Manning Publications"
        },
        {
          type: "course",
          title: "Platform Engineering Fundamentals",
          url: "https://www.cncf.io/certification/training/",
          provider: "CNCF"
        }
      ],
      marketDemand: {
        jobOpenings: 14000,
        salaryRange: "$125,000 - $190,000",
        growthRate: "78%"
      },
      timeToLearn: "4-8 months",
      prerequisites: ["Kubernetes", "DevOps", "Cloud Platforms", "Infrastructure as Code"],
      relatedTechnologies: ["Kubernetes", "Terraform", "ArgoCD", "Backstage"],
      lastUpdated: new Date().toISOString()
    },
    {
      id: "gitops",
      name: "GitOps & Infrastructure as Code",
      category: "devops",
      description: "Operational framework using Git repositories as the single source of truth for declarative infrastructure and applications.",
      popularity: "rising",
      relevance: "high",
      skills: ["ArgoCD", "Flux", "Kubernetes", "Helm", "Git", "Terraform"],
      learningResources: [
        {
          type: "certification",
          title: "GitOps Fundamentals",
          url: "https://www.cncf.io/certification/gitops/",
          provider: "CNCF"
        },
        {
          type: "tutorial",
          title: "ArgoCD Getting Started",
          url: "https://argo-cd.readthedocs.io/en/stable/getting_started/",
          provider: "Argo Project"
        }
      ],
      marketDemand: {
        jobOpenings: 11500,
        salaryRange: "$115,000 - $175,000",
        growthRate: "67%"
      },
      timeToLearn: "3-5 months",
      prerequisites: ["Kubernetes", "Git", "Docker", "YAML"],
      relatedTechnologies: ["ArgoCD", "Flux", "Helm", "Kustomize"],
      lastUpdated: new Date().toISOString()
    },

    // Mobile Category
    {
      id: "flutter-multiplatform",
      name: "Flutter & Cross-Platform Mobile",
      category: "mobile",
      description: "Google's UI toolkit for building natively compiled applications for mobile, web, and desktop from a single codebase.",
      popularity: "rising",
      relevance: "high",
      skills: ["Dart", "Flutter", "Cross-Platform Development", "Material Design", "State Management"],
      learningResources: [
        {
          type: "documentation",
          title: "Flutter Documentation",
          url: "https://docs.flutter.dev/",
          provider: "Google"
        },
        {
          type: "course",
          title: "Flutter Complete Course",
          url: "https://www.udemy.com/course/learn-flutter-dart-to-build-ios-android-apps/",
          provider: "Udemy"
        }
      ],
      marketDemand: {
        jobOpenings: 16000,
        salaryRange: "$90,000 - $140,000",
        growthRate: "72%"
      },
      timeToLearn: "3-6 months",
      prerequisites: ["Programming Fundamentals", "Mobile Development Concepts"],
      relatedTechnologies: ["React Native", "Xamarin", "Ionic"],
      lastUpdated: new Date().toISOString()
    },
    {
      id: "react-native-new-arch",
      name: "React Native New Architecture",
      category: "mobile",
      description: "Revolutionary architecture improvements including Fabric renderer, TurboModules, and JSI for better performance.",
      popularity: "hot",
      relevance: "high",
      skills: ["React Native", "JavaScript", "C++", "Java/Kotlin", "Swift/Objective-C"],
      learningResources: [
        {
          type: "documentation",
          title: "New React Native Architecture",
          url: "https://reactnative.dev/docs/new-architecture-intro",
          provider: "Meta"
        },
        {
          type: "tutorial",
          title: "Migrating to New Architecture",
          url: "https://reactnative.dev/docs/new-architecture-app-intro",
          provider: "Meta"
        }
      ],
      marketDemand: {
        jobOpenings: 18500,
        salaryRange: "$95,000 - $155,000",
        growthRate: "68%"
      },
      timeToLearn: "2-4 months",
      prerequisites: ["React Native", "JavaScript", "Mobile Development"],
      relatedTechnologies: ["Expo", "Flipper", "Metro"],
      lastUpdated: new Date().toISOString()
    },

    // Web3 Category
    {
      id: "smart-contracts",
      name: "Smart Contract Development",
      category: "web3",
      description: "Self-executing contracts with terms directly written into code, running on blockchain networks like Ethereum.",
      popularity: "stable",
      relevance: "medium",
      skills: ["Solidity", "Ethereum", "Web3.js", "Hardhat", "Smart Contract Security"],
      learningResources: [
        {
          type: "tutorial",
          title: "Solidity Documentation",
          url: "https://docs.soliditylang.org/",
          provider: "Ethereum Foundation"
        },
        {
          type: "course",
          title: "Smart Contract Development",
          url: "https://cryptozombies.io/",
          provider: "CryptoZombies"
        }
      ],
      marketDemand: {
        jobOpenings: 4200,
        salaryRange: "$120,000 - $200,000",
        growthRate: "45%"
      },
      timeToLearn: "4-8 months",
      prerequisites: ["Programming Experience", "Blockchain Basics", "Cryptography"],
      relatedTechnologies: ["Ethereum", "Polygon", "Hardhat", "OpenZeppelin"],
      lastUpdated: new Date().toISOString()
    },
    {
      id: "defi-protocols",
      name: "DeFi Protocol Development",
      category: "web3",
      description: "Decentralized Finance protocols enabling financial services without traditional intermediaries through blockchain technology.",
      popularity: "rising",
      relevance: "medium",
      skills: ["DeFi", "Solidity", "AMMs", "Yield Farming", "Liquidity Pools"],
      learningResources: [
        {
          type: "course",
          title: "DeFi Developer Course",
          url: "https://university.alchemy.com/",
          provider: "Alchemy University"
        },
        {
          type: "documentation",
          title: "Uniswap V3 Docs",
          url: "https://docs.uniswap.org/",
          provider: "Uniswap Labs"
        }
      ],
      marketDemand: {
        jobOpenings: 3500,
        salaryRange: "$130,000 - $220,000",
        growthRate: "38%"
      },
      timeToLearn: "6-10 months",
      prerequisites: ["Smart Contracts", "DeFi Knowledge", "Economics"],
      relatedTechnologies: ["Uniswap", "Aave", "Compound", "Curve"],
      lastUpdated: new Date().toISOString()
    },

    // Security Category
    {
      id: "cyber-security-ai",
      name: "AI-Powered Cybersecurity",
      category: "security",
      description: "Using artificial intelligence and machine learning for threat detection, incident response, and automated security operations.",
      popularity: "hot",
      relevance: "high",
      skills: ["Security Analytics", "ML for Security", "Threat Intelligence", "SOAR", "Zero Trust"],
      learningResources: [
        {
          type: "certification",
          title: "Certified AI Security Professional",
          url: "https://www.eccouncil.org/",
          provider: "EC-Council"
        },
        {
          type: "course",
          title: "AI for Cybersecurity",
          url: "https://www.sans.org/",
          provider: "SANS Institute"
        }
      ],
      marketDemand: {
        jobOpenings: 18000,
        salaryRange: "$130,000 - $220,000",
        growthRate: "92%"
      },
      timeToLearn: "4-6 months",
      prerequisites: ["Cybersecurity Basics", "Machine Learning", "Network Security"],
      relatedTechnologies: ["SIEM", "XDR", "Threat Hunting"],
      lastUpdated: new Date().toISOString()
    },
    {
      id: "zero-trust-security",
      name: "Zero Trust Security Architecture",
      category: "security",
      description: "Security model that requires verification for every user and device, regardless of their location within or outside the network.",
      popularity: "rising",
      relevance: "high",
      skills: ["Zero Trust", "Identity Management", "Multi-Factor Authentication", "Network Segmentation"],
      learningResources: [
        {
          type: "certification",
          title: "Zero Trust Certification",
          url: "https://www.isc2.org/Certifications/CISSP",
          provider: "ISC2"
        },
        {
          type: "tutorial",
          title: "Zero Trust Implementation Guide",
          url: "https://www.nist.gov/publications/zero-trust-architecture",
          provider: "NIST"
        }
      ],
      marketDemand: {
        jobOpenings: 13500,
        salaryRange: "$125,000 - $195,000",
        growthRate: "85%"
      },
      timeToLearn: "3-6 months",
      prerequisites: ["Network Security", "Identity Management", "Cloud Security"],
      relatedTechnologies: ["Azure AD", "Okta", "CrowdStrike", "Palo Alto"],
      lastUpdated: new Date().toISOString()
    },

    // Cloud Category
    {
      id: "edge-computing",
      name: "Edge Computing & CDN Evolution",
      category: "cloud",
      description: "Computing infrastructure that brings data processing closer to users, including edge functions, CDN evolution, and distributed systems.",
      popularity: "hot",
      relevance: "high",
      skills: ["Edge Functions", "CDN Configuration", "Distributed Systems", "Performance Optimization"],
      learningResources: [
        {
          type: "documentation",
          title: "Cloudflare Workers",
          url: "https://developers.cloudflare.com/workers/",
          provider: "Cloudflare"
        },
        {
          type: "course",
          title: "Edge Computing Fundamentals",
          url: "https://www.coursera.org/learn/edge-computing",
          provider: "Coursera"
        }
      ],
      marketDemand: {
        jobOpenings: 12000,
        salaryRange: "$110,000 - $170,000",
        growthRate: "76%"
      },
      timeToLearn: "2-4 months",
      prerequisites: ["Cloud Computing", "Networking", "JavaScript/Python"],
      relatedTechnologies: ["Serverless", "CDNs", "Microservices"],
      lastUpdated: new Date().toISOString()
    },
    {
      id: "multi-cloud-strategies",
      name: "Multi-Cloud & Hybrid Strategies",
      category: "cloud",
      description: "Managing applications and data across multiple cloud providers to avoid vendor lock-in and optimize performance.",
      popularity: "stable",
      relevance: "high",
      skills: ["AWS", "Azure", "GCP", "Kubernetes", "Cloud Management", "Cost Optimization"],
      learningResources: [
        {
          type: "certification",
          title: "Multi-Cloud Architecture",
          url: "https://cloud.google.com/certification/cloud-architect",
          provider: "Google Cloud"
        },
        {
          type: "course",
          title: "Multi-Cloud Strategy",
          url: "https://www.pluralsight.com/courses/multi-cloud-strategy",
          provider: "Pluralsight"
        }
      ],
      marketDemand: {
        jobOpenings: 9800,
        salaryRange: "$120,000 - $180,000",
        growthRate: "55%"
      },
      timeToLearn: "4-8 months",
      prerequisites: ["Cloud Platforms", "Kubernetes", "Infrastructure Management"],
      relatedTechnologies: ["Terraform", "Ansible", "Kubernetes", "Service Mesh"],
      lastUpdated: new Date().toISOString()
    },

    // Data Category
    {
      id: "real-time-analytics",
      name: "Real-Time Data Analytics",
      category: "data",
      description: "Processing and analyzing data streams in real-time to provide immediate insights for business decision making.",
      popularity: "hot",
      relevance: "high",
      skills: ["Apache Kafka", "Apache Spark", "Stream Processing", "Real-time Dashboards", "Event-Driven Architecture"],
      learningResources: [
        {
          type: "course",
          title: "Kafka Streams Development",
          url: "https://www.confluent.io/training/",
          provider: "Confluent"
        },
        {
          type: "tutorial",
          title: "Real-time Analytics with Spark",
          url: "https://spark.apache.org/docs/latest/streaming-programming-guide.html",
          provider: "Apache Spark"
        }
      ],
      marketDemand: {
        jobOpenings: 15500,
        salaryRange: "$115,000 - $175,000",
        growthRate: "82%"
      },
      timeToLearn: "4-6 months",
      prerequisites: ["Data Engineering", "SQL", "Python/Scala", "Distributed Systems"],
      relatedTechnologies: ["Kafka", "Spark", "Flink", "ClickHouse"],
      lastUpdated: new Date().toISOString()
    },
    {
      id: "data-mesh",
      name: "Data Mesh Architecture",
      category: "data",
      description: "Decentralized data architecture paradigm that treats data as a product with domain-oriented ownership.",
      popularity: "rising",
      relevance: "medium",
      skills: ["Data Architecture", "Domain-Driven Design", "Data Products", "Federated Governance"],
      learningResources: [
        {
          type: "book",
          title: "Data Mesh by Zhamak Dehghani",
          url: "https://www.oreilly.com/library/view/data-mesh/9781492092384/",
          provider: "O'Reilly"
        },
        {
          type: "course",
          title: "Data Mesh Fundamentals",
          url: "https://www.thoughtworks.com/insights/topic/data-mesh",
          provider: "ThoughtWorks"
        }
      ],
      marketDemand: {
        jobOpenings: 6200,
        salaryRange: "$125,000 - $185,000",
        growthRate: "65%"
      },
      timeToLearn: "3-6 months",
      prerequisites: ["Data Engineering", "Domain-Driven Design", "Data Governance"],
      relatedTechnologies: ["Apache Airflow", "dbt", "DataHub", "Apache Atlas"],
      lastUpdated: new Date().toISOString()
    },

    // Emerging Category
    {
      id: "quantum-computing",
      name: "Quantum Computing Development",
      category: "emerging",
      description: "Programming quantum computers using quantum algorithms and frameworks like Qiskit and Cirq for solving complex computational problems.",
      popularity: "rising",
      relevance: "low",
      skills: ["Quantum Algorithms", "Qiskit", "Cirq", "Linear Algebra", "Quantum Physics"],
      learningResources: [
        {
          type: "course",
          title: "Introduction to Quantum Computing",
          url: "https://www.ibm.com/quantum/learn",
          provider: "IBM Quantum"
        },
        {
          type: "certification",
          title: "IBM Quantum Developer Certification",
          url: "https://www.ibm.com/training/certification",
          provider: "IBM"
        }
      ],
      marketDemand: {
        jobOpenings: 1200,
        salaryRange: "$150,000 - $250,000",
        growthRate: "200%"
      },
      timeToLearn: "6-12 months",
      prerequisites: ["Advanced Mathematics", "Physics", "Python"],
      relatedTechnologies: ["Classical Computing", "Machine Learning", "Cryptography"],
      lastUpdated: new Date().toISOString()
    },
    {
      id: "neuromorphic-computing",
      name: "Neuromorphic Computing",
      category: "emerging",
      description: "Brain-inspired computing architectures that mimic neural structures for ultra-low power AI applications.",
      popularity: "rising",
      relevance: "low",
      skills: ["Neural Networks", "Hardware Design", "Spiking Neural Networks", "Event-Driven Computing"],
      learningResources: [
        {
          type: "course",
          title: "Neuromorphic Engineering",
          url: "https://www.edx.org/course/neuromorphic-engineering",
          provider: "ETH Zurich"
        },
        {
          type: "tutorial",
          title: "Intel Loihi Documentation",
          url: "https://intel-ncl.github.io/",
          provider: "Intel"
        }
      ],
      marketDemand: {
        jobOpenings: 800,
        salaryRange: "$140,000 - $230,000",
        growthRate: "180%"
      },
      timeToLearn: "8-12 months",
      prerequisites: ["Neuroscience", "Hardware Engineering", "Machine Learning"],
      relatedTechnologies: ["Intel Loihi", "SpiNNaker", "BrainChip"],
      lastUpdated: new Date().toISOString()
    },
    {
      id: "spatial-computing",
      name: "Spatial Computing & AR/VR",
      category: "emerging",
      description: "Computing that integrates digital content with the physical world through augmented and virtual reality technologies.",
      popularity: "hot",
      relevance: "medium",
      skills: ["Unity", "Unreal Engine", "ARKit", "ARCore", "WebXR", "Computer Vision"],
      learningResources: [
        {
          type: "course",
          title: "AR/VR Development with Unity",
          url: "https://learn.unity.com/pathway/xr-development",
          provider: "Unity"
        },
        {
          type: "documentation",
          title: "Apple Vision Pro Development",
          url: "https://developer.apple.com/visionos/",
          provider: "Apple"
        }
      ],
      marketDemand: {
        jobOpenings: 7500,
        salaryRange: "$105,000 - $165,000",
        growthRate: "95%"
      },
      timeToLearn: "4-8 months",
      prerequisites: ["3D Graphics", "Game Development", "Computer Vision"],
      relatedTechnologies: ["Unity", "Meta SDK", "Apple Vision Pro", "WebXR"],
      lastUpdated: new Date().toISOString()
    }
  ]

  return currentTrends
}

// AI-powered trend analysis
const analyzePersonalizedTrends = async (userSkills: string[], userIndustry: string): Promise<ITTrend[]> => {
  const trends = await getTrendingTechnologies()
  
  // Use AI to personalize trend relevance
  const prompt = `
    Given a user with skills: ${userSkills.join(', ')} 
    Working in industry: ${userIndustry}
    
    Analyze these IT trends and rank them by relevance for this user's career growth.
    Consider: skill overlap, learning curve, market demand, and career progression opportunities.
    
    Return a JSON array of trend IDs ordered by relevance (most relevant first).
    Available trends: ${trends.map(t => `${t.id}: ${t.name}`).join(', ')}
  `

  try {
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
      maxTokens: 500,
    })

    // Parse AI response and reorder trends
    const trendIds = JSON.parse(text.match(/\[.*\]/)?.[0] || '[]')
    const reorderedTrends = trendIds
      .map((id: string) => trends.find(t => t.id === id))
      .filter(Boolean)
    
    // Add any missing trends at the end
    const includedIds = new Set(trendIds)
    const remainingTrends = trends.filter(t => !includedIds.has(t.id))
    
    return [...reorderedTrends, ...remainingTrends]
  } catch (error) {
    console.error('Error personalizing trends:', error)
    return trends
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const personalize = searchParams.get('personalize') === 'true'
    const userSkills = searchParams.get('skills')?.split(',') || []
    const userIndustry = searchParams.get('industry') || 'technology'

    let trends = await getTrendingTechnologies()

    // First, filter by category if specified (this should NOT trigger AI)
    if (category && category !== 'all') {
      trends = trends.filter(trend => trend.category === category)
    }

    // Only personalize if explicitly requested AND we have user skills
    // AND we're not just doing a simple category filter
    if (personalize && userSkills.length > 0 && (!category || category === 'all')) {
      try {
        const personalizedTrends = await analyzePersonalizedTrends(userSkills, userIndustry)
        trends = personalizedTrends
      } catch (error) {
        console.error('Error personalizing trends, falling back to default:', error)
        // Keep the original trends if personalization fails
      }
    }

    return NextResponse.json({
      trends,
      categories: ['all', 'frontend', 'backend', 'ai/ml', 'devops', 'mobile', 'web3', 'security', 'cloud', 'data', 'emerging'],
      lastUpdated: new Date().toISOString(),
      totalTrends: trends.length,
      isPersonalized: personalize && userSkills.length > 0 && (!category || category === 'all')
    })
  } catch (error) {
    console.error('Error fetching IT trends:', error)
    return NextResponse.json(
      { error: 'Failed to fetch IT trends' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, userProfile } = body

    if (action === 'get-recommendations') {
      // Get personalized trend recommendations based on user profile
      const trends = await analyzePersonalizedTrends(
        userProfile.technicalSkills?.map((s: any) => s.skill) || [],
        userProfile.industry || 'technology'
      )

      return NextResponse.json({
        recommendations: trends.slice(0, 5), // Top 5 recommendations
        learningPath: trends.slice(0, 3).map(trend => ({
          trend: trend.name,
          timeToLearn: trend.timeToLearn,
          prerequisites: trend.prerequisites,
          nextSteps: trend.learningResources.slice(0, 2)
        }))
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error processing request:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
} 