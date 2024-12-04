document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const topicInfo = document.getElementById('topicInfo');
    const loader = document.getElementById('loader');
    const topicTitle = document.getElementById('topicTitle');
    const definition = document.getElementById('definition');
    const imageGallery = document.getElementById('imageGallery');
    const summary = document.getElementById('summary');

    // Modified Wikipedia API endpoint to use MediaWiki API
    const WIKIPEDIA_API = 'https://en.wikipedia.org/w/api.php';

    async function searchTopic(topic) {
        try {
            showLoader();
            
            // Fetch Wikipedia summary using modified approach
            const wikiData = await fetchWikipediaData(topic);
            
            // Update UI with results
            updateUI(topic, wikiData);
            
            hideLoader();
            topicInfo.classList.remove('hidden');
        } catch (error) {
            console.error('Error:', error);
            hideLoader();
            alert('An error occurred while fetching the data. Please try again.');
        }
    }

    async function fetchWikipediaData(topic) {
        const params = new URLSearchParams({
            action: 'query',
            format: 'json',
            titles: topic,
            prop: 'extracts|pageimages',
            exintro: true,
            explaintext: true,
            piprop: 'original',
            origin: '*',
            redirects: 1
        });

        try {
            const response = await fetch(`${WIKIPEDIA_API}?${params}`);
            const data = await response.json();
            
            if (!data.query || !data.query.pages) {
                throw new Error('No results found');
            }

            const pages = data.query.pages;
            const pageId = Object.keys(pages)[0];
            const page = pages[pageId];

            if (pageId === '-1') {
                return {
                    extract: 'No information found for this topic.',
                    image: null
                };
            }

            return {
                extract: page.extract || 'No detailed information available.',
                image: page.original ? page.original.source : null
            };
        } catch (error) {
            console.error('Wikipedia API Error:', error);
            return {
                extract: 'Error fetching information. Please try again.',
                image: null
            };
        }
    }

    function updateUI(topic, wikiData) {
        topicTitle.textContent = topic;
        
        // Update definition and summary
        const fullText = wikiData.extract;
        const shortDefinition = fullText.split('.')[0] + '.';
        definition.textContent = shortDefinition;
        summary.textContent = fullText;

        // Update image gallery
        imageGallery.innerHTML = '';
        if (wikiData.image) {
            const img = document.createElement('img');
            img.src = wikiData.image;
            img.alt = topic;
            imageGallery.appendChild(img);
        } else {
            imageGallery.innerHTML = '<p>No images available for this topic.</p>';
        }
    }

    function showLoader() {
        loader.classList.remove('hidden');
        topicInfo.classList.add('hidden');
    }

    function hideLoader() {
        loader.classList.add('hidden');
    }

    // Event Listeners
    searchBtn.addEventListener('click', () => {
        const topic = searchInput.value.trim();
        if (topic) {
            searchTopic(topic);
        }
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const topic = searchInput.value.trim();
            if (topic) {
                searchTopic(topic);
            }
        }
    });
}); 