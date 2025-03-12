import { useState, useEffect } from 'react';
import { useUserId } from '@nhost/react';
import { useQuery, useMutation, gql } from '@apollo/client';
import Navigation from '../components/Navigation';
import LoadingSpinner from '../components/LoadingSpinner';

// Update GraphQL definitions with correct types
const GET_USER_PREFERENCES = gql`
  query GetUserPreferences($userId: uuid!) {
    user_preferences(where: {user_id: {_eq: $userId}}) {
      id
      topic
      keywords
      preferred_sources
    }
  }
`;

const ADD_USER_PREFERENCE = gql`
  mutation AddUserPreference($userId: uuid!, $topic: String!, $keywords: [String!], $preferredSources: [String!]) {
    insert_user_preferences_one(object: {
      user_id: $userId, 
      topic: $topic, 
      keywords: $keywords, 
      preferred_sources: $preferredSources
    }) {
      id
      topic
      keywords
      preferred_sources
    }
  }
`;

const UPDATE_USER_PREFERENCE = gql`
  mutation UpdateUserPreference($id: uuid!, $keywords: [String!], $preferredSources: [String!]) {
    update_user_preferences_by_pk(
      pk_columns: {id: $id}, 
      _set: {
        keywords: $keywords,
        preferred_sources: $preferredSources
      }
    ) {
      id
      keywords
      preferred_sources
    }
  }
`;

const DELETE_USER_PREFERENCE = gql`
  mutation DeleteUserPreference($id: uuid!) {
    delete_user_preferences_by_pk(id: $id) {
      id
    }
  }
`;

const TOPICS = [
  'Technology', 'Business', 'Health', 'Science', 
  'Entertainment', 'Sports', 'Politics', 'World'
];

const Preferences = () => {
  const userId = useUserId();
  const [selectedTopics, setSelectedTopics] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { loading, data, refetch } = useQuery(GET_USER_PREFERENCES, {
    variables: { userId },
    skip: !userId,
    fetchPolicy: 'cache-and-network'
  });
  
  const [addPreference] = useMutation(ADD_USER_PREFERENCE);
  const [updatePreference] = useMutation(UPDATE_USER_PREFERENCE);
  const [deletePreference] = useMutation(DELETE_USER_PREFERENCE);
  
  // Debug data structure
  useEffect(() => {
    console.log('Current data structure:', data);
    console.log('Current selectedTopics:', selectedTopics);
  }, [data, selectedTopics]);
  
  // Initialize selected topics from fetched data
  useEffect(() => {
    if (data?.user_preferences) {
      const topics = {};
      data.user_preferences.forEach(pref => {
        // Make sure we always have arrays
        let keywords = [];
        let sources = [];
        
        // Handle different possible formats from API
        if (pref.keywords) {
          if (Array.isArray(pref.keywords)) {
            keywords = pref.keywords;
          } else if (typeof pref.keywords === 'string') {
            // Try to parse JSON string if it looks like an array
            if (pref.keywords.startsWith('[') && pref.keywords.endsWith(']')) {
              try {
                keywords = JSON.parse(pref.keywords);
              } catch (e) {
                keywords = pref.keywords.split(',').map(k => k.trim());
              }
            } else {
              keywords = pref.keywords.split(',').map(k => k.trim());
            }
          }
        }
        
        // Same logic for sources
        if (pref.preferred_sources) {
          if (Array.isArray(pref.preferred_sources)) {
            sources = pref.preferred_sources;
          } else if (typeof pref.preferred_sources === 'string') {
            if (pref.preferred_sources.startsWith('[') && pref.preferred_sources.endsWith(']')) {
              try {
                sources = JSON.parse(pref.preferred_sources);
              } catch (e) {
                sources = pref.preferred_sources.split(',').map(s => s.trim());
              }
            } else {
              sources = pref.preferred_sources.split(',').map(s => s.trim());
            }
          }
        }
        
        topics[pref.topic] = {
          id: pref.id,
          keywords: keywords.filter(Boolean), // Remove any empty entries
          sources: sources.filter(Boolean)
        };
      });
      setSelectedTopics(topics);
    }
  }, [data]);

  // Toggle topic selection
  const handleTopicToggle = async (topic) => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    try {
      if (selectedTopics[topic]) {
        // Delete preference
        await deletePreference({
          variables: { id: selectedTopics[topic].id }
        });
        
        // Update local state
        setSelectedTopics(prev => {
          const newTopics = {...prev};
          delete newTopics[topic];
          return newTopics;
        });
        console.log(`Removed topic: ${topic}`);
      } else {
        // Add preference with empty arrays (not _text)
        const { data: resultData } = await addPreference({
          variables: {
            userId,
            topic,
            keywords: [], // Empty array of strings
            preferredSources: [] // Empty array of strings
          }
        });
        
        // Make sure we got a valid result
        if (resultData?.insert_user_preferences_one) {
          setSelectedTopics(prev => ({
            ...prev,
            [topic]: {
              id: resultData.insert_user_preferences_one.id,
              keywords: [],
              sources: []
            }
          }));
          console.log(`Added topic: ${topic}`);
        } else {
          console.error('Failed to add topic, no result data');
        }
      }
    } catch (error) {
      console.error(`Error toggling topic ${topic}:`, error);
      alert(`Error toggling topic ${topic}. Please try again.`);
    } finally {
      sessionStorage.setItem('fromPreferences', 'true');
      setIsProcessing(false);
    }
  };

  // Handle keywords input change
  const handleKeywordsChange = (topic, keywords) => {
    if (!selectedTopics[topic]) return;
    
    setSelectedTopics(prev => ({
      ...prev,
      [topic]: {
        ...prev[topic],
        keywords: keywords.split(',').map(k => k.trim()).filter(k => k)
      }
    }));
  };

  // Handle sources input change
  const handleSourcesChange = (topic, sources) => {
    if (!selectedTopics[topic]) return;
    
    setSelectedTopics(prev => ({
      ...prev,
      [topic]: {
        ...prev[topic],
        sources: sources.split(',').map(s => s.trim()).filter(s => s)
      }
    }));
  };

  // Save preference changes
  const savePreference = async (topic) => {
    if (!selectedTopics[topic] || isProcessing) return;
    
    setIsProcessing(true);
    try {
      await updatePreference({
        variables: {
          id: selectedTopics[topic].id,
          keywords: selectedTopics[topic].keywords || [], // Ensure it's an array
          preferredSources: selectedTopics[topic].sources || [] // Ensure it's an array
        }
      });
      console.log(`Saved preferences for ${topic}`);
      // Refetch after a short delay to ensure server has processed the update
      setTimeout(() => refetch(), 300);
    } catch (error) {
      console.error('Error updating preference:', error);
      alert('Failed to save preferences. Please try again.');
    } finally {
      sessionStorage.setItem('fromPreferences', 'true');
      setIsProcessing(false);
    }
  };

  if (loading && !data) return <LoadingSpinner />;

  return (
    <div className="preferences-page">
      <Navigation />
      <div className="container">
        <h1>News Preferences</h1>
        <p>Select topics you're interested in and customize your news feed</p>
        
        <div className="topics-grid">
          {TOPICS.map(topic => (
            <div 
              key={topic} 
              className={`topic-card ${selectedTopics[topic] ? 'selected' : ''}`}
            >
              <div className="topic-header">
                <h3>{topic}</h3>
                <label className="switch">
                  <input 
                    type="checkbox"
                    checked={!!selectedTopics[topic]}
                    onChange={() => handleTopicToggle(topic)}
                    disabled={isProcessing}
                  />
                  <span className="slider"></span>
                </label>
              </div>
              
              {selectedTopics[topic] && (
                <div className="topic-details">
                  <div className="form-group">
                    <label>Keywords (comma-separated):</label>
                    <input 
                      type="text"
                      value={selectedTopics[topic]?.keywords?.join(', ') || ''}
                      onChange={(e) => handleKeywordsChange(topic, e.target.value)}
                      disabled={isProcessing}
                    />
                  </div>
                  <div className="form-group">
                    <label>Preferred Sources (comma-separated):</label>
                    <input 
                      type="text"
                      value={selectedTopics[topic]?.sources?.join(', ') || ''}
                      onChange={(e) => handleSourcesChange(topic, e.target.value)}
                      disabled={isProcessing}
                    />
                  </div>
                  <button 
                    onClick={() => savePreference(topic)}
                    className="save-btn"
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Preferences;