# Habit AI Server - Architecture Documentation

## System Overview

The Habit AI Server is a Node.js + TypeScript backend service that generates personalized habit plans by analyzing user goals and barriers through AI-powered processing.

```
┌─────────────────────────────────────────────────────────────────┐
│                     Mobile App (React Native)                    │
│              (apps/mobile - Expo + React Navigation)            │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP/CORS
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Habit AI Server (Node.js)                     │
│         (apps/server - Express.js + TypeScript)                  │
├─────────────────────────────────────────────────────────────────┤
│                         HTTP API Layer                           │
│  GET /health               POST /habits/generate                 │
├─────────────────────────────────────────────────────────────────┤
│                      Route Layer                                 │
│                    (src/routes/habits.ts)                        │
├─────────────────────────────────────────────────────────────────┤
│                    Service Layer                                 │
│  ┌──────────────────┐  ┌─────────────────────────────────────┐  │
│  │ Habit Generator  │  │      OpenAI Service                 │  │
│  │  Service         │  │  (with mock fallback)               │  │
│  └──────────────────┘  └─────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                    Data Layer                                    │
│        Prisma ORM + SQLite/PostgreSQL Database                   │
├─────────────────────────────────────────────────────────────────┤
│ User │ Goal │ Barrier │ Habit │ HabitPlan                        │
└─────────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
apps/server/
├── src/
│   ├── __tests__/              # Unit tests
│   │   └── habitGenerator.test.ts
│   ├── middleware/
│   │   └── errorHandler.ts     # Error handling & async wrapper
│   ├── routes/
│   │   └── habits.ts           # Habit generation endpoints
│   ├── services/
│   │   ├── habitGeneratorService.ts  # Business logic
│   │   └── openAiService.ts          # AI integration
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces
│   ├── utils/
│   │   └── logger.ts           # Winston logger
│   ├── validators/
│   │   └── habitGenerator.ts   # Zod validation schemas
│   ├── app.ts                  # Express configuration
│   └── index.ts                # Server entry point
├── prisma/
│   └── schema.prisma           # Database schema
├── .env.example                # Environment template
├── .eslintrc.json              # ESLint configuration
├── .gitignore                  # Git ignore rules
├── .prettierrc                 # Prettier configuration
├── jest.config.js              # Jest configuration
├── package.json                # Dependencies & scripts
├── tsconfig.json               # TypeScript configuration
├── README.md                   # User guide
└── ARCHITECTURE.md             # This file
```

## Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Runtime** | Node.js | 18+ | JavaScript runtime |
| **Language** | TypeScript | 5.3+ | Type-safe development |
| **Framework** | Express.js | 4.18+ | HTTP server & routing |
| **Database ORM** | Prisma | 5.7+ | Type-safe DB access |
| **Database** | SQLite/PostgreSQL | latest | Data persistence |
| **AI Integration** | OpenAI SDK | 4.28+ | Habit generation |
| **Validation** | Zod | 3.22+ | Runtime schema validation |
| **Logging** | Winston | 3.11+ | Structured logging |
| **Testing** | Jest | 29.7+ | Unit testing |
| **Linting** | ESLint | 8.56+ | Code quality |
| **Formatting** | Prettier | 3.1+ | Code formatting |

## Core Concepts

### 1. Habit Categories

Generated habits are categorized into three types:

- **Foundational**: Core daily practices that build discipline and create routine structure
  - Examples: Morning reflection, evening review, weekly planning
  - Typically simpler and shorter in duration
  - Should be included in early phases (1-2)

- **Goal-Specific**: Directly aligned with the user's main objective
  - Examples: 30-minute workout (for fitness goal), learning session (for skill goal)
  - Should escalate in difficulty across phases
  - Core habits for achieving the goal

- **Barrier-Targeting**: Specifically designed to overcome identified obstacles
  - Examples: Time management techniques, accountability check-ins
  - References specific barriers from user input
  - Distributed across later phases (3-4)

### 2. Journey Phases

Habits are distributed across 4 phases representing the user's journey:

- **Phase 1 - Introduction** (Week 1-2): Easy habits to build momentum
  - Simple, short-duration habits (5-15 minutes)
  - Foundational habits to establish routine
  - Goal: Lower barrier to entry

- **Phase 2 - Building** (Week 3-4): Increase complexity
  - Add more goal-specific habits
  - Longer durations (20-45 minutes)
  - Goal: Build capability and confidence

- **Phase 3 - Reinforcement** (Week 5-8): Consolidate and overcome barriers
  - Introduce barrier-targeting habits
  - Mix of practices from phases 1-2
  - Goal: Address obstacles head-on

- **Phase 4 - Mastery** (Week 9+): Advanced integration
  - Most challenging habits (45-120 minutes)
  - Progressive improvement habits
  - Goal: Full habit integration and maintenance

### 3. Database Model Relationships

```
User (1:N)
  ├── Goal (1:N)
  │   ├── Barrier (1:N)
  │   │   └── Habit (0:1) [barrierId foreign key]
  │   ├── Habit (1:N)
  │   └── HabitPlan (1:N)
  │       └── Habit (1:N)
  └── Habit (1:N)
```

## Request/Response Flow

### Generate Habits Flow

```
1. Request Received
   POST /habits/generate
   Body: { userId, goalTitle, barriers[] }
   ↓
2. Validation
   Zod validation on request body
   ↓
3. Data Persistence (Initial)
   Create User (if not exists)
   Create Goal
   Create Barriers (array)
   ↓
4. AI Generation
   Build prompt from goal & barriers
   Call OpenAI API (or use mock)
   Parse & normalize response
   ↓
5. Data Persistence (Habits)
   Create HabitPlan
   Create Habit records
   Link habits to barriers (if applicable)
   ↓
6. Response Assembly
   Calculate summary (counts by category)
   Return planId, goalId, habits, summary
   ↓
7. Response Sent (201 Created)
```

## Design Patterns

### 1. Service Layer Pattern

Services encapsulate business logic and database interactions:

```typescript
// Service file: services/habitGeneratorService.ts
export async function generateHabits(
  request: GenerateHabitsRequest
): Promise<GenerateHabitsResult> {
  // Orchestrates the entire habit generation process
  // 1. Data validation
  // 2. Database operations
  // 3. AI processing
  // 4. Data transformation
}
```

### 2. Validation Pattern

Zod schemas provide both runtime validation and type safety:

```typescript
// Validator file: validators/habitGenerator.ts
const schema = z.object({
  userId: z.string().min(1),
  goalTitle: z.string().min(1),
  barriers: z.array(BarrierSchema).min(1),
});

// Usage in route
const validated = schema.parse(req.body); // Throws if invalid
```

### 3. Error Handling Pattern

Async route handlers are wrapped for error propagation:

```typescript
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Usage
router.post('/endpoint', asyncHandler(async (req, res) => {
  // Error thrown here will be caught by error handler middleware
}));
```

### 4. Repository Pattern (with Prisma)

Prisma Client acts as the data access layer:

```typescript
const user = await prisma.user.upsert({
  where: { id },
  update: {},
  create: { /* ... */ }
});

const habits = await prisma.habit.createMany({
  data: habitArray
});
```

## AI Integration Strategy

### OpenAI API Usage

1. **Prompt Construction**: Builds detailed prompt from goal and barriers
2. **API Call**: Sends to OpenAI with structured response expectations
3. **Response Parsing**: Extracts JSON from response
4. **Validation**: Validates response against schema
5. **Normalization**: Ensures categories and phases are valid

### Fallback Strategy

```typescript
if (USE_MOCK_AI || !OPENAI_API_KEY) {
  // Use pre-configured mock habits
  return generateMockHabits();
}

try {
  // Try OpenAI API
  return await openAiService.generate();
} catch (error) {
  // Fall back to mock
  logger.warn('OpenAI failed, using mock');
  return generateMockHabits();
}
```

### Mock Data Structure

Pre-configured habits organized by category:

```typescript
const MOCK_HABITS = {
  foundational: [
    { title: 'Morning Reflection', ... },
    { title: 'Evening Review', ... },
  ],
  goalSpecific: [
    { title: 'Goal-Aligned Action', ... },
  ],
  barrierTargeting: [
    { title: 'Obstacle Mitigation', ... },
  ],
};
```

## Security Considerations

### Input Validation

- All user inputs validated with Zod schemas
- String length constraints prevent buffer overflows
- Array length constraints prevent resource exhaustion

### Database Security

- Prisma parameterized queries prevent SQL injection
- Foreign key constraints maintain referential integrity
- CASCADE delete protects against orphaned records

### API Security

- CORS configuration restricts origins
- Request size limits via middleware
- Rate limiting can be added via middleware

### API Keys

- OpenAI key never logged or returned to client
- Key management via environment variables
- Support for mock mode without requiring key

## Logging Strategy

Winston logger provides structured logging:

```typescript
// Development: Pretty console output
logger.info('User created', { userId: 'user-123' });

// Production: File-based logging
// logs/combined.log - all logs
// logs/error.log - errors only
```

Log levels:
- **error**: Critical failures
- **warn**: Degraded functionality (e.g., OpenAI fallback)
- **info**: Important events (habit generation completed)
- **debug**: Detailed diagnostic information

## Testing Strategy

### Unit Tests

Located in `src/__tests__/`:

1. **Validation Tests**: Verify Zod schemas catch invalid data
2. **Response Validation Tests**: Ensure API responses match expected structure
3. **Integration Tests**: Verify habit distribution across phases

### Test Categories

```typescript
describe('Habit Generator', () => {
  describe('Validation', () => {
    // Input validation tests
  });
  describe('AI Response Validation', () => {
    // Output validation tests
  });
  describe('Mock Habit Generation', () => {
    // Business logic tests
  });
});
```

### Running Tests

```bash
npm test              # Run once
npm run test:watch   # Watch mode
```

## Performance Considerations

### Database Optimization

- Indexes on frequently queried fields (userId, goalId, phase, category)
- Batch operations for creating multiple habits
- Connection pooling with Prisma

### API Response Time

- Mock mode instant response (<10ms)
- OpenAI API typical response 2-5 seconds
- Client-side loading indicator recommended

### Scalability

- SQLite for development (single file)
- PostgreSQL for production (concurrent users)
- Prisma migrations for version management
- Stateless design allows horizontal scaling

## Deployment Considerations

### Environment-Specific Configuration

```env
# Development
USE_MOCK_AI=true
NODE_ENV=development
LOG_LEVEL=debug

# Production
USE_MOCK_AI=false
NODE_ENV=production
LOG_LEVEL=info
DATABASE_URL=postgresql://...
```

### Database Migrations

```bash
# Development: auto migration with reset
npm run db:migrate

# Production: careful migration strategy
npx prisma migrate deploy
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["npm", "start"]
```

## Future Enhancements

### Short-term

1. Add `GET /habits/plan/:planId` endpoint
2. Implement habit progress tracking
3. Add user authentication middleware
4. Implement habit update endpoint

### Medium-term

1. Add email notifications for habit reminders
2. Implement habit tracking analytics
3. Add support for multiple habit languages
4. Implement A/B testing for AI prompts

### Long-term

1. Machine learning for personalized optimization
2. Social habit completion challenges
3. Integration with calendar/reminder apps
4. Advanced analytics dashboard

## Code Quality Standards

### TypeScript

- Strict mode enabled
- No `any` type
- Explicit return types on functions
- No unused variables/parameters

### Linting (ESLint)

```bash
npm run lint
npm run format  # Auto-fix formatting
```

### Type Checking

```bash
npm run type-check
```

## Maintenance

### Regular Tasks

- Monitor OpenAI API costs and token usage
- Review error logs for patterns
- Update dependencies monthly
- Run tests before deployments
- Database backups for production

### Monitoring

- Log aggregation (production)
- Error tracking (Sentry recommended)
- APM monitoring (New Relic recommended)
- Database query performance

## References

- [Express.js Documentation](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Zod Documentation](https://zod.dev/)
- [OpenAI API Documentation](https://platform.openai.com/docs/)
- [Winston Logger](https://github.com/winstonjs/winston)
