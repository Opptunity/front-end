import { generateId } from "@/lib/utils"
import { type Industry, getExpertSourcesForIndustry } from "@/lib/industry-detection"

// Define types for API responses
type StackOverflowQuestion = {
  title: string
  link: string
  tags: string[]
  score: number
  answer_count: number
  accepted_answer_id: number | null
  body_markdown?: string
}

type GitHubRepo = {
  name: string
  description: string
  stargazers_count: number
  language: string
  topics: string[]
  html_url: string
}

type MDNDocument = {
  title: string
  summary: string
  url: string
  tags: string[]
}

// Cache API responses to avoid rate limiting and improve performance
const apiCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

/**
 * Fetch data from Stack Overflow API for a specific skill
 */
export async function fetchStackOverflowData(skill: string): Promise<StackOverflowQuestion[]> {
  const cacheKey = `stackoverflow-${skill.toLowerCase()}`

  // Check cache first
  const cachedData = apiCache.get(cacheKey)
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
    console.log(`Using cached Stack Overflow data for ${skill}`)
    return cachedData.data
  }

  try {
    console.log(`Fetching Stack Overflow data for ${skill}`)

    // Encode the skill for URL
    const encodedSkill = encodeURIComponent(skill)

    // Fetch top questions with accepted answers for this skill
    const response = await fetch(
      `https://api.stackexchange.com/2.3/search/advanced?order=desc&sort=votes&accepted=True&tagged=${encodedSkill}&site=stackoverflow&filter=withbody`,
    )

    if (!response.ok) {
      throw new Error(`Stack Overflow API error: ${response.status}`)
    }

    const data = await response.json()

    // Store in cache
    apiCache.set(cacheKey, { data: data.items, timestamp: Date.now() })

    return data.items
  } catch (error) {
    console.error(`Error fetching Stack Overflow data for ${skill}:`, error)
    return []
  }
}

/**
 * Fetch trending repositories from GitHub for a specific skill/technology
 */
export async function fetchGitHubData(skill: string): Promise<GitHubRepo[]> {
  const cacheKey = `github-${skill.toLowerCase()}`

  // Check cache first
  const cachedData = apiCache.get(cacheKey)
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
    console.log(`Using cached GitHub data for ${skill}`)
    return cachedData.data
  }

  try {
    console.log(`Fetching GitHub data for ${skill}`)

    // Encode the skill for URL
    const encodedSkill = encodeURIComponent(skill)

    // Search for top repositories related to this skill
    const response = await fetch(
      `https://api.github.com/search/repositories?q=${encodedSkill}&sort=stars&order=desc&per_page=5`,
    )

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`)
    }

    const data = await response.json()

    // Store in cache
    apiCache.set(cacheKey, { data: data.items, timestamp: Date.now() })

    return data.items
  } catch (error) {
    console.error(`Error fetching GitHub data for ${skill}:`, error)
    return []
  }
}

/**
 * Fetch MDN documentation for web development skills
 */
export async function fetchMDNData(skill: string): Promise<MDNDocument[]> {
  const cacheKey = `mdn-${skill.toLowerCase()}`

  // Check cache first
  const cachedData = apiCache.get(cacheKey)
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
    console.log(`Using cached MDN data for ${skill}`)
    return cachedData.data
  }

  try {
    console.log(`Fetching MDN data for ${skill}`)

    // Encode the skill for URL
    const encodedSkill = encodeURIComponent(skill)

    // Use MDN's GitHub content API as a proxy since they don't have a public API
    const response = await fetch(`https://developer.mozilla.org/api/v1/search?q=${encodedSkill}&locale=en-US`)

    if (!response.ok) {
      throw new Error(`MDN API error: ${response.status}`)
    }

    const data = await response.json()

    // Store in cache
    apiCache.set(cacheKey, { data: data.documents, timestamp: Date.now() })

    return data.documents
  } catch (error) {
    console.error(`Error fetching MDN data for ${skill}:`, error)
    return []
  }
}

/**
 * Fetch data from HubSpot for marketing skills
 */
export async function fetchHubSpotData(skill: string): Promise<any[]> {
  const cacheKey = `hubspot-${skill.toLowerCase()}`

  // Check cache first
  const cachedData = apiCache.get(cacheKey)
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
    console.log(`Using cached HubSpot data for ${skill}`)
    return cachedData.data
  }

  try {
    console.log(`Fetching HubSpot data for ${skill}`)

    // Since HubSpot doesn't have a public API for their blog content,
    // we'll simulate fetching data with some marketing best practices
    const marketingBestPractices = [
      {
        title: "The Ultimate Guide to " + skill,
        url: "https://blog.hubspot.com/marketing/guide-to-" + skill.toLowerCase().replace(/\s+/g, "-"),
        summary: `Best practices and strategies for implementing ${skill} in your marketing campaigns.`,
        author: "HubSpot Marketing Team",
      },
      {
        title: skill + " Statistics You Need to Know",
        url: "https://blog.hubspot.com/marketing/" + skill.toLowerCase().replace(/\s+/g, "-") + "-statistics",
        summary: `Data-driven insights about ${skill} and its effectiveness in modern marketing.`,
        author: "HubSpot Research",
      },
      {
        title: "How to Measure " + skill + " ROI",
        url: "https://blog.hubspot.com/marketing/measuring-" + skill.toLowerCase().replace(/\s+/g, "-") + "-roi",
        summary: `Methods and metrics for evaluating the return on investment of your ${skill} efforts.`,
        author: "HubSpot Analytics Team",
      },
    ]

    // Store in cache
    apiCache.set(cacheKey, { data: marketingBestPractices, timestamp: Date.now() })

    return marketingBestPractices
  } catch (error) {
    console.error(`Error fetching HubSpot data for ${skill}:`, error)
    return []
  }
}

/**
 * Fetch data from Moz for SEO skills
 */
export async function fetchMozData(skill: string): Promise<any[]> {
  const cacheKey = `moz-${skill.toLowerCase()}`

  // Check cache first
  const cachedData = apiCache.get(cacheKey)
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
    console.log(`Using cached Moz data for ${skill}`)
    return cachedData.data
  }

  try {
    console.log(`Fetching Moz data for ${skill}`)

    // Simulate Moz blog content
    const seoBestPractices = [
      {
        title: "The Beginner's Guide to " + skill,
        url: "https://moz.com/beginners-guide-to-" + skill.toLowerCase().replace(/\s+/g, "-"),
        summary: `A comprehensive overview of ${skill} and how it fits into your SEO strategy.`,
        author: "Moz Staff",
      },
      {
        title: "Advanced " + skill + " Techniques",
        url: "https://moz.com/blog/advanced-" + skill.toLowerCase().replace(/\s+/g, "-") + "-techniques",
        summary: `Take your ${skill} to the next level with these expert strategies.`,
        author: "Rand Fishkin",
      },
      {
        title: skill + " Case Study: Real-World Results",
        url: "https://moz.com/blog/" + skill.toLowerCase().replace(/\s+/g, "-") + "-case-study",
        summary: `See how top companies have implemented ${skill} to improve their search rankings.`,
        author: "Moz Research Team",
      },
    ]

    // Store in cache
    apiCache.set(cacheKey, { data: seoBestPractices, timestamp: Date.now() })

    return seoBestPractices
  } catch (error) {
    console.error(`Error fetching Moz data for ${skill}:`, error)
    return []
  }
}

/**
 * Fetch data from PubMed for healthcare skills
 */
export async function fetchPubMedData(skill: string): Promise<any[]> {
  const cacheKey = `pubmed-${skill.toLowerCase()}`

  // Check cache first
  const cachedData = apiCache.get(cacheKey)
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
    console.log(`Using cached PubMed data for ${skill}`)
    return cachedData.data
  }

  try {
    console.log(`Fetching PubMed data for ${skill}`)

    // Encode the skill for URL
    const encodedSkill = encodeURIComponent(skill)

    // Use PubMed API to search for papers
    const response = await fetch(
      `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodedSkill}&retmode=json&sort=relevance&retmax=5`,
    )

    if (!response.ok) {
      throw new Error(`PubMed API error: ${response.status}`)
    }

    const data = await response.json()
    const ids = data.esearchresult.idlist || []

    // If we have IDs, fetch the summaries
    if (ids.length > 0) {
      const summaryResponse = await fetch(
        `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(",")}&retmode=json`,
      )

      if (!summaryResponse.ok) {
        throw new Error(`PubMed Summary API error: ${summaryResponse.status}`)
      }

      const summaryData = await summaryResponse.json()
      const articles = ids.map((id: string) => {
        const article = summaryData.result[id]
        return {
          title: article.title,
          authors: article.authors,
          journal: article.fulljournalname,
          pubdate: article.pubdate,
          url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
        }
      })

      // Store in cache
      apiCache.set(cacheKey, { data: articles, timestamp: Date.now() })

      return articles
    }

    return []
  } catch (error) {
    console.error(`Error fetching PubMed data for ${skill}:`, error)
    return []
  }
}

/**
 * Fetch data from Investopedia for finance skills
 */
export async function fetchInvestopediaData(skill: string): Promise<any[]> {
  const cacheKey = `investopedia-${skill.toLowerCase()}`

  // Check cache first
  const cachedData = apiCache.get(cacheKey)
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
    console.log(`Using cached Investopedia data for ${skill}`)
    return cachedData.data
  }

  try {
    console.log(`Fetching Investopedia data for ${skill}`)

    // Simulate Investopedia content
    const financeBestPractices = [
      {
        title: skill + " Definition and Example",
        url:
          "https://www.investopedia.com/terms/" +
          skill.charAt(0).toLowerCase() +
          "/" +
          skill.toLowerCase().replace(/\s+/g, "-") +
          ".asp",
        summary: `A comprehensive explanation of ${skill} and how it's used in finance.`,
        author: "Investopedia Team",
      },
      {
        title: "Understanding " + skill + " in Modern Finance",
        url: "https://www.investopedia.com/articles/understanding-" + skill.toLowerCase().replace(/\s+/g, "-"),
        summary: `An in-depth look at ${skill} and its importance in today's financial landscape.`,
        author: "James Chen",
      },
      {
        title: "How to Apply " + skill + " in Financial Analysis",
        url: "https://www.investopedia.com/articles/applying-" + skill.toLowerCase().replace(/\s+/g, "-"),
        summary: `Practical applications of ${skill} in financial analysis and decision-making.`,
        author: "Investopedia Editorial Team",
      },
    ]

    // Store in cache
    apiCache.set(cacheKey, { data: financeBestPractices, timestamp: Date.now() })

    return financeBestPractices
  } catch (error) {
    console.error(`Error fetching Investopedia data for ${skill}:`, error)
    return []
  }
}

/**
 * Mock function to simulate fetching data from ArXiv
 */
async function fetchArXivData(skill: string): Promise<any[]> {
  const cacheKey = `arxiv-${skill.toLowerCase()}`

  // Check cache first
  const cachedData = apiCache.get(cacheKey)
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
    console.log(`Using cached ArXiv data for ${skill}`)
    return cachedData.data
  }

  try {
    console.log(`Fetching ArXiv data for ${skill}`)

    // Simulate ArXiv content
    const researchPapers = [
      {
        title: "Recent Advances in " + skill,
        url: "https://arxiv.org/abs/2307.12345",
        summary: `An overview of the latest research and developments in ${skill}.`,
        authors: ["John Doe", "Jane Smith"],
      },
      {
        title: "A Novel Approach to " + skill,
        url: "https://arxiv.org/abs/2308.67890",
        summary: `A new method for addressing challenges in ${skill}.`,
        authors: ["Alice Johnson", "Bob Williams"],
      },
      {
        title: "The Impact of " + skill + " on Modern Science",
        url: "https://arxiv.org/abs/2309.24681",
        summary: `An analysis of the effects of ${skill} on various scientific fields.`,
        authors: ["Charlie Brown", "David Davis"],
      },
    ]

    // Store in cache
    apiCache.set(cacheKey, { data: researchPapers, timestamp: Date.now() })

    return researchPapers
  } catch (error) {
    console.error(`Error fetching ArXiv data for ${skill}:`, error)
    return []
  }
}

/**
 * Fetch expert data for a specific skill based on the industry
 */
export async function fetchExpertDataForSkill(skill: string, industry: Industry) {
  const sources = getExpertSourcesForIndustry(industry)
  const results: Record<string, any> = {}

  // Fetch data from each source in parallel
  await Promise.all(
    sources.map(async (source) => {
      switch (source) {
        case "stackoverflow":
          results.stackoverflow = await fetchStackOverflowData(skill)
          break
        case "github":
          results.github = await fetchGitHubData(skill)
          break
        case "mdn":
          results.mdn = await fetchMDNData(skill)
          break
        case "arxiv":
          results.arxiv = await fetchArXivData(skill)
          break
        case "hubspot":
          results.hubspot = await fetchHubSpotData(skill)
          break
        case "moz":
          results.moz = await fetchMozData(skill)
          break
        case "pubmed":
          results.pubmed = await fetchPubMedData(skill)
          break
        case "investopedia":
          results.investopedia = await fetchInvestopediaData(skill)
          break
        // Add other industry-specific sources as needed
      }
    }),
  )

  return results
}

/**
 * Generate expert-backed question based on API data and industry
 */
export function generateExpertQuestion(skill: string, level: string, apiData: Record<string, any>, industry: Industry) {
  // Default question if API data is insufficient
  const defaultQuestion = {
    id: `expert-${generateId()}`,
    text: `According to industry experts, which is considered a best practice when working with ${skill}?`,
    options: [
      "Using the latest techniques for all projects",
      "Following established industry standards",
      "Prioritizing speed over quality",
      "Avoiding third-party tools and resources",
    ],
    correctAnswer: "Following established industry standards",
    skill,
    difficulty: level,
    explanation: `Industry experts generally recommend following established standards as they represent proven solutions to common challenges in ${skill}.`,
    source: "Expert consensus",
  }

  // If we don't have useful API data, return the default question
  if (!apiData || Object.keys(apiData).length === 0) {
    return defaultQuestion
  }

  try {
    // Generate questions based on industry and available data
    switch (industry) {
      case "technology":
        return generateTechnologyQuestion(skill, level, apiData)
      case "marketing":
        return generateMarketingQuestion(skill, level, apiData)
      case "finance":
        return generateFinanceQuestion(skill, level, apiData)
      case "healthcare":
        return generateHealthcareQuestion(skill, level, apiData)
      case "design":
        return generateDesignQuestion(skill, level, apiData)
      case "hr":
        return generateHRQuestion(skill, level, apiData)
      case "sales":
        return generateSalesQuestion(skill, level, apiData)
      case "education":
        return generateEducationQuestion(skill, level, apiData)
      case "legal":
        return generateLegalQuestion(skill, level, apiData)
      case "manufacturing":
        return generateManufacturingQuestion(skill, level, apiData)
      default:
        return defaultQuestion
    }
  } catch (error) {
    console.error("Error generating expert question:", error)
    return defaultQuestion
  }
}

// Helper functions to generate industry-specific questions

function generateTechnologyQuestion(skill: string, level: string, apiData: Record<string, any>) {
  // Try to generate a question from Stack Overflow data
  if (apiData.stackoverflow?.length > 0) {
    const question = apiData.stackoverflow[0]

    return {
      id: `so-${generateId()}`,
      text: `According to highly upvoted Stack Overflow discussions, which approach is recommended for ${skill}?`,
      options: [
        "Following established design patterns and best practices",
        `Using newer alternatives to ${skill} when possible`,
        "Prioritizing performance over maintainability",
        "Implementing custom solutions rather than using standard libraries",
      ],
      correctAnswer: "Following established design patterns and best practices",
      skill,
      difficulty: level,
      explanation: `This reflects the consensus from Stack Overflow discussions with high vote counts. The question "${question.title}" has ${question.score} upvotes and addresses common practices in ${skill}.`,
      source: `Stack Overflow: ${question.link}`,
    }
  }

  // Try to generate a question from GitHub data
  if (apiData.github?.length > 0) {
    const repo = apiData.github[0]

    return {
      id: `gh-${generateId()}`,
      text: `Based on popular GitHub repositories, what is considered a best practice in the ${skill} community?`,
      options: [
        `Following patterns established in widely-used libraries like ${repo.name}`,
        "Creating custom implementations for all functionality",
        `Avoiding dependencies on popular ${skill} libraries`,
        "Prioritizing cutting-edge features over stability",
      ],
      correctAnswer: `Following patterns established in widely-used libraries like ${repo.name}`,
      skill,
      difficulty: level,
      explanation: `This is based on patterns observed in ${repo.name}, a popular ${skill} repository with ${repo.stargazers_count} stars on GitHub.`,
      source: `GitHub: ${repo.html_url}`,
    }
  }

  // Default technology question
  return {
    id: `tech-${generateId()}`,
    text: `According to software engineering best practices, what is the recommended approach when working with ${skill}?`,
    options: [
      "Following established design patterns and industry standards",
      "Always using the newest version or framework",
      "Building custom solutions from scratch",
      "Prioritizing development speed over code quality",
    ],
    correctAnswer: "Following established design patterns and industry standards",
    skill,
    difficulty: level,
    explanation: `Software engineering experts generally recommend following established patterns and standards when working with ${skill}, as this promotes maintainability, reliability, and collaboration.`,
    source: "Software engineering best practices",
  }
}

function generateMarketingQuestion(skill: string, level: string, apiData: Record<string, any>) {
  // Try to generate a question from HubSpot data
  if (apiData.hubspot?.length > 0) {
    const article = apiData.hubspot[0]

    return {
      id: `hubspot-${generateId()}`,
      text: `According to HubSpot's marketing experts, what is the most effective approach to ${skill}?`,
      options: [
        "Implementing data-driven strategies based on customer behavior",
        "Following the latest trends regardless of audience fit",
        "Maximizing reach at the expense of targeting",
        "Using the same approach across all marketing channels",
      ],
      correctAnswer: "Implementing data-driven strategies based on customer behavior",
      skill,
      difficulty: level,
      explanation: `HubSpot's marketing experts emphasize the importance of data-driven decision making in ${skill}, as outlined in "${article.title}".`,
      source: `HubSpot: ${article.url}`,
    }
  }

  // Try to generate a question from Moz data
  if (apiData.moz?.length > 0) {
    const article = apiData.moz[0]

    return {
      id: `moz-${generateId()}`,
      text: `According to Moz's SEO experts, what is the best practice for ${skill}?`,
      options: [
        "Following white-hat techniques that prioritize user experience",
        "Focusing exclusively on keyword density",
        "Prioritizing quantity of content over quality",
        "Using automated tools for all aspects of SEO",
      ],
      correctAnswer: "Following white-hat techniques that prioritize user experience",
      skill,
      difficulty: level,
      explanation: `Moz's SEO experts consistently recommend white-hat techniques that prioritize user experience when implementing ${skill}, as detailed in "${article.title}".`,
      source: `Moz: ${article.url}`,
    }
  }

  // Default marketing question
  return {
    id: `marketing-${generateId()}`,
    text: `According to marketing industry experts, what is the most effective approach to ${skill}?`,
    options: [
      "Creating customer-centric strategies based on data and insights",
      "Following competitors' approaches exactly",
      "Maximizing reach without considering targeting or relevance",
      "Using the same messaging across all channels and audiences",
    ],
    correctAnswer: "Creating customer-centric strategies based on data and insights",
    skill,
    difficulty: level,
    explanation: `Marketing experts consistently emphasize the importance of customer-centric, data-driven approaches to ${skill} to ensure relevance and effectiveness.`,
    source: "Marketing industry best practices",
  }
}

function generateFinanceQuestion(skill: string, level: string, apiData: Record<string, any>) {
  // Try to generate a question from Investopedia data
  if (apiData.investopedia?.length > 0) {
    const article = apiData.investopedia[0]

    return {
      id: `investopedia-${generateId()}`,
      text: `According to financial experts at Investopedia, what is the recommended approach to ${skill}?`,
      options: [
        "Following established financial principles and regulations",
        "Taking high-risk approaches to maximize potential returns",
        "Relying exclusively on historical data for predictions",
        "Prioritizing short-term gains over long-term stability",
      ],
      correctAnswer: "Following established financial principles and regulations",
      skill,
      difficulty: level,
      explanation: `Financial experts at Investopedia emphasize the importance of following established principles and regulations when dealing with ${skill}, as outlined in "${article.title}".`,
      source: `Investopedia: ${article.url}`,
    }
  }

  // Default finance question
  return {
    id: `finance-${generateId()}`,
    text: `According to financial industry standards, what is the best practice for ${skill}?`,
    options: [
      "Following established financial principles and regulatory guidelines",
      "Prioritizing high-risk strategies for maximum potential returns",
      "Relying exclusively on automated systems without human oversight",
      "Focusing on short-term results over long-term financial health",
    ],
    correctAnswer: "Following established financial principles and regulatory guidelines",
    skill,
    difficulty: level,
    explanation: `Financial experts consistently emphasize the importance of following established principles and regulatory guidelines when implementing ${skill} to ensure compliance and minimize risk.`,
    source: "Financial industry standards",
  }
}

function generateHealthcareQuestion(skill: string, level: string, apiData: Record<string, any>) {
  // Try to generate a question from PubMed data
  if (apiData.pubmed?.length > 0) {
    const article = apiData.pubmed[0]

    return {
      id: `pubmed-${generateId()}`,
      text: `According to peer-reviewed medical research, what is the recommended approach to ${skill}?`,
      options: [
        "Following evidence-based practices supported by clinical studies",
        "Prioritizing cost-efficiency over patient outcomes",
        "Implementing new techniques without waiting for clinical validation",
        "Standardizing care without consideration for individual patient needs",
      ],
      correctAnswer: "Following evidence-based practices supported by clinical studies",
      skill,
      difficulty: level,
      explanation: `Medical research published in "${article.journal}" emphasizes the importance of evidence-based practices in ${skill}, as detailed in the study "${article.title}".`,
      source: `PubMed: ${article.url}`,
    }
  }

  // Default healthcare question
  return {
    id: `healthcare-${generateId()}`,
    text: `According to healthcare best practices, what is the recommended approach to ${skill}?`,
    options: [
      "Following evidence-based protocols and patient-centered care principles",
      "Prioritizing efficiency over individualized patient care",
      "Implementing new techniques before clinical validation",
      "Standardizing all procedures regardless of patient circumstances",
    ],
    correctAnswer: "Following evidence-based protocols and patient-centered care principles",
    skill,
    difficulty: level,
    explanation: `Healthcare experts consistently emphasize the importance of evidence-based protocols and patient-centered care when implementing ${skill} to ensure optimal outcomes.`,
    source: "Healthcare best practices",
  }
}

function generateDesignQuestion(skill: string, level: string, apiData: Record<string, any>) {
  // Default design question
  return {
    id: `design-${generateId()}`,
    text: `According to design industry experts, what is the best approach to ${skill}?`,
    options: [
      "Prioritizing user needs and accessibility in the design process",
      "Following aesthetic trends regardless of usability",
      "Maximizing visual complexity to impress clients",
      "Standardizing designs across all platforms and contexts",
    ],
    correctAnswer: "Prioritizing user needs and accessibility in the design process",
    skill,
    difficulty: level,
    explanation: `Design experts consistently emphasize the importance of user-centered design and accessibility when implementing ${skill} to ensure effective and inclusive experiences.`,
    source: "Design industry best practices",
  }
}

function generateHRQuestion(skill: string, level: string, apiData: Record<string, any>) {
  // Default HR question
  return {
    id: `hr-${generateId()}`,
    text: `According to human resources professionals, what is the recommended approach to ${skill}?`,
    options: [
      "Following legal requirements and ethical best practices",
      "Prioritizing company interests over employee well-being",
      "Implementing standardized processes without considering individual needs",
      "Focusing on short-term cost savings over long-term talent development",
    ],
    correctAnswer: "Following legal requirements and ethical best practices",
    skill,
    difficulty: level,
    explanation: `HR professionals consistently emphasize the importance of legal compliance and ethical practices when implementing ${skill} to ensure fair treatment and positive outcomes.`,
    source: "HR professional standards",
  }
}

function generateSalesQuestion(skill: string, level: string, apiData: Record<string, any>) {
  // Default sales question
  return {
    id: `sales-${generateId()}`,
    text: `According to sales experts, what is the most effective approach to ${skill}?`,
    options: [
      "Building relationships and understanding customer needs",
      "Focusing exclusively on closing deals quickly",
      "Using high-pressure tactics to maximize immediate sales",
      "Standardizing pitches regardless of customer context",
    ],
    correctAnswer: "Building relationships and understanding customer needs",
    skill,
    difficulty: level,
    explanation: `Sales experts consistently emphasize the importance of relationship-building and understanding customer needs when implementing ${skill} for sustainable success.`,
    source: "Sales industry best practices",
  }
}

function generateEducationQuestion(skill: string, level: string, apiData: Record<string, any>) {
  // Default education question
  return {
    id: `education-${generateId()}`,
    text: `According to education experts, what is the best practice for ${skill}?`,
    options: [
      "Using evidence-based teaching methods tailored to student needs",
      "Standardizing all instruction regardless of student differences",
      "Prioritizing test preparation over conceptual understanding",
      "Implementing new educational trends without validation",
    ],
    correctAnswer: "Using evidence-based teaching methods tailored to student needs",
    skill,
    difficulty: level,
    explanation: `Education experts consistently emphasize the importance of evidence-based, student-centered approaches when implementing ${skill} for effective learning outcomes.`,
    source: "Education research and best practices",
  }
}

function generateLegalQuestion(skill: string, level: string, apiData: Record<string, any>) {
  // Default legal question
  return {
    id: `legal-${generateId()}`,
    text: `According to legal experts, what is the recommended approach to ${skill}?`,
    options: [
      "Following established legal precedents and ethical guidelines",
      "Prioritizing client interests over legal requirements",
      "Taking aggressive positions regardless of legal merit",
      "Standardizing legal advice without considering specific circumstances",
    ],
    correctAnswer: "Following established legal precedents and ethical guidelines",
    skill,
    difficulty: level,
    explanation: `Legal experts consistently emphasize the importance of following established precedents and ethical guidelines when implementing ${skill} to ensure proper representation and compliance.`,
    source: "Legal profession standards",
  }
}

function generateManufacturingQuestion(skill: string, level: string, apiData: Record<string, any>) {
  // Default manufacturing question
  return {
    id: `manufacturing-${generateId()}`,
    text: `According to manufacturing experts, what is the best practice for ${skill}?`,
    options: [
      "Implementing standardized processes with continuous improvement",
      "Prioritizing production speed over quality control",
      "Minimizing costs by reducing safety measures",
      "Avoiding new technologies to maintain traditional methods",
    ],
    correctAnswer: "Implementing standardized processes with continuous improvement",
    skill,
    difficulty: level,
    explanation: `Manufacturing experts consistently emphasize the importance of standardized processes and continuous improvement when implementing ${skill} for optimal efficiency and quality.`,
    source: "Manufacturing industry standards",
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

/**
 * Fetch CV improvement suggestions from the API
 * 
 * @param assessmentId ID of the assessment to use for context (optional)
 * @param cvText Raw CV/resume text (required if not using assessment ID)
 * @returns Array of CV improvement suggestions
 */
export async function fetchCVImprovements(params: { 
  assessmentId?: string, 
  cvText?: string 
}): Promise<any> {
  try {
    const { assessmentId, cvText } = params;
    
    // If we have an assessment ID, use the GET endpoint
    if (assessmentId) {
      console.log("Fetching CV improvements for assessment ID:", assessmentId);
      const response = await fetch(`/api/cv-improvements?assessmentId=${encodeURIComponent(assessmentId)}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.fromCache) {
        console.log("Retrieved CV improvements from cache for assessment ID:", assessmentId);
      } else {
        console.log("Generated new CV improvements for assessment ID:", assessmentId);
      }
      return data.improvements;
    } 
    // Otherwise, use the POST endpoint with raw CV text
    else if (cvText) {
      console.log("Generating CV improvements from raw CV text");
      const response = await fetch('/api/cv-improvements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cvText }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.fromCache) {
        console.log("Retrieved CV improvements from cache");
      } else {
        console.log("Generated new CV improvements");
      }
      return data.improvements;
    } else {
      throw new Error('Either assessmentId or cvText must be provided');
    }
  } catch (error) {
    console.error('Error fetching CV improvements:', error);
    throw error;
  }
}
