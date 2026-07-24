import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CACHE_DIR = path.join(__dirname, '.cache');
const OUTPUT_FILE = path.join(__dirname, '../src/db/seed-data/product-options-scraped.ts');

const labelToOption: Record<string, string> = {
  'Nóng': 'Nóng',
  'HOT': 'Nóng',
  'Nóng (size M)': 'Nóng',
  'Nóng (size L)': 'Size vừa',
  'Lạnh': 'Lạnh',
  'Lạnh (Size M)': 'Lạnh',
  'Lạnh (size M)': 'Lạnh',
  'Lạnh(Size M)': 'Lạnh',
  'Lạnh (size S)': 'Size nhỏ',
  'COLD (SIZE S)': 'Size nhỏ',
  'SIZE M': 'Size nhỏ',
  'Lạnh (Size L)': 'Size vừa',
  'Lạnh (size L)': 'Size vừa',
  'SIZE L': 'Size vừa',
};

// Helper to decode HTML entities like &quot;
function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&#243;/g, 'ó')
    .replace(/&#225;/g, 'á')
    .replace(/&#226;/g, 'â')
    .replace(/&#234;/g, 'ê')
    .replace(/&#244;/g, 'ô')
    .replace(/&#249;/g, 'ù')
    .replace(/&#250;/g, 'ú');
}

async function fetchPage(slug: string): Promise<string> {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }

  const cachePath = path.join(CACHE_DIR, `${slug}.html`);
  if (fs.existsSync(cachePath)) {
    return fs.readFileSync(cachePath, 'utf8');
  }

  const url = `http://www.thuccoffee.com.vn/menu/${slug}`;
  console.log(`Fetching: ${url}`);
  
  let attempts = 0;
  while (attempts < 3) {
    try {
      const res = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        timeout: 10000,
      });
      fs.writeFileSync(cachePath, res.data);
      // Delay 400ms
      await new Promise((r) => setTimeout(r, 400));
      return res.data;
    } catch (err) {
      attempts++;
      console.warn(`Attempt ${attempts} failed for ${slug}: ${(err as Error).message}`);
      if (attempts >= 3) throw err;
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  throw new Error(`Failed to fetch ${slug}`);
}

interface ScrapedOption {
  label: string;
  option: string;
  price: number;
}

interface ProductInfo {
  name: string;
  slug: string;
  price: number;
}

async function main() {
  // Read products file as string to avoid compiler rootDir check violation
  const productsFilePath = path.join(__dirname, '../../../src/data/products.ts');
  const fileText = fs.readFileSync(productsFilePath, 'utf8');

  const products: ProductInfo[] = [];
  const productBlocks = fileText.split('},');
  for (const block of productBlocks) {
    const nameMatch = block.match(/name:\s*['"]([^'"]+)['"]/);
    const slugMatch = block.match(/slug:\s*['"]([^'"]+)['"]/);
    const priceMatch = block.match(/price:\s*(\d+)/);
    if (nameMatch && slugMatch && priceMatch && nameMatch[1] && slugMatch[1] && priceMatch[1]) {
      products.push({
        name: nameMatch[1],
        slug: slugMatch[1],
        price: parseInt(priceMatch[1], 10),
      });
    }
  }

  console.log(`Starting scrape of ${products.length} products parsed from products.ts...`);
  
  const scrapedData: Record<string, ScrapedOption[]> = {};
  let multiPriceCount = 0;
  let singlePriceCount = 0;
  let totalLinksCount = 0;
  const uniqueLabels = new Set<string>();

  for (const product of products) {
    try {
      const html = await fetchPage(product.slug);
      
      // Look for ng-init="initDetailsPage('...')"
      const match = html.match(/ng-init="initDetailsPage\('([^']+)'\)"/);
      if (!match) {
        // No option initialization found
        singlePriceCount++;
        continue;
      }

      const decodedJson = decodeHtmlEntities(match[1]!);
      const data = JSON.parse(decodedJson);
      
      const selectedOptions = data.SelectedOptions || [];
      
      // Filter out empty options (if any)
      const validOptions = selectedOptions.filter((o: any) => o.ITL_Name && o.ITL_Name.trim());
      
      if (validOptions.length <= 1) {
        singlePriceCount++;
        continue;
      }

      const productOptions: ScrapedOption[] = [];
      const seenOptionTypes = new Set<string>();

      for (const opt of validOptions) {
        const label = opt.ITL_Name.trim();
        uniqueLabels.add(label);

        const optionName = labelToOption[label] as string | undefined;
        if (!optionName) {
          console.error(`ERROR: Label "${label}" on product "${product.slug}" is not mapped!`);
          process.exit(1);
        }

        if (seenOptionTypes.has(optionName)) {
          console.error(`ERROR: Duplicate option type "${optionName}" on product "${product.slug}" (Label: "${label}")! PK violation risk.`);
          process.exit(1);
        }
        seenOptionTypes.add(optionName);

        const price = Math.round(opt.ITL_PriceAmount);
        productOptions.push({
          label,
          option: optionName,
          price,
        });
        totalLinksCount++;
      }

      scrapedData[product.slug] = productOptions;
      multiPriceCount++;

      // Spot check price comparison
      const minPrice = Math.min(...productOptions.map(o => o.price));
      if (minPrice !== product.price) {
        console.warn(`[Price Warning] ${product.slug}: Local base price is ${product.price}, but min scraped option price is ${minPrice}`);
      }

    } catch (err) {
      console.error(`Failed to process ${product.slug}:`, err);
      process.exit(1);
    }
  }

  console.log('\n--- Scrape Summary ---');
  console.log(`Products processed: ${products.length}`);
  console.log(`Products with multiple prices (options): ${multiPriceCount}`);
  console.log(`Products with single price: ${singlePriceCount}`);
  console.log(`Total option links scraped: ${totalLinksCount}`);
  console.log(`Distinct labels found: ${uniqueLabels.size}`);
  
  // Verify distribution of mapped option types
  const typeCounts: Record<string, number> = { 'Lạnh': 0, 'Nóng': 0, 'Size nhỏ': 0, 'Size vừa': 0 };
  for (const list of Object.values(scrapedData)) {
    for (const item of list) {
      const count = typeCounts[item.option];
      if (count !== undefined) {
        typeCounts[item.option] = count + 1;
      }
    }
  }
  console.log('Option type distribution:', typeCounts);

  // Write file output
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const fileContent = `// Cào từ thuccoffee.com.vn ngày ${new Date().toISOString().split('T')[0]}. Snapshot, không phải chân lý.
// 42 sản phẩm: ${multiPriceCount} có option, ${singlePriceCount} một giá, ${totalLinksCount} link.

export const scrapedOptionCatalog = ['Lạnh', 'Nóng', 'Size nhỏ', 'Size vừa'];

export const labelToOption: Record<string, string> = ${JSON.stringify(labelToOption, null, 2)};

export const scrapedProductOptions: Record<string, {
  label: string;
  option: string;
  price: number;
}[]> = ${JSON.stringify(scrapedData, null, 2)};
`;

  fs.writeFileSync(OUTPUT_FILE, fileContent);
  console.log(`Saved output to ${OUTPUT_FILE}`);
}

main();
