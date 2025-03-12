/**
 * Scores articles based on user preferences and interactions
 */
export const scoreArticles = (articles, userPreferences, userInteractions) => {
    return articles.map(article => {
      let score = 50; // Base score
      
      // Topic match
      const topicMatch = userPreferences.some(pref => 
        article.article.topics.includes(pref.topic)
      );
      if (topicMatch) score += 20;
      
      // Keyword match
      const keywords = userPreferences.flatMap(pref => pref.keywords || []);
      const keywordMatches = keywords.filter(keyword => 
        article.article.title.toLowerCase().includes(keyword.toLowerCase()) || 
        article.summary.toLowerCase().includes(keyword.toLowerCase())
      ).length;
      score += keywordMatches * 5;
      
      // Source preference
      const sources = userPreferences.flatMap(pref => pref.preferred_sources || []);
      if (sources.includes(article.article.source)) {
        score += 10;
      }
      
      // Recency bonus (within last 24 hours)
      const isRecent = new Date(article.article.published_at) > 
                       new Date(Date.now() - 24 * 60 * 60 * 1000);
      if (isRecent) score += 15;
      
      // Sentiment alignment (if user has shown preference)
      const userSentimentPreference = getUserSentimentPreference(userInteractions);
      if (userSentimentPreference && article.sentiment === userSentimentPreference) {
        score += 10;
      }
      
      return {
        ...article,
        relevanceScore: score
      };
    }).sort((a, b) => b.relevanceScore - a.relevanceScore);
  };
  
  // Helper to determine user's sentiment preference based on their interactions
  const getUserSentimentPreference = (interactions) => {
    if (!interactions || interactions.length < 5) return null;
    
    const sentimentCounts = interactions.reduce((counts, interaction) => {
      if (interaction.is_read || interaction.is_saved) {
        const sentiment = interaction.article.processed_article.sentiment;
        counts[sentiment] = (counts[sentiment] || 0) + 1;
      }
      return counts;
    }, {});
    
    // Find most common sentiment in interactions
    let maxCount = 0;
    let preferredSentiment = null;
    
    Object.entries(sentimentCounts).forEach(([sentiment, count]) => {
      if (count > maxCount) {
        maxCount = count;
        preferredSentiment = sentiment;
      }
    });
    
    return preferredSentiment;
  };