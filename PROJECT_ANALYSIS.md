# Ask Lumina - Project Analysis

## 📋 Executive Summary

**Ask Lumina** is a sophisticated AI-powered customer support assistant application for Lumina Screens, a home theater projection screen manufacturer. The application combines OpenAI's GPT-3.5-turbo with semantic search using embeddings to provide intelligent, context-aware responses about products, FAQs, regional support, and home theater solutions.

---

## 🏗️ Architecture & Technology Stack

### Frontend
- **Framework**: Next.js 14.1.0 (App Router)
- **UI Library**: React 18
- **Styling**: Tailwind CSS 3.3.0
- **Font**: Manrope (Google Fonts)
- **Icons**: React Icons, Heroicons
- **Markdown Rendering**: React Markdown with GitHub Flavored Markdown

### Backend
- **Runtime**: Node.js (Next.js API Routes)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Email/Password + Google OAuth)
- **AI/ML**: 
  - OpenAI GPT-3.5-turbo (Chat completions)
  - OpenAI text-embedding-ada-002 (Semantic search)

### Key Dependencies
```json
{
  "@supabase/supabase-js": "^2.49.4",
  "@supabase/auth-helpers-nextjs": "^0.10.0",
  "openai": "^4.78.1",
  "react-markdown": "^9.0.3",
  "remark-gfm": "^4.0.0"
}
```

---

## 🎯 Core Features

### 1. **AI-Powered Chat Interface**
- Real-time streaming responses from OpenAI
- Context-aware conversations with conversation history
- Markdown rendering for formatted responses
- Typing animations for better UX
- Dark/Light theme support

### 2. **Semantic Search with Embeddings**
- Vector embeddings stored in Supabase
- Multi-content type search (products, FAQs, regional support, company info)
- Weighted context from previous messages
- Keyword-based relevance scoring
- Intent detection and content type prioritization

### 3. **Admin Dashboard**
- Product management (CRUD operations)
- FAQ management
- Company information management
- Regional support team management
- User management (super admin only)
- Real-time metrics dashboard

### 4. **Authentication & Authorization**
- Email/Password authentication
- Google OAuth integration
- Role-based access control (User/Admin/Super Admin)
- Protected routes via middleware
- Session management

### 5. **Content Management**
- Dynamic embedding generation
- Batch processing for embeddings
- Content type categorization
- Metadata enrichment for better search

---

## 📁 Project Structure

```
ask-lumina/
├── src/
│   ├── app/
│   │   ├── admin/              # Admin dashboard pages
│   │   │   ├── company-info/
│   │   │   ├── faqs/
│   │   │   ├── products/
│   │   │   ├── regional-support/
│   │   │   ├── setup/
│   │   │   └── users/
│   │   ├── api/                # API routes
│   │   │   ├── admin/          # Admin-specific APIs
│   │   │   ├── embeddings/     # Embedding management
│   │   │   ├── openai/         # Main chat API
│   │   │   ├── products/       # Product APIs
│   │   │   ├── faqs/           # FAQ APIs
│   │   │   └── regional-support/
│   │   ├── auth/               # Authentication pages
│   │   │   ├── signin/
│   │   │   ├── signup/
│   │   │   └── callback/
│   │   ├── chat/               # Alternative chat page
│   │   ├── layout.js           # Root layout
│   │   ├── page.js             # Main chat interface
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── Header.js           # App header with logo, theme toggle
│   │   ├── Sidebar.js          # Chat history sidebar
│   │   ├── Modal.js            # Reusable modal component
│   │   ├── ProductDetail.js    # Product detail display
│   │   ├── ProfileDropdown.js  # User profile menu
│   │   └── TypingAnimation.js  # Loading animation
│   ├── data/
│   │   ├── luminaInfo.js       # Static company information
│   │   ├── products.js         # Product data structure
│   │   ├── faq.js              # FAQ data structure
│   │   └── regionalSupport.js  # Regional support structure
│   ├── utils/
│   │   ├── supabase.js         # Supabase client configuration
│   │   ├── embeddings.js       # Embedding generation & search
│   │   └── roles.js            # Role management utilities
│   └── middleware.js           # Route protection & auth
├── public/
│   ├── images/                 # Static images
│   └── fonts/                  # Custom fonts
└── Configuration files
```

---

## 🗄️ Database Schema (Inferred)

### Supabase Tables

#### 1. **products**
```sql
- id (uuid, primary key)
- name (text)
- gain (text/number)
- material (text)
- surface (text)
- projection_type (text)
- description (text)
- product_specs (array/json)
- features (array/json)
- why_choose_this (array)
- technical_datasheet (text/url)
```

#### 2. **faqs**
```sql
- id (uuid, primary key)
- question (text)
- answer (text)
- category (text)
- tags (array)
```

#### 3. **regional_support**
```sql
- id (uuid, primary key)
- name (text)
- designation (text)
- contact_number (text)
- email (text)
- regions (array)
- states (array)
- cities (array)
```

#### 4. **company_info**
```sql
- id (uuid, primary key)
- key (text)
- content (text)
```

#### 5. **lumina_embeddings**
```sql
- id (uuid, primary key)
- content (text)
- embedding (vector)
- type (text) - 'products' | 'faqs' | 'regional_support' | 'company_info'
- source_id (text) - Reference to source table
- metadata (jsonb)
```

#### 6. **Supabase Auth Tables** (Managed by Supabase)
- `auth.users` - User accounts
- User metadata includes: `userRole`, `is_super_admin`

---

## 🔐 Authentication & Authorization Flow

### Authentication Methods
1. **Email/Password**: Traditional sign-in
2. **Google OAuth**: Social authentication

### Authorization Levels
- **User**: Default role, can access chat interface
- **Admin**: Can access admin dashboard, manage content
- **Super Admin**: Can manage users in addition to admin privileges

### Middleware Protection
- All routes except `/auth/*` and `/api/*` require authentication
- `/admin/*` routes require admin role
- Automatic redirects for unauthorized access

---

## 🤖 AI Integration Architecture

### OpenAI Integration

#### 1. **Chat Completion** (`/api/openai/route.js`)
- **Model**: GPT-3.5-turbo
- **Streaming**: Real-time response streaming
- **Temperature**: 0.5 (focused responses)
- **Max Tokens**: 1000 (enforces brevity)
- **System Prompt**: Highly detailed prompt enforcing:
  - Scope limitation to Lumina products & home theater
  - Response structure and formatting rules
  - Regional support protocols
  - Product recommendation workflow

#### 2. **Embeddings** (`src/utils/embeddings.js`)
- **Model**: text-embedding-ada-002
- **Vector Storage**: Supabase with pgvector extension
- **Search Function**: `match_embeddings` RPC function
- **Relevance Scoring**: Multi-factor scoring system:
  - 40%: Embedding similarity
  - 35%: Keyword matching
  - 15%: Intent alignment
  - 10%: Content type boosts

### Context Enhancement
- **Weighted Context**: Previous messages weighted by recency
- **Content Type Detection**: Automatic detection of query intent
- **Multi-source Context**: Combines products, FAQs, support, company info

---

## 🔌 API Routes

### Public APIs
- `POST /api/openai` - Main chat endpoint
- `GET /api/products` - Product listings
- `GET /api/faqs` - FAQ listings
- `GET /api/regional-support` - Support contacts
- `GET /api/company-info` - Company information

### Admin APIs
- `GET/POST/PUT/DELETE /api/admin/faq` - FAQ management
- `GET/POST/PUT/DELETE /api/admin/setup` - Setup management
- `GET/POST/PUT/DELETE /api/admin/users` - User management

### Embedding APIs
- `POST /api/embeddings` - Generate and store embeddings
- Supports batch processing
- Rebuild capabilities

---

## 🎨 UI/UX Features

### Design System
- **Color Palette**: Custom Lumina brand colors
  - Accent: `#02a4c7` to `#89ba86` (gradient)
  - Dark mode support throughout
- **Typography**: Manrope font family
- **Components**: Reusable, theme-aware components

### User Experience
- **Streaming Responses**: Real-time AI responses
- **Markdown Support**: Rich text formatting
- **Quick Actions**: Pre-defined query buttons
- **Chat History**: Sidebar with previous conversations
- **Theme Toggle**: Dark/Light mode
- **Responsive Design**: Mobile-friendly layout

---

## ⚙️ Configuration

### Environment Variables Required

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Application Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Next.js Configuration
- Image domains configured for:
  - `luminascreens.com`
  - `lh3.googleusercontent.com` (Google OAuth)
  - `www.svgrepo.com` (Icons)

### Tailwind Configuration
- Custom color scheme
- Dark mode: `class` strategy
- Custom gradient stops

---

## 🚀 Key Strengths

1. **Sophisticated AI Integration**
   - Context-aware responses
   - Semantic search with embeddings
   - Multi-source knowledge base

2. **Scalable Architecture**
   - Next.js App Router
   - Server-side API routes
   - Efficient database queries

3. **User Experience**
   - Real-time streaming
   - Dark mode support
   - Responsive design
   - Intuitive admin interface

4. **Security**
   - Role-based access control
   - Protected routes
   - Secure authentication

5. **Content Management**
   - Dynamic embedding generation
   - Batch processing
   - Metadata enrichment

---

## 🔧 Potential Improvements & Considerations

### 1. **Performance**
- [ ] Implement caching for frequently accessed embeddings
- [ ] Add rate limiting for API endpoints
- [ ] Optimize embedding search queries
- [ ] Consider CDN for static assets

### 2. **Error Handling**
- [ ] Enhanced error messages for users
- [ ] Retry logic for failed API calls
- [ ] Fallback responses when embeddings fail
- [ ] Better error logging and monitoring

### 3. **Features**
- [ ] Chat export functionality
- [ ] Search within chat history
- [ ] User feedback mechanism (thumbs up/down)
- [ ] Analytics dashboard
- [ ] Multi-language support

### 4. **Security**
- [ ] Input sanitization for user queries
- [ ] API key rotation strategy
- [ ] Audit logging for admin actions
- [ ] CSRF protection

### 5. **Testing**
- [ ] Unit tests for utilities
- [ ] Integration tests for API routes
- [ ] E2E tests for critical flows
- [ ] Performance testing

### 6. **Documentation**
- [ ] API documentation
- [ ] Deployment guide
- [ ] Environment setup guide
- [ ] Database schema documentation

### 7. **Monitoring & Analytics**
- [ ] Error tracking (Sentry, etc.)
- [ ] Usage analytics
- [ ] Performance monitoring
- [ ] Cost tracking for OpenAI API

### 8. **Code Quality**
- [ ] TypeScript migration for type safety
- [ ] ESLint configuration review
- [ ] Code splitting optimization
- [ ] Bundle size optimization

---

## 📊 Technical Metrics

### Current Implementation
- **AI Model**: GPT-3.5-turbo (cost-effective, fast)
- **Embedding Model**: text-embedding-ada-002
- **Max Tokens**: 1000 (enforces concise responses)
- **Streaming**: Enabled for real-time UX
- **Batch Size**: 100 records for embedding generation

### Database Considerations
- Vector similarity search via Supabase RPC
- Match threshold: 0.55 (configurable)
- Max results: 20 matches, filtered to top 10

---

## 🎯 Use Cases

1. **Customer Support**: Answer product questions, provide recommendations
2. **Sales Assistance**: Connect customers with regional representatives
3. **Technical Support**: Provide installation and setup guidance
4. **Product Discovery**: Help customers find the right screen for their needs
5. **Content Management**: Admin dashboard for maintaining knowledge base

---

## 📝 Deployment Checklist

- [ ] Set up Supabase project
- [ ] Configure database tables and RPC functions
- [ ] Set up OpenAI API account
- [ ] Configure environment variables
- [ ] Set up Google OAuth credentials
- [ ] Generate initial embeddings
- [ ] Configure domain for production
- [ ] Set up SSL certificates
- [ ] Configure CORS if needed
- [ ] Set up monitoring and logging

---

## 🔗 Key Files Reference

| File | Purpose |
|------|---------|
| `src/app/page.js` | Main chat interface |
| `src/app/api/openai/route.js` | AI chat endpoint |
| `src/utils/embeddings.js` | Embedding generation & search |
| `src/middleware.js` | Route protection |
| `src/app/admin/page.js` | Admin dashboard |
| `src/utils/supabase.js` | Database client |
| `src/utils/roles.js` | Authorization utilities |

---

## 📚 Dependencies Summary

### Production Dependencies
- **Next.js 14.1.0**: React framework
- **Supabase**: Database & authentication
- **OpenAI**: AI chat & embeddings
- **React Markdown**: Markdown rendering
- **React Icons**: Icon library

### Development Dependencies
- **Tailwind CSS**: Styling
- **ESLint**: Code linting
- **PostCSS**: CSS processing

---

## 🎓 Learning Resources

For developers working on this project:
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [OpenAI API Reference](https://platform.openai.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

**Analysis Date**: 2025-01-27
**Project Version**: 0.1.0
**Status**: Production-ready with recommended improvements

