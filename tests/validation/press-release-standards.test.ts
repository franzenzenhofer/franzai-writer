import { pressReleaseValidator, type PressReleaseContent } from '@/lib/press-release-validator';

/**
 * Comprehensive validation tests for press release standards
 * Tests against real-world press release requirements and best practices
 */

describe('Press Release Standards Validation', () => {
  describe('AP Style Compliance', () => {
    it('should validate proper date formats', () => {
      const validContent: PressReleaseContent = {
        headline: 'Company Announces New Product Launch',
        content: 'SAN FRANCISCO, January 15, 2024 - TechCorp today announced...',
        quotes: '',
        statistics: '',
        contactName: 'John Doe',
        contactTitle: 'PR Manager',
        contactEmail: 'john@techcorp.com',
        contactPhone: '555-0123',
        companyName: 'TechCorp',
      };

      const result = pressReleaseValidator.validatePressRelease(validContent);
      const dateWarnings = result.warnings.filter(w => w.field === 'content' && w.message.includes('date'));
      expect(dateWarnings).toHaveLength(0);
    });

    it('should flag incorrect percentage formatting', () => {
      const content: PressReleaseContent = {
        headline: 'Sales Increase Announced',
        content: 'Sales increased by 25 per cent this quarter.',
        quotes: '',
        statistics: '',
        contactName: 'Jane Doe',
        contactTitle: 'PR Manager',
        contactEmail: 'jane@company.com',
        contactPhone: '555-0124',
        companyName: 'Company Inc',
      };

      const result = pressReleaseValidator.validatePressRelease(content);
      const percentWarning = result.warnings.find(w => w.message.includes('percent'));
      expect(percentWarning).toBeDefined();
      expect(percentWarning?.message).toContain('Use "percent" not "per cent"');
    });

    it('should validate money format compliance', () => {
      const validContent: PressReleaseContent = {
        headline: 'Company Raises $15 Million in Series A',
        content: 'The company raised $15 million in funding, bringing total to $25.5 million.',
        quotes: '',
        statistics: '$15 million Series A, $25.5 million total funding',
        contactName: 'John Doe',
        contactTitle: 'CFO',
        contactEmail: 'john@company.com',
        contactPhone: '555-0125',
        companyName: 'StartupCo',
      };

      const result = pressReleaseValidator.validatePressRelease(validContent);
      expect(result.score).toBeGreaterThan(70);
    });

    it('should flag toward vs towards usage', () => {
      const content: PressReleaseContent = {
        headline: 'Company Moves Towards Sustainability',
        content: 'We are moving towards a more sustainable future.',
        quotes: '',
        statistics: '',
        contactName: 'Jane Green',
        contactTitle: 'Sustainability Officer',
        contactEmail: 'jane@company.com',
        contactPhone: '555-0126',
        companyName: 'GreenCorp',
      };

      const result = pressReleaseValidator.validatePressRelease(content);
      const towardWarning = result.warnings.find(w => w.message.includes('toward'));
      expect(towardWarning).toBeDefined();
      expect(towardWarning?.message).toContain('Use "toward" not "towards"');
    });
  });

  describe('Structure Validation', () => {
    it('should require FOR IMMEDIATE RELEASE header', () => {
      const content: PressReleaseContent = {
        headline: 'Major Announcement',
        content: 'Company announces new product without proper header.',
        quotes: '',
        statistics: '',
        contactName: 'PR Team',
        contactTitle: 'Communications',
        contactEmail: 'pr@company.com',
        contactPhone: '555-0127',
        companyName: 'Company',
      };

      const result = pressReleaseValidator.validatePressRelease(content);
      const headerError = result.errors.find(e => e.message.includes('FOR IMMEDIATE RELEASE'));
      expect(headerError).toBeDefined();
      expect(headerError?.type).toBe('major');
    });

    it('should check for proper end notation', () => {
      const content: PressReleaseContent = {
        headline: 'Product Launch',
        content: 'FOR IMMEDIATE RELEASE\n\nProduct launch details...',
        quotes: '',
        statistics: '',
        contactName: 'PR Contact',
        contactTitle: 'Manager',
        contactEmail: 'pr@company.com',
        contactPhone: '555-0128',
        companyName: 'Company',
      };

      const result = pressReleaseValidator.validatePressRelease(content);
      const endWarning = result.warnings.find(w => w.message.includes('end notation'));
      expect(endWarning).toBeDefined();
    });

    it('should validate complete press release structure', () => {
      const wellStructured: PressReleaseContent = {
        headline: 'TechCorp Launches Revolutionary AI Platform',
        content: `FOR IMMEDIATE RELEASE

SAN FRANCISCO, January 15, 2024 - TechCorp, a leading provider of enterprise AI solutions, today announced the launch of its groundbreaking AI platform designed to transform business operations.

The new platform leverages advanced machine learning algorithms to automate complex business processes, resulting in significant efficiency gains for enterprise customers.

"This launch represents a major milestone in our mission to democratize AI for businesses," said Jane Smith, CEO of TechCorp. "Our platform makes enterprise AI accessible and actionable."

About TechCorp
TechCorp is a leading provider of enterprise AI solutions, serving Fortune 500 companies worldwide.

###`,
        quotes: '"This launch represents a major milestone in our mission to democratize AI for businesses," said Jane Smith, CEO of TechCorp.',
        statistics: '• 50% efficiency improvement\n• 100+ enterprise customers\n• $10M in funding',
        contactName: 'John Doe',
        contactTitle: 'VP of Communications',
        contactEmail: 'press@techcorp.com',
        contactPhone: '+1 (555) 012-3456',
        companyName: 'TechCorp',
        website: 'https://techcorp.com',
      };

      const result = pressReleaseValidator.validatePressRelease(wellStructured);
      expect(result.isValid).toBe(true);
      expect(result.score).toBeGreaterThan(85);
      expect(result.errors.filter(e => e.type === 'critical')).toHaveLength(0);
    });
  });

  describe('Content Quality Checks', () => {
    it('should flag marketing hyperbole in headlines', () => {
      const content: PressReleaseContent = {
        headline: 'Revolutionary Game-Changing Disruptive Platform',
        content: 'FOR IMMEDIATE RELEASE\n\nContent...',
        quotes: '',
        statistics: '',
        contactName: 'Marketing',
        contactTitle: 'Director',
        contactEmail: 'marketing@company.com',
        contactPhone: '555-0129',
        companyName: 'HypeCorp',
      };

      const result = pressReleaseValidator.validatePressRelease(content);
      const marketingWarning = result.warnings.find(w => w.message.includes('marketing hyperbole'));
      expect(marketingWarning).toBeDefined();
      expect(marketingWarning?.field).toBe('headline');
    });

    it('should check headline length requirements', () => {
      const tooShort: PressReleaseContent = {
        headline: 'New Product',
        content: 'FOR IMMEDIATE RELEASE\n\nContent...',
        quotes: '',
        statistics: '',
        contactName: 'PR',
        contactTitle: 'Manager',
        contactEmail: 'pr@company.com',
        contactPhone: '555-0130',
        companyName: 'Company',
      };

      const shortResult = pressReleaseValidator.validatePressRelease(tooShort);
      expect(shortResult.warnings.some(w => w.message.includes('Headline too short'))).toBe(true);

      const tooLong: PressReleaseContent = {
        ...tooShort,
        headline: 'This Is An Extremely Long Headline That Contains Way Too Many Words And Should Be Shortened For Better Impact',
      };

      const longResult = pressReleaseValidator.validatePressRelease(tooLong);
      expect(longResult.warnings.some(w => w.message.includes('Headline too long'))).toBe(true);
    });

    it('should validate word count requirements', () => {
      const tooShortContent: PressReleaseContent = {
        headline: 'Major Announcement',
        content: 'FOR IMMEDIATE RELEASE\n\nVery short content.\n\n###',
        quotes: '',
        statistics: '',
        contactName: 'PR',
        contactTitle: 'Manager',
        contactEmail: 'pr@company.com',
        contactPhone: '555-0131',
        companyName: 'Company',
      };

      const result = pressReleaseValidator.validatePressRelease(tooShortContent);
      const lengthWarning = result.warnings.find(w => w.message.includes('Content too short'));
      expect(lengthWarning).toBeDefined();
      expect(lengthWarning?.suggestion).toContain('Add more context');
    });

    it('should check for 5 Ws in lead paragraph', () => {
      const missingWs: PressReleaseContent = {
        headline: 'Product Launch Announcement',
        content: `FOR IMMEDIATE RELEASE

The new product is very innovative and will change the industry.

More details about the product features and benefits.

###`,
        quotes: '',
        statistics: '',
        contactName: 'PR',
        contactTitle: 'Manager',
        contactEmail: 'pr@company.com',
        contactPhone: '555-0132',
        companyName: 'Company',
      };

      const result = pressReleaseValidator.validatePressRelease(missingWs);
      const wssSuggestion = result.suggestions.find(s => s.message.includes('First paragraph should answer'));
      expect(wssSuggestion).toBeDefined();
    });
  });

  describe('Quote Validation', () => {
    it('should validate proper quote attribution', () => {
      const properQuotes: PressReleaseContent = {
        headline: 'Company Milestone',
        content: 'FOR IMMEDIATE RELEASE\n\nContent...\n\n###',
        quotes: '"This is a significant achievement for our company," said John Smith, CEO of TechCorp. "We look forward to continued growth."',
        statistics: '',
        contactName: 'PR',
        contactTitle: 'Manager',
        contactEmail: 'pr@company.com',
        contactPhone: '555-0133',
        companyName: 'TechCorp',
      };

      const result = pressReleaseValidator.validatePressRelease(properQuotes);
      const quoteWarnings = result.warnings.filter(w => w.field === 'quotes');
      expect(quoteWarnings).toHaveLength(0);
    });

    it('should flag clichéd quote language', () => {
      const clichedQuotes: PressReleaseContent = {
        headline: 'Partnership Announcement',
        content: 'FOR IMMEDIATE RELEASE\n\nContent...\n\n###',
        quotes: '"We are excited to announce this partnership," said the CEO. "We are thrilled to work together."',
        statistics: '',
        contactName: 'PR',
        contactTitle: 'Manager',
        contactEmail: 'pr@company.com',
        contactPhone: '555-0134',
        companyName: 'Company',
      };

      const result = pressReleaseValidator.validatePressRelease(clichedQuotes);
      const clicheSuggestion = result.suggestions.find(s => s.message.includes('natural, conversational language'));
      expect(clicheSuggestion).toBeDefined();
    });
  });

  describe('Contact Information Validation', () => {
    it('should require all essential contact fields', () => {
      const missingContact: PressReleaseContent = {
        headline: 'News Release',
        content: 'FOR IMMEDIATE RELEASE\n\nContent...\n\n###',
        quotes: '',
        statistics: '',
        contactName: '',
        contactTitle: '',
        contactEmail: '',
        contactPhone: '',
        companyName: 'Company',
      };

      const result = pressReleaseValidator.validatePressRelease(missingContact);
      expect(result.errors.some(e => e.field === 'contactName')).toBe(true);
      expect(result.errors.some(e => e.field === 'contactEmail')).toBe(true);
      expect(result.warnings.some(w => w.field === 'contactPhone')).toBe(true);
    });

    it('should validate email format', () => {
      const invalidEmail: PressReleaseContent = {
        headline: 'Announcement',
        content: 'FOR IMMEDIATE RELEASE\n\nContent...\n\n###',
        quotes: '',
        statistics: '',
        contactName: 'John Doe',
        contactTitle: 'PR Manager',
        contactEmail: 'invalid-email-format',
        contactPhone: '555-0135',
        companyName: 'Company',
      };

      const result = pressReleaseValidator.validatePressRelease(invalidEmail);
      const emailError = result.errors.find(e => e.field === 'contactEmail' && e.message.includes('Invalid email'));
      expect(emailError).toBeDefined();
    });
  });

  describe('Readability and Clarity', () => {
    it('should flag overly long sentences', () => {
      const longSentences: PressReleaseContent = {
        headline: 'Complex Announcement',
        content: `FOR IMMEDIATE RELEASE

This extraordinarily long sentence contains far too many words and clauses that make it difficult to read and understand quickly which is problematic for journalists who need to quickly scan press releases to determine newsworthiness and extract key information for their stories.

###`,
        quotes: '',
        statistics: '',
        contactName: 'PR',
        contactTitle: 'Manager',
        contactEmail: 'pr@company.com',
        contactPhone: '555-0136',
        companyName: 'Company',
      };

      const result = pressReleaseValidator.validatePressRelease(longSentences);
      const readabilitySuggestion = result.suggestions.find(s => s.message.includes('sentences are too long'));
      expect(readabilitySuggestion).toBeDefined();
    });

    it('should suggest simpler alternatives to jargon', () => {
      const jargonContent: PressReleaseContent = {
        headline: 'Business Solution Launch',
        content: `FOR IMMEDIATE RELEASE

Company will utilize synergies to optimize and streamline operations, leveraging paradigm shifts.

###`,
        quotes: '',
        statistics: '',
        contactName: 'PR',
        contactTitle: 'Manager',
        contactEmail: 'pr@company.com',
        contactPhone: '555-0137',
        companyName: 'Company',
      };

      const result = pressReleaseValidator.validatePressRelease(jargonContent);
      const jargonSuggestion = result.suggestions.find(s => s.message.includes('simpler alternatives'));
      expect(jargonSuggestion).toBeDefined();
      expect(jargonSuggestion?.example).toContain('use');
    });
  });

  describe('Quality Score Calculation', () => {
    it('should calculate appropriate scores based on content quality', () => {
      const excellentPR: PressReleaseContent = {
        headline: 'TechCorp Announces Strategic Partnership with Industry Leader',
        content: `FOR IMMEDIATE RELEASE

SAN FRANCISCO, January 15, 2024 - TechCorp, a leading enterprise software provider, today announced a strategic partnership with GlobalTech Inc. to deliver integrated cloud solutions to Fortune 500 companies.

The partnership combines TechCorp's advanced analytics platform with GlobalTech's cloud infrastructure, creating a comprehensive solution that addresses growing enterprise demand for scalable, secure data management.

"This partnership represents a natural alignment of our complementary strengths," said Sarah Johnson, CEO of TechCorp. "Together, we can deliver unprecedented value to enterprise customers seeking integrated cloud and analytics solutions."

The combined solution will be available starting Q2 2024, with early access programs beginning in March for select enterprise customers.

About TechCorp
TechCorp provides enterprise analytics solutions to over 200 Fortune 500 companies, processing billions of data points daily to drive business intelligence and decision-making.

###`,
        quotes: '"This partnership represents a natural alignment of our complementary strengths," said Sarah Johnson, CEO of TechCorp.',
        statistics: '• 200+ Fortune 500 customers\n• Billions of data points processed daily\n• Q2 2024 launch',
        contactName: 'Michael Chen',
        contactTitle: 'VP of Communications',
        contactEmail: 'press@techcorp.com',
        contactPhone: '+1 (415) 555-0138',
        companyName: 'TechCorp',
        website: 'https://techcorp.com',
      };

      const excellentResult = pressReleaseValidator.validatePressRelease(excellentPR);
      expect(excellentResult.score).toBeGreaterThan(90);
      expect(excellentResult.isValid).toBe(true);

      const poorPR: PressReleaseContent = {
        headline: 'News',
        content: 'Company makes announcement.',
        quotes: '',
        statistics: '',
        contactName: '',
        contactTitle: '',
        contactEmail: '',
        contactPhone: '',
        companyName: 'Company',
      };

      const poorResult = pressReleaseValidator.validatePressRelease(poorPR);
      expect(poorResult.score).toBeLessThan(50);
      expect(poorResult.isValid).toBe(false);
    });

    it('should award bonus points for best practices', () => {
      const bestPractices: PressReleaseContent = {
        headline: 'Company Achieves Major Milestone in Sustainability',
        content: `FOR IMMEDIATE RELEASE

NEW YORK, January 15, 2024 - GreenCorp today announced it has achieved carbon neutrality across all operations, fulfilling a commitment made in 2020.

The achievement comes after implementing comprehensive renewable energy initiatives and carbon offset programs across 50 global facilities.

About GreenCorp
GreenCorp is a global leader in sustainable manufacturing, serving customers in 30 countries.

###`,
        quotes: '"Achieving carbon neutrality demonstrates our commitment to environmental leadership," said Emma Williams, CEO of GreenCorp.',
        statistics: '• Carbon neutral across 50 facilities\n• 100% renewable energy\n• 30 countries served',
        contactName: 'David Lee',
        contactTitle: 'Director of Communications',
        contactEmail: 'press@greencorp.com',
        contactPhone: '+1 (212) 555-0139',
        companyName: 'GreenCorp',
      };

      const result = pressReleaseValidator.validatePressRelease(bestPractices);
      expect(result.score).toBeGreaterThan(85);
      
      // Should get bonus for proper structure elements
      expect(result.errors.filter(e => e.message.includes('FOR IMMEDIATE RELEASE'))).toHaveLength(0);
      expect(result.warnings.filter(w => w.message.includes('end notation'))).toHaveLength(0);
    });
  });
});

describe('Real-World Press Release Examples', () => {
  it('should validate tech product launch press release', () => {
    const techLaunch: PressReleaseContent = {
      headline: 'Apple Unveils New MacBook Pro with M3 Chip',
      content: `FOR IMMEDIATE RELEASE

CUPERTINO, Calif., January 15, 2024 - Apple today announced the new MacBook Pro featuring the breakthrough M3 chip, delivering unprecedented performance and battery life for professional users.

The new MacBook Pro with M3 provides up to 22 hours of battery life, the longest ever in a Mac, along with performance that is up to 40 percent faster than the previous generation. The laptop features a stunning Liquid Retina XDR display, advanced camera and audio, and comprehensive connectivity.

"The new MacBook Pro with M3 chip represents a tremendous leap forward in performance and efficiency," said John Ternus, Apple's senior vice president of Hardware Engineering. "Professional users will experience dramatically faster workflows while enjoying all-day battery life."

Available for order today, the 14-inch MacBook Pro with M3 starts at $1,599, and the 16-inch model starts at $2,499. Both models will be in stores and arriving to customers beginning January 26.

About Apple
Apple revolutionized personal technology with the introduction of the Macintosh in 1984. Today, Apple leads the world in innovation with iPhone, iPad, Mac, Apple Watch, and Apple TV.

###`,
      quotes: '"The new MacBook Pro with M3 chip represents a tremendous leap forward in performance and efficiency," said John Ternus, Apple\'s senior vice president of Hardware Engineering.',
      statistics: '• Up to 22 hours battery life\n• 40% faster performance\n• Starting at $1,599 (14-inch) and $2,499 (16-inch)',
      contactName: 'Apple Press Info',
      contactTitle: 'Media Relations',
      contactEmail: 'press@apple.com',
      contactPhone: '(408) 974-2042',
      companyName: 'Apple',
      website: 'https://apple.com',
    };

    const result = pressReleaseValidator.validatePressRelease(techLaunch);
    expect(result.isValid).toBe(true);
    expect(result.score).toBeGreaterThan(85);
    
    // Should pass most quality checks
    expect(result.errors.filter(e => e.type === 'critical')).toHaveLength(0);
    
    // May have minor suggestions but no major issues
    expect(result.warnings.filter(w => w.type === 'content')).toHaveLength(0);
  });

  it('should validate funding announcement press release', () => {
    const fundingPR: PressReleaseContent = {
      headline: 'Climate Tech Startup Raises $50M Series B to Scale Carbon Capture',
      content: `FOR IMMEDIATE RELEASE

SAN FRANCISCO, January 15, 2024 - CarbonClear, a leading carbon capture technology company, today announced $50 million in Series B funding led by Breakthrough Energy Ventures, with participation from existing investors including Khosla Ventures and Lowercarbon Capital.

The funding will accelerate deployment of CarbonClear's direct air capture technology, which removes CO2 from the atmosphere at a fraction of the cost of existing solutions. The company plans to build five new capture facilities across North America in 2024.

"This investment validates the tremendous progress we've made in making carbon capture economically viable," said Dr. Lisa Chen, CEO and co-founder of CarbonClear. "We're now positioned to scale our technology and make a meaningful impact on climate change."

Since its founding in 2021, CarbonClear has captured over 100,000 tons of CO2 and secured contracts with major corporations committed to achieving net-zero emissions.

"CarbonClear's breakthrough technology represents exactly the kind of innovation needed to address climate change at scale," said Carmichael Roberts, Breakthrough Energy Ventures. "We're excited to support their mission."

About CarbonClear
CarbonClear develops and operates direct air capture systems that remove CO2 from the atmosphere. The company's proprietary technology achieves capture costs below $100 per ton, making large-scale deployment economically feasible.

###`,
      quotes: '"This investment validates the tremendous progress we\'ve made in making carbon capture economically viable," said Dr. Lisa Chen, CEO and co-founder of CarbonClear. "We\'re now positioned to scale our technology and make a meaningful impact on climate change."',
      statistics: '• $50 million Series B funding\n• 100,000+ tons CO2 captured\n• 5 new facilities planned for 2024\n• Sub-$100/ton capture cost',
      contactName: 'Sarah Martinez',
      contactTitle: 'Head of Communications',
      contactEmail: 'press@carbonclear.com',
      contactPhone: '+1 (415) 555-0200',
      companyName: 'CarbonClear',
      website: 'https://carbonclear.com',
    };

    const result = pressReleaseValidator.validatePressRelease(fundingPR);
    expect(result.isValid).toBe(true);
    expect(result.score).toBeGreaterThan(90);
    
    // Funding announcements should include all key elements
    expect(result.content).toContain('$50 million');
    expect(result.content).toContain('Series B');
    expect(result.content).toContain('Breakthrough Energy Ventures');
  });

  it('should validate merger/acquisition press release', () => {
    const mergerPR: PressReleaseContent = {
      headline: 'Microsoft to Acquire Gaming Studio for $7.5 Billion',
      content: `FOR IMMEDIATE RELEASE

REDMOND, Wash., January 15, 2024 - Microsoft Corp. today announced an agreement to acquire ZeniMax Media, parent company of Bethesda Softworks, for $7.5 billion in cash.

The acquisition includes publishing rights to global franchises including The Elder Scrolls, Fallout, DOOM, and Wolfenstein. Bethesda's 2,300 employees across studios worldwide will join Microsoft's Xbox Game Studios.

"Bethesda's games have always had a special place in the hearts of millions of gamers around the world," said Phil Spencer, head of Xbox. "We're thrilled to welcome these talented teams to the Xbox family."

The transaction is subject to customary closing conditions and regulatory review. Microsoft expects the acquisition to close in the first half of fiscal year 2024.

"This is an exciting next step in our journey," said Pete Hines, senior vice president at Bethesda. "We look forward to joining Microsoft and continuing to create great games together."

About Microsoft
Microsoft enables digital transformation for the era of an intelligent cloud and intelligent edge. Its mission is to empower every person and organization on the planet to achieve more.

###`,
      quotes: '"Bethesda\'s games have always had a special place in the hearts of millions of gamers around the world," said Phil Spencer, head of Xbox. "We\'re thrilled to welcome these talented teams to the Xbox family."',
      statistics: '• $7.5 billion acquisition\n• 2,300 employees joining Microsoft\n• Multiple AAA gaming franchises\n• Expected close H1 FY2024',
      contactName: 'Microsoft Media Relations',
      contactTitle: 'Corporate Communications',
      contactEmail: 'press@microsoft.com',
      contactPhone: '+1 (425) 882-8080',
      companyName: 'Microsoft',
      website: 'https://microsoft.com',
    };

    const result = pressReleaseValidator.validatePressRelease(mergerPR);
    expect(result.isValid).toBe(true);
    expect(result.score).toBeGreaterThan(85);
    
    // M&A announcements need specific elements
    expect(result.errors.filter(e => e.type === 'critical')).toHaveLength(0);
  });
});