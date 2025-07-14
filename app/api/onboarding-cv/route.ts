import { NextRequest, NextResponse } from 'next/server';
import { assessSkills } from '@/lib/skills-assessment';
import { 
  engineerSupabase, 
  testConnection,
  getEngineerByEmail 
} from '@/lib/supabase-engineer';

export async function POST(request: NextRequest) {
  try {
    const { cvData, email } = await request.json();
    
    console.log('=== CV-ONLY ONBOARDING START ===');
    console.log('CV data received:', cvData);
    console.log('Email:', email);

    // Extract and assess CV text
    const cvText = cvData.text || cvData.original_text;
    if (!cvText) {
      return NextResponse.json(
        { error: 'No CV text found' },
        { status: 400 }
      );
    }

    console.log('Analyzing CV with AI...');
    console.log('CV text length:', cvText.length);
    console.log('CV text start (first 100 chars):', cvText.substring(0, 100));
    const assessment = await assessSkills(cvText, email);
    
    console.log('=== AI ASSESSMENT DEBUG ===');
    console.log('Assessment contactInfo:', assessment.contactInfo);
    console.log('AI extracted address:', assessment.contactInfo?.residenceAddress);
    
    // Extract basic information from AI assessment and CV text
    const extractedInfo = extractBasicEmployeeInfo(assessment, email, cvText);
    console.log('Extracted employee info:', extractedInfo);

    // Check if Engineer Supabase is available
    const connectionOk = await testConnection();
    if (!connectionOk) {
      console.warn('Engineer Supabase not available');
      return NextResponse.json(
        { error: 'Engineer database not available' },
        { status: 503 }
      );
    }

    // Create employee profile in engineer database
    console.log('Creating employee profile in engineer database...');
    
    // Check if engineer already exists
    const existingEngineer = await getEngineerByEmail(email);
    if (existingEngineer) {
      console.log(`Engineer with email ${email} already exists - updating with new CV data`);
      
      // Parse new name for database update
      const nameParts = extractedInfo.name.trim().split(' ');
      const prenom = nameParts[0] || '';
      const nom = nameParts.slice(1).join(' ') || '';

      console.log('=== UPDATING EXISTING ENGINEER ===');
      console.log('Existing engineer:', `${existingEngineer.prenom} ${existingEngineer.nom}`);
      console.log('New extracted info:', extractedInfo);
      console.log('New name parts - prenom:', prenom, 'nom:', nom);
      
      // Update existing engineer with new CV data
      const { data: updatedEngineer, error: updateError } = await engineerSupabase
        .from('ingenieurs')
        .update({
          nom: nom,
          prenom: prenom,
          adresse_residence: extractedInfo.residence_address
        })
        .eq('ingenieur_id', existingEngineer.ingenieur_id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating engineer:', updateError);
        // If update fails, return the existing engineer data but with extracted role/experience
        return NextResponse.json({
          success: true,
          message: 'Engineer exists, update failed but proceeding with assessment',
          employee: {
            id: existingEngineer.ingenieur_id,
            name: extractedInfo.name, // Use newly extracted name even if DB update failed
            email: existingEngineer.email,
            role: extractedInfo.role,
            experience_level: extractedInfo.experience_level,
            residence_address: extractedInfo.residence_address || existingEngineer.adresse_residence,
            skills_count: assessment.technicalSkills?.length || 0
          },
          assessment_summary: assessment.summary,
          assessment_data: {
            technicalSkills: assessment.technicalSkills || [],
            softSkills: assessment.softSkills || [],
            strengths: assessment.strengths || [],
            improvementAreas: assessment.improvementAreas || [],
            extractedContactInfo: assessment.contactInfo || null
          }
        });
      }

      console.log('Engineer updated successfully:', updatedEngineer);

      // Add technical skills to the database for the updated engineer
      if (assessment.technicalSkills && assessment.technicalSkills.length > 0) {
        try {
          console.log(`Updating skills for existing engineer ${existingEngineer.ingenieur_id}`);
          await addEngineerSkillsToDatabase(existingEngineer.ingenieur_id, assessment.technicalSkills);
          console.log(`✅ Successfully updated ${assessment.technicalSkills.length} skills`);
        } catch (skillError) {
          console.error('❌ Error updating skills:', skillError);
        }
      }

      // Store/update complete assessment data
      await storeCompleteAssessmentData(existingEngineer.ingenieur_id, assessment, cvText, extractedInfo);

      return NextResponse.json({
        success: true,
        message: 'Engineer profile updated successfully!',
        employee: {
          id: existingEngineer.ingenieur_id,
          name: `${updatedEngineer.prenom} ${updatedEngineer.nom}`.trim(),
          email: updatedEngineer.email,
          role: extractedInfo.role,
          experience_level: extractedInfo.experience_level,
          residence_address: updatedEngineer.adresse_residence,
          skills_count: assessment.technicalSkills?.length || 0
        },
        assessment_summary: assessment.summary,
        assessment_data: {
          technicalSkills: assessment.technicalSkills || [],
          softSkills: assessment.softSkills || [],
          strengths: assessment.strengths || [],
          improvementAreas: assessment.improvementAreas || [],
          extractedContactInfo: assessment.contactInfo || null
        }
      });
    }

    // Parse name for database
    const nameParts = extractedInfo.name.trim().split(' ');
    const prenom = nameParts[0] || '';
    const nom = nameParts.slice(1).join(' ') || '';

    console.log('=== DATABASE INSERT DEBUG ===');
    console.log('Extracted info:', extractedInfo);
    console.log('Name parts - prenom:', prenom, 'nom:', nom);
    console.log('Address to save:', extractedInfo.residence_address);
    
    const engineerDataToInsert = {
      nom: nom,
      prenom: prenom,
      email: email,
      equipe_id: null, // No team assignment for now
      adresse_residence: extractedInfo.residence_address // Fix column name
    };
    
    console.log('Data being inserted into database:', engineerDataToInsert);

    // Create new engineer in ingenieurs table
    const { data: savedEngineer, error: engineerError } = await engineerSupabase
      .from('ingenieurs')
      .insert(engineerDataToInsert)
      .select()
      .single();

    console.log('Engineer Supabase response - data:', savedEngineer);
    console.log('Engineer Supabase response - error:', engineerError);

    if (engineerError) {
      console.error('Error saving engineer:', JSON.stringify(engineerError, null, 2));
      throw new Error(`Failed to save engineer: ${engineerError.message || JSON.stringify(engineerError)}`);
    }

    console.log('Engineer created successfully:', savedEngineer);
    console.log('Saved engineer address field (adresse_residence):', savedEngineer.adresse_residence);

    // Add technical skills to the competences system
    console.log('=== SKILLS PROCESSING DEBUG ===');
    console.log('Assessment object:', JSON.stringify(assessment, null, 2));
    console.log('Technical skills array:', assessment.technicalSkills);
    console.log('Technical skills length:', assessment.technicalSkills?.length);
    
    if (assessment.technicalSkills && assessment.technicalSkills.length > 0) {
      try {
        console.log(`Attempting to add ${assessment.technicalSkills.length} skills for engineer ${savedEngineer.ingenieur_id}`);
        await addEngineerSkillsToDatabase(savedEngineer.ingenieur_id, assessment.technicalSkills);
        console.log(`✅ Successfully processed ${assessment.technicalSkills.length} skills for engineer ${savedEngineer.ingenieur_id}`);
      } catch (skillError) {
        console.error('❌ Error adding skills to database:', skillError);
        // Don't fail the whole process if skills addition fails
      }
    } else {
      console.log('❌ No technical skills found in assessment or empty array');
    }

    // Store complete assessment data for future retrieval
    await storeCompleteAssessmentData(savedEngineer.ingenieur_id, assessment, cvText, extractedInfo);

    console.log('Employee profile created successfully!');
    
    return NextResponse.json({
      success: true,
      message: 'CV onboarding completed successfully!',
      employee: {
        id: savedEngineer.ingenieur_id,
        name: `${savedEngineer.prenom} ${savedEngineer.nom}`.trim(),
        email: savedEngineer.email,
        role: extractedInfo.role,
        experience_level: extractedInfo.experience_level,
        residence_address: savedEngineer.adresse_residence,
        skills_count: assessment.technicalSkills?.length || 0
      },
      engineer_id: savedEngineer.ingenieur_id,
      assessment_summary: assessment.summary,
      assessment_data: {
        technicalSkills: assessment.technicalSkills || [],
        softSkills: assessment.softSkills || [],
        strengths: assessment.strengths || [],
        improvementAreas: assessment.improvementAreas || [],
        extractedContactInfo: assessment.contactInfo || null
      }
    });

  } catch (error) {
    console.error('CV onboarding error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process CV onboarding',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper function to calculate an overall score based on technical skills
function calculateOverallScore(technicalSkills: any[]): number {
  if (!Array.isArray(technicalSkills) || technicalSkills.length === 0) {
    return 75 // Default score if no skills are provided
  }
  
  // Map skill levels to numerical values
  const levelScores: Record<string, number> = {
    'Beginner': 25,
    'Basic': 40,
    'Intermediate': 60,
    'Advanced': 80,
    'Expert': 95
  }
  
  // Calculate average score from technical skills
  let totalScore = 0
  let countedSkills = 0
  
  technicalSkills.forEach(skill => {
    const level = skill.level
    if (level && levelScores[level]) {
      totalScore += levelScores[level]
      countedSkills++
    }
  })
  
  if (countedSkills === 0) return 75 // Default if no recognized skill levels
  
  return Math.round(totalScore / countedSkills)
}

// Helper function to extract residence address from CV text
function extractAddressFromCV(cvText: string): string | null {
  if (!cvText) return null;

  console.log('=== MANUAL ADDRESS EXTRACTION DEBUG ===');
  console.log('CV text length:', cvText.length);
  console.log('CV text sample:', cvText.substring(0, 200));

  const cvLower = cvText.toLowerCase();
  
  // Enhanced address patterns to look for
  const addressPatterns = [
    // Address after label (case insensitive)
    /(?:address|residence|location|based in|lives? in|residing in|resides in)[:]\s*([^,\n]+(?:,\s*[^,\n]+)*)/i,
    // City, Country patterns (enhanced for international formats)
    /([A-Za-z\u00C0-\u017F][a-zA-Z\u00C0-\u017F\s]+,\s*[A-Za-z\u00C0-\u017F][a-zA-Z\u00C0-\u017F\s]+)/g,
    // Specific patterns for common international formats
    /\b([A-Za-z\u00C0-\u017F]+\s*,\s*[A-Za-z\u00C0-\u017F]+)\b/g,
    // Postal code patterns (various formats)
    /([^,\n]*(?:\d{5}|\d{4}\s*\d{2}|\b\d{1,5}\s+[A-Z]{1,2}\d{1,2}\s*\d[A-Z]{2}\b)[^,\n]*)/i,
    // Street address patterns
    /(\d+\s+[A-Z\u00C0-\u017F][a-zA-Z\u00C0-\u017F\s]+(?:\s+(?:Street|St|Road|Rd|Avenue|Ave|Boulevard|Blvd|Drive|Dr|Lane|Ln))?[^,\n]*)/i
  ];

  console.log('Testing address patterns...');
  
  for (let i = 0; i < addressPatterns.length; i++) {
    const pattern = addressPatterns[i];
    console.log(`Testing pattern ${i + 1}:`, pattern.source);
    
    const matches = cvText.match(pattern);
    if (matches) {
      console.log(`Pattern ${i + 1} matches found:`, matches);
      
      // For global patterns, check all matches
      if (pattern.global) {
        for (const match of matches) {
          const address = match.trim();
          console.log(`Evaluating match: "${address}"`);
          
          // Filter out obvious non-addresses
          if (address.includes('@') || /^\+?\d+[\-\s\d]*$/.test(address)) {
            console.log('Rejected: contains email or phone pattern');
            continue;
          }
          
          // Check if it contains typical address components or known locations
          if (isValidAddress(address)) {
            console.log('✅ Valid address found:', address);
            return address;
          } else {
            console.log('❌ Invalid address:', address);
          }
        }
      } else {
        // For non-global patterns, check the first capture group
        if (matches[1]) {
          const address = matches[1].trim();
          console.log(`Evaluating capture group: "${address}"`);
          
          // Filter out obvious non-addresses
          if (address.includes('@') || /^\+?\d+[\-\s\d]*$/.test(address)) {
            console.log('Rejected: contains email or phone pattern');
            continue;
          }
          
          if (isValidAddress(address)) {
            console.log('✅ Valid address found:', address);
            return address;
          } else {
            console.log('❌ Invalid address:', address);
          }
        }
      }
    } else {
      console.log(`Pattern ${i + 1}: No matches`);
    }
  }

  // Look for contact section and extract address from there
  console.log('Searching in contact section...');
  const contactSectionMatch = cvText.match(/(?:contact|personal\s+information|address|coordonnées)[^]*?(?=(?:experience|education|skills|professional|summary|objective|expérience|formation|compétences|\n\n))/i);
  if (contactSectionMatch) {
    console.log('Contact section found:', contactSectionMatch[0].substring(0, 200));
    const contactSection = contactSectionMatch[0];
    
    // Look for address-like lines in contact section
    const lines = contactSection.split('\n');
    for (const line of lines) {
      const cleanLine = line.trim();
      console.log(`Checking contact line: "${cleanLine}"`);
      
      if (cleanLine.length > 5 && 
          !cleanLine.includes('@') && 
          !cleanLine.match(/^\+?\d+[\-\s\d]*$/) &&
          (cleanLine.includes(',') || /[A-Za-z\u00C0-\u017F]/.test(cleanLine))) {
        
        if (isValidAddress(cleanLine)) {
          console.log('✅ Valid address found in contact section:', cleanLine);
          return cleanLine;
        } else {
          console.log('❌ Invalid address in contact section:', cleanLine);
        }
      }
    }
  } else {
    console.log('No contact section found');
  }

  // Last resort: Look for any line that contains known location names
  console.log('Last resort: searching for known location names...');
  const knownLocations = [
    'tunis', 'tunisia', 'tunisie', 'paris', 'france', 'londres', 'london', 'england', 'uk', 'usa',
    'canada', 'toronto', 'montreal', 'vancouver', 'new york', 'california',
    'texas', 'florida', 'germany', 'berlin', 'munich', 'spain', 'madrid',
    'barcelona', 'italy', 'rome', 'milan', 'netherlands', 'amsterdam',
    'switzerland', 'zurich', 'geneva', 'morocco', 'casablanca', 'rabat',
    'algeria', 'algiers', 'egypt', 'cairo', 'lebanon', 'beirut', 'maroc',
    'algérie', 'egypte', 'liban'
  ];
  
  const lines = cvText.split('\n');
  for (const line of lines) {
    const cleanLine = line.trim();
    if (cleanLine.length > 5 && cleanLine.length < 100) {
      const lowerLine = cleanLine.toLowerCase();
      
      // Check if line contains any known location
      const hasKnownLocation = knownLocations.some(location => lowerLine.includes(location));
      if (hasKnownLocation) {
        console.log(`Found line with known location: "${cleanLine}"`);
        
        // Additional validation
        if (!cleanLine.includes('@') && !cleanLine.match(/^\+?\d+[\-\s\d]*$/)) {
          console.log('✅ Valid address found by location name:', cleanLine);
          return cleanLine;
        }
      }
    }
  }

  console.log('❌ No address found through manual extraction');
  return null;
}

// Helper function to validate if an extracted string is actually an address
function isValidAddress(addressString: string): boolean {
  if (!addressString || addressString.length < 3) return false;
  
  const lowerAddress = addressString.toLowerCase();
  
  // List of common programming skills and technical terms that are NOT addresses
  const technicalTerms = [
    'python', 'javascript', 'java', 'react', 'angular', 'vue', 'node', 'nodejs',
    'typescript', 'php', 'ruby', 'go', 'rust', 'kotlin', 'swift', 'c++', 'c#',
    'html', 'css', 'sass', 'scss', 'mongodb', 'mysql', 'postgresql', 'redis',
    'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'firebase', 'git', 'github',
    'api', 'rest', 'graphql', 'json', 'xml', 'sql', 'nosql', 'tensor', 'pandas',
    'numpy', 'sklearn', 'pytorch', 'tensorflow', 'django', 'flask', 'express',
    'spring', 'laravel', 'rails', 'vuejs', 'reactjs', 'bootstrap', 'tailwind'
  ];
  
  // Check if the address contains only technical terms
  const words = lowerAddress.split(/[,\s]+/).filter(word => word.length > 0);
  const technicalWordCount = words.filter(word => 
    technicalTerms.some(term => word.includes(term) || term.includes(word))
  ).length;
  
  // If more than half the words are technical terms, it's probably not an address
  if (technicalWordCount > words.length / 2) {
    return false;
  }
  
  // Positive indicators of a real address
  const addressIndicators = [
    // Geographic indicators
    /\b(street|st|road|rd|avenue|ave|boulevard|blvd|drive|dr|lane|ln|way)\b/i,
    /\b(city|town|village|municipality)\b/i,
    /\b(state|province|county|region)\b/i,
    /\b(country|nation)\b/i,
    // Postal codes (various formats)
    /\b\d{5}(-\d{4})?\b/, // US ZIP
    /\b[A-Z]\d[A-Z]\s*\d[A-Z]\d\b/, // Canadian postal
    /\b[A-Z]{1,2}\d{1,2}[A-Z]?\s*\d[A-Z]{2}\b/, // UK postal
    /\b\d{4,5}\b/, // Generic postal codes
    // Common location words
    /\b(apartment|apt|suite|unit|floor|building)\b/i,
    // Numbers that could be street numbers
    /^\d+\s+/
  ];
  
  // Check for address indicators
  const hasAddressIndicators = addressIndicators.some(pattern => 
    pattern.test(addressString)
  );
  
  // Known geographic locations (cities, countries)
  const knownLocations = [
    'tunis', 'tunisia', 'tunisie', 'paris', 'france', 'londres', 'london', 'england', 'uk', 'usa',
    'canada', 'toronto', 'montreal', 'vancouver', 'new york', 'california',
    'texas', 'florida', 'germany', 'berlin', 'munich', 'spain', 'madrid',
    'barcelona', 'italy', 'rome', 'milan', 'netherlands', 'amsterdam',
    'switzerland', 'zurich', 'geneva', 'morocco', 'casablanca', 'rabat',
    'algeria', 'algiers', 'egypt', 'cairo', 'lebanon', 'beirut', 'maroc',
    'algérie', 'egypte', 'liban'
  ];
  
  const hasKnownLocation = knownLocations.some(location =>
    lowerAddress.includes(location)
  );
  
  // Return true if it has address indicators or known locations
  return hasAddressIndicators || hasKnownLocation;
}

// Helper function to validate if extracted text is likely a person's name
function isLikelyPersonName(name: string): boolean {
  const invalidPatterns = [
    /\b(?:services|solutions|systems|technologies|consulting|corporation|company|inc|ltd|llc|group|team|department|division)\b/i,
    /\b(?:data|software|web|mobile|cloud|digital|tech|it|hr|marketing|sales|finance)\b/i,
    /\b(?:manager|director|engineer|developer|analyst|specialist|coordinator|assistant)\b/i,
    /\b(?:project|product|business|strategy|operations|development)\b/i
  ];
  
  // Check if name contains business/job-related terms
  for (const pattern of invalidPatterns) {
    if (pattern.test(name)) {
      console.log(`Rejected name candidate "${name}" - contains business terms`);
      return false;
    }
  }
  
  // Check if it's a reasonable length for a person's name
  const words = name.split(' ');
  if (words.length < 2 || words.length > 4) {
    console.log(`Rejected name candidate "${name}" - unusual word count`);
    return false;
  }
  
  // Check if each word starts with capital letter (basic name format)
  const properFormat = words.every(word => /^[A-Z][a-z]+$/.test(word));
  if (!properFormat) {
    console.log(`Rejected name candidate "${name}" - improper capitalization`);
    return false;
  }
  
  return true;
}

// Helper function to extract basic employee info from AI assessment and CV content
function extractBasicEmployeeInfo(assessment: any, email: string, cvText?: string) {
  let fullName = '';
  
  // Method 1: Extract name from AI summary (most reliable)
  if (assessment.summary) {
    const summary = assessment.summary;
    // Look for name at the beginning of summary: "Adam Akari is a..."
    const summaryNameMatch = summary.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\s+(?:is|has|was|works|studied)/i);
    if (summaryNameMatch && summaryNameMatch[1]) {
      fullName = summaryNameMatch[1].trim();
      console.log('Name extracted from AI summary:', fullName);
    }
  }
  
  // Method 2: Extract from contactInfo if available
  if (!fullName && assessment.contactInfo?.name) {
    fullName = assessment.contactInfo.name.trim();
    console.log('Name extracted from AI contactInfo:', fullName);
  }
  
  // Method 3: Fallback to CV text patterns (improved)
  if (!fullName && cvText) {
    const namePatterns = [
      // Look for name at the very beginning of CV
      /^([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s*$/m,
      // Look for name after headers
      /(?:NAME|Name|FULL NAME|Full Name)[:]\s*([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
      // Look for isolated name lines (not part of sentences)
      /^([A-Z][a-z]+\s+[A-Z][a-z]+)\s*$/m
    ];
    
    for (const pattern of namePatterns) {
      const match = cvText.match(pattern);
      if (match && match[1]) {
        const candidateName = match[1].trim();
        // Validate that it's likely a person's name (not a company/department)
        if (isLikelyPersonName(candidateName)) {
          fullName = candidateName;
          console.log('Name extracted from CV text:', fullName);
          break;
        }
      }
    }
  }
  
  // Method 4: Fallback to email
  if (!fullName) {
    const nameFromEmail = email.split('@')[0].replace(/[._]/g, ' ');
    fullName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
    console.log('Name extracted from email:', fullName);
  }

  // Extract residence address from CV
  const residenceAddress = cvText ? extractAddressFromCV(cvText) : null;
  console.log('Manual address extraction result:', residenceAddress);
  
  // Prioritize AI-extracted address, use manual extraction as fallback
  let finalAddress = null;
  
  console.log('=== ADDRESS EXTRACTION DECISION PROCESS ===');
  console.log('AI contactInfo object:', JSON.stringify(assessment.contactInfo, null, 2));
  console.log('AI extracted address:', assessment.contactInfo?.residenceAddress);
  console.log('Manual extraction result:', residenceAddress);
  
  // First, try to use AI-extracted address (more reliable)
  if (assessment.contactInfo?.residenceAddress) {
    finalAddress = assessment.contactInfo.residenceAddress;
    console.log('✅ Using AI-extracted address (preferred):', finalAddress);
  }
  // If AI didn't find an address, try manual extraction with validation
  else if (residenceAddress) {
    // Validate that the manually extracted address is actually an address
    if (isValidAddress(residenceAddress)) {
      finalAddress = residenceAddress;
      console.log('✅ Using validated manual address as fallback:', finalAddress);
    } else {
      console.log('❌ Manual extraction result rejected (not a valid address):', residenceAddress);
    }
  } else {
    console.log('❌ No address found through either AI or manual extraction');
  }
  
  console.log('Final address to be saved:', finalAddress);

  // Determine experience level from assessment
  let experienceLevel = 'Mid-Level';
  const summary = assessment.summary?.toLowerCase() || '';
  
  if (summary.includes('senior') || summary.includes('lead') || summary.includes('principal')) {
    experienceLevel = 'Senior';
  } else if (summary.includes('junior') || summary.includes('entry')) {
    experienceLevel = 'Junior';
  } else if (summary.includes('principal') || summary.includes('architect')) {
    experienceLevel = 'Principal';
  }

  // Extract primary role from CV content and AI analysis
  let primaryRole = 'Professional';
  
  // First try to extract role from CV text directly
  if (cvText) {
    const cvLower = cvText.toLowerCase();
    
    // Look for job titles in experience section
    const jobTitlePatterns = [
      /(?:senior|lead|principal|chief)\s+([^,\n]+?)(?:\s*,|\s*—|\s*\n)/gi,
      /([^,\n]*?(?:manager|director|consultant|analyst|engineer|developer|designer|specialist|coordinator)[^,\n]*?)(?:\s*,|\s*—|\s*\n)/gi
    ];
    
    const foundTitles = [];
    for (const pattern of jobTitlePatterns) {
      let match;
      while ((match = pattern.exec(cvText)) !== null) {
        if (match[1]) {
          foundTitles.push(match[1].trim());
        }
      }
    }
    
    // Use the most recent/first job title found
    if (foundTitles.length > 0) {
      primaryRole = foundTitles[0];
    }
  }
  
  // If no specific role found, try to categorize based on AI industry analysis
  if (primaryRole === 'Professional' && assessment.industryAnalysis?.industry) {
    const industry = assessment.industryAnalysis.industry.toLowerCase();
    
    if (industry.includes('marketing') || industry.includes('content')) {
      primaryRole = 'Marketing Professional';
    } else if (industry.includes('strategy') || industry.includes('consulting')) {
      primaryRole = 'Strategy Consultant';
    } else if (industry.includes('product')) {
      primaryRole = 'Product Manager';
    } else if (industry.includes('frontend') || industry.includes('react') || industry.includes('vue')) {
      primaryRole = 'Frontend Developer';
    } else if (industry.includes('backend') || industry.includes('api') || industry.includes('server')) {
      primaryRole = 'Backend Developer';
    } else if (industry.includes('full stack') || industry.includes('fullstack')) {
      primaryRole = 'Full Stack Developer';
    } else if (industry.includes('devops') || industry.includes('cloud')) {
      primaryRole = 'DevOps Engineer';
    } else if (industry.includes('data') || industry.includes('analytics')) {
      primaryRole = 'Data Engineer';
    } else if (industry.includes('mobile') || industry.includes('android') || industry.includes('ios')) {
      primaryRole = 'Mobile Developer';
    } else if (industry.includes('security')) {
      primaryRole = 'Security Engineer';
    }
  }

  const result = {
    name: fullName,
    email: email,
    role: primaryRole,
    experience_level: experienceLevel,
    residence_address: finalAddress
  };
  
  console.log('extractBasicEmployeeInfo result:', result);
  return result;
}

// Helper function to add engineer skills to the competences database
async function addEngineerSkillsToDatabase(ingenieurId: number, technicalSkills: any[]) {
  try {
    console.log(`=== STARTING SKILLS DATABASE INSERTION ===`);
    console.log(`Engineer ID: ${ingenieurId}`);
    console.log(`Number of skills to process: ${technicalSkills.length}`);
    console.log(`Skills data structure:`, JSON.stringify(technicalSkills, null, 2));
    
    for (let i = 0; i < technicalSkills.length; i++) {
      const skill = technicalSkills[i];
      console.log(`\n--- Processing skill ${i + 1}/${technicalSkills.length} ---`);
      console.log('Skill object:', JSON.stringify(skill, null, 2));
      
      const skillName = skill.skill || skill.name;
      console.log(`Extracted skill name: "${skillName}"`);
      
      if (!skillName) {
        console.log('❌ Skipping skill with no name:', skill);
        continue;
      }

      console.log(`Processing skill: ${skillName} with level: ${skill.level}`);

      // First check if competence already exists
      let competenceId = null;
      const { data: existingCompetence, error: searchError } = await engineerSupabase
        .from('competences')
        .select('competence_id')
        .eq('nom_competence', skillName)
        .single();

      if (searchError && searchError.code !== 'PGRST116') { // PGRST116 = no rows found
        console.warn(`Error searching for competence ${skillName}:`, searchError);
        continue;
      }

      if (existingCompetence) {
        // Competence already exists
        competenceId = existingCompetence.competence_id;
        console.log(`Found existing competence: ${skillName} with ID: ${competenceId}`);
      } else {
        // Create new competence
        const { data: newCompetence, error: createError } = await engineerSupabase
          .from('competences')
          .insert({
            nom_competence: skillName,
            categorie: categorizeSkill(skillName)
          })
          .select('competence_id')
          .single();

        if (createError) {
          console.warn(`Error creating competence ${skillName}:`, createError);
          continue;
        }

        competenceId = newCompetence?.competence_id;
        console.log(`Created new competence: ${skillName} with ID: ${competenceId}`);
      }

      if (!competenceId) {
        console.warn(`No competence ID found for skill: ${skillName}`);
        continue;
      }

      // Convert skill level to string value (niveau is varchar in database)
      const niveau = mapSkillLevelToString(skill.level);
      console.log(`Mapping skill level "${skill.level}" to string value: ${niveau}`);

      // Add engineer competence relationship
      const { data: relationData, error: ingCompError } = await engineerSupabase
        .from('ingenieur_competences')
        .upsert({
          ingenieur_id: ingenieurId,
          competence_id: competenceId,
          niveau: niveau
        }, {
          onConflict: 'ingenieur_id,competence_id'
        })
        .select();

      if (ingCompError) {
        console.error(`Error adding competence ${skillName} (ID: ${competenceId}) to engineer ${ingenieurId}:`, ingCompError);
      } else {
        console.log(`Successfully linked engineer ${ingenieurId} to competence ${skillName} (ID: ${competenceId}) with level ${niveau}`);
      }
    }
    
    console.log(`Finished processing ${technicalSkills.length} skills for engineer ${ingenieurId}`);
  } catch (error) {
    console.error('Error in addEngineerSkillsToDatabase:', error);
    throw error;
  }
}

// Helper function to store complete assessment data
async function storeCompleteAssessmentData(ingenieurId: number, assessment: any, cvText: string, extractedInfo: any) {
  try {
    console.log(`Storing complete assessment data for engineer ${ingenieurId}`);
    
    // Create a JSON object with all assessment data
    const assessmentData = {
      ingenieur_id: ingenieurId,
      cv_text: cvText,
      ai_assessment: {
        summary: assessment.summary,
        technical_skills: assessment.technicalSkills,
        soft_skills: assessment.softSkills,
        strengths: assessment.strengths,
        improvement_areas: assessment.improvementAreas,
        recommendations: assessment.recommendations,
        industry_analysis: assessment.industryAnalysis,
        career_trajectory: assessment.careerTrajectory,
        skill_gap_analysis: assessment.skillGapAnalysis
      },
      extracted_info: extractedInfo,
      processed_at: new Date().toISOString()
    };

    // Try to store in a JSON field in the ingenieurs table
    // Note: This will only work if cv_assessment_data column exists in the database
    const { error: updateError } = await engineerSupabase
      .from('ingenieurs')
      .update({
        cv_assessment_data: assessmentData
      })
      .eq('ingenieur_id', ingenieurId);

    if (updateError) {
      console.warn('cv_assessment_data column might not exist in ingenieurs table:', updateError);
      console.log('Assessment data will be stored in-memory for this session only');
      
      // You might want to create a separate assessments table in the future
      // For now, we'll just log that the data couldn't be stored permanently
    } else {
      console.log('Assessment data stored successfully in cv_assessment_data column');
    }
  } catch (error) {
    console.warn('Error storing complete assessment data:', error);
    console.log('Continuing without storing complete assessment data');
  }
}

// Helper function to map skill levels to strings (niveau is varchar in database)
// Database constraint: niveau::text = ANY (ARRAY['Débutant', 'Intermédiaire', 'Confirmé', 'Expert'])
function mapSkillLevelToString(level: string): string {
  const levelStr = level?.toLowerCase() || '';
  
  if (levelStr.includes('expert')) return 'Expert';
  if (levelStr.includes('advanced') || levelStr.includes('proficient') || levelStr.includes('experienced')) return 'Confirmé';
  if (levelStr.includes('intermediate')) return 'Intermédiaire';
  if (levelStr.includes('beginner') || levelStr.includes('basic')) return 'Débutant';
  
  console.log(`Warning: Unknown skill level "${level}", defaulting to 'Intermédiaire'`);
  return 'Intermédiaire'; // Default to Intermediate
}

// Helper function to categorize skills
function categorizeSkill(skillName: string): string {
  const skill = skillName.toLowerCase();
  
  if (['javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'go', 'rust', 'php'].some(lang => skill.includes(lang))) {
    return 'Programming Languages';
  }
  if (['react', 'vue', 'angular', 'svelte', 'next.js', 'nuxt'].some(fw => skill.includes(fw))) {
    return 'Frontend Frameworks';
  }
  if (['node.js', 'express', 'fastapi', 'spring', 'django', 'flask'].some(fw => skill.includes(fw))) {
    return 'Backend Frameworks';
  }
  if (['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform'].some(tool => skill.includes(tool))) {
    return 'DevOps & Cloud';
  }
  if (['postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch'].some(db => skill.includes(db))) {
    return 'Databases';
  }
  if (['marketing', 'content', 'strategy', 'management'].some(term => skill.includes(term))) {
    return 'Business & Marketing';
  }
  
  return 'Other';
}