/**
 * UFC Roster Scraper
 * Scrapes all UFC fighters from the UFC website
 */

export interface UFCFighterInfo {
  slug: string;
  firstName: string;
  lastName: string;
  nickname: string | null;
  weightClass: string;
  record: {
    wins: number;
    losses: number;
    draws: number;
  };
  imageUrl: string | null;
  country: string;
}

export class UFCRosterScraper {
  private readonly BASE_URL = 'https://www.ufc.com';
  
  // Weight classes to scrape
  private readonly WEIGHT_CLASSES = [
    { name: 'Strawweight', slug: 'strawweight' },
    { name: 'Flyweight', slug: 'flyweight' },
    { name: 'Bantamweight', slug: 'bantamweight' },
    { name: 'Featherweight', slug: 'featherweight' },
    { name: 'Lightweight', slug: 'lightweight' },
    { name: 'Welterweight', slug: 'welterweight' },
    { name: 'Middleweight', slug: 'middleweight' },
    { name: 'Light Heavyweight', slug: 'light-heavyweight' },
    { name: 'Heavyweight', slug: 'heavyweight' },
    { name: "Women's Strawweight", slug: 'womens-strawweight' },
    { name: "Women's Flyweight", slug: 'womens-flyweight' },
    { name: "Women's Bantamweight", slug: 'womens-bantamweight' },
    { name: "Women's Featherweight", slug: 'womens-featherweight' },
  ];

  /**
   * Scrape all fighters from UFC sitemap (fastest and most complete method)
   */
  async scrapeAllFighters(): Promise<UFCFighterInfo[]> {
    const allFighters: UFCFighterInfo[] = [];
    const allSlugs: string[] = [];
    
    console.info('🔍 Starting UFC roster scrape via sitemap...');
    
    // Step 1: Get all athlete slugs from sitemap
    const maxSitemapPages = 50;
    for (let page = 1; page <= maxSitemapPages; page++) {
      try {
        const response = await fetch(`${this.BASE_URL}/sitemap.xml?page=${page}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        });
        
        if (!response.ok) break;
        
        const xml = await response.text();
        
        // Extract athlete slugs from sitemap
        const slugRegex = /<loc>https:\/\/www\.ufc\.com\/athlete\/([^<]+)<\/loc>/g;
        let match;
        let pageCount = 0;
        
        while ((match = slugRegex.exec(xml)) !== null) {
          const slug = match[1].trim();
          if (slug && !slug.includes('"') && !allSlugs.includes(slug)) {
            allSlugs.push(slug);
            pageCount++;
          }
        }
        
        if (pageCount === 0) {
          console.info(`  📄 Sitemap page ${page}: no athletes, stopping`);
          break;
        }
        
        console.info(`  📄 Sitemap page ${page}: ${pageCount} athletes (total: ${allSlugs.length})`);
        
        await this.delay(100);
      } catch (error) {
        console.error(`Error fetching sitemap page ${page}:`, error);
        break;
      }
    }
    
    console.info(`📋 Found ${allSlugs.length} athlete slugs in sitemap`);
    
    // Step 2: Convert slugs to fighter info
    for (const slug of allSlugs) {
      const nameParts = slug.split('-');
      const firstName = this.capitalize(nameParts[0] || '');
      const lastName = nameParts.slice(1).map(p => this.capitalize(p)).join(' ');
      
      if (firstName && lastName) {
        allFighters.push({
          slug,
          firstName,
          lastName,
          nickname: null,
          weightClass: 'Unknown',
          record: { wins: 0, losses: 0, draws: 0 },
          imageUrl: null,
          country: 'Unknown',
        });
      }
    }
    
    console.info(`✅ Total fighters from sitemap: ${allFighters.length}`);
    
    return allFighters;
  }

  /**
   * Scrape fighters from a roster page
   */
  private async scrapeRosterPage(page: number = 0): Promise<UFCFighterInfo[]> {
    const fighters: UFCFighterInfo[] = [];
    
    try {
      const response = await fetch(`${this.BASE_URL}/athletes/all?page=${page}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });
      
      if (!response.ok) {
        console.error(`Failed to fetch roster page ${page}: ${response.status}`);
        return fighters;
      }
      
      const html = await response.text();
      
      // Find all athlete cards with name, record, and weight class
      // Pattern: find flipcard blocks with athlete info
      const cardRegex = /<div class="c-listing-athlete-flipcard[^"]*white">\s*<div class="c-listing-athlete-flipcard__inner">[\s\S]*?<span class="c-listing-athlete__name">\s*([^<]+)\s*<\/span>[\s\S]*?<div class="field__item">([^<]*)<\/div>[\s\S]*?<span class="c-listing-athlete__record">([^<]*)<\/span>[\s\S]*?href="\/athlete\/([^"]+)"/g;
      
      let match;
      const seen = new Set<string>();
      
      while ((match = cardRegex.exec(html)) !== null) {
        const [, fullName, weightClass, recordStr, slug] = match;
        
        // Skip duplicates within the same page
        if (seen.has(slug)) continue;
        seen.add(slug);
        
        // Parse name
        const nameParts = fullName.trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        // Parse record (format: "12-5-0 (W-L-D)")
        const recordMatch = recordStr.match(/(\d+)-(\d+)-(\d+)/);
        const record = recordMatch 
          ? { wins: parseInt(recordMatch[1]), losses: parseInt(recordMatch[2]), draws: parseInt(recordMatch[3]) }
          : { wins: 0, losses: 0, draws: 0 };
        
        fighters.push({
          slug: slug.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          nickname: null,
          weightClass: weightClass.trim() || 'Unknown',
          record,
          imageUrl: null,
          country: 'Unknown',
        });
      }
      
      // If the card regex didn't work well, try a simpler pattern
      if (fighters.length === 0) {
        const simpleRegex = /href="\/athlete\/([^"]+)"[^>]*>View Profile<\/a>/g;
        const slugs: string[] = [];
        
        while ((match = simpleRegex.exec(html)) !== null) {
          const slug = match[1];
          if (!seen.has(slug)) {
            seen.add(slug);
            slugs.push(slug);
          }
        }
        
        // Convert slugs to fighter info
        for (const slug of slugs) {
          const nameParts = slug.split('-');
          const firstName = this.capitalize(nameParts[0] || '');
          const lastName = nameParts.slice(1).map(p => this.capitalize(p)).join(' ');
          
          fighters.push({
            slug,
            firstName,
            lastName,
            nickname: null,
            weightClass: 'Unknown',
            record: { wins: 0, losses: 0, draws: 0 },
            imageUrl: null,
            country: 'Unknown',
          });
        }
      }
      
    } catch (error) {
      console.error(`Error scraping roster page ${page}:`, error);
    }
    
    return fighters;
  }

  /**
   * Scrape detailed info for a single fighter
   */
  async scrapeFighterDetails(slug: string): Promise<Partial<UFCFighterInfo> | null> {
    try {
      const response = await fetch(`${this.BASE_URL}/athlete/${slug}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });
      
      if (!response.ok) {
        return null;
      }
      
      const html = await response.text();
      
      // Extract nickname
      const nicknameMatch = html.match(/<p class="hero-profile__nickname">"([^"]+)"<\/p>/);
      const nickname = nicknameMatch ? nicknameMatch[1] : null;
      
      // Extract weight class
      const weightClassMatch = html.match(/<p class="hero-profile__tag">\s*([^<]+)\s*Division/);
      const weightClass = weightClassMatch ? weightClassMatch[1].trim() : 'Unknown';
      
      // Extract country from bio
      const countryMatch = html.match(/Venant de[\s\S]*?<dd class="c-bio__text">([^,<]+)/i) ||
                          html.match(/Fighting out of[\s\S]*?<dd class="c-bio__text">([^,<]+)/i);
      const country = countryMatch ? countryMatch[1].trim() : 'Unknown';
      
      // Extract headshot image
      const imageMatch = html.match(/event_results_athlete_headshot[^"]*\/([^"?]+)/);
      const imageUrl = imageMatch 
        ? `https://ufc.com/images/styles/event_results_athlete_headshot/s3/${imageMatch[1]}`
        : null;
      
      return {
        nickname,
        weightClass,
        country,
        imageUrl,
      };
      
    } catch (error) {
      console.error(`Error scraping fighter ${slug}:`, error);
      return null;
    }
  }

  /**
   * Scrape top fighters (champions and ranked fighters) from rankings page
   */
  async scrapeTopFighters(): Promise<UFCFighterInfo[]> {
    const fighters: UFCFighterInfo[] = [];
    
    console.info('🔍 Scraping top UFC fighters from rankings...');
    
    try {
      const response = await fetch(`${this.BASE_URL}/rankings`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });
      
      if (!response.ok) {
        console.error(`Failed to fetch rankings: ${response.status}`);
        return fighters;
      }
      
      const html = await response.text();
      
      // Find all athlete links with names
      // Pattern: href="/athlete/slug"...>Name Lastname</a>
      const athleteRegex = /<a[^>]*href="\/athlete\/([^"]+)"[^>]*class="[^"]*e-button--black[^"]*"[^>]*>[\s\S]*?<\/a>|<a[^>]*href="\/athlete\/([^"]+)"[^>]*>([^<]+)<\/a>/g;
      
      let match;
      while ((match = athleteRegex.exec(html)) !== null) {
        const slug = (match[1] || match[2] || '').trim();
        const name = (match[3] || '').trim();
        
        if (!slug || slug.includes('/')) continue;
        
        // Parse name from slug if not available
        let firstName = '';
        let lastName = '';
        
        if (name && name.length > 2 && !name.includes('<')) {
          const nameParts = name.split(' ');
          firstName = nameParts[0] || '';
          lastName = nameParts.slice(1).join(' ') || '';
        } else {
          const slugParts = slug.split('-');
          firstName = this.capitalize(slugParts[0] || '');
          lastName = slugParts.slice(1).map(p => this.capitalize(p)).join(' ');
        }
        
        if (firstName && lastName) {
          fighters.push({
            slug,
            firstName,
            lastName,
            nickname: null,
            weightClass: 'Unknown',
            record: { wins: 0, losses: 0, draws: 0 },
            imageUrl: null,
            country: 'Unknown',
          });
        }
      }
      
      console.info(`✅ Found ${fighters.length} fighters from rankings`);
      
    } catch (error) {
      console.error('Error scraping rankings:', error);
    }
    
    return this.removeDuplicates(fighters);
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  /**
   * Scrape records for all fighters from roster pages
   * Returns a map of slug -> record
   */
  async scrapeAllRecords(): Promise<Map<string, { wins: number; losses: number; draws: number; weightClass: string }>> {
    const records = new Map<string, { wins: number; losses: number; draws: number; weightClass: string }>();
    
    console.info('📊 Scraping fighter records from roster pages...');
    
    const maxPages = 50;
    let page = 0;
    let hasMorePages = true;
    
    while (hasMorePages && page < maxPages) {
      try {
        const response = await fetch(`${this.BASE_URL}/athletes/all?page=${page}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml',
            'Accept-Language': 'en-US,en;q=0.9',
          },
        });
        
        if (!response.ok) {
          hasMorePages = false;
          continue;
        }
        
        const html = await response.text();
        
        // Find athlete cards with slug, record, and weight class
        // Pattern: href="/athlete/slug"...record...weight class
        const cardRegex = /href="\/athlete\/([^"]+)"[^>]*>View Profile[\s\S]*?<span class="c-listing-athlete__record">([^<]*)<\/span>/g;
        
        let match;
        let pageCount = 0;
        
        while ((match = cardRegex.exec(html)) !== null) {
          const [, slug, recordStr] = match;
          
          // Parse record (format: "12-5-0 (W-L-D)")
          const recordMatch = recordStr.match(/(\d+)-(\d+)-(\d+)/);
          if (recordMatch) {
            records.set(slug.trim(), {
              wins: parseInt(recordMatch[1]),
              losses: parseInt(recordMatch[2]),
              draws: parseInt(recordMatch[3]),
              weightClass: 'Unknown',
            });
            pageCount++;
          }
        }
        
        // Also try to extract weight class
        const wcRegex = /<span class="c-listing-athlete__title">[\s\S]*?<div class="field__item">([^<]+)<\/div>[\s\S]*?href="\/athlete\/([^"]+)"/g;
        while ((match = wcRegex.exec(html)) !== null) {
          const [, weightClass, slug] = match;
          const existing = records.get(slug.trim());
          if (existing) {
            existing.weightClass = weightClass.trim();
          }
        }
        
        if (pageCount === 0) {
          // Try alternate pattern
          const altRegex = /<span class="c-listing-athlete__name">\s*([^<]+)\s*<\/span>[\s\S]*?<span class="c-listing-athlete__record">([^<]*)<\/span>[\s\S]*?href="\/athlete\/([^"]+)"/g;
          while ((match = altRegex.exec(html)) !== null) {
            const [, , recordStr, slug] = match;
            const recordMatch = recordStr.match(/(\d+)-(\d+)-(\d+)/);
            if (recordMatch) {
              records.set(slug.trim(), {
                wins: parseInt(recordMatch[1]),
                losses: parseInt(recordMatch[2]),
                draws: parseInt(recordMatch[3]),
                weightClass: 'Unknown',
              });
              pageCount++;
            }
          }
        }
        
        if (pageCount === 0) {
          console.info(`  📄 Page ${page}: no records found, stopping`);
          hasMorePages = false;
        } else {
          console.info(`  📄 Page ${page}: ${pageCount} records (total: ${records.size})`);
          page++;
          await this.delay(200);
        }
        
      } catch (error) {
        console.error(`Error scraping page ${page}:`, error);
        hasMorePages = false;
      }
    }
    
    console.info(`✅ Total records scraped: ${records.size}`);
    return records;
  }

  private removeDuplicates(fighters: UFCFighterInfo[]): UFCFighterInfo[] {
    const seen = new Set<string>();
    return fighters.filter(f => {
      if (seen.has(f.slug)) return false;
      seen.add(f.slug);
      return true;
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

