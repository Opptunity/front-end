"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type Language = "en" | "ar"

type LanguageContextType = {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  isRTL: boolean
}

const translations = {
  en: {
    // Header
    features: "Features",
    howItWorks: "How It Works",
    pricing: "Pricing",
    faq: "FAQ",
    joinWaitlist: "Join the Waitlist",
    tryAssessment: "Try our free upskilling assessment",
    learnMore: "Learn More",

    // Hero
    heroTitle: "Empower Your Team with Next-Generation Upskilling",
    heroSubtitle: "Accelerate learning, spark innovation, and track ROI—all in one seamless platform.",

    // Dashboard
    dashboard: "Skills Dashboard",
    welcomeBack: "Welcome back, Alex! Here's your team's progress",
    teamMembers: "Team Members",
    skillsAcquired: "Skills Acquired",
    coursesCompleted: "Courses Completed",
    learningHours: "Learning Hours",
    thisMonth: "this month",
    skillsProgress: "Skills Progress",
    skillDistribution: "Skill Distribution",
    teamSkillsOverview: "Team Skills Overview",
    viewAll: "View all",
    onTrack: "On track",
    ahead: "Ahead",
    behind: "Behind",

    // Value Props
    keyFeatures: "Key Features at a Glance",
    intelligentSkillMapping: "Intelligent Skill Mapping",
    skillMappingDesc: "Discover and catalog enterprise-wide skills with structured role-based insights.",
    adaptiveAssessments: "Adaptive Assessments",
    assessmentsDesc: "Quick quizzes, coding challenges, and peer assessments that evolve with each user's progress.",
    aiMentorship: "AI Mentorship",
    aiMentorshipDesc: "Provide always-on guidance from C-level expertise, powered by a finely tuned conversational AI.",
    roiAnalytics: "ROI-Driven Analytics",
    analyticsDesc: "Track upskilling impact with comprehensive dashboards and data-backed insights.",

    // How It Works
    howItWorksTitle: "How It Works",
    step: "Step",
    createAccount: "Create Your Account",
    createAccountDesc: "Quick sign-up with SSO integration for seamless enterprise access.",
    identifySkills: "Identify Skills & Gaps",
    identifySkillsDesc: "Our AI generates a comprehensive skill map for your organization.",
    accessContent: "Access Custom Content",
    accessContentDesc: "Tailored learning pathways based on identified skill gaps.",
    engageMentor: "Engage with AI Mentorship",
    engageMentorDesc: "Get personalized guidance and feedback from our AI mentors.",
    trackGrowth: "Track Growth & ROI",
    trackGrowthDesc: "Comprehensive analytics to measure impact and return on investment.",
    previous: "Previous",
    next: "Next",

    // For Organizations
    forOrganizations: "For Organizations",
    orgDesc:
      "Transform your workforce with data-driven insights and strategic talent development aligned with your business objectives.",
    benefit1: "Comprehensive workforce skill mapping and gap analysis",
    benefit2: "Optimized company taxonomy aligned with industry standards",
    benefit3: "Data-driven insights for strategic talent development",
    benefit4: "Reduced hiring costs through internal upskilling initiatives",
    benefit5: "Improved employee retention through career growth opportunities",

    // AI Mentor
    meetMentor: "Meet Your AI Mentor",
    mentorDesc:
      "Experience personalized guidance powered by advanced AI. Ask questions, get recommendations, and accelerate your team's growth.",
    mentorGreeting:
      "👋 Hi Alex! I'm your AI mentor. I can help you with skill development, answer questions, and provide personalized guidance. What would you like to work on today?",
    mentorRecommendation: "Based on your recent progress, here are some recommended focus areas:",
    askQuestion: "Ask your AI mentor a question...",
    suggestedQuestions: "Suggested questions:",

    // Pricing
    pricingTitle: "Simple, Transparent Pricing",
    pricingSubtitle: "Choose the plan that's right for your organization's upskilling needs.",
    annualBilling: "Annual Billing",
    monthlyBilling: "Monthly Billing",
    teamPlan: "Team",
    teamDesc: "Perfect for small teams getting started with upskilling",
    businessPlan: "Business",
    businessDesc: "Ideal for growing organizations with diverse learning needs",
    enterprisePlan: "Enterprise",
    enterpriseDesc: "Custom solution for large organizations",
    perMonth: "per month",
    savePercent: "Save 15%",
    custom: "Custom",
    mostPopular: "Most Popular",
    teamMembers25: "Up to 25 team members",
    teamMembers100: "Up to 100 team members",
    teamMembersUnlimited: "Unlimited team members",
    aiSkillMapping: "AI skill mapping",
    advancedSkillMapping: "Advanced skill mapping",
    basicAnalytics: "Basic analytics",
    comprehensiveAnalytics: "Comprehensive analytics",
    customAnalytics: "Custom analytics & reporting",
    standardContent: "Standard content library",
    fullContent: "Full content library",
    customContent: "Custom content integration",
    emailSupport: "Email support",
    prioritySupport: "Priority support",
    dedicatedManager: "Dedicated account manager",
    aiMentorshipFeature: "AI mentorship",
    advancedAiMentorship: "Advanced AI mentorship",
    customLearning: "Custom learning paths",
    apiAccess: "API access",
    ssoSecurity: "SSO & advanced security",

    // FAQ
    faqTitle: "Frequently Asked Questions",
    dataProtection: "How is user data protected?",
    dataProtectionAnswer:
      "We take data security seriously. All data is encrypted both in transit and at rest using industry-standard protocols. We are GDPR compliant and offer SOC 2 compliance for enterprise customers. Your organization maintains full ownership of all data, and we provide comprehensive data export options.",
    existingLms: "What if my team doesn't have an existing LMS?",
    existingLmsAnswer:
      "Our platform works as a standalone solution, so you don't need an existing Learning Management System. We provide all the tools necessary for skill mapping, content delivery, and progress tracking in one integrated platform. If you do have an existing LMS, we offer integration options to work alongside your current systems.",
    hrIntegration: "Can I integrate with other HR systems?",
    hrIntegrationAnswer:
      "Yes, we offer robust API integrations with popular HR systems including Workday, BambooHR, SAP SuccessFactors, and more. Our team can help set up custom integrations for enterprise customers to ensure seamless data flow between systems.",
    multiLingual: "Is there support for multi-lingual content?",
    multiLingualAnswer:
      "Absolutely. Our platform supports content in over 30 languages, and our AI mentorship feature can communicate in multiple languages. We can also help translate custom content for global teams, ensuring consistent learning experiences across your organization regardless of location.",
    implementation: "How long does implementation typically take?",
    implementationAnswer:
      "For small to medium teams, you can be up and running in as little as 48 hours. Enterprise implementations with custom integrations typically take 2-4 weeks. Our customer success team provides dedicated support throughout the onboarding process to ensure a smooth transition.",

    // Misc
    technical: "Technical",
    leadership: "Leadership",
    communication: "Communication",
    other: "Other",

    // Testimonials
    trustedBy: "Trusted by Leading Organizations",
    testimonial1: {
      quote:
        "This platform helped us reduce onboarding time by 40% while ensuring new hires have the skills they need from day one.",
      author: "Sarah Johnson",
      title: "Chief Learning Officer, TechCorp",
    },
    testimonial2: {
      quote:
        "The AI mentorship feature has been a game-changer for our distributed teams. It's like having an expert coach available 24/7.",
      author: "Michael Chen",
      title: "VP of Engineering, InnovateSoft",
    },
    testimonial3: {
      quote:
        "80% of our employees completed at least one skill track in under three months. The ROI metrics helped us prove the value to leadership.",
      author: "Jessica Williams",
      title: "Director of Talent Development, GlobalFinance",
    },

    // Footer Sections
    company: "Company",
    aboutUs: "About Us",
    careers: "Careers",
    blog: "Blog",
    contact: "Contact",
    resources: "Resources",
    helpCenter: "Help Center",
    community: "Community",
    webinars: "Webinars",
    partners: "Partners",
    product: "Product",
    documentation: "Documentation",
    apiAccess: "API Access",
    legal: "Legal",
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
    compliance: "Compliance",
    security: "Security",
    newsletter: "Subscribe to our newsletter",
    emailPlaceholder: "Your email address",
    subscribe: "Subscribe",
    copyright: "© 2025 Opptunity. All rights reserved.",
    platformDescription:
      "AI-powered platform for workforce skill development, gap analysis, and strategic talent optimization.",

    // Secondary CTA
    readyTitle: "Ready to Supercharge Your Team's Skills?",
    readySubtitle:
      "Join leading organizations already leveraging our AI-powered platform to develop talent and drive innovation.",

    // Assessment
    assessmentTitle: "Free Upskilling Assessment",
    assessmentSubtitle: "Discover your team's skill gaps and get personalized recommendations",
    startAssessment: "Start Assessment",

    // Assessment form
    companyProfile: "Company Profile",
    workforceRoles: "Workforce Roles & Skills",
    futureNeeds: "Future Needs",
    resources: "Resources",
    companyProfileDesc: "Tell us about your organization (anonymous)",
    workforceRolesDesc: "Identify key roles and skill gaps",
    futureNeedsDesc: "Share your plans for the next 12 months",
    resourcesDesc: "Tell us about your available resources",
    assessmentResults: "Assessment Results",
    step: "Step",
    of: "of",
    resultsDescription: "Based on your responses, we've identified the following skill gaps and recommendations",
    previous: "Previous",
    next: "Next",
    submitAssessment: "Submit Assessment",
    startNewAssessment: "Start New Assessment",

    // Assessment form additional keys
    companyProfileLongDesc: "Tell us about your organization. This assessment is anonymous - we don't collect your company name.",
    industry: "Industry",
    selectIndustry: "Select your industry",
    companySize: "Company Size",
    selectCompanySize: "Select company size",
    strategicPriorities: "Strategic Priorities",
    selectPriorities: "Select your organization's top strategic priorities for the next 12-24 months",
    businessGrowth: "Business Growth",
    innovationProducts: "Innovation & New Products",
    operationalEfficiency: "Operational Efficiency",
    customerExperience: "Customer Experience",
    digitalTransformation: "Digital Transformation",
    talentDevelopment: "Talent Development",
    costReduction: "Cost Reduction",
    sustainability: "Sustainability",
    marketExpansion: "Market Expansion",
    regulatoryCompliance: "Regulatory Compliance",

    // Workforce Skills Form
    workforceRolesLongDesc: "Identify key roles and skill gaps in your organization",
    keyRoles: "Key Roles",
    keyRolesDesc: "Identify the roles that are most critical or challenging to fill",
    role: "Role",
    roleTitle: "Role Title",
    rolePlaceholder: "e.g., Software Engineer, Project Manager",
    businessImportance: "Business Importance",
    hiringDifficulty: "Hiring/Retention Difficulty",
    low: "Low",
    high: "High",
    easy: "Easy",
    hard: "Hard",
    addAnotherRole: "Add Another Role",
    skillGaps: "Skill Gaps",
    skillGapsDesc: "Select the skills where your organization faces the biggest gaps",
    keyCompetencies: "Key Competencies",
    keyCompetenciesDesc: "Select the competencies that are most important for your organization's success",
    
    // Skill gap options
    dataAnalysis: "Data Analysis & Reporting",
    programming: "Programming & Development",
    projectManagement: "Project Management",
    digitalMarketing: "Digital Marketing",
    cybersecurity: "Cybersecurity",
    cloudComputing: "Cloud Computing",
    aiMachineLearning: "AI & Machine Learning",
    designUX: "Design & UX",
    problemSolving: "Problem Solving",
    adaptability: "Adaptability",
    teamwork: "Teamwork & Collaboration",
    timeManagement: "Time Management",
    criticalThinking: "Critical Thinking",
    emotionalIntelligence: "Emotional Intelligence",
    
    // Key competency options
    technicalExpertise: "Technical Expertise",
    strategicThinking: "Strategic Thinking",
    innovationCreativity: "Innovation & Creativity",
    customerFocus: "Customer Focus",
    businessAcumen: "Business Acumen",
    changeManagement: "Change Management",
    crossFunctional: "Cross-Functional Collaboration",
    digitalLiteracy: "Digital Literacy",
    dataDecisionMaking: "Data-Driven Decision Making",
    agileMethodologies: "Agile Methodologies",

    // Future Needs Form
    futureNeedsLongDesc: "Share your plans for new roles and projects in the next 12 months",
    plannedRoles: "Planned New Roles",
    plannedRolesDesc: "Add any new roles you plan to hire for in the next 12 months",
    newRole: "New Role",
    newRolePlaceholder: "e.g., Data Scientist, UX Designer",
    hiringTimeline: "Hiring Timeline",
    selectTimeline: "Select timeline",
    noPlannedRoles: "No planned roles added yet",
    addPlannedRole: "Add Planned Role",
    upcomingProjects: "Upcoming Projects",
    upcomingProjectsDesc: "Briefly describe any major projects or initiatives planned for the next 12 months",
    projectsPlaceholder: "Describe your upcoming projects or initiatives...",
    upskillBarriers: "Upskilling Barriers",
    upskillBarriersDesc: "What are your biggest challenges when it comes to upskilling your workforce?",
    
    // Timeline options
    timeline0to3: "0-3 months",
    timeline4to6: "4-6 months",
    timeline7to9: "7-9 months",
    timeline10to12: "10-12 months",
    
    // Barrier options
    budgetConstraints: "Budget Constraints",
    timeLimitations: "Time Limitations",
    employeeEngagement: "Employee Engagement",
    measuringROI: "Measuring ROI",
    findingContent: "Finding Relevant Content",
    personalizingLearning: "Personalizing Learning",
    knowledgeRetention: "Knowledge Retention",
    technologyAdoption: "Technology Adoption",
    leadershipBuyIn: "Leadership Buy-in",
    identifyingSkills: "Identifying Required Skills",
    
    // Resources Form
    resourcesLongDesc: "Tell us about the resources available for training and development",
    annualTrainingBudget: "Annual Training Budget",
    selectBudgetRange: "Select budget range",
    availableTrainingTime: "Available Training Time",
    selectTimeAvailable: "Select time available",
    existingTools: "Existing HR/Learning Tools",
    existingToolsDesc: "Select the tools your organization currently uses",
    additionalNotes: "Additional Notes (Optional)",
    additionalNotesPlaceholder: "Any other information about your resources or constraints...",
    
    // Budget options
    budgetLessThan10k: "Less than $10,000",
    budget10kTo50k: "$10,000 - $50,000",
    budget50kTo100k: "$50,000 - $100,000",
    budget100kTo250k: "$100,000 - $250,000",
    budget250kTo500k: "$250,000 - $500,000",
    budget500kTo1m: "$500,000 - $1,000,000",
    budgetMoreThan1m: "More than $1,000,000",
    budgetPreferNotToSay: "Prefer not to say",
    
    // Time options
    timeLessThan1Hour: "Less than 1 hour per week",
    time1To2Hours: "1-2 hours per week",
    time3To5Hours: "3-5 hours per week",
    time6To10Hours: "6-10 hours per week",
    timeMoreThan10Hours: "More than 10 hours per week",
    timeVaries: "Varies by department/role",
    
    // Tool options
    lmsLabel: "Learning Management System (LMS)",
    hrisLabel: "HR Information System (HRIS)",
    talentManagementLabel: "Talent Management Software",
    performanceManagementLabel: "Performance Management System",
    eLearningLabel: "E-Learning Platforms",
    skillsAssessmentLabel: "Skills Assessment Tools",
    mentoringLabel: "Mentoring/Coaching Software",
    contentLibraryLabel: "Learning Content Library",
    noToolsLabel: "No formal tools in place",

    // Industries
    industryTechnology: "Technology",
    industryHealthcare: "Healthcare",
    industryFinance: "Finance",
    industryManufacturing: "Manufacturing",
    industryRetail: "Retail",
    industryEducation: "Education",
    industryGovernment: "Government",
    industryNonProfit: "Non-profit",
    industryProfessionalServices: "Professional Services",
    industryConstruction: "Construction",
    industryEnergy: "Energy",
    industryTransportation: "Transportation",
    industryHospitality: "Hospitality",
    industryMediaEntertainment: "Media & Entertainment",
    industryOther: "Other",
    
    // Company Sizes
    companySize1to10: "1-10 employees",
    companySize11to50: "11-50 employees",
    companySize51to200: "51-200 employees",
    companySize201to500: "201-500 employees",
    companySize501to1000: "501-1000 employees",
    companySize1001to5000: "1001-5000 employees",
    companySizeOver5000: "5001+ employees",

    // Pricing cards
    perUserPerMonth: "per user / month",
    teamFeatures: "Team features",
    businessFeatures: "Business features",
    enterpriseFeatures: "Enterprise features",
    includedFeatures: "Included features",
    usersIncluded: "users included",

    // AI Agents
    aiAgentTitle: "AI Learning Assistant",
    aiAgentDescription: "Get personalized learning recommendations, skill assessments, and educational content from our AI learning assistant.",
    careerAIAgentTitle: "Career AI Agent",
    careerAIAgentDescription: "Get personalized career advice, job search strategies, and professional development guidance from our AI career agent.",
  },
  ar: {
    // Header
    features: "المميزات",
    howItWorks: "آلية العمل",
    pricing: "الباقات والأسعار",
    faq: "الأسئلة الشائعة",
    joinWaitlist: "انضم لقائمة الانتظار",
    tryAssessment: "جرب تقييم تطوير المهارات المجاني",
    learnMore: "اكتشف المزيد",

    // Hero
    heroTitle: "ارتقِ بفريقك من خلال منصة تطوير المهارات المتقدمة",
    heroSubtitle: "سرّع عملية التعلم، وحفز الابتكار، وتتبع العائد على الاستثمار—كل ذلك في منصة متكاملة سلسة.",

    // Dashboard
    dashboard: "لوحة المهارات",
    welcomeBack: "أهلاً بعودتك، أليكس! إليك تقدم فريقك",
    teamMembers: "أعضاء الفريق",
    skillsAcquired: "المهارات المكتسبة",
    coursesCompleted: "الدورات المنجزة",
    learningHours: "ساعات التعلم",
    thisMonth: "هذا الشهر",
    skillsProgress: "تقدم المهارات",
    skillDistribution: "توزيع المهارات",
    teamSkillsOverview: "نظرة عامة على مهارات الفريق",
    viewAll: "عرض الكل",
    onTrack: "حسب الخطة",
    ahead: "متقدم",
    behind: "متأخر",

    // Value Props
    keyFeatures: "الميزات الرئيسية في لمحة",
    intelligentSkillMapping: "رسم خرائط المهارات الذكية",
    skillMappingDesc: "اكتشف وصنّف المهارات على مستوى المؤسسة بنظرة شاملة مبنية على الأدوار الوظيفية.",
    adaptiveAssessments: "تقييمات تكيفية",
    assessmentsDesc: "اختبارات سريعة، وتحديات برمجية، وتقييمات الأقران التي تتطور مع تقدم كل مستخدم.",
    aiMentorship: "إرشاد بالذكاء الاصطناعي",
    aiMentorshipDesc: "توفير توجيه مستمر بخبرة تنفيذية عالية، مدعوم بذكاء اصطناعي محادثة متطور.",
    roiAnalytics: "تحليلات العائد على الاستثمار",
    analyticsDesc: "تتبع تأثير تطوير المهارات من خلال لوحات معلومات شاملة ورؤى مدعومة بالبيانات.",

    // How It Works
    howItWorksTitle: "آلية العمل",
    step: "الخطوة",
    createAccount: "إنشاء حسابك",
    createAccountDesc: "تسجيل سريع مع تكامل تسجيل الدخول الموحد للوصول السلس للمؤسسات.",
    identifySkills: "تحديد المهارات والفجوات",
    identifySkillsDesc: "يقوم الذكاء الاصطناعي لدينا بإنشاء خريطة شاملة للمهارات في مؤسستك.",
    accessContent: "الوصول إلى المحتوى المخصص",
    accessContentDesc: "مسارات تعليمية مخصصة بناءً على فجوات المهارات المحددة.",
    engageMentor: "التفاعل مع المرشد الذكي",
    engageMentorDesc: "احصل على إرشادات وملاحظات شخصية من مرشدينا المدعومين بالذكاء الاصطناعي.",
    trackGrowth: "تتبع النمو والعائد",
    trackGrowthDesc: "تحليلات شاملة لقياس التأثير والعائد على الاستثمار.",
    previous: "السابق",
    next: "التالي",

    // For Organizations
    forOrganizations: "للمؤسسات",
    orgDesc: "حوّل القوى العاملة لديك من خلال رؤى مدعومة بالبيانات وتطوير المواهب استراتيجياً بما يتماشى مع أهداف عملك.",
    benefit1: "رسم خرائط شامل لمهارات القوى العاملة وتحليل الفجوات",
    benefit2: "تصنيف مؤسسي محسّن متوافق مع معايير الصناعة",
    benefit3: "رؤى مدعومة بالبيانات لتطوير المواهب استراتيجياً",
    benefit4: "تقليل تكاليف التوظيف من خلال مبادرات تطوير المهارات الداخلية",
    benefit5: "تحسين الاحتفاظ بالموظفين من خلال فرص النمو المهني",

    // AI Mentor
    meetMentor: "تعرّف على مرشدك الذكي",
    mentorDesc:
      "استفد من التوجيه الشخصي المدعوم بالذكاء الاصطناعي المتقدم. اطرح الأسئلة، واحصل على توصيات، وسرّع نمو فريقك.",
    mentorGreeting:
      "👋 مرحباً أليكس! أنا مرشدك الذكي. يمكنني مساعدتك في تطوير المهارات، والإجابة على استفساراتك، وتقديم توجيهات مخصصة. ما الذي ترغب في العمل عليه اليوم؟",
    mentorRecommendation: "بناءً على تقدمك الأخير، إليك بعض مجالات التركيز الموصى بها:",
    askQuestion: "اسأل مرشدك الذكي سؤالاً...",
    suggestedQuestions: "أسئلة مقترحة:",

    // Pricing
    pricingTitle: "أسعار واضحة وبسيطة",
    pricingSubtitle: "اختر الباقة المناسبة لاحتياجات تطوير مهارات مؤسستك.",
    annualBilling: "فوترة سنوية",
    monthlyBilling: "فوترة شهرية",
    teamPlan: "فريق",
    teamDesc: "مثالي للفرق الصغيرة التي تبدأ رحلة تطوير المهارات",
    businessPlan: "أعمال",
    businessDesc: "مثالي للمؤسسات النامية ذات احتياجات التعلم المتنوعة",
    enterprisePlan: "مؤسسات كبرى",
    enterpriseDesc: "حلول مخصصة للمؤسسات الكبيرة",
    perMonth: "شهرياً",
    savePercent: "وفر 15%",
    custom: "سعر خاص",
    mostPopular: "الأكثر طلباً",
    teamMembers25: "حتى 25 عضو فريق",
    teamMembers100: "حتى 100 عضو فريق",
    teamMembersUnlimited: "عدد غير محدود من أعضاء الفريق",
    aiSkillMapping: "رسم خرائط المهارات بالذكاء الاصطناعي",
    advancedSkillMapping: "رسم خرائط المهارات المتقدم",
    basicAnalytics: "تحليلات أساسية",
    comprehensiveAnalytics: "تحليلات شاملة",
    customAnalytics: "تحليلات وتقارير مخصصة",
    standardContent: "مكتبة محتوى قياسية",
    fullContent: "مكتبة محتوى كاملة",
    customContent: "تكامل محتوى مخصص",
    emailSupport: "دعم عبر البريد الإلكتروني",
    prioritySupport: "دعم ذو أولوية",
    dedicatedManager: "مدير حساب مخصص",
    aiMentorshipFeature: "إرشاد بالذكاء الاصطناعي",
    advancedAiMentorship: "إرشاد متقدم بالذكاء الاصطناعي",
    customLearning: "مسارات تعلم مخصصة",
    apiAccess: "وصول إلى واجهة برمجة التطبيقات",
    ssoSecurity: "تسجيل دخول موحد وأمان متقدم",

    // FAQ
    faqTitle: "الأسئلة المتداولة",
    dataProtection: "كيف يتم حماية بيانات المستخدم؟",
    dataProtectionAnswer:
      "نحن نأخذ أمن البيانات على محمل الجد. جميع البيانات مشفرة أثناء النقل والتخزين باستخدام بروتوكولات قياسية في الصناعة. نحن ملتزمون بمعايير GDPR ونقدم امتثال SOC 2 لعملاء المؤسسات. تحتفظ مؤسستك بملكية كاملة لجميع البيانات، ونوفر خيارات شاملة لتصدير البيانات.",
    existingLms: "ماذا لو لم يكن لدى فريقي نظام إدارة تعلم حالي؟",
    existingLmsAnswer:
      "تعمل منصتنا كحل مستقل، لذا لا تحتاج إلى نظام إدارة تعلم موجود مسبقاً. نوفر جميع الأدوات اللازمة لرسم خرائط المهارات وتقديم المحتوى وتتبع التقدم في منصة متكاملة واحدة. إذا كان لديك نظام إدارة تعلم حالي، فإننا نقدم خيارات تكامل للعمل جنباً إلى جنب مع أنظمتك الحالية.",
    hrIntegration: "هل يمكنني التكامل مع أنظمة الموارد البشرية الأخرى؟",
    hrIntegrationAnswer:
      "نعم، نقدم تكاملات قوية لواجهة برمجة التطبيقات مع أنظمة الموارد البشرية الشائعة بما في ذلك Workday وBambooHR وSAP SuccessFactors والمزيد. يمكن لفريقنا المساعدة في إعداد تكاملات مخصصة لعملاء المؤسسات لضمان تدفق البيانات بسلاسة بين الأنظمة.",
    multiLingual: "هل هناك دعم للمحتوى متعدد اللغات؟",
    multiLingualAnswer:
      "بالتأكيد. تدعم منصتنا المحتوى بأكثر من 30 لغة، ويمكن لميزة الإرشاد بالذكاء الاصطناعي التواصل بلغات متعددة. يمكننا أيضاً المساعدة في ترجمة المحتوى المخصص للفرق العالمية، مما يضمن تجارب تعليمية متسقة عبر مؤسستك بغض النظر عن الموقع.",
    implementation: "كم من الوقت تستغرق عملية التنفيذ عادةً؟",
    implementationAnswer:
      "بالنسبة للفرق الصغيرة والمتوسطة، يمكنك البدء في العمل في غضون 48 ساعة فقط. عادةً ما تستغرق تنفيذات المؤسسات ذات التكاملات المخصصة من 2 إلى 4 أسابيع. يقدم فريق نجاح العملاء لدينا دعماً مخصصاً طوال عملية التأهيل لضمان انتقال سلس.",

    // Misc
    technical: "تقنية",
    leadership: "قيادية",
    communication: "تواصل",
    other: "أخرى",

    // Testimonials
    trustedBy: "موثوق به من قبل المؤسسات الرائدة",
    testimonial1: {
      quote:
        "ساعدتنا هذه المنصة على تقليل وقت التأهيل بنسبة 40% مع ضمان امتلاك الموظفين الجدد للمهارات التي يحتاجونها منذ اليوم الأول.",
      author: "سارة جونسون",
      title: "مديرة التعلم، تيك كورب",
    },
    testimonial2: {
      quote:
        "كانت ميزة الإرشاد بالذكاء الاصطناعي نقلة نوعية لفرقنا الموزعة. إنها مثل وجود مدرب خبير متاح على مدار الساعة.",
      author: "مايكل تشن",
      title: "نائب رئيس الهندسة، إنوفيت سوفت",
    },
    testimonial3: {
      quote:
        "أكمل 80% من موظفينا مسار مهارة واحد على الأقل في أقل من ثلاثة أشهر. ساعدتنا مقاييس العائد على الاستثمار في إثبات القيمة للإدارة العليا.",
      author: "جيسيكا ويليامز",
      title: "مديرة تطوير المواهب، جلوبال فاينانس",
    },

    // Footer Sections
    company: "الشركة",
    aboutUs: "من نحن",
    careers: "الوظائف",
    blog: "المدونة",
    contact: "اتصل بنا",
    resources: "المصادر",
    helpCenter: "مركز المساعدة",
    community: "مجتمع المستخدمين",
    webinars: "الندوات عبر الإنترنت",
    partners: "الشركاء",
    product: "المنتج",
    documentation: "الوثائق التقنية",
    apiAccess: "واجهة برمجة التطبيقات",
    legal: "قانوني",
    privacyPolicy: "سياسة الخصوصية",
    termsOfService: "شروط الخدمة",
    compliance: "الامتثال",
    security: "الأمان",
    newsletter: "اشترك في نشرتنا الإخبارية",
    emailPlaceholder: "بريدك الإلكتروني",
    subscribe: "اشترك",
    copyright: "© 2025 Opptunity. جميع الحقوق محفوظة",
    platformDescription:
      "منصة مدعومة بالذكاء الاصطناعي لتطوير مهارات القوى العاملة، وتحليل الفجوات، وتحسين المواهب استراتيجياً.",

    // Secondary CTA
    readyTitle: "هل أنت مستعد لتعزيز مهارات فريقك؟",
    readySubtitle:
      "انضم إلى المؤسسات الرائدة التي تستفيد بالفعل من منصتنا المدعومة بالذكاء الاصطناعي لتطوير المواهب ودفع الابتكار.",

    // Assessment
    assessmentTitle: "تقييم تطوير المهارات المجاني",
    assessmentSubtitle: "اكتشف فجوات المهارات في فريقك واحصل على توصيات مخصصة",
    startAssessment: "ابدأ التقييم",

    // Assessment form
    companyProfile: "ملف الشركة",
    workforceRoles: "أدوار ومهارات القوى العاملة",
    futureNeeds: "الاحتياجات المستقبلية",
    resources: "الموارد",
    companyProfileDesc: "أخبرنا عن مؤسستك (بشكل مجهول)",
    workforceRolesDesc: "حدد الأدوار الرئيسية وفجوات المهارات",
    futureNeedsDesc: "شارك خططك للأدوار والمشاريع الجديدة في الاثني عشر شهرًا القادمة",
    resourcesDesc: "أخبرنا عن الموارد المتاحة لديك",
    assessmentResults: "نتائج التقييم",
    step: "الخطوة",
    of: "من",
    resultsDescription: "بناءً على إجاباتك، حددنا فجوات المهارات والتوصيات التالية",
    previous: "السابق",
    next: "التالي",
    submitAssessment: "إرسال التقييم",
    startNewAssessment: "بدء تقييم جديد",

    // Assessment form additional keys
    companyProfileLongDesc: "أخبرنا عن مؤسستك. هذا التقييم مجهول - نحن لا نجمع اسم شركتك.",
    industry: "الصناعة",
    selectIndustry: "اختر صناعتك",
    companySize: "حجم الشركة",
    selectCompanySize: "اختر حجم الشركة",
    strategicPriorities: "الأولويات الاستراتيجية",
    selectPriorities: "حدد أولويات مؤسستك الاستراتيجية للـ 12-24 شهرًا القادمة",
    businessGrowth: "نمو الأعمال",
    innovationProducts: "الابتكار ومنتجات جديدة",
    operationalEfficiency: "الكفاءة التشغيلية",
    customerExperience: "تجربة العملاء",
    digitalTransformation: "التحول الرقمي",
    talentDevelopment: "تطوير المواهب",
    costReduction: "تقليل التكاليف",
    sustainability: "الاستدامة",
    marketExpansion: "توسع السوق",
    regulatoryCompliance: "الامتثال التنظيمي",

    // Workforce Skills Form
    workforceRolesLongDesc: "حدد الأدوار الرئيسية وفجوات المهارات في مؤسستك",
    keyRoles: "الأدوار الرئيسية",
    keyRolesDesc: "حدد الأدوار الأكثر أهمية أو تحدياً للتوظيف",
    role: "دور",
    roleTitle: "المسمى الوظيفي",
    rolePlaceholder: "مثال: مهندس برمجيات، مدير مشروع",
    businessImportance: "الأهمية للأعمال",
    hiringDifficulty: "صعوبة التوظيف/الاحتفاظ",
    low: "منخفض",
    high: "مرتفع",
    easy: "سهل",
    hard: "صعب",
    addAnotherRole: "إضافة دور آخر",
    skillGaps: "فجوات المهارات",
    skillGapsDesc: "حدد المهارات التي تواجه فيها مؤسستك أكبر الفجوات",
    keyCompetencies: "الكفاءات الرئيسية",
    keyCompetenciesDesc: "حدد الكفاءات الأكثر أهمية لنجاح مؤسستك",
    
    // Skill gap options
    dataAnalysis: "تحليل البيانات وإعداد التقارير",
    programming: "البرمجة والتطوير",
    projectManagement: "إدارة المشاريع",
    digitalMarketing: "التسويق الرقمي",
    cybersecurity: "الأمن السيبراني",
    cloudComputing: "الحوسبة السحابية",
    aiMachineLearning: "الذكاء الاصطناعي وتعلم الآلة",
    designUX: "التصميم وتجربة المستخدم",
    problemSolving: "حل المشكلات",
    adaptability: "التكيف",
    teamwork: "العمل الجماعي والتعاون",
    timeManagement: "إدارة الوقت",
    criticalThinking: "التفكير النقدي",
    emotionalIntelligence: "الذكاء العاطفي",
    
    // Key competency options
    technicalExpertise: "الخبرة التقنية",
    strategicThinking: "التفكير الاستراتيجي",
    innovationCreativity: "الابتكار والإبداع",
    customerFocus: "التركيز على العملاء",
    businessAcumen: "الحس التجاري",
    changeManagement: "إدارة التغيير",
    crossFunctional: "التعاون بين مختلف الوظائف",
    digitalLiteracy: "المعرفة الرقمية",
    dataDecisionMaking: "اتخاذ القرارات المستندة إلى البيانات",
    agileMethodologies: "منهجيات العمل المرنة",

    // Future Needs Form
    futureNeedsLongDesc: "شارك خططك للأدوار والمشاريع الجديدة في الاثني عشر شهرًا القادمة",
    plannedRoles: "الأدوار الجديدة المخططة",
    plannedRolesDesc: "أضف أي أدوار جديدة تخطط للتوظيف لها في الاثني عشر شهرًا القادمة",
    newRole: "دور جديد",
    newRolePlaceholder: "مثال: عالم بيانات، مصمم تجربة المستخدم",
    hiringTimeline: "جدول التوظيف",
    selectTimeline: "اختر الجدول الزمني",
    noPlannedRoles: "لم تتم إضافة أدوار مخططة بعد",
    addPlannedRole: "إضافة دور مخطط",
    upcomingProjects: "المشاريع القادمة",
    upcomingProjectsDesc: "صف باختصار أي مشاريع أو مبادرات رئيسية مخطط لها للاثني عشر شهرًا القادمة",
    projectsPlaceholder: "صف مشاريعك أو مبادراتك القادمة...",
    upskillBarriers: "عوائق تطوير المهارات",
    upskillBarriersDesc: "ما هي أكبر التحديات التي تواجهك عندما يتعلق الأمر بتطوير مهارات القوى العاملة لديك؟",
    
    // Timeline options
    timeline0to3: "0-3 أشهر",
    timeline4to6: "4-6 أشهر",
    timeline7to9: "7-9 أشهر",
    timeline10to12: "10-12 شهر",
    
    // Barrier options
    budgetConstraints: "قيود الميزانية",
    timeLimitations: "قيود الوقت",
    employeeEngagement: "مشاركة الموظفين",
    measuringROI: "قياس العائد على الاستثمار",
    findingContent: "العثور على محتوى مناسب",
    personalizingLearning: "تخصيص التعلم",
    knowledgeRetention: "الاحتفاظ بالمعرفة",
    technologyAdoption: "تبني التكنولوجيا",
    leadershipBuyIn: "دعم القيادة",
    identifyingSkills: "تحديد المهارات المطلوبة",
    
    // Resources Form
    resourcesLongDesc: "أخبرنا عن الموارد المتاحة للتدريب والتطوير",
    annualTrainingBudget: "ميزانية التدريب السنوية",
    selectBudgetRange: "اختر نطاق الميزانية",
    availableTrainingTime: "وقت التدريب المتاح",
    selectTimeAvailable: "اختر الوقت المتاح",
    existingTools: "أدوات الموارد البشرية/التعلم الحالية",
    existingToolsDesc: "حدد الأدوات التي تستخدمها مؤسستك حاليًا",
    additionalNotes: "ملاحظات إضافية (اختياري)",
    additionalNotesPlaceholder: "أي معلومات أخرى حول مواردك أو قيودك...",
    
    // Budget options
    budgetLessThan10k: "أقل من 10,000 دولار",
    budget10kTo50k: "10,000 - 50,000 دولار",
    budget50kTo100k: "50,000 - 100,000 دولار",
    budget100kTo250k: "100,000 - 250,000 دولار",
    budget250kTo500k: "250,000 - 500,000 دولار",
    budget500kTo1m: "500,000 - 1,000,000 دولار",
    budgetMoreThan1m: "أكثر من 1,000,000 دولار",
    budgetPreferNotToSay: "أفضل عدم الإفصاح",
    
    // Time options
    timeLessThan1Hour: "أقل من ساعة واحدة في الأسبوع",
    time1To2Hours: "1-2 ساعات في الأسبوع",
    time3To5Hours: "3-5 ساعات في الأسبوع",
    time6To10Hours: "6-10 ساعات في الأسبوع",
    timeMoreThan10Hours: "أكثر من 10 ساعات في الأسبوع",
    timeVaries: "يختلف حسب القسم/الدور",
    
    // Tool options
    lmsLabel: "نظام إدارة التعلم (LMS)",
    hrisLabel: "نظام معلومات الموارد البشرية (HRIS)",
    talentManagementLabel: "برنامج إدارة المواهب",
    performanceManagementLabel: "نظام إدارة الأداء",
    eLearningLabel: "منصات التعلم الإلكتروني",
    skillsAssessmentLabel: "أدوات تقييم المهارات",
    mentoringLabel: "برنامج الإرشاد/التدريب",
    contentLibraryLabel: "مكتبة محتوى التعلم",
    noToolsLabel: "لا توجد أدوات رسمية مستخدمة",

    // Industries
    industryTechnology: "تكنولوجيا",
    industryHealthcare: "رعاية صحية",
    industryFinance: "تمويل",
    industryManufacturing: "تصنيع",
    industryRetail: "تجزئة",
    industryEducation: "تعليم",
    industryGovernment: "حكومة",
    industryNonProfit: "غير ربحية",
    industryProfessionalServices: "خدمات مهنية",
    industryConstruction: "بناء وتشييد",
    industryEnergy: "طاقة",
    industryTransportation: "نقل",
    industryHospitality: "ضيافة",
    industryMediaEntertainment: "إعلام وترفيه",
    industryOther: "أخرى",
    
    // Company Sizes
    companySize1to10: "1-10 موظفين",
    companySize11to50: "11-50 موظف",
    companySize51to200: "51-200 موظف",
    companySize201to500: "201-500 موظف",
    companySize501to1000: "501-1000 موظف",
    companySize1001to5000: "1001-5000 موظف",
    companySizeOver5000: "أكثر من 5000 موظف",

    // Pricing cards
    perUserPerMonth: "لكل مستخدم / شهريًا",
    teamFeatures: "ميزات الفريق",
    businessFeatures: "ميزات الأعمال",
    enterpriseFeatures: "ميزات المؤسسات",
    includedFeatures: "الميزات المشمولة",
    usersIncluded: "المستخدمين المشمولين",

    // AI Agents
    aiAgentTitle: "مساعد التعلم الذكي",
    aiAgentDescription: "احصل على توصيات تعليمية مخصصة، وتقييمات للمهارات، ومحتوى تعليمي من مساعد التعلم الذكي.",
    careerAIAgentTitle: "مساعد المسار الوظيفي الذكي",
    careerAIAgentDescription: "احصل على نصائح مهنية مخصصة، واستراتيجيات البحث عن وظائف، وإرشادات للتطوير المهني من مساعد المسار الوظيفي الذكي.",
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>("en")
  const [isRTL, setIsRTL] = useState(false)

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("language", lang)
    document.documentElement.lang = lang
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr"
    setIsRTL(lang === "ar")
  }

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "ar")) {
      setLanguage(savedLanguage)
    }
  }, [])

  const t = (key: string): any => {
    const keys = key.split(".")
    let value = translations[language]

    // Handle nested keys like "testimonial1.quote"
    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k as keyof typeof value]
      } else {
        return key // Key not found
      }
    }

    return value || key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>{children}</LanguageContext.Provider>
}

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}

