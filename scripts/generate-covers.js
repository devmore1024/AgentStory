const fs = require('fs');
const path = require('path');
const https = require('https');

const books = [
    {
        title: '小红帽',
        slug: 'fairy-little-red-riding-hood',
        scene: 'vintage storybook illustration of Little Red Riding Hood walking through a dark mysterious forest with ancient trees, shadowy wolf figure in background, intricate line art, watercolor texture, muted burgundy and gold colors, adult fantasy style, masterpiece, high quality, no text'
    },
    {
        title: '白雪公主',
        slug: 'fairy-snow-white',
        scene: 'vintage storybook illustration of a glass coffin in a deep forest clearing surrounded by nature and seven small figures, apple on the ground, intricate line art, watercolor texture, muted colors, adult fantasy style, masterpiece, high quality, no text'
    },
    {
        title: '灰姑娘',
        slug: 'fairy-cinderella',
        scene: 'vintage storybook illustration of a sparkling glass slipper on a stone staircase at midnight, pumpkin carriage fading in distance, intricate line art, watercolor texture, muted colors, adult fantasy style, masterpiece, high quality, no text'
    }
];

function downloadImage(url, outputPath) {
    return new Promise((resolve, reject) => {
        const request = https.get(url, (response) => {
            if (response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 307 || response.statusCode === 308) {
                const redirectUrl = response.headers.location;
                console.log(`Redirecting to: ${redirectUrl}`);
                downloadImage(redirectUrl, outputPath).then(resolve).catch(reject);
                return;
            }

            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download image: ${response.statusCode}`));
                return;
            }

            const file = fs.createWriteStream(outputPath);
            response.pipe(file);

            file.on('finish', () => {
                file.close();
                console.log(`Image saved to ${outputPath}`);
                resolve();
            });
        });

        request.on('error', (err) => {
            fs.unlink(outputPath, () => {});
            reject(err);
        });
    });
}

async function generateImage(prompt, outputPath) {
    console.log(`Generating image for prompt: "${prompt}"...`);
    
    // 使用 Pollinations AI (免费无需 Key)
    // 添加 seed 以保证每次生成不同（或者相同，如果需要固定）
    const seed = Math.floor(Math.random() * 1000000);
    const encodedPrompt = encodeURIComponent(prompt);
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}`;
    
    try {
        await downloadImage(url, outputPath);
    } catch (e) {
        console.error('Error generating image:', e);
    }
}

async function main() {
    // 创建目录
    const dir = path.dirname(path.resolve(__dirname, `../public/covers/test.png`));
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }

    for (const book of books) {
        const outputPath = path.resolve(__dirname, `../public/covers/${book.slug}.png`);
        console.log(`Processing ${book.title}...`);
        await generateImage(book.scene, outputPath);
    }
}

main();
