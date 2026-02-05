const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '../temp_menu_source.html');
const html = fs.readFileSync(htmlPath, 'utf8');

const categories = [];

// Split by menu-list divs. 
// Note: This matches the start of a category block roughly.
const categoryParts = html.split('<div class="menu-list" id="menu-list-');

// Skip the first part which is before the first category
for (let i = 1; i < categoryParts.length; i++) {
    const part = categoryParts[i];

    // Extract Category Name
    const nameMatch = part.match(/<div class="category-name">([^<]+)<\/div>/);
    if (!nameMatch) continue;
    const categoryName = nameMatch[1].trim();

    // Extract items blocks (class="card ...")
    // simple split by class="card
    const itemParts = part.split('class="card');

    const items = [];

    // Skip first part (before first card)
    for (let j = 1; j < itemParts.length; j++) {
        const itemHtml = itemParts[j];

        // Extract Data attributes from button
        const idMatch = itemHtml.match(/data-item-id="([^"]+)"/);
        const nameMatch = itemHtml.match(/data-item-name="([^"]+)"/);
        const priceMatch = itemHtml.match(/data-item-price="([^"]+)"/);
        const imgMatch = itemHtml.match(/data-item-img="([^"]+)"/);

        // Extract Description from the item div
        // The item div usually comes before the button in the HTML structure we saw
        // <div ... data-desc="..." ...>
        const descMatch = itemHtml.match(/data-desc="([^"]*)"/);

        // Extract Image from src if data-item-img is missing (fallback)
        // itemHtml usually starts with ' m-2 p-2"> ... <img src="..."'
        // But data-item-img seems reliable.

        if (nameMatch && priceMatch) {
            items.push({
                externalId: idMatch ? idMatch[1] : null,
                name: nameMatch[1],
                description: descMatch ? descMatch[1] : "",
                price: parseFloat(priceMatch[1]),
                imageUrl: imgMatch ? imgMatch[1] : "",
                // Clean up name if it has HTML entities (basic check)
            });
        }
    }

    if (items.length > 0) {
        categories.push({
            name: categoryName,
            items: items
        });
    }
}

const outputPath = path.join(__dirname, '../kroren_scraped_data.json');
fs.writeFileSync(outputPath, JSON.stringify({ categories }, null, 2));
console.log(`Parsed ${categories.length} categories and saved to ${outputPath}`);
