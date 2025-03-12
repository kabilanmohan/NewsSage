import { useState, useEffect } from 'react';
import { useUserId } from '@nhost/react';
import { useQuery, gql } from '@apollo/client';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import ArticleCard from '../components/ArticleCard';
import LoadingSpinner from '../components/LoadingSpinner';

// Define the GET_USER_NEWS query based on your actual schema
const GET_USER_NEWS = gql`
  query GetUserNews($userId: uuid!) {
    user_profiles(where: {id: {_eq: $userId}}) {
      display_name
    }
    
    # Get user preferences
    user_preferences(where: {user_id: {_eq: $userId}}) {
      id
      topic
      keywords
      preferred_sources
    }
    
    # Query processed articles with no limit (we'll handle pagination in code)
    processed_articles(
      order_by: {processed_at: desc}
    ) {
      id
      summary
      sentiment
      sentiment_explanation
      processed_at
      article_id
    }
    
    # Query news articles separately
    news_articles {
      id
      title
      url
      source
      content
      published_at
      topics
    }
    
    # Query user interactions separately
    user_article_interactions(where: {user_id: {_eq: $userId}}) {
      article_id
      is_read
      is_saved
    }
  }
`;

const Dashboard = () => {
  const userId = useUserId();
  const { loading, error, data, refetch } = useQuery(GET_USER_NEWS, {
    variables: { userId },
    fetchPolicy: 'cache-and-network',
    skip: !userId
  });
  
  // Add second query just for preferences
  const { data: preferencesData } = useQuery(gql`
    query GetUserPreferences($userId: uuid!) {
      has_preferences: user_preferences_aggregate(where: {user_id: {_eq: $userId}}) {
        aggregate {
          count
        }
      }
    }
  `, {
    variables: { userId },
    fetchPolicy: 'cache-and-network',
    skip: !userId
  });
  
  const [allArticles, setAllArticles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [articles, setArticles] = useState([]);
  const articlesPerPage = 12; // Show 12 articles per page
  const [totalPages, setTotalPages] = useState(1);
  
  // Force refresh when coming from preferences page
  useEffect(() => {
    // Check if we're navigating from preferences page
    const fromPreferences = sessionStorage.getItem('fromPreferences');
    if (fromPreferences) {
      console.log("Refreshing from preferences page");
      refetch();
      sessionStorage.removeItem('fromPreferences');
    }
  }, [refetch]);
  
  // Process all articles
  useEffect(() => {
    if (data?.processed_articles && data?.news_articles) {
      console.log("Processing data for dashboard");
      
      // Extract user preferences into a usable format
      const userPreferences = {};
      (data.user_preferences || []).forEach(pref => {
        userPreferences[pref.topic] = {
          keywords: pref.keywords || [],
          sources: pref.preferred_sources || []
        };
      });
      
      // Create a map of news articles for easy lookup
      const articlesMap = {};
      (data.news_articles || []).forEach(article => {
        articlesMap[article.id] = article;
      });
      
      // Get user interactions
      const interactionsMap = {};
      (data.user_article_interactions || []).forEach(interaction => {
        interactionsMap[interaction.article_id] = interaction;
      });
      
      // Filter and transform the articles
      let filteredArticles = data.processed_articles.filter(processedArticle => {
        // Get the related article
        const articleId = processedArticle.article_id;
        const article = articlesMap[articleId];
        
        // If we don't have the article data, skip it
        if (!article) return false;
        
        // No preferences means show everything 
        if (Object.keys(userPreferences).length === 0) return true;
        
        const articleTopics = Array.isArray(article.topics) ? article.topics : [];
        
        // Check if any of the article's topics match the user's preferred topics
        const topicMatch = articleTopics.some(topic => userPreferences[topic]);
        
        if (topicMatch) return true;
        
        // Check for keyword matches in title or content
        const keywords = Object.values(userPreferences)
          .flatMap(pref => pref.keywords)
          .filter(Boolean);
        
        if (keywords.length > 0) {
          const titleAndContent = (article.title + ' ' + (article.content || '')).toLowerCase();
          const keywordMatch = keywords.some(keyword => 
            titleAndContent.includes(keyword.toLowerCase())
          );
          if (keywordMatch) return true;
        }
        
        // Check for source matches
        const sources = Object.values(userPreferences)
          .flatMap(pref => pref.sources)
          .filter(Boolean);
        
        if (sources.length > 0 && article.source) {
          const sourceMatch = sources.some(source => 
            article.source.toLowerCase().includes(source.toLowerCase())
          );
          if (sourceMatch) return true;
        }
        
        // No match
        return false;
      });
      
      console.log(`Found ${filteredArticles.length} matching articles`);
      
      // Transform the filtered articles into the expected format for ArticleCard
      const transformedArticles = filteredArticles.map(processedArticle => {
        const articleId = processedArticle.article_id;
        const articleData = articlesMap[articleId];
        
        // Skip if we can't find the article data
        if (!articleData) return null;
        
        // Get the user interaction data
        const interactionData = interactionsMap[articleId] || {
          is_read: false,
          is_saved: false
        };
        
        // Combine all data into the expected structure
        return {
          id: processedArticle.id,
          summary: processedArticle.summary,
          sentiment: processedArticle.sentiment,
          sentiment_explanation: processedArticle.sentiment_explanation,
          article: {
            id: articleData.id,
            title: articleData.title,
            source: articleData.source,
            published_at: articleData.published_at,
            url: articleData.url,
            topics: articleData.topics,
            user_article_interactions: [{
              is_read: interactionData.is_read,
              is_saved: interactionData.is_saved
            }]
          }
        };
      }).filter(Boolean); // Remove any null values
      
      // Store all filtered & transformed articles
      setAllArticles(transformedArticles);
      
      // Calculate total pages
      const pages = Math.ceil(transformedArticles.length / articlesPerPage);
      setTotalPages(pages);
      
      console.log(`Total pages: ${pages} with ${transformedArticles.length} articles`);
    }
  }, [data]);
  
  // Update visible articles when page changes or all articles are updated
  useEffect(() => {
    const startIndex = (currentPage - 1) * articlesPerPage;
    const endIndex = startIndex + articlesPerPage;
    const visibleArticles = allArticles.slice(startIndex, endIndex);
    setArticles(visibleArticles);
    
    // Scroll to top on page change if not on first render
    if (allArticles.length > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage, allArticles]);

  // Page change handlers
  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };
  
  const goToPrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };
  
  const goToPage = (pageNum) => {
    setCurrentPage(pageNum);
  };

  if (loading && !articles.length) return <LoadingSpinner />;
  
  if (error) return (
    <div className="dashboard">
      <Navigation />
      <div className="container">
        <div className="error">Error loading news: {error.message}</div>
      </div>
    </div>
  );

  const displayName = data?.user_profiles?.[0]?.display_name || "User";
  const hasPreferences = preferencesData?.has_preferences?.aggregate?.count > 0;

  return (
    <div className="dashboard">
      <Navigation />
      <div className="container">
        <div className="dashboard-header">
          <h1>Welcome, {displayName}</h1>
          {!hasPreferences && (
            <div className="preferences-alert">
              <p>Set your news preferences to get personalized content</p>
              <Link to="/preferences" className="btn">Set Preferences</Link>
            </div>
          )}
        </div>
        
        {allArticles.length === 0 ? (
          <div className="no-articles">
            <p>No articles available yet. Check back soon or set your preferences!</p>
            {hasPreferences && (
              <button 
                onClick={() => refetch()} 
                className="refresh-btn"
              >
                Refresh Articles
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="articles-header">
              <h2>Your Personalized News</h2>
              <div className="articles-tools">
                <span className="articles-count">
                  {`Showing ${articles.length} of ${allArticles.length} articles`}
                </span>
                <button 
                  onClick={() => refetch()} 
                  className="refresh-btn"
                >
                  Refresh
                </button>
              </div>
            </div>
            
            <div className="news-feed">
              {articles.map(article => (
                <ArticleCard 
                  key={article.id} 
                  article={article} 
                  userId={userId}
                />
              ))}
            </div>
            
            {/* Pagination controls */}
            <div className="pagination">
              <button 
                className="pagination-btn"
                onClick={goToPrevPage}
                disabled={currentPage === 1}
              >
                &laquo; Previous
              </button>
              
              <div className="pagination-numbers">
                {/* Show page numbers with ellipsis for many pages */}
                {[...Array(totalPages)].map((_, idx) => {
                  const pageNum = idx + 1;
                  // Always show first page, last page, current page, and neighbors of current page
                  if (
                    pageNum === 1 || 
                    pageNum === totalPages || 
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <button 
                        key={pageNum} 
                        className={`page-number ${pageNum === currentPage ? 'active' : ''}`}
                        onClick={() => goToPage(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (
                    (pageNum === currentPage - 2 && pageNum > 1) || 
                    (pageNum === currentPage + 2 && pageNum < totalPages)
                  ) {
                    return <span key={pageNum} className="ellipsis">...</span>;
                  }
                  return null;
                })}
              </div>
              
              <button 
                className="pagination-btn"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
              >
                Next &raquo;
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;