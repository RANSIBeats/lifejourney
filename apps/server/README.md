# Habit AI Server

Backend service for the Habit AI mobile application. Generates personalized habit plans using AI-powered analysis of user goals and barriers.

## Features

- **AI-Powered Habit Generation**: Uses OpenAI API to generate personalized habits
- **Mock AI Fallback**: Works offline with pre-configured mock habits
- **Supabase Persistence**: Stores users, goals, barriers, plans, phases, and habits in Supabase
- **Structured Habit Architecture**: Generates habits in three categories:
  - Foundational: Core daily practices
  - Goal-Specific: Directly aligned with user goals
  - Barrier-Targeting: Addresses identified obstacles
- **Journey Phases**: Distributes habits across 4 journey phases (introduction → mastery)
- **Comprehensive Validation**: Zod schemas for request/response validation
- **Error Handling**: Graceful error handling with detailed logging

## Prerequisites

- Node.js 18+ and npm/yarn
- Supabase project (URL, anon key, and service role key)
- OpenAI API key (optional, mock mode available)

## Installation

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

```bash
cp .env.example .env
```

3. Configure your `.env` file:

```env
# Supabase
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# API
PORT=3000
NODE_ENV=development

# OpenAI (optional)
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_ENABLED=true
USE_MOCK_AI=false

# CORS
CORS_ORIGIN=http://localhost:19000,http://localhost:8081
```

## Database Setup

All persistence is handled by Supabase. Use the Supabase CLI to apply the SQL schema and optional seed data from `supabase/`:

```bash
# Start local Supabase services (optional)
supabase start

# Apply the latest migration
supabase db push

# Reset and seed (development only)
supabase db reset --seed
```

## Development

Start the development server with hot reload:

```bash
npm run dev
```

The server will be available at `http://localhost:3000`

## Building

Build TypeScript to JavaScript:

```bash
npm run build
```

Start the production build:

```bash
npm start
```

## Testing

Run unit tests:

```bash
npm test
```

Watch mode for development:

```bash
npm run test:watch
```

## API Endpoints

### Generate Habits

**Endpoint**: `POST /habits/generate`

**Description**: Generate a personalized habit plan for a user based on their goal and barriers. The authenticated Supabase user (via `Authorization: Bearer <JWT>`) is automatically injected into the request.

**Headers**:

```
Authorization: Bearer <Supabase JWT>
```

**Request Body**:

```json
{
  "goalTitle": "Get Fit",
  "goalDescription": "Lose weight and build muscle over 6 months",
  "goalCategory": "health",
  "barriers": [
    {
      "title": "Lack of time",
      "description": "Busy work schedule with long hours",
      "type": "time-based"
    },
    {
      "title": "Lack of motivation",
      "description": "Hard to stay motivated alone",
      "type": "psychological"
    }
  ]
}
```

**Response** (201 Created):

```json
{
  "success": true,
  "data": {
    "planId": "cly1a2b3c4d5e6f7g8h9i0j1k",
    "goalId": "goal_123",
    "habits": [
      {
        "id": "habit_1",
        "title": "Morning Reflection",
        "description": "Spend 5 minutes reflecting on your goals",
        "category": "foundational",
        "phase": 1,
        "frequency": "daily",
        "duration": 5,
        "priority": 8
      },
      {
        "id": "habit_2",
        "title": "30-Minute Workout",
        "description": "Dedicated exercise session",
        "category": "goal-specific",
        "phase": 2,
        "frequency": "daily",
        "duration": 30,
        "priority": 10
      },
      {
        "id": "habit_3",
        "title": "Overcome Time Barriers",
        "description": "Time management techniques",
        "category": "barrier-targeting",
        "phase": 3,
        "frequency": "daily",
        "duration": 15,
        "priority": 9
      }
    ],
    "summary": {
      "foundationalCount": 3,
      "goalSpecificCount": 2,
      "barrierTargetingCount": 3,
      "totalCount": 8
    }
  }
}
```

**Error Response** (400 Bad Request):

```json
{
  "error": "Validation error",
  "details": [
    {
      "code": "too_small",
      "minimum": 1,
      "type": "array",
      "path": ["barriers"],
      "message": "At least one barrier is required"
    }
  ]
}
```

### Retrieve Habit Plan

**Endpoint**: `GET /habits/plan/:planId`

**Headers**:

```
Authorization: Bearer <Supabase JWT>
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "planId": "plan-123",
    "goalId": "goal-123",
    "title": "Get Fit - Habit Plan",
    "phaseCounts": {
      "phase1": 2,
      "phase2": 3,
      "phase3": 2,
      "phase4": 1
    },
    "phases": [
      { "id": "phase-1", "phaseNumber": 1, "status": "active" },
      { "id": "phase-2", "phaseNumber": 2, "status": "pending" }
    ],
    "habits": [
      {
        "id": "habit-1",
        "title": "Morning Reflection",
        "description": "Spend 5 minutes reflecting on your goals",
        "category": "foundational",
        "phase": 1,
        "frequency": "daily",
        "duration": 5,
        "priority": 8
      }
    ]
  }
}
```

### Health Check

**Endpoint**: `GET /health`

**Response** (200 OK):

```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:45.123Z"
}
```

## Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `SUPABASE_URL` | Supabase project URL | - | Yes |
| `SUPABASE_ANON_KEY` | Supabase anon/public key (mobile clients) | - | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) | - | Yes |
| `PORT` | Server port | `3000` | No |
| `NODE_ENV` | Environment | `development` | No |
| `OPENAI_API_KEY` | OpenAI API key | - | No (if using mock) |
| `OPENAI_MODEL` | OpenAI model name | `gpt-3.5-turbo` | No |
| `OPENAI_ENABLED` | Enable OpenAI integration | `true` | No |
| `USE_MOCK_AI` | Use mock AI for testing | `false` | No |
| `CORS_ORIGIN` | Allowed CORS origins (comma-separated) | `http://localhost:19000` | No |
| `LOG_LEVEL` | Logging level (debug, info, warn, error) | `info` | No |

### OpenAI API Usage

The service automatically handles OpenAI API calls:

1. **Offline Development**: Set `USE_MOCK_AI=true` to use pre-configured mock habits
2. **API Key Optional**: If `OPENAI_API_KEY` is not set, falls back to mock mode
3. **Graceful Degradation**: If API call fails, automatically uses mock habits with a warning log

#### OpenAI Prompt Strategy

The system sends a detailed prompt to OpenAI that:
- Describes the user's goal and goal category
- Lists all barriers with their descriptions and types
- Requests habits organized by category and phase
- Expects JSON-formatted response with specific structure

#### Cost Optimization

- Uses `gpt-3.5-turbo` by default (cheaper than GPT-4)
- Structured prompts minimize tokens
- Response is parsed for JSON validity before persisting
- Non-critical API errors fallback to mock mode

## Database Schema

### Models

**User**
- Represents a mobile app user
- Fields: id, email, name, created_at, updated_at

**Goal**
- User's main objective
- Fields: id, user_id, title, description, category, created_at, updated_at

**Barrier**
- Obstacles that might prevent goal achievement
- Fields: id, user_id, goal_id, title, description, type, created_at, updated_at
- Types: psychological, environmental, social, time-based, etc.

**Habit**
- Individual habit to build
- Fields: id, user_id, goal_id, barrier_id (optional), plan_id, title, description, category, phase, frequency, duration, priority, created_at, updated_at
- Categories: foundational, goal-specific, barrier-targeting
- Phases: 1, 2, 3, 4

**HabitPlan**
- Collection of habits organized by phase
- Fields: id, user_id, goal_id, title, description, phase1_count, phase2_count, phase3_count, phase4_count, created_at, updated_at

## Habit Generation Algorithm

1. **Input Validation**: Validates user goal and barriers using Zod schemas
2. **Database Setup**: Creates user, goal, and barrier records
3. **AI Generation**: Sends prompt to OpenAI (or uses mock)
4. **Response Normalization**:
   - Validates category (foundational, goal-specific, barrier-targeting)
   - Ensures phase is 1-4
   - Ensures priority is 1-10
   - Constrains duration to reasonable values
5. **Plan Creation**: Creates HabitPlan with phase counts
6. **Habit Persistence**: Creates individual Habit records with proper references
7. **Response Assembly**: Returns planId, goalId, habits, and summary

## Logging

The service uses Winston for structured logging:

- **Development**: Console output with colors and formatting
- **Production**: Console + file-based logging (error.log, combined.log)
- **Levels**: debug, info, warn, error

Configure with `LOG_LEVEL` environment variable.

## Error Handling

The service implements comprehensive error handling:

1. **Validation Errors**: Returns 400 with Zod error details
2. **OpenAI Errors**: Logs and falls back to mock habits
3. **Database Errors**: Logs and returns 500 with appropriate message
4. **Unhandled Errors**: Caught by error handler middleware

## Mobile App Integration

### Setup (React Native with Expo)

1. Update your API configuration:

```typescript
// services/api.ts
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});
```

2. Create a habit generation hook:

```typescript
import { useMutation } from '@tanstack/react-query';
import api from '@/services/api';

interface GenerateHabitsRequest {
  goalTitle: string;
  goalDescription?: string;
  goalCategory?: string;
  barriers: Array<{
    title: string;
    description?: string;
    type?: string;
  }>;
}

export function useGenerateHabits() {
  return useMutation({
    mutationFn: async (data: GenerateHabitsRequest) => {
      const response = await api.post('/habits/generate', data);
      return response.data.data;
    },
  });
}
```

3. Use in your habit setup screen:

```typescript
import { useGenerateHabits } from '@/hooks/useGenerateHabits';

export function HabitSetupScreen() {
  const { mutate, isPending } = useGenerateHabits();

  const handleGenerateHabits = () => {
    mutate({
      goalTitle: 'Get Fit',
      goalDescription: 'Lose weight and build muscle',
      goalCategory: 'health',
      barriers: [
        {
          title: 'Lack of time',
          description: 'Busy work schedule',
          type: 'time-based',
        },
      ],
    });
  };

  return (
    <View>
      <Button onPress={handleGenerateHabits} disabled={isPending}>
        {isPending ? 'Generating...' : 'Generate Habits'}
      </Button>
    </View>
  );
}
```

### Error Handling

Wrap mutation calls with error boundary:

```typescript
const { mutate, error } = useGenerateHabits();

if (error) {
  return <ErrorMessage error={error} />;
}
```

## Development Workflow

### 1. Schema Changes

When modifying the Supabase schema, update the SQL migrations under `supabase/migrations/` and apply them with the Supabase CLI:

```bash
# Create a new migration
supabase migration new add_new_feature

# Apply the migration locally
supabase db push

# Reset and reseed (development only)
supabase db reset --seed
```

### 2. Service Development

Follow the pattern in `src/services/`:

1. Create service file with business logic
2. Add TypeScript interfaces in `src/types/`
3. Add validation schemas in `src/validators/`
4. Add unit tests in `src/__tests__/`
5. Wire up routes in `src/routes/`

### 3. Testing Locally

```bash
# Terminal 1: Start server
npm run dev

# Terminal 2: Test with curl (replace <token> with a Supabase JWT)
curl -X POST http://localhost:3000/habits/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "goalTitle": "Get Fit",
    "barriers": [{"title": "No time"}]
  }'
```

## Deployment

### Docker

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t habit-ai-server .
docker run -p 3000:3000 \
  -e SUPABASE_URL="https://your-project-ref.supabase.co" \
  -e SUPABASE_SERVICE_ROLE_KEY="your-service-role-key" \
  -e SUPABASE_ANON_KEY="your-anon-key" \
  habit-ai-server
```

### Environment-Specific Configuration

- **Development**: `USE_MOCK_AI=true` or configure OpenAI key
- **Staging**: Use a Supabase staging project + real OpenAI API key
- **Production**: Use the production Supabase project and service role key management

## Troubleshooting

### Database Connection Issues

```bash
# Verify Supabase services are running (local development)
supabase status

# Re-apply migrations if schema drift occurs
supabase db push

# Reset with seed data (development only)
supabase db reset --seed
```

### OpenAI API Errors

Check `LOG_LEVEL=debug` output for detailed error information. Service automatically falls back to mock mode.

### Port Already in Use

```bash
# Change PORT environment variable
PORT=3001 npm run dev
```

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines.

## License

Private - Habit AI Project
