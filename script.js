document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const topicInfo = document.getElementById('topicInfo');
    const loader = document.getElementById('loader');

    // Wikipedia API endpoint
    const WIKIPEDIA_API = 'https://en.wikipedia.org/w/api.php';

    function showLoader() {
        loader.classList.remove('hidden');
        if (topicInfo) {
            topicInfo.classList.add('hidden');
        }
    }

    function hideLoader() {
        loader.classList.add('hidden');
    }

    async function searchTopic(query) {
        try {
            showLoader();
            
            // Process the query to handle questions
            const processedQuery = processSearchQuery(query);
            const wikiData = await fetchWikipediaData(processedQuery);
            
            if (wikiData && wikiData.extract) {
                updateUI(query, processedQuery, wikiData);
                topicInfo.classList.remove('hidden');
            } else {
                throw new Error('No information found');
            }
            
            hideLoader();
        } catch (error) {
            console.error('Error:', error);
            hideLoader();
            topicInfo.innerHTML = `
                <div class="content-card error-card">
                    <h3 class="card-title">Sorry!</h3>
                    <p>No information found for "${query}". Please try another search.</p>
                </div>
            `;
            topicInfo.classList.remove('hidden');
        }
    }

    function processSearchQuery(query) {
        // Remove question words and clean up the query
        const questionWords = ['what', 'who', 'where', 'when', 'why', 'how', 'is', 'are', 'was', 'were'];
        let processedQuery = query.toLowerCase();
        
        // Remove question marks and common question words
        processedQuery = processedQuery.replace('?', '');
        questionWords.forEach(word => {
            processedQuery = processedQuery.replace(new RegExp(`^${word}\\s+(?:is|are|was|were)?\\s+`, 'i'), '');
        });

        // Clean up "law of" or similar phrases
        processedQuery = processedQuery.replace(/^the\s+/, '');
        
        return processedQuery.trim();
    }

    async function fetchWikipediaData(topic) {
        const params = new URLSearchParams({
            action: 'query',
            format: 'json',
            titles: topic,
            prop: 'extracts|pageimages|sections',
            exintro: false,
            explaintext: true,
            piprop: 'original',
            origin: '*',
            redirects: 1
        });

        try {
            const response = await fetch(`${WIKIPEDIA_API}?${params}`);
            const data = await response.json();
            const pages = data.query.pages;
            const pageId = Object.keys(pages)[0];
            return pages[pageId];
        } catch (error) {
            console.error('Wikipedia API Error:', error);
            throw new Error('Failed to fetch data');
        }
    }

    function updateUI(originalQuery, processedQuery, wikiData) {
        // Create content container
        const mainContent = document.createElement('div');
        mainContent.className = 'main-content-container';

        // Format the title based on whether it was a question
        const isQuestion = originalQuery.includes('?') || /^(what|who|where|when|why|how|is|are|was|were)\s/.test(originalQuery.toLowerCase());
        const displayTitle = isQuestion ? originalQuery : `About: ${originalQuery}`;

        // Split content into introduction and details
        const contentParts = wikiData.extract.split('\n\n');
        const introduction = contentParts[0];
        const details = contentParts.slice(1).join('\n\n');

        mainContent.innerHTML = `
            <div class="content-card question-card">
                <h3 class="card-title">${displayTitle}</h3>
                <div class="answer-section">
                    <h4>Quick Answer</h4>
                    <p class="quick-answer">${introduction}</p>
                </div>
            </div>

            <div class="content-card detailed-card">
                <h4>Detailed Explanation</h4>
                <div class="detailed-answer">
                    ${formatDetailedAnswer(details)}
                </div>
            </div>

            <div class="action-buttons">
                <button class="action-btn print" onclick="window.print()">
                    <span>Print Answer</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M6 9V2h12v7"/>
                        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                        <path d="M6 14h12v8H6z"/>
                    </svg>
                </button>
            </div>
        `;

        // Clear previous content and add new content
        topicInfo.innerHTML = '';
        topicInfo.appendChild(mainContent);
    }

    function formatDetailedAnswer(text) {
        return text.split('\n\n')
            .map(paragraph => `<p>${paragraph}</p>`)
            .join('');
    }

    // Event Listeners
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const query = searchInput.value.trim();
            if (query) {
                searchTopic(query);
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                if (query) {
                    searchTopic(query);
                }
            }
        });
    }
});