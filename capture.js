import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import shortid from 'shortid';

import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

puppeteer.use(StealthPlugin());

class ScreenshotServer {
    constructor() {
        this.__filename = fileURLToPath(import.meta.url);
        this.__dirname = path.dirname(this.__filename);
        this.app = express();
        this.PORT = 3000;
        this.outputDir = path.join(this.__dirname, 'screenshots');
        this.upload = this.configureMulter();
        this.cleanupInterval = 80 * 80 * 1000;
        this.aliasFile = path.join(this.outputDir, 'aliases.json'); // File to store alias mappings
    }

    async init() {
        try {
            await fs.ensureDir(this.outputDir);
            console.log('🗂 Base screenshot directory ensured:', this.outputDir);

            // Ensure alias file exists
            if (!fs.existsSync(this.aliasFile)) {
                await fs.writeJson(this.aliasFile, {});
                console.log('🗂 Created alias mapping file:', this.aliasFile);
            }

            const testFile = path.join(this.outputDir, 'test.txt');
            await fs.writeFile(testFile, 'test');
            await fs.unlink(testFile);
            console.log('✅ Write permissions confirmed for outputDir');

            // Perform initial cleanup on startup
            await this.cleanupOldSessions();
        } catch (error) {
            console.error('❌ No write permissions for outputDir:', error);
            process.exit(1);
        }

        this.setupMiddleware();
        this.setupRoutes();
        this.startServer();

        // Schedule periodic cleanup
        setInterval(() => this.cleanupOldSessions(), this.cleanupInterval);
        console.log(`🧹 Scheduled session cleanup every ${this.cleanupInterval / 60000} minutes`);
    }

    async cleanupOldSessions() {
        try {
            const dirs = await fs.readdir(this.outputDir, { withFileTypes: true });
            const now = Date.now();
            const maxAge = 24 * 60 * 60 * 1000; // 24 hours
            const aliases = await fs.readJson(this.aliasFile);

            for (const dir of dirs) {
                if (!dir.isDirectory()) continue;

                const dirPath = path.join(this.outputDir, dir.name);
                const stats = await fs.stat(dirPath);

                // Skip cleanup if session is explicitly marked as shared
                const metadataPath = path.join(dirPath, 'metadata.json');
                if (fs.existsSync(metadataPath)) {
                    const metadata = await fs.readJson(metadataPath);
                    if (metadata.shared) continue;
                }

                if (now - stats.mtimeMs > maxAge) {
                    await fs.remove(dirPath);
                    console.log(`🗑️ Removed old session directory: ${dir.name}`);

                    // Remove aliases pointing to this session
                    for (const alias in aliases) {
                        if (aliases[alias] === dir.name) {
                            delete aliases[alias];
                            console.log(`🗑️ Removed alias: ${alias}`);
                        }
                    }
                }
            }

            // Save updated aliases
            await fs.writeJson(this.aliasFile, aliases, { spaces: 2 });
            console.log('✅ Old session cleanup completed');
        } catch (error) {
            console.error('❌ Error during session cleanup:', error);
        }
    }

    setupMiddleware() {
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(express.static(path.join(this.__dirname, 'public')));
        this.app.use('/screenshots', express.static(this.outputDir));
    }

    
    configureMulter() {
    return multer({ 
        storage: multer.memoryStorage(),
        limits: { fileSize: 100 * 1024 * 1024 } // 100MB for videos
    });
}

async convertPptToImages(filePath, sessionDir) {
    const tempPdfDir = path.join(this.outputDir, 'temp_' + Date.now());
    await fs.ensureDir(tempPdfDir);

    try {
        // Windows LibreOffice path
        const libreOfficePath = '"C:\\Program Files\\LibreOffice\\program\\soffice.exe"';
        
        // Convert PPT to PDF
        const convertCmd = `${libreOfficePath} --headless --convert-to pdf --outdir "${tempPdfDir}" "${filePath}"`;
        console.log('🔧 Converting PPT to PDF...');
        await execPromise(convertCmd);

        // Find the generated PDF
        const files = await fs.readdir(tempPdfDir);
        const pdfFile = files.find(f => f.endsWith('.pdf'));
        if (!pdfFile) throw new Error('PDF conversion failed - no PDF found');

        const pdfPath = path.join(tempPdfDir, pdfFile);
        console.log('✅ PDF created:', pdfFile);
        
        // Now install pdf-poppler to convert PDF to images
        console.log('📄 Converting PDF to images...');
        const { convert } = await import('pdf-poppler');
        
        await convert(pdfPath, {
            format: 'png',
            out_dir: sessionDir,
            out_prefix: 'slide',
            page: null // Convert all pages
        });

        // Cleanup temp directory
        await fs.remove(tempPdfDir);
        console.log('🧹 Cleaned up temp files');

        // Get all generated slide images
        const slideFiles = await fs.readdir(sessionDir);
        const slides = slideFiles.filter(f => f.startsWith('slide') && f.endsWith('.png'));
        
        console.log(`✅ Generated ${slides.length} slide images`);
        return slides;
        
    } catch (error) {
        console.error('❌ PPT conversion error:', error);
        await fs.remove(tempPdfDir).catch(() => {});
        throw error;
    }
}
async convertPdfToImages(pdfPath, sessionDir) {
    try {
        console.log('📄 Converting PDF to images...');
        const { convert } = await import('pdf-poppler');
        
        await convert(pdfPath, {
            format: 'png',
            out_dir: sessionDir,
            out_prefix: 'page',
            page: null // Convert all pages
        });

        // Get and rename files
        const pageFiles = await fs.readdir(sessionDir);
        const pages = pageFiles.filter(f => f.startsWith('page') && f.endsWith('.png'));
        
        console.log('📋 Found page files:', pages);
        
        // Ensure consistent naming
        const renamedPages = [];
        for (let i = 0; i < pages.length; i++) {
            const oldName = pages[i];
            const newName = `page-${i + 1}.png`;
            
            if (oldName !== newName) {
                await fs.rename(
                    path.join(sessionDir, oldName),
                    path.join(sessionDir, newName)
                );
                renamedPages.push(newName);
                console.log(`📝 Renamed: ${oldName} → ${newName}`);
            } else {
                renamedPages.push(oldName);
            }
        }
        
        console.log(`✅ Generated ${renamedPages.length} page images`);
        return renamedPages;
        
    } catch (error) {
        console.error('❌ PDF conversion error:', error);
        throw error;
    }
}
    setupRoutes() {
        // Serve static files first
        this.app.use(express.static(path.join(this.__dirname, 'public')));

        // API routes
        this.app.get('/api/screenshots/:sessionId', async (req, res) => this.handleGetScreenshots(req, res));
        this.app.post('/api/capture', async (req, res) => this.handleCapture(req, res));
        this.app.post('/api/upload/:sessionId?', this.upload.array('images'), (req, res) => this.handleUpload(req, res));
        this.app.get('/api/share/:sessionId', async (req, res) => this.handleShareSession(req, res));
        this.app.post('/api/share/:sessionId?', async (req, res) => this.handleShareSession(req, res));

        // Serve dynamic HTML for /gallery/:alias
        this.app.get('/gallery/:alias', async (req, res) => {
            const alias = req.params.alias;
            let sessionId;

            
            try {
                const aliases = await fs.readJson(this.aliasFile);
                sessionId = aliases[alias];
                if (!sessionId) {
                    console.warn(`Invalid or unknown alias: ${alias}`);
                    return res.status(404).send('Session not found');
                }
            } catch (error) {
                console.error(`Error reading aliases from ${this.aliasFile}:`, error);
                return res.status(500).send('Server error');
            }

            const sessionDir = path.join(this.outputDir, sessionId);
            let htmlPath = path.join(this.__dirname, 'public', 'modern.html'); // Default fallback

            // Validate sessionId format (UUID-like)
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(sessionId)) {
                console.warn(`Resolved sessionId is invalid: ${sessionId}`);
                return res.status(400).send('Invalid session ID');
            }

            // Check metadata.json for htmlPath
            const metadataPath = path.join(sessionDir, 'metadata.json');
            console.log(`Checking metadata at: ${metadataPath}`);
            if (fs.existsSync(metadataPath)) {
                try {
                    const metadata = fs.readJsonSync(metadataPath);
                    console.log(`Metadata content: ${JSON.stringify(metadata)}`);
                    if (Array.isArray(metadata)) {
                        console.warn(`Metadata is an array, expected an object for session: ${sessionId}, falling back to modern.html`);
                    } else if (metadata.htmlPath) {
                        const cleanHtmlPath = metadata.htmlPath.replace(/^\/+/, '').replace(/\\/g, '/');
                        const candidatePath = path.join(this.__dirname, 'public', cleanHtmlPath);
                        console.log(`Trying candidatePath: ${candidatePath}`);
                        if (fs.existsSync(candidatePath) && candidatePath.endsWith('.html')) {
                            htmlPath = candidatePath;
                            console.log(`Valid htmlPath found: ${htmlPath}`);
                        } else {
                            console.warn(`Invalid or missing HTML file: ${candidatePath}, falling back to modern.html`);
                        }
                    } else {
                        console.warn(`No htmlPath in metadata for session: ${sessionId}, falling back to modern.html`);
                    }
                } catch (error) {
                    console.error(`Error reading metadata at ${metadataPath}:`, error);
                }
            } else {
                console.warn(`No metadata found at ${metadataPath} for session: ${sessionId}, falling back to modern.html`);
            }

            console.log(`Final htmlPath to serve: ${htmlPath}`);
            fs.access(htmlPath, fs.constants.F_OK, (err) => {
                if (err) {
                    console.error(`File not accessible: ${htmlPath}`, err);
                    return res.status(404).send('Page not found');
                }

                fs.readFile(htmlPath, 'utf8', (err, data) => {
                    if (err) {
                        console.error(`Error reading file: ${htmlPath}`, err);
                        return res.status(500).send('Server error');
                    }

                    // Inject sessionId (not alias) for client-side use
                    const script = `<script>localStorage.setItem('sessionId', '${sessionId}');</script>`;
                    const modifiedHtml = data.includes('</body>')
                        ? data.replace('</body>', `${script}</body>`)
                        : `${data}${script}`;

                    res.set('Content-Type', 'text/html');
                    res.send(modifiedHtml);
                    console.log(`Serving gallery for alias: ${alias}, sessionId: ${sessionId}, htmlPath: ${htmlPath}`);
                });
            });
        });

        // Fallback route for other pages
        this.app.get('/:page?', (req, res) => {
            const page = req.params.page || 'index';
            const filePath = path.join(this.__dirname, 'public', `${page}.html`);
            fs.access(filePath, fs.constants.F_OK, (err) => {
                if (err) {
                    return res.status(404).send('Page not found');
                }
                res.sendFile(filePath);
            });
        });
    }

    async handleShareSession(req, res) {
        let sessionId = req.params.sessionId === 'new' ? uuidv4() : req.params.sessionId || uuidv4();
        const sessionDir = path.join(this.outputDir, sessionId);
        console.log(`Generating share link for sessionId: ${sessionId}`);

        try {
            
            if (req.method === 'GET' || (req.method === 'POST' && req.params.sessionId !== 'new')) {
                if (!fs.existsSync(sessionDir)) {
                    return res.status(404).json({ error: 'Session not found' });
                }
            }

            
            const alias = shortid.generate();
            const aliases = await fs.readJson(this.aliasFile);
            aliases[alias] = sessionId;
            await fs.writeJson(this.aliasFile, aliases, { spaces: 2 });
            console.log(` Mapped alias ${alias} to sessionId ${sessionId}`);

           
            if (req.method === 'POST' && req.body.htmlPath) {
                let htmlPath = req.body.htmlPath;
                if (!htmlPath.endsWith('.html')) {
                    htmlPath = htmlPath.replace(/\/$/, '') + '.html';
                }
                const metadataPath = path.join(sessionDir, 'metadata.json');
                let metadataObj = { metadata: [], shared: true, htmlPath };
                if (fs.existsSync(metadataPath)) {
                    try {
                        const existingData = await fs.readJson(metadataPath);
                        if (Array.isArray(existingData)) {
                            metadataObj.metadata = existingData;
                        } else {
                            metadataObj = { ...existingData, shared: true, htmlPath };
                        }
                    } catch (error) {
                        console.error(`Error reading metadata at ${metadataPath}:`, error);
                    }
                }
                await fs.ensureDir(sessionDir);
                await fs.writeJson(metadataPath, metadataObj, { spaces: 2 });
                console.log(`📝 Updated metadata with htmlPath: ${htmlPath}`);
            }

            const shareUrl = `${req.protocol}://${req.get('host')}/gallery/${alias}`;
            res.json({ success: true, sessionId, shareUrl });
        } catch (error) {
            console.error('❌ Error generating share link:', error);
            res.status(500).json({ error: 'Failed to generate share link', details: error.message });
        }
    }

    startServer() {
        this.app.listen(this.PORT, () => {
            console.log(`🚀 Server running at http://localhost:${this.PORT}`);
        });
    }

    async handleGetScreenshots(req, res) {
        let sessionId = req.params.sessionId;
        const sessionDir = path.join(this.outputDir, sessionId);

        
        const aliases = await fs.readJson(this.aliasFile);
        if (aliases[sessionId]) {
            sessionId = aliases[sessionId];
            console.log(`Resolved alias ${req.params.sessionId} to sessionId ${sessionId}`);
        }

        try {
            if (!fs.existsSync(sessionDir)) {
                return res.status(404).json({ error: 'Session not found' });
            }

            const files = await fs.readdir(sessionDir);
            const imageFiles = files.filter(file => file.match(/\.(png|jpg|jpeg)$/i));
            const screenshotUrls = imageFiles.map(file => `/screenshots/${sessionId}/${file}`);

            const metadataPath = path.join(sessionDir, 'metadata.json');
            let metadata = [];
            let sourceUrl = null;

            if (fs.existsSync(metadataPath)) {
                const metadataContent = await fs.readJson(metadataPath);
                
                // Extract source URL if present
                if (metadataContent.sourceUrl) {
                    sourceUrl = metadataContent.sourceUrl;
                }

                if (Array.isArray(metadataContent)) {
                    metadata = metadataContent;
                } else if (metadataContent.metadata) {
                    metadata = metadataContent.metadata;
                }

                // Add sourceUrl to each metadata entry
                if (sourceUrl) {
                    metadata = metadata.map(meta => ({
                        ...meta,
                        sourceUrl: sourceUrl
                    }));
                }
            }

            res.json({ 
                screenshots: screenshotUrls, 
                metadata,
                sourceUrl
            });
        } catch (error) {
            console.error('❌ Error fetching screenshots:', error);
            res.status(500).json({ error: 'Failed to retrieve screenshots' });
        }
    }

    async handleCapture(req, res) {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        const sessionId = uuidv4();
        const sessionDir = path.join(this.outputDir, sessionId);

        await fs.ensureDir(sessionDir);
        console.log(`🌐 Capturing new screenshots for: ${url} in session: ${sessionId}`);

        try {
            await this.captureMockup(url, sessionDir);

            // Store source URL in metadata
            const metadataPath = path.join(sessionDir, 'metadata.json');
            const files = await fs.readdir(sessionDir);
            const imageFiles = files.filter(file => file.match(/\.(png|jpg|jpeg)$/i));

            const metadata = {
                sourceUrl: url,
                capturedAt: new Date().toISOString(),
                shared: false,
                metadata: imageFiles.map(filename => ({
                    filename,
                    title: `Screenshot from ${url}`,
                    description: `Captured section of ${url}`,
                    sourceUrl: url
                }))
            };

            await fs.writeJson(metadataPath, metadata, { spaces: 2 });
            console.log(`📝 Saved metadata with source URL: ${url}`);

            res.json({ 
                success: true, 
                message: `Screenshots captured for ${url}`, 
                sessionId,
                sourceUrl: url,
                fileCount: imageFiles.length
            });
        } catch (error) {
            console.error('❌ Screenshot capture failed:', error);
            res.status(500).json({ error: 'Failed to capture screenshot', details: error.message });
        }
    }

async handleUpload(req, res) {
    const sessionId = req.params.sessionId || uuidv4();
    console.log(`Uploading files for sessionId: ${sessionId}`);
    const sessionDir = path.join(this.outputDir, sessionId);

    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
    }

    try {
        await fs.ensureDir(sessionDir);
        if (req.params.sessionId && fs.existsSync(sessionDir)) {
            await fs.emptyDir(sessionDir);
            console.log(`🗑️ Cleared existing files in session: ${sessionId}`);
        }

        const filePaths = [];
        const metadata = [];

        for (let i = 0; i < req.files.length; i++) {
            const file = req.files[i];
            const ext = path.extname(file.originalname).toLowerCase();
            
            // Handle PowerPoint files
            if (['.ppt', '.pptx', '.odp'].includes(ext)) {
                const tempPptPath = path.join(this.outputDir, `temp_${Date.now()}_${file.originalname}`);
                await fs.writeFile(tempPptPath, file.buffer);
                
                try {
                    const slideImages = await this.convertPptToImages(tempPptPath, sessionDir);
                    
                    slideImages.forEach((slideFile, slideIndex) => {
                        filePaths.push(`/screenshots/${sessionId}/${slideFile}`);
                        metadata.push({ 
                            filename: slideFile, 
                            title: `${req.body.title?.[i] || file.originalname} - Slide ${slideIndex + 1}`,
                            description: req.body.description?.[i] || '',
                            artist: req.body.artist?.[i] || 'Presentation',
                            type: 'image'
                        });
                    });
                    
                    await fs.unlink(tempPptPath);
                    console.log(`✅ PPT processed: ${slideImages.length} slides`);
                } catch (error) {
                    console.error(`Failed to process PPT: ${error}`);
                    await fs.unlink(tempPptPath).catch(() => {});
                }
            }
            // Handle PDF files
            else if (ext === '.pdf') {
                const tempPdfPath = path.join(this.outputDir, `temp_${Date.now()}_${file.originalname}`);
                await fs.writeFile(tempPdfPath, file.buffer);
                
                try {
                    const pageImages = await this.convertPdfToImages(tempPdfPath, sessionDir);
                    
                    pageImages.forEach((pageFile, pageIndex) => {
                        filePaths.push(`/screenshots/${sessionId}/${pageFile}`);
                        metadata.push({ 
                            filename: pageFile, 
                            title: `${req.body.title?.[i] || file.originalname} - Page ${pageIndex + 1}`,
                            description: req.body.description?.[i] || '',
                            artist: req.body.artist?.[i] || 'PDF Document',
                            type: 'image'
                        });
                    });
                    
                    await fs.unlink(tempPdfPath);
                    console.log(`✅ PDF processed: ${pageImages.length} pages`);
                } catch (error) {
                    console.error(`Failed to process PDF: ${error}`);
                    await fs.unlink(tempPdfPath).catch(() => {});
                }
            }
            // ✨ Handle Video files
            else if (['.mp4', '.webm', '.mov', '.avi'].includes(ext)) {
                const filename = `video-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
                const filePath = path.join(sessionDir, filename);
                await fs.writeFile(filePath, file.buffer);
                console.log(`✅ Saved video: ${filePath}`);
                filePaths.push(`/screenshots/${sessionId}/${filename}`);
                
                metadata.push({ 
                    filename, 
                    title: req.body.title?.[i] || file.originalname.replace(ext, ''),
                    description: req.body.description?.[i] || '',
                    artist: req.body.artist?.[i] || 'Video',
                    type: 'video' // ⚠️ CRITICAL: Mark as video
                });
            }
            // Handle regular images
            else if (['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(ext)) {
                const filename = `image-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
                const filePath = path.join(sessionDir, filename);
                await fs.writeFile(filePath, file.buffer);
                console.log(`✅ Saved image: ${filePath}`);
                filePaths.push(`/screenshots/${sessionId}/${filename}`);
                
                metadata.push({ 
                    filename, 
                    title: req.body.title?.[i] || 'Untitled',
                    description: req.body.description?.[i] || '',
                    artist: req.body.artist?.[i] || 'Unknown',
                    type: 'image'
                });
            }
            else {
                console.warn(`⚠️ Unsupported file type: ${ext}`);
            }
        }

        const metadataPath = path.join(sessionDir, 'metadata.json');
        const metadataObj = {
            metadata,
            shared: false,
            htmlPath: null
        };
        await fs.writeJson(metadataPath, metadataObj, { spaces: 2 });
        console.log(`📝 Metadata saved: ${metadataPath}`);

        res.json({
            success: true,
            message: `Uploaded ${filePaths.length} items successfully`,
            sessionId,
            filePaths
        });
    } catch (error) {
        console.error('❌ Error handling upload:', error);
        res.status(500).json({ error: 'Failed to upload files', details: error.message });
    }
}

    async captureMockup(url, sessionDir) {
        console.log(`🌐 Navigating to: ${url}`);
        let browser;
        try {
            browser = await puppeteer.launch({
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-blink-features=AutomationControlled',
                    '--disable-infobars',
                    '--window-size=1440,900',
                ],
            });
            console.log(`✅ Browser launched`);

            const page = await browser.newPage();
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
            await page.evaluateOnNewDocument(() => {
                Object.defineProperty(navigator, 'webdriver', { get: () => false });
                window.navigator.chrome = { runtime: {} };
                Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3] });
                Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
            });
            await page.setViewport({ width: 1440, height: 900 });
            console.log(`✅ Page setup complete`);

            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
            console.log(`✅ Initial navigation complete`);

            try {
                await page.waitForSelector('button', { timeout: 5000 });
                const accepted = await page.evaluate(() => {
                    const buttons = Array.from(document.querySelectorAll('button'));
                    const acceptButton = buttons.find(btn => /accept|consent/i.test(btn.innerText));
                    if (acceptButton) {
                        acceptButton.click();
                        console.log(`✅ Clicked cookie button: ${acceptButton.innerText}`);
                        return true;
                    }
                    return false;
                });
                if (!accepted) console.log("⚠️ No consent button found.");
            } catch (error) {
                console.log("⚠️ No cookie popups detected.");
            }

            await this.waitForDynamicContent(page, 10000);
            await this.autoScroll(page);

            await page.evaluate(() => window.scrollTo(0, 0));
            console.log(`⬆️ Scrolled back to top`);

            let totalHeight = await page.evaluate(() => document.body.scrollHeight);
            const viewportHeight = page.viewport().height;
            let currentPosition = 0;
            let index = 0;

            console.log(`📏 Total height: ${totalHeight}, Viewport height: ${viewportHeight}`);

            while (currentPosition < totalHeight) {
                const screenshotPath = path.join(sessionDir, `section_${index}.png`);
                await page.screenshot({ path: screenshotPath, fullPage: false });
                console.log(`✅ Screenshot captured: ${screenshotPath} at position ${currentPosition}`);
                currentPosition += viewportHeight;
                await page.evaluate((scrollAmount) => window.scrollBy(0, scrollAmount), viewportHeight);
                await new Promise(resolve => setTimeout(resolve, 1000));

                totalHeight = await page.evaluate(() => document.body.scrollHeight);
                console.log(`📏 Updated total height: ${totalHeight}, Current position: ${currentPosition}`);
                index++;
            }

            const fullPagePath = path.join(sessionDir, 'full_page.png');
            await page.screenshot({ path: fullPagePath, fullPage: true });
            console.log(`✅ Full page screenshot captured: ${fullPagePath}`);

            await browser.close();
            console.log('📸 Screenshot capture completed.');
        } catch (error) {
            console.error('❌ Screenshot capture failed:', error);
            if (browser) await browser.close();
            throw error;
        }
    }

    async waitForDynamicContent(page, maxWaitMs) {
        console.log(`⏳ Waiting for dynamic content to load (max ${maxWaitMs}ms)`);
        let previousHeight = 0;
        let stableCount = 0;
        const checkInterval = 1000;
        const maxStableChecks = 3;

        for (let i = 0; i < maxWaitMs / checkInterval; i++) {
            const currentHeight = await page.evaluate(() => document.body.scrollHeight);
            console.log(`📏 Current scroll height: ${currentHeight}`);
            if (currentHeight === previousHeight) {
                stableCount++;
                if (stableCount >= maxStableChecks) {
                    console.log(`✅ Content stable after ${i * checkInterval}ms`);
                    break;
                }
            } else {
                stableCount = 0;
            }
            previousHeight = currentHeight;
            await new Promise(resolve => setTimeout(resolve, checkInterval));
        }
    }

    async autoScroll(page) {
        console.log(`🖱️ Auto-scrolling to load dynamic content`);
        let previousHeight = 0;
        let currentHeight = await page.evaluate(() => document.body.scrollHeight);

        while (previousHeight !== currentHeight) {
            previousHeight = currentHeight;
            await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
            await new Promise(resolve => setTimeout(resolve, 2000));
            currentHeight = await page.evaluate(() => document.body.scrollHeight);
            console.log(`📏 Scrolled to height: ${currentHeight}`);
        }
        console.log(`✅ Auto-scroll complete`);
    }
}

const server = new ScreenshotServer();
server.init();