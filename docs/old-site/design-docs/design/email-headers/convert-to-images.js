const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function convertHtmlToPng() {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const htmlFiles = [
        'option1-ai-journey.html',
        'option2-course-grid.html',
        'option3-futuristic-dashboard.html',
        'option4-minimalist-tech.html',
        'option5-learning-lab.html'
    ];
    
    for (const htmlFile of htmlFiles) {
        const page = await browser.newPage();
        await page.setViewport({ width: 1656, height: 801 });
        
        const htmlPath = path.join(__dirname, htmlFile);
        const pngFile = htmlFile.replace('.html', '.png');
        const pngPath = path.join(__dirname, pngFile);
        
        await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
        await page.screenshot({ path: pngPath, fullPage: false });
        
        console.log(`✅ Converted ${htmlFile} to ${pngFile}`);
        await page.close();
    }
    
    await browser.close();
    console.log('\n🎉 All email headers have been converted to PNG images!');
}

convertHtmlToPng().catch(console.error);