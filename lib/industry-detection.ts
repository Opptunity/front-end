// Define industry categories and related skills
export type Industry =
  | "technology"
  | "marketing"
  | "finance"
  | "healthcare"
  | "education"
  | "design"
  | "legal"
  | "hr"
  | "sales"
  | "manufacturing"
  | "other"

// Map of skills to their most likely industry
const skillToIndustryMap: Record<string, Industry> = {
  // Technology skills
  javascript: "technology",
  python: "technology",
  react: "technology",
  java: "technology",
  "node.js": "technology",
  aws: "technology",
  cloud: "technology",
  devops: "technology",
  "machine learning": "technology",
  "data science": "technology",
  sql: "technology",
  nosql: "technology",
  mongodb: "technology",
  docker: "technology",
  kubernetes: "technology",
  git: "technology",
  agile: "technology",
  scrum: "technology",
  "ci/cd": "technology",
  html: "technology",
  css: "technology",
  typescript: "technology",
  php: "technology",
  ruby: "technology",
  "c#": "technology",
  "c++": "technology",
  swift: "technology",
  kotlin: "technology",
  flutter: "technology",
  "react native": "technology",
  angular: "technology",
  vue: "technology",
  django: "technology",
  flask: "technology",
  spring: "technology",
  "asp.net": "technology",
  laravel: "technology",
  wordpress: "technology",
  database: "technology",
  api: "technology",
  rest: "technology",
  graphql: "technology",
  microservices: "technology",
  serverless: "technology",
  linux: "technology",
  windows: "technology",
  macos: "technology",
  ios: "technology",
  android: "technology",

  // Marketing skills
  seo: "marketing",
  sem: "marketing",
  "social media": "marketing",
  "content marketing": "marketing",
  "email marketing": "marketing",
  "digital marketing": "marketing",
  "marketing automation": "marketing",
  "google analytics": "marketing",
  "google ads": "marketing",
  "facebook ads": "marketing",
  instagram: "marketing",
  tiktok: "marketing",
  "influencer marketing": "marketing",
  "brand management": "marketing",
  "market research": "marketing",
  "customer segmentation": "marketing",
  "marketing strategy": "marketing",
  "public relations": "marketing",
  copywriting: "marketing",
  "content strategy": "marketing",
  hubspot: "marketing",
  mailchimp: "marketing",
  marketo: "marketing",
  hootsuite: "marketing",
  buffer: "marketing",
  canva: "marketing",
  "adobe creative suite": "marketing",
  photoshop: "marketing",
  illustrator: "marketing",
  indesign: "marketing",
  analytics: "marketing",
  "a/b testing": "marketing",
  "conversion optimization": "marketing",
  "customer journey": "marketing",
  "marketing funnel": "marketing",

  // Finance skills
  "financial analysis": "finance",
  accounting: "finance",
  bookkeeping: "finance",
  quickbooks: "finance",
  xero: "finance",
  sap: "finance",
  "financial modeling": "finance",
  excel: "finance",
  "financial reporting": "finance",
  budgeting: "finance",
  forecasting: "finance",
  investment: "finance",
  "portfolio management": "finance",
  "risk management": "finance",
  taxation: "finance",
  audit: "finance",
  compliance: "finance",
  banking: "finance",
  insurance: "finance",
  fintech: "finance",
  blockchain: "finance",
  cryptocurrency: "finance",
  "mergers and acquisitions": "finance",
  valuation: "finance",
  "capital markets": "finance",
  "financial planning": "finance",
  "wealth management": "finance",

  // Healthcare skills
  "patient care": "healthcare",
  "medical coding": "healthcare",
  "electronic health records": "healthcare",
  epic: "healthcare",
  cerner: "healthcare",
  "clinical research": "healthcare",
  "healthcare compliance": "healthcare",
  hipaa: "healthcare",
  "medical terminology": "healthcare",
  nursing: "healthcare",
  pharmacy: "healthcare",
  telemedicine: "healthcare",
  "healthcare management": "healthcare",
  "public health": "healthcare",
  "medical devices": "healthcare",
  "healthcare analytics": "healthcare",
  "patient advocacy": "healthcare",

  // Design skills
  "ui design": "design",
  "ux design": "design",
  "user research": "design",
  wireframing: "design",
  prototyping: "design",
  figma: "design",
  sketch: "design",
  "adobe xd": "design",
  "graphic design": "design",
  typography: "design",
  "color theory": "design",
  illustration: "design",
  animation: "design",
  "3d modeling": "design",
  "product design": "design",
  "design thinking": "design",
  "design systems": "design",
  accessibility: "design",
  "responsive design": "design",

  // HR skills
  recruiting: "hr",
  "talent acquisition": "hr",
  "employee relations": "hr",
  "performance management": "hr",
  compensation: "hr",
  benefits: "hr",
  payroll: "hr",
  "hr information systems": "hr",
  workday: "hr",
  adp: "hr",
  "succession planning": "hr",
  "employee engagement": "hr",
  "diversity and inclusion": "hr",
  "training and development": "hr",
  onboarding: "hr",
  "hr analytics": "hr",
  "labor relations": "hr",
  "hr compliance": "hr",

  // Sales skills
  "sales management": "sales",
  "account management": "sales",
  "business development": "sales",
  "cold calling": "sales",
  "lead generation": "sales",
  negotiation: "sales",
  closing: "sales",
  crm: "sales",
  salesforce: "sales",
  "hubspot crm": "sales",
  pipedrive: "sales",
  "sales forecasting": "sales",
  "sales strategy": "sales",
  "customer success": "sales",
  "relationship management": "sales",
  "solution selling": "sales",
  "consultative selling": "sales",
  "b2b sales": "sales",
  "b2c sales": "sales",
  "enterprise sales": "sales",
  "inside sales": "sales",
  "outside sales": "sales",

  // Education skills
  "curriculum development": "education",
  "instructional design": "education",
  teaching: "education",
  "e-learning": "education",
  lms: "education",
  blackboard: "education",
  canvas: "education",
  moodle: "education",
  assessment: "education",
  "student engagement": "education",
  "classroom management": "education",
  "special education": "education",
  "educational technology": "education",
  "higher education": "education",
  "k-12": "education",

  // Legal skills
  "legal research": "legal",
  "legal writing": "legal",
  "contract management": "legal",
  compliance: "legal",
  "intellectual property": "legal",
  litigation: "legal",
  "corporate law": "legal",
  "legal analysis": "legal",
  westlaw: "legal",
  lexisnexis: "legal",
  "e-discovery": "legal",
  "legal ethics": "legal",

  // Manufacturing skills
  "supply chain": "manufacturing",
  "inventory management": "manufacturing",
  "quality control": "manufacturing",
  "lean manufacturing": "manufacturing",
  "six sigma": "manufacturing",
  "production planning": "manufacturing",
  logistics: "manufacturing",
  procurement: "manufacturing",
  erp: "manufacturing",
  "sap erp": "manufacturing",
  "oracle erp": "manufacturing",
  "process improvement": "manufacturing",
  "operations management": "manufacturing",
  "warehouse management": "manufacturing",
  "manufacturing execution systems": "manufacturing",
  cad: "manufacturing",
  cam: "manufacturing",
  cnc: "manufacturing",
  "3d printing": "manufacturing",
}

/**
 * Detect the most likely industry based on a list of skills
 */
export function detectIndustry(skills: string[]): Industry {
  if (!skills || skills.length === 0) return "other"

  // Count occurrences of each industry
  const industryCounts: Record<Industry, number> = {
    technology: 0,
    marketing: 0,
    finance: 0,
    healthcare: 0,
    education: 0,
    design: 0,
    legal: 0,
    hr: 0,
    sales: 0,
    manufacturing: 0,
    other: 0,
  }

  // Normalize skills and count industry matches
  skills.forEach((skillObj) => {
    // Handle if skill is an object with a skill property
    const skillName = typeof skillObj === "string" ? skillObj : (skillObj as any).skill || ""

    // Normalize skill name
    const normalizedSkill = skillName.toLowerCase().trim()

    // Check for exact matches
    if (skillToIndustryMap[normalizedSkill]) {
      industryCounts[skillToIndustryMap[normalizedSkill]]++
      return
    }

    // Check for partial matches
    for (const [key, industry] of Object.entries(skillToIndustryMap)) {
      if (normalizedSkill.includes(key) || key.includes(normalizedSkill)) {
        industryCounts[industry]++
        return
      }
    }

    // If no match found, increment "other"
    industryCounts.other++
  })

  // Find the industry with the highest count
  let maxCount = 0
  let detectedIndustry: Industry = "other"

  for (const [industry, count] of Object.entries(industryCounts)) {
    if (count > maxCount) {
      maxCount = count
      detectedIndustry = industry as Industry
    }
  }

  return detectedIndustry
}

/**
 * Get a list of relevant expert sources for a specific industry
 */
export function getExpertSourcesForIndustry(industry: Industry): string[] {
  switch (industry) {
    case "technology":
      return ["stackoverflow", "github", "mdn", "arxiv"]
    case "marketing":
      return ["hubspot", "moz", "marketingprofs", "thinkwithgoogle"]
    case "finance":
      return ["bloomberg", "morningstar", "wsj", "investopedia"]
    case "healthcare":
      return ["pubmed", "cdc", "who", "nejm"]
    case "education":
      return ["edutopia", "chronicle", "educause", "edweek"]
    case "design":
      return ["dribbble", "behance", "nielsen", "ixda"]
    case "legal":
      return ["westlaw", "lexisnexis", "americanbar", "justia"]
    case "hr":
      return ["shrm", "hrbartender", "hrexecutive", "workology"]
    case "sales":
      return ["salesforce", "hubspot", "saleshacker", "closeriq"]
    case "manufacturing":
      return ["industryweek", "asq", "isixsigma", "manufacturingnet"]
    default:
      return ["general"]
  }
}

/**
 * Get a description of expert sources for a specific industry
 */
export function getExpertSourceDescription(source: string): { name: string; description: string; icon: string } {
  const sources: Record<string, { name: string; description: string; icon: string }> = {
    // Technology sources
    stackoverflow: {
      name: "Stack Overflow",
      description:
        "Questions incorporate insights from highly-upvoted discussions and accepted answers from the world's largest developer community.",
      icon: "blue",
    },
    github: {
      name: "GitHub",
      description:
        "Best practices derived from popular repositories, industry-standard libraries, and open-source projects with high star ratings.",
      icon: "purple",
    },
    mdn: {
      name: "MDN Web Docs",
      description: "Authoritative web development standards and practices from Mozilla's comprehensive documentation.",
      icon: "orange",
    },
    arxiv: {
      name: "ArXiv",
      description:
        "Advanced concepts from academic research papers in computer science, machine learning, and related fields.",
      icon: "green",
    },

    // Marketing sources
    hubspot: {
      name: "HubSpot",
      description:
        "Industry-leading inbound marketing expertise and best practices from HubSpot's extensive resources.",
      icon: "orange",
    },
    moz: {
      name: "Moz",
      description: "SEO and digital marketing insights from one of the most respected authorities in the field.",
      icon: "blue",
    },
    marketingprofs: {
      name: "MarketingProfs",
      description: "Marketing strategies and tactics from a community of marketing professionals and thought leaders.",
      icon: "purple",
    },
    thinkwithgoogle: {
      name: "Think with Google",
      description: "Data-driven marketing insights and consumer trends from Google's research and analytics.",
      icon: "red",
    },

    // Finance sources
    bloomberg: {
      name: "Bloomberg",
      description:
        "Financial data, news, and analysis from one of the world's leading financial information providers.",
      icon: "black",
    },
    morningstar: {
      name: "Morningstar",
      description: "Investment research, ratings, and financial analysis from independent experts.",
      icon: "yellow",
    },
    wsj: {
      name: "Wall Street Journal",
      description: "Business and financial news, analysis, and insights from the leading business publication.",
      icon: "blue",
    },
    investopedia: {
      name: "Investopedia",
      description: "Comprehensive financial education and reference materials for investors and finance professionals.",
      icon: "green",
    },

    // Healthcare sources
    pubmed: {
      name: "PubMed",
      description: "Peer-reviewed medical research and clinical studies from the National Library of Medicine.",
      icon: "blue",
    },
    cdc: {
      name: "CDC",
      description: "Healthcare guidelines and best practices from the Centers for Disease Control and Prevention.",
      icon: "green",
    },
    who: {
      name: "WHO",
      description: "Global health standards and recommendations from the World Health Organization.",
      icon: "blue",
    },
    nejm: {
      name: "New England Journal of Medicine",
      description: "Leading peer-reviewed medical journal featuring the latest research and clinical practice.",
      icon: "red",
    },

    // Design sources
    dribbble: {
      name: "Dribbble",
      description: "Design trends and inspiration from a community of leading designers and creative professionals.",
      icon: "pink",
    },
    behance: {
      name: "Behance",
      description: "Showcase of creative work and design portfolios from professionals worldwide.",
      icon: "blue",
    },
    nielsen: {
      name: "Nielsen Norman Group",
      description: "User experience research and guidelines from world-renowned UX experts.",
      icon: "gray",
    },
    ixda: {
      name: "Interaction Design Association",
      description: "Best practices in interaction design from a global community of design professionals.",
      icon: "purple",
    },

    // Default
    general: {
      name: "Industry Experts",
      description: "Consensus from recognized authorities and practitioners in the field.",
      icon: "gray",
    },
  }

  return sources[source] || sources["general"]
}
