// Fetch BBC News Topic Data
// This script extracts JSON data from any BBC topic page
// Usage: node fetch-bbc-topic.js <topicId>
// Example: node fetch-bbc-topic.js c2vdnvdg6xxt

const https = require('https');

function fetchBBCTopic(topicId) {
    return new Promise((resolve, reject) => {
        const url = `https://www.bbc.com/news/topics/${topicId}`;

        https.get(url, (res) => {
            let html = '';
            res.on('data', chunk => html += chunk);
            res.on('end', () => {
                try {
                    // BBC embeds the page data as JSON in a script tag with id="__NEXT_DATA__"
                    const jsonMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/s);

                    if (!jsonMatch) {
                        reject(new Error('Could not find JSON data in the page'));
                        return;
                    }

                    const fullData = JSON.parse(jsonMatch[1]);

                    // The page data is stored with a key based on the slug
                    const pageProps = fullData.props?.pageProps;
                    const pageKey = Object.keys(pageProps.page)[0];
                    const pageData = pageProps.page[pageKey];

                    if (!pageData) {
                        reject(new Error('Could not extract page data'));
                        return;
                    }

                    // Get topic info
                    const topicInfo = {
                        id: pageData.id,
                        title: pageData.title,
                        seo: pageData.seo
                    };

                    // Extract news articles from sections
                    const sections = pageData.sections || [];
                    const articles = [];

                    for (const section of sections) {
                        const sectionTitle = section.title || 'Untitled Section';

                        if (section.content) {
                            for (const item of section.content) {
                                articles.push({
                                    section: sectionTitle,
                                    title: item.title,
                                    description: item.description,
                                    href: item.href ? `https://www.bbc.com${item.href}` : null,
                                    image: item.image?.model?.blocks?.src?.replace('/480/', '/1024/') || null,
                                    imageAlt: item.image?.model?.blocks?.altText || null,
                                    contentType: item.metadata?.contentType,
                                    lastUpdated: item.metadata?.lastUpdated ? new Date(item.metadata.lastUpdated).toISOString() : null,
                                    topics: item.metadata?.topics || [],
                                    isLive: item.isLiveNow || false
                                });
                            }
                        }
                    }

                    resolve({
                        topic: topicInfo,
                        articles: articles,
                        totalArticles: articles.length,
                        sections: sections.map(s => ({ title: s.title, count: s.content?.length || 0 })),
                        fetchedAt: new Date().toISOString()
                    });

                } catch (error) {
                    reject(error);
                }
            });
        }).on('error', reject);
    });
}

// Main execution
const topicId = process.argv[2] || 'c2vdnvdg6xxt';

fetchBBCTopic(topicId)
    .then(data => {
        console.log(JSON.stringify(data, null, 2));
    })
    .catch(err => {
        console.error('Failed:', err.message);
        process.exit(1);
    });

// Export for use as module
module.exports = { fetchBBCTopic };
