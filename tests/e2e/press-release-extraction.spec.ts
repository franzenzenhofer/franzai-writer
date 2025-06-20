import { test, expect } from '@playwright/test';

test.describe('Press Release Content Extraction', () => {
  test('extract and display full press release content', async ({ page }) => {
    console.log('Starting press release content extraction');
    
    // Navigate to the workflow
    await page.goto('/w/press-release/new');
    await page.waitForLoadState('networkidle');
    
    // Fill basic information with real data
    await page.locator('input[placeholder*="New Product Launch"]').fill('InnovateTech Solutions Launches Revolutionary AI-Powered Analytics Platform');
    await page.locator('textarea[placeholder*="We\'re launching"]').fill(
      'InnovateTech Solutions today announced the launch of DataSense AI, a groundbreaking analytics platform that leverages advanced machine learning to provide real-time business insights. The platform transforms how companies analyze customer behavior, predict market trends, and make data-driven decisions with unprecedented accuracy and speed.'
    );
    await page.locator('input[placeholder*="TechCorp Inc."]').fill('InnovateTech Solutions');
    await page.locator('input[placeholder*="https://example.com"]').fill('https://www.innovatetech.com');
    
    await page.click('#process-stage-basic-info');
    await expect(page.locator('[data-testid="stage-card-basic-info"]')).toHaveClass(/border-green-500/, { 
      timeout: 30000 
    });
    
    // Wait for all auto-run stages
    console.log('Waiting for auto-run stages to complete...');
    await expect(page.locator('[data-testid="stage-card-tone-briefing"]')).toHaveClass(/border-green-500/, { 
      timeout: 60000 
    });
    await expect(page.locator('[data-testid="stage-card-research"]')).toHaveClass(/border-green-500/, { 
      timeout: 90000 
    });
    
    // Fill key facts
    await page.locator('input[placeholder="Main headline for the press release"]').fill(
      'InnovateTech Solutions Unveils DataSense AI: Revolutionary Analytics Platform That Transforms Business Intelligence'
    );
    await page.locator('input[placeholder="Supporting subheadline (optional)"]').fill(
      'New AI-powered platform delivers real-time insights with 95% prediction accuracy, empowering businesses to make smarter decisions faster'
    );
    await page.locator('textarea[placeholder="Main points to include (one per line)"]').fill(
      `• Launches DataSense AI, an advanced analytics platform using cutting-edge machine learning
• Achieves 95% accuracy in predicting customer behavior and market trends
• Reduces data analysis time by 80% compared to traditional methods
• Features intuitive dashboard with real-time visualization capabilities
• Includes automated reporting and custom alert systems
• Offers seamless integration with existing business intelligence tools`
    );
    await page.locator('textarea[placeholder*="This launch represents"]').fill(
      `"DataSense AI represents a quantum leap in business analytics," said Michael Chen, CEO of InnovateTech Solutions. "We're not just providing data; we're delivering actionable intelligence that drives real business outcomes. Our platform democratizes AI-powered analytics, making it accessible to businesses of all sizes."

"In beta testing, our clients saw an average 40% improvement in decision-making speed and a 25% increase in revenue within the first quarter," added Dr. Sarah Martinez, Chief Technology Officer. "The platform's predictive capabilities are helping businesses stay ahead of market changes and customer needs."`
    );
    await page.locator('textarea[placeholder="Important numbers, statistics, or data points"]').fill(
      `• 95% prediction accuracy for customer behavior analysis
• 80% reduction in data processing time
• 40% faster decision-making reported by beta users
• 25% average revenue increase in first quarter of use
• Processes over 1 million data points per second
• Supports 50+ data source integrations`
    );
    
    await page.click('#process-stage-key-facts');
    await expect(page.locator('[data-testid="stage-card-key-facts"]')).toHaveClass(/border-green-500/, { 
      timeout: 30000 
    });
    
    // Fill contact information
    await page.locator('input[placeholder*="Jane Smith"]').fill('Jennifer Thompson');
    await page.locator('input[placeholder*="Director of Communications"]').fill('Vice President of Communications');
    await page.locator('input[placeholder*="press@company.com"]').fill('press@innovatetech.com');
    await page.locator('input[placeholder*="+1 (555)"]').fill('+1 (555) 123-4567');
    await page.locator('textarea[placeholder="Secondary contacts or PR agency details"]').fill(
      `PR Agency Contact:
TechPR Partners
Maria Rodriguez
mrodriguez@techpr.com
+1 (555) 987-6543`
    );
    
    await page.click('#process-stage-contact-info');
    await expect(page.locator('[data-testid="stage-card-contact-info"]')).toHaveClass(/border-green-500/, { 
      timeout: 30000 
    });
    
    // Wait for final press release
    console.log('Waiting for final press release generation...');
    await expect(page.locator('[data-testid="stage-card-final-press-release"]')).toHaveClass(/border-green-500/, { 
      timeout: 120000 
    });
    
    // Wait a bit more to ensure rendering is complete
    await page.waitForTimeout(2000);
    
    // Check for any error messages
    const errorToast = await page.locator('[role="alert"]').textContent().catch(() => null);
    if (errorToast) {
      console.log('ERROR TOAST:', errorToast);
    }
    
    // Extract the press release content
    console.log('\n=== ATTEMPTING TO EXTRACT PRESS RELEASE CONTENT ===\n');
    
    // First, check if there's an error message in the stage
    const stageError = await page.locator('[data-testid="stage-card-final-press-release"] .text-destructive, [data-testid="stage-card-final-press-release"] .text-red-500').textContent().catch(() => null);
    if (stageError) {
      console.log('STAGE ERROR:', stageError);
    }
    
    // Try different selectors to find the content
    const possibleSelectors = [
      '[data-testid="stage-card-final-press-release"] .prose',
      '[data-testid="stage-card-final-press-release"] [data-testid="markdown-content"]',
      '[data-testid="stage-card-final-press-release"] .markdown',
      '[data-testid="stage-card-final-press-release"] pre',
      '[data-testid="stage-card-final-press-release"] .whitespace-pre-wrap',
      '[data-testid="stage-card-final-press-release"] [class*="output"]',
      '[data-testid="stage-card-final-press-release"] [class*="content"]',
      '[data-testid="stage-card-final-press-release"] p'
    ];
    
    let pressReleaseContent = null;
    for (const selector of possibleSelectors) {
      try {
        const element = await page.locator(selector).first();
        if (await element.isVisible({ timeout: 5000 })) {
          pressReleaseContent = await element.textContent();
          if (pressReleaseContent && pressReleaseContent.length > 100) {
            console.log(`Found content using selector: ${selector}`);
            break;
          }
        }
      } catch (e) {
        // Try next selector
      }
    }
    
    // If still not found, try to get all text from the stage card
    if (!pressReleaseContent || pressReleaseContent.length < 100) {
      const stageCard = page.locator('[data-testid="stage-card-final-press-release"]');
      pressReleaseContent = await stageCard.textContent();
    }
    
    // Print the press release
    console.log('\n=== FULL PRESS RELEASE CONTENT ===\n');
    console.log(pressReleaseContent);
    console.log('\n=== END OF PRESS RELEASE ===\n');
    
    // Take a focused screenshot of just the press release stage
    const finalStage = page.locator('[data-testid="stage-card-final-press-release"]');
    await finalStage.screenshot({ path: 'final-press-release-stage.png' });
    
    // Also take a full page screenshot
    await page.screenshot({ path: 'full-workflow-completed.png', fullPage: true });
    
    console.log('Screenshots saved: final-press-release-stage.png and full-workflow-completed.png');
  });
});