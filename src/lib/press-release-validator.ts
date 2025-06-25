/**
 * Press Release Validation and Quality Assurance System
 * Ensures press releases meet professional journalism and AP style standards
 */

export interface ValidationResult {
  isValid: boolean;
  score: number; // 0-100 quality score
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: ValidationSuggestion[];
}

export interface ValidationError {
  type: 'critical' | 'major' | 'minor';
  field: string;
  message: string;
  location?: string;
}

export interface ValidationWarning {
  type: 'style' | 'content' | 'structure';
  field: string;
  message: string;
  suggestion?: string;
}

export interface ValidationSuggestion {
  type: 'improvement' | 'optimization' | 'enhancement';
  field: string;
  message: string;
  example?: string;
}

export interface PressReleaseContent {
  headline: string;
  subheadline?: string;
  content: string;
  quotes: string;
  statistics: string;
  contactName: string;
  contactTitle: string;
  contactEmail: string;
  contactPhone: string;
  companyName: string;
  website?: string;
}

/**
 * Comprehensive Press Release Validator
 */
export class PressReleaseValidator {
  private readonly AP_STYLE_PATTERNS = {
    // Common AP style violations
    dateFormat: /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/,
    timeFormat: /\b\d{1,2}:\d{2}\s*(a\.m\.|p\.m\.)\b/i,
    stateAbbreviations: /\b(Alabama|Alaska|Arizona|Arkansas|California|Colorado|Connecticut|Delaware|Florida|Georgia|Hawaii|Idaho|Illinois|Indiana|Iowa|Kansas|Kentucky|Louisiana|Maine|Maryland|Massachusetts|Michigan|Minnesota|Mississippi|Missouri|Montana|Nebraska|Nevada|New Hampshire|New Jersey|New Mexico|New York|North Carolina|North Dakota|Ohio|Oklahoma|Oregon|Pennsylvania|Rhode Island|South Carolina|South Dakota|Tennessee|Texas|Utah|Vermont|Virginia|Washington|West Virginia|Wisconsin|Wyoming)\b/,
    percentFormat: /\b\d+(\.\d+)?\s*percent\b/i,
    moneyFormat: /\$\d{1,3}(,\d{3})*(\.\d{2})?\s*(million|billion|trillion)?/i,
  };

  private readonly PROFESSIONAL_STANDARDS = {
    minWordCount: 300,
    maxWordCount: 800,
    idealWordCount: 500,
    maxHeadlineWords: 12,
    minHeadlineWords: 6,
    maxParagraphSentences: 4,
    maxSentenceWords: 25,
  };

  /**
   * Validate complete press release content
   */
  public validatePressRelease(content: PressReleaseContent): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: ValidationSuggestion[] = [];

    // Core validation checks
    this.validateHeadline(content.headline, errors, warnings, suggestions);
    this.validateContent(content.content, errors, warnings, suggestions);
    this.validateQuotes(content.quotes, errors, warnings, suggestions);
    this.validateContactInfo(content, errors, warnings, suggestions);
    this.validateAPStyle(content.content, warnings, suggestions);
    this.validateStructure(content.content, warnings, suggestions);
    this.validateReadability(content.content, warnings, suggestions);

    // Calculate quality score
    const score = this.calculateQualityScore(content, errors, warnings);

    return {
      isValid: errors.filter(e => e.type === 'critical').length === 0,
      score,
      errors,
      warnings,
      suggestions,
    };
  }

  /**
   * Validate headline quality and standards
   */
  private validateHeadline(headline: string, errors: ValidationError[], warnings: ValidationWarning[], suggestions: ValidationSuggestion[]): void {
    if (!headline || headline.trim().length === 0) {
      errors.push({
        type: 'critical',
        field: 'headline',
        message: 'Headline is required',
      });
      return;
    }

    const wordCount = headline.split(/\s+/).length;
    
    if (wordCount < this.PROFESSIONAL_STANDARDS.minHeadlineWords) {
      warnings.push({
        type: 'content',
        field: 'headline',
        message: `Headline too short (${wordCount} words). Aim for ${this.PROFESSIONAL_STANDARDS.minHeadlineWords}-${this.PROFESSIONAL_STANDARDS.maxHeadlineWords} words.`,
        suggestion: 'Add more specific details about the announcement',
      });
    }

    if (wordCount > this.PROFESSIONAL_STANDARDS.maxHeadlineWords) {
      warnings.push({
        type: 'content',
        field: 'headline',
        message: `Headline too long (${wordCount} words). Keep under ${this.PROFESSIONAL_STANDARDS.maxHeadlineWords} words.`,
        suggestion: 'Remove unnecessary words and focus on the core news',
      });
    }

    // Check for marketing language
    const marketingWords = ['revolutionary', 'game-changing', 'groundbreaking', 'disruptive', 'innovative', 'cutting-edge'];
    const foundMarketingWords = marketingWords.filter(word => 
      headline.toLowerCase().includes(word.toLowerCase())
    );

    if (foundMarketingWords.length > 0) {
      warnings.push({
        type: 'style',
        field: 'headline',
        message: `Avoid marketing hyperbole: ${foundMarketingWords.join(', ')}`,
        suggestion: 'Use factual, newsworthy language instead',
      });
    }

    // Check for passive voice
    if (headline.includes(' is ') || headline.includes(' are ') || headline.includes(' was ') || headline.includes(' were ')) {
      suggestions.push({
        type: 'improvement',
        field: 'headline',
        message: 'Consider using active voice for stronger impact',
        example: 'Company Launches Product vs. Product is Launched by Company',
      });
    }
  }

  /**
   * Validate main content structure and quality
   */
  private validateContent(content: string, errors: ValidationError[], warnings: ValidationWarning[], suggestions: ValidationSuggestion[]): void {
    if (!content || content.trim().length === 0) {
      errors.push({
        type: 'critical',
        field: 'content',
        message: 'Press release content is required',
      });
      return;
    }

    const wordCount = content.split(/\s+/).length;

    if (wordCount < this.PROFESSIONAL_STANDARDS.minWordCount) {
      warnings.push({
        type: 'content',
        field: 'content',
        message: `Content too short (${wordCount} words). Aim for ${this.PROFESSIONAL_STANDARDS.minWordCount}-${this.PROFESSIONAL_STANDARDS.maxWordCount} words.`,
        suggestion: 'Add more context, background information, and industry details',
      });
    }

    if (wordCount > this.PROFESSIONAL_STANDARDS.maxWordCount) {
      warnings.push({
        type: 'content',
        field: 'content',
        message: `Content too long (${wordCount} words). Keep under ${this.PROFESSIONAL_STANDARDS.maxWordCount} words.`,
        suggestion: 'Focus on the most newsworthy information and remove unnecessary details',
      });
    }

    // Check for required elements
    if (!content.includes('FOR IMMEDIATE RELEASE')) {
      errors.push({
        type: 'major',
        field: 'content',
        message: 'Missing "FOR IMMEDIATE RELEASE" header',
      });
    }

    if (!content.includes('###') && !content.includes('-30-')) {
      warnings.push({
        type: 'structure',
        field: 'content',
        message: 'Missing end notation (### or -30-)',
        suggestion: 'Add ### or -30- at the end of the press release',
      });
    }

    // Check for boilerplate
    if (!content.toLowerCase().includes('about ')) {
      warnings.push({
        type: 'structure',
        field: 'content',
        message: 'Missing company boilerplate ("About [Company]" section)',
        suggestion: 'Add a brief company description at the end',
      });
    }
  }

  /**
   * Validate quote quality and attribution
   */
  private validateQuotes(quotes: string, errors: ValidationError[], warnings: ValidationWarning[], suggestions: ValidationSuggestion[]): void {
    if (!quotes || quotes.trim().length === 0) {
      warnings.push({
        type: 'content',
        field: 'quotes',
        message: 'No executive quotes provided',
        suggestion: 'Add 1-2 quotes from company leadership for credibility',
      });
      return;
    }

    // Check quote attribution format
    const quotePattern = /"[^"]+"\s*[-–—]\s*[^,]+,\s*[^.]+/g;
    const validQuotes = quotes.match(quotePattern);

    if (!validQuotes || validQuotes.length === 0) {
      warnings.push({
        type: 'style',
        field: 'quotes',
        message: 'Quotes may not be properly attributed',
        suggestion: 'Format: "Quote content" - Full Name, Title, Company',
      });
    }

    // Check for marketing language in quotes
    const marketingPhrases = ['excited to announce', 'pleased to', 'thrilled to', 'delighted to'];
    const foundPhrases = marketingPhrases.filter(phrase => 
      quotes.toLowerCase().includes(phrase.toLowerCase())
    );

    if (foundPhrases.length > 0) {
      suggestions.push({
        type: 'improvement',
        field: 'quotes',
        message: 'Consider more natural, conversational language in quotes',
        example: 'Avoid clichéd phrases like "excited to announce"',
      });
    }
  }

  /**
   * Validate contact information completeness
   */
  private validateContactInfo(content: PressReleaseContent, errors: ValidationError[], warnings: ValidationWarning[], suggestions: ValidationSuggestion[]): void {
    if (!content.contactName) {
      errors.push({
        type: 'major',
        field: 'contactName',
        message: 'Media contact name is required',
      });
    }

    if (!content.contactEmail) {
      errors.push({
        type: 'major',
        field: 'contactEmail',
        message: 'Media contact email is required',
      });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(content.contactEmail)) {
      errors.push({
        type: 'major',
        field: 'contactEmail',
        message: 'Invalid email format',
      });
    }

    if (!content.contactPhone) {
      warnings.push({
        type: 'content',
        field: 'contactPhone',
        message: 'Phone number recommended for media follow-up',
      });
    }

    if (!content.contactTitle) {
      warnings.push({
        type: 'content',
        field: 'contactTitle',
        message: 'Contact title recommended for credibility',
      });
    }
  }

  /**
   * Validate AP Style compliance
   */
  private validateAPStyle(content: string, warnings: ValidationWarning[], suggestions: ValidationSuggestion[]): void {
    // Check for common AP style violations
    if (content.match(/\bper cent\b/gi)) {
      warnings.push({
        type: 'style',
        field: 'content',
        message: 'Use "percent" not "per cent" (AP style)',
      });
    }

    if (content.match(/\btowards\b/gi)) {
      warnings.push({
        type: 'style',
        field: 'content',
        message: 'Use "toward" not "towards" (AP style)',
      });
    }

    if (content.match(/\bOK\b/g)) {
      warnings.push({
        type: 'style',
        field: 'content',
        message: 'Use "OK" not "okay" (AP style)',
      });
    }

    // Check for proper comma usage before "and" in series
    const seriesPattern = /\w+,\s*\w+\s+and\s+\w+/g;
    if (content.match(seriesPattern)) {
      suggestions.push({
        type: 'optimization',
        field: 'content',
        message: 'AP style: No comma before "and" in simple series',
        example: 'red, white and blue (not red, white, and blue)',
      });
    }
  }

  /**
   * Validate press release structure
   */
  private validateStructure(content: string, warnings: ValidationWarning[], suggestions: ValidationSuggestion[]): void {
    const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);

    if (paragraphs.length < 3) {
      warnings.push({
        type: 'structure',
        field: 'content',
        message: 'Press release should have at least 3-4 paragraphs',
        suggestion: 'Add more context, background, and supporting information',
      });
    }

    // Check first paragraph for 5 W's
    if (paragraphs.length > 0) {
      const firstParagraph = paragraphs[0].toLowerCase();
      const missingWs = [];

      if (!this.containsWho(firstParagraph)) missingWs.push('Who');
      if (!this.containsWhat(firstParagraph)) missingWs.push('What');
      if (!this.containsWhen(firstParagraph)) missingWs.push('When');

      if (missingWs.length > 0) {
        suggestions.push({
          type: 'improvement',
          field: 'content',
          message: `First paragraph should answer: ${missingWs.join(', ')}`,
          example: 'Lead paragraph should cover who, what, when, where, why',
        });
      }
    }
  }

  /**
   * Validate readability and clarity
   */
  private validateReadability(content: string, warnings: ValidationWarning[], suggestions: ValidationSuggestion[]): void {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const longSentences = sentences.filter(s => s.split(/\s+/).length > this.PROFESSIONAL_STANDARDS.maxSentenceWords);

    if (longSentences.length > 0) {
      suggestions.push({
        type: 'improvement',
        field: 'content',
        message: `${longSentences.length} sentences are too long (over ${this.PROFESSIONAL_STANDARDS.maxSentenceWords} words)`,
        example: 'Break long sentences into shorter, clearer ones',
      });
    }

    // Check for jargon and complex words
    const jargonWords = ['utilize', 'paradigm', 'synergy', 'leverage', 'optimize', 'streamline'];
    const foundJargon = jargonWords.filter(word => 
      content.toLowerCase().includes(word.toLowerCase())
    );

    if (foundJargon.length > 0) {
      suggestions.push({
        type: 'improvement',
        field: 'content',
        message: `Consider simpler alternatives to: ${foundJargon.join(', ')}`,
        example: 'Use "use" instead of "utilize", "improve" instead of "optimize"',
      });
    }
  }

  /**
   * Calculate overall quality score
   */
  private calculateQualityScore(content: PressReleaseContent, errors: ValidationError[], warnings: ValidationWarning[]): number {
    let score = 100;

    // Deduct points for errors
    errors.forEach(error => {
      switch (error.type) {
        case 'critical':
          score -= 25;
          break;
        case 'major':
          score -= 15;
          break;
        case 'minor':
          score -= 5;
          break;
      }
    });

    // Deduct points for warnings
    warnings.forEach(warning => {
      switch (warning.type) {
        case 'content':
          score -= 10;
          break;
        case 'style':
          score -= 5;
          break;
        case 'structure':
          score -= 8;
          break;
      }
    });

    // Bonus points for good practices
    const wordCount = content.content.split(/\s+/).length;
    if (wordCount >= this.PROFESSIONAL_STANDARDS.minWordCount && wordCount <= this.PROFESSIONAL_STANDARDS.idealWordCount) {
      score += 5;
    }

    if (content.quotes && content.quotes.includes('"') && content.quotes.includes('-')) {
      score += 5;
    }

    if (content.content.includes('FOR IMMEDIATE RELEASE') && content.content.includes('###')) {
      score += 5;
    }

    return Math.max(0, Math.min(100, score));
  }

  // Helper methods for structural analysis
  private containsWho(text: string): boolean {
    return /\b(company|corporation|organization|startup|firm)\b/.test(text) ||
           /\b[A-Z][a-z]+\s+(Inc|Corp|LLC|Ltd)\b/.test(text);
  }

  private containsWhat(text: string): boolean {
    return /\b(announce|launch|release|introduce|unveil|reveal)\b/.test(text);
  }

  private containsWhen(text: string): boolean {
    return /\b(today|yesterday|tomorrow|this week|this month)\b/.test(text) ||
           /\b(January|February|March|April|May|June|July|August|September|October|November|December)\b/.test(text);
  }
}

// Export singleton instance
export const pressReleaseValidator = new PressReleaseValidator();