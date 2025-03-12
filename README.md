# News Digest App

A personalized news aggregation platform built with React, GraphQL, and Nhost. The News Digest App delivers curated articles based on user preferences, with AI-powered summaries and sentiment analysis.

## Features

- **Personalized News Feed**: Articles filtered based on user preferences
- **Topic Preferences**: Select topics of interest and customize keywords
- **AI-Powered Summaries**: Concise article summaries for quick reading
- **Sentiment Analysis**: Visual indication of article sentiment (positive, negative, neutral)
- **User Interactions**: Save articles and track reading history
- **Responsive Design**: Works seamlessly across desktop and mobile devices
- **Clean UI**: Modern, minimalist interface for an optimal reading experience

## Tech Stack

- **Frontend**: React, Apollo Client, CSS3
- **Backend**: GraphQL API, Hasura, PostgreSQL
- **Authentication**: Nhost Auth
- **AI Processing**: OpenRouter API, Claude 3.7
- **News Source**: NewsAPI
- **Deployment**: Netlify (frontend), Nhost (backend)

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn
- Git
- Nhost account
- NewsAPI key

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/news-digest-app.git
cd news-digest-app
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```
REACT_APP_NHOST_SUBDOMAIN=your_nhost_subdomain
REACT_APP_NHOST_REGION=your_nhost_region
```

4. **Start the development server**

```bash
npm start
```

The app will be available at [http://localhost:3000](http://localhost:3000)

## Backend Setup

### Database Schema

The app requires the following tables in your PostgreSQL database:

- `users`: User accounts and profiles
- `user_preferences`: User topic preferences and keywords
- `news_articles`: Source news articles
- `processed_articles`: AI-processed summaries and sentiment analysis
- `user_article_interactions`: Track read and saved articles

### News Processing Workflow

The news aggregation process involves:

1. Fetching articles from NewsAPI
2. Processing with AI for summaries and sentiment analysis
3. Storing in the database
4. Serving personalized content to users

## Deployment

### Frontend Deployment (Netlify)

1. Fork or clone this repository
2. Connect your GitHub repo to Netlify
3. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `build`
4. Add environment variables in Netlify dashboard
5. Deploy!

### Environment Variables

Make sure to set these in your deployment environment:

```
REACT_APP_NHOST_SUBDOMAIN=ktnqyxenwhwxuvsebdvr
REACT_APP_NHOST_REGION=ap-south-1
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Nhost](https://nhost.io/) for authentication and hosting
- [NewsAPI](https://newsapi.org/) for news sources
- [OpenRouter](https://openrouter.ai/) for AI processing
- [Claude](https://www.anthropic.com/claude) for AI summaries and sentiment analysis
- [React](https://reactjs.org/) and [Apollo](https://www.apollographql.com/) teams for incredible tools
- All open source libraries used in this project

## Contact

Your Name - [@yourusername](https://twitter.com/yourusername) - email@example.com

Project Link: [https://github.com/yourusername/news-digest-app](https://github.com/yourusername/news-digest-app)

---

© 2023 News Digest App. All Rights Reserved.

Similar code found with 2 license types
