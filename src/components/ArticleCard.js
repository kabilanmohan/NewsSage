import { useState } from 'react';
import { useMutation, gql } from '@apollo/client';

const UPDATE_USER_INTERACTION = gql`
  mutation UpdateUserInteraction($userId: uuid!, $articleId: uuid!, $isRead: Boolean, $isSaved: Boolean) {
    insert_user_article_interactions_one(
      object: {
        user_id: $userId,
        article_id: $articleId,
        is_read: $isRead,
        is_saved: $isSaved
      },
      on_conflict: {
        constraint: user_article_interactions_user_id_article_id_key,
        update_columns: [is_read, is_saved]
      }
    ) {
      id
      is_read
      is_saved
    }
  }
`;

const ArticleCard = ({ article, userId }) => {
  const { summary, sentiment, sentiment_explanation, article: articleData } = article;
  const { title, source, published_at, url, topics = [] } = articleData || {};
  
  const hasInteraction = article.user_interactions?.user_article_interactions?.length > 0;
  const interaction = hasInteraction ? article.user_interactions.user_article_interactions[0] : null;
  
  const [isRead, setIsRead] = useState(interaction?.is_read || false);
  const [isSaved, setIsSaved] = useState(interaction?.is_saved || false);
  const [showDetails, setShowDetails] = useState(false);
  
  const [updateInteraction] = useMutation(UPDATE_USER_INTERACTION);
  
  const handleReadClick = async () => {
    const newIsRead = !isRead;
    setIsRead(newIsRead);
    try {
      await updateInteraction({
        variables: {
          userId,
          articleId: articleData.id,
          isRead: newIsRead,
          isSaved
        }
      });
    } catch (error) {
      console.error('Error updating read status:', error);
      setIsRead(!newIsRead); // Revert on error
    }
  };
  
  const handleSaveClick = async () => {
    const newIsSaved = !isSaved;
    setIsSaved(newIsSaved);
    try {
      await updateInteraction({
        variables: {
          userId,
          articleId: articleData.id,
          isRead,
          isSaved: newIsSaved
        }
      });
    } catch (error) {
      console.error('Error updating save status:', error);
      setIsSaved(!newIsSaved); // Revert on error
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };
  
  const getSentimentColor = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive': return 'green';
      case 'negative': return 'red';
      case 'neutral': return 'gray';
      default: return 'blue';
    }
  };

  const getSentimentEmoji = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive': return '😊';
      case 'negative': return '😔';
      case 'neutral': return '😐';
      default: return '❓';
    }
  };

  return (
    <div className={`article-card ${isRead ? 'read' : ''}`}>
      <div className="article-header">
        <div className={`sentiment-indicator ${getSentimentColor(sentiment)}`} title={sentiment}>
          {sentiment ? getSentimentEmoji(sentiment) : '❓'}
        </div>
        <h3 className="article-title">{title}</h3>
      </div>
      
      <div className="article-meta">
        <span className="source">{source}</span>
        <span className="date">{formatDate(published_at)}</span>
        <div className="topics">
          {topics && topics.map(topic => (
            <span key={topic} className="topic-tag">{topic}</span>
          ))}
        </div>
      </div>
      
      <div className="article-summary">
        <p>{summary}</p>
      </div>
      
      {showDetails && sentiment_explanation && (
        <div className="article-details">
          <h4>Sentiment Analysis</h4>
          <p>{sentiment_explanation}</p>
        </div>
      )}
      
      <div className="article-actions">
        <button onClick={() => window.open(url, '_blank')} className="read-btn">
          Read Full Article
        </button>
        <button onClick={() => setShowDetails(!showDetails)} className="details-btn">
          {showDetails ? 'Hide AI Analysis' : 'Show AI Analysis'}
        </button>
        <button onClick={handleReadClick} className={`mark-btn ${isRead ? 'active' : ''}`}>
          {isRead ? 'Mark Unread' : 'Mark Read'}
        </button>
        <button onClick={handleSaveClick} className={`save-btn ${isSaved ? 'active' : ''}`}>
          {isSaved ? 'Unsave' : 'Save'}
        </button>
      </div>
    </div>
  );
};

export default ArticleCard;