const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to poem workflow...');
    await page.goto('http://localhost:9002/w/poem/new');
    
    console.log('Waiting for poem topic stage...');
    await page.waitForSelector('[data-testid="stage-card-poem-topic"]', { timeout: 10000 });
    
    console.log('Filling poem topic...');
    await page.fill('textarea', 'The beauty of autumn leaves');
    
    console.log('Clicking continue button...');
    await page.click('#process-stage-poem-topic');
    
    console.log('Waiting for poem generation to complete...');
    // Wait for any indication that poem stage has started or completed
    await page.waitForTimeout(5000);
    
    // Check what's on the page
    const poemCard = await page.$('[data-testid="stage-card-poem-generation"]');
    if (poemCard) {
      const cardClasses = await poemCard.getAttribute('class');
      console.log('Poem card classes:', cardClasses);
      
      // Check if poem has any output
      const poemOutput = await page.$('#stage-poem-generation pre');
      console.log('Poem output element exists:', !!poemOutput);
      
      if (!poemOutput) {
        // Try to find any output in the poem stage
        const anyOutput = await page.$('[data-testid="stage-card-poem-generation"] .space-y-4');
        console.log('Any output in poem stage:', !!anyOutput);
        
        // Check if there's an error
        const errorElement = await page.$('[data-testid="stage-card-poem-generation"] .text-destructive');
        if (errorElement) {
          const errorText = await errorElement.textContent();
          console.error('Poem generation error:', errorText);
        }
      }
    }
    
    console.log('Taking screenshot of current state...');
    await page.screenshot({ path: 'poem-generation-state.png' });
    
    console.log('Running export stage...');
    await page.click('#process-stage-export');
    
    console.log('Waiting for export to complete...');
    // Wait a bit for the export to process
    await page.waitForTimeout(5000);
    
    // Check if export card has completed status
    const exportCard = await page.$('[data-testid="stage-card-export"]');
    if (exportCard) {
      const cardClasses = await exportCard.getAttribute('class');
      console.log('Export card classes:', cardClasses);
      
      // Check if there's an error
      const errorElement = await page.$('[data-testid="stage-card-export"] .text-destructive');
      if (errorElement) {
        const errorText = await errorElement.textContent();
        console.error('Export error found:', errorText);
      }
      
      // Check if preview is visible
      const preview = await page.$('[title="clean HTML preview"]');
      console.log('Preview element exists:', !!preview);
      
      if (preview) {
        const isVisible = await preview.isVisible();
        console.log('Preview is visible:', isVisible);
      }
      
      // Check the export state
      const exportPreviewSection = await page.$('.space-y-4:has([title="clean HTML preview"])');
      console.log('Export preview section exists:', !!exportPreviewSection);
      
      // Check if there's any content in the export output
      const exportContent = await page.$$('.space-y-4');
      console.log('Number of content sections:', exportContent.length);
    }
    
    console.log('Waiting 10 seconds to observe...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('Error:', error);
    await page.screenshot({ path: 'export-debug-error.png' });
  }
  
  await browser.close();
})();