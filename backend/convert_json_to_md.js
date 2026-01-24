
const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'src/data/kroren_scraped.json');
const outputPath = path.join(__dirname, '../kroren_menu.md');

try {
    const rawData = fs.readFileSync(inputPath, 'utf8');
    const products = JSON.parse(rawData);

    // Group by category
    const productsByCategory = {};
    products.forEach(product => {
        if (!productsByCategory[product.category]) {
            productsByCategory[product.category] = [];
        }
        productsByCategory[product.category].push(product);
    });

    let markdownContent = '# Kroren Menü\n\n';

    for (const [category, items] of Object.entries(productsByCategory)) {
        markdownContent += `## ${category}\n\n`;
        items.forEach(item => {
            markdownContent += `### ${item.name}\n`;
            markdownContent += `- **Fiyat:** ${item.price}\n`;
            markdownContent += `- **Açıklama:** ${item.description || 'Açıklama yok'}\n\n`;
        });
    }

    fs.writeFileSync(outputPath, markdownContent);
    console.log(`Successfully created ${outputPath}`);
} catch (error) {
    console.error('Error converting menu:', error);
}
