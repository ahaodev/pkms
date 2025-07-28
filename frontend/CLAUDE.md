# CLAUDE.md - Frontend Development Guide

This file provides guidance to Claude Code when working with the PKMS frontend React application.

## Project Overview

PKMS Frontend is a modern React application built with TypeScript, Vite, and Tailwind CSS. It provides a comprehensive package management interface with role-based access control, multi-tenant support, and responsive design.

## Technology Stack

### Core Technologies
- **React**: 18.3.1 (consider upgrading to 19.1.0)
- **TypeScript**: 5.5.3+ with strict mode enabled
- **Vite**: 5.4.8+ for fast development and building
- **Tailwind CSS**: 3.4.13+ for utility-first styling
- **shadcn/ui**: Component library for consistent UI

### Key Dependencies
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: React Router DOM v6 with lazy loading
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios with interceptors
- **Icons**: Lucide React
- **Charts**: Recharts for data visualization

## Development Commands

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server (port 5173, proxies /api to localhost:8080)
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Preview production build
npm run preview

# Check for security vulnerabilities
npm audit

# Fix security issues
npm audit fix
```

## Project Structure

```
frontend/src/
├── components/           # Reusable UI components (organized by feature)
│   ├── ui/              # shadcn/ui base components
│   ├── auth/            # Authentication components
│   ├── dashboard/       # Dashboard-specific components
│   ├── settings/        # Settings page components (账户、外观、存储、安全)
│   ├── user/           # User management components
│   ├── project/        # Project management components
│   ├── tenant/         # Tenant management components
│   └── permissions/    # RBAC permission components
├── pages/              # Page-level components
├── lib/                # Utilities and API clients
│   ├── api/           # API service layer
│   └── utils.ts       # Helper functions
├── hooks/             # Custom React hooks
├── providers/         # Context providers (auth, theme, query)
├── types/            # TypeScript type definitions
├── config/           # Configuration files (routes, constants)
└── contexts/         # React contexts
```

## Architecture Patterns

### Component Organization
- **Feature-based grouping**: Components organized by business domain
- **Index exports**: Each component group has index.ts for clean imports
- **Props interfaces**: Every component has typed Props interface
- **Consistent naming**: PascalCase for components, kebab-case for files

### State Management Strategy
- **Server State**: TanStack Query with 5min staleTime, 10min cacheTime
- **Client State**: React Context for auth, theme, tenant switching
- **Local State**: useState for UI state, useReducer for complex forms
- **Form State**: React Hook Form with Zod validation

### API Architecture
- **Base Client**: Axios instance in `lib/api/api.ts` with interceptors
- **Service Layer**: Separate files for each domain (auth, users, projects, etc.)
- **Authentication**: Automatic JWT token injection via request interceptors
- **Multi-tenancy**: x-tenant-id header injection
- **Error Handling**: Global 401 handling with automatic logout

### Authentication Flow
- JWT tokens in localStorage (ACCESS_TOKEN, REFRESH_TOKEN)
- Route guards based on authentication status and roles
- Automatic token refresh on API calls
- Multi-tenant support with tenant switching

## Critical Performance Issues (MUST FIX)

### 🚨 Bundle Size Optimization - URGENT
**Current Issue**: Main JS bundle is 628.28 KB (too large)
**Target**: Split into chunks < 250KB each

```typescript
// vite.config.ts - Add this configuration
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          charts: ['recharts'],
          icons: ['lucide-react'],
          forms: ['react-hook-form', '@hookform/resolvers'],
        }
      }
    }
  }
});
```

### 🚨 Security Vulnerabilities - URGENT
**Found**: 3 vulnerabilities (2 moderate, 1 critical)
**Action Required**: Run `npm audit fix` immediately

### 🚨 Production Console Logs - URGENT
**Issue**: 54 console.log statements in production code
**Solution**: Configure build to remove console statements

```typescript
// vite.config.ts - Add this to remove console logs in production
export default defineConfig({
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
});
```

## Performance Optimization Guidelines

### Route-based Code Splitting
```typescript
// Use lazy loading for page components
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import("@/pages/dashboard"));
const Users = lazy(() => import("@/pages/users"));
const Settings = lazy(() => import("@/pages/settings"));

// Wrap with Suspense
<Suspense fallback={<PageLoader />}>
  <Routes>
    <Route path="/" element={<Dashboard />} />
  </Routes>
</Suspense>
```

### Component Performance
```typescript
// Use React.memo for expensive components
export const UserCard = React.memo(({ user, onEdit }: UserCardProps) => {
  // Component logic
});

// Use useMemo for expensive calculations
const filteredUsers = useMemo(() => 
  users.filter(user => user.name.includes(searchTerm)), 
  [users, searchTerm]
);

// Use useCallback for event handlers
const handleUserSelect = useCallback((userId: string) => {
  onUserSelect(userId);
}, [onUserSelect]);
```

## Code Quality Standards

### TypeScript Configuration
```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### Component Structure Template
```typescript
interface ComponentProps {
  // Define all props with proper types
  data: DataType;
  onAction?: (id: string) => void;
  className?: string;
}

export function Component({ data, onAction, className }: ComponentProps) {
  // State declarations
  const [loading, setLoading] = useState(false);
  
  // Custom hooks
  const { user } = useAuth();
  
  // Memoized values
  const computedValue = useMemo(() => {
    return expensiveComputation(data);
  }, [data]);
  
  // Event handlers
  const handleClick = useCallback(() => {
    onAction?.(data.id);
  }, [onAction, data.id]);
  
  // Effects
  useEffect(() => {
    // Side effects
  }, []);
  
  return (
    <div className={cn("base-styles", className)}>
      {/* JSX content */}
    </div>
  );
}
```

## API Integration Patterns

### Query Hook Pattern
```typescript
// Custom hook for data fetching
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => api.users.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      if (error.status === 404) return false;
      return failureCount < 3;
    },
  });
}

// Mutation hook pattern
export function useCreateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userData: CreateUserRequest) => api.users.create(userData),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
    },
  });
}
```

### API Service Pattern
```typescript
// api/users.ts
export const usersApi = {
  getAll: (): Promise<User[]> => 
    apiClient.get('/api/v1/users').then(res => res.data),
    
  getById: (id: string): Promise<User> =>
    apiClient.get(`/api/v1/users/${id}`).then(res => res.data),
    
  create: (user: CreateUserRequest): Promise<User> =>
    apiClient.post('/api/v1/users', user).then(res => res.data),
    
  update: (id: string, user: UpdateUserRequest): Promise<User> =>
    apiClient.put(`/api/v1/users/${id}`, user).then(res => res.data),
    
  delete: (id: string): Promise<void> =>
    apiClient.delete(`/api/v1/users/${id}`),
};
```

## Settings Page Architecture (Recently Redesigned)

The settings page has been completely redesigned with four main sections:

### 1. Account Settings (账户设置)
- **Location**: `components/settings/account-settings.tsx`
- **Features**: Basic info (username, email), password management
- **Validation**: Password confirmation and strength validation

### 2. Storage Settings (存储设置)
- **Location**: `components/settings/storage-settings.tsx`
- **Features**: Local disk vs MinIO configuration, connection testing
- **Backend Integration**: Connects to Go storage configuration

## RBAC Integration

### Permission System
The frontend integrates with the backend RBAC system:

- **Roles**: admin, pm, user (as defined in backend `domain/constants.go`)
- **Resources**: project, package, release, user, file
- **Actions**: read, write, delete, create, update, list, share, upload, download

### Route Protection
```typescript
// Route guards based on RBAC
function RouteGuard({ children, requiresAdmin = false }: RouteGuardProps) {
  const { isAdmin } = useAuth();
  
  if (requiresAdmin && !isAdmin()) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}
```

## Security Best Practices

### Input Validation
```typescript
// Use Zod for form validation
const userSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8),
});

type UserFormData = z.infer<typeof userSchema>;
```

### XSS Prevention
```typescript
// Always sanitize user input before rendering
import DOMPurify from 'dompurify';

const sanitizedHTML = DOMPurify.sanitize(userInput);
```

## Common Issues and Solutions

### Bundle Size Warnings
**Issue**: Vite warns about chunks larger than 500KB
**Solution**: Implement manual chunking in vite.config.ts (see above)

### Console Logs in Production
**Issue**: Development console.log statements in production builds
**Solution**: Configure Terser to remove console statements (see above)

### Security Vulnerabilities
**Issue**: npm audit shows vulnerabilities in esbuild and form-data
**Solution**: Run `npm audit fix` immediately

### Route Protection Issues
**Issue**: Unauthorized access to protected routes
**Solution**: Use RouteGuard component with proper role checking

## Development Workflow

### Before Making Changes
1. **Check Current State**: Run `npm run lint` and `npm run build`
2. **Security Check**: Run `npm audit` to check for vulnerabilities
3. **Performance**: Monitor bundle size in build output

### Code Quality Checklist
- [ ] TypeScript interfaces defined for all props
- [ ] Console.log statements removed (use proper logging)
- [ ] Components wrapped with React.memo if needed
- [ ] Event handlers memoized with useCallback
- [ ] Expensive calculations memoized with useMemo
- [ ] Proper error boundaries implemented
- [ ] Loading states handled gracefully

### Testing Guidelines
```typescript
// Component testing with React Testing Library
import { render, screen, fireEvent } from '@testing-library/react';
import { UserCard } from './user-card';

test('renders user information correctly', () => {
  const user = { id: '1', name: 'John Doe', email: 'john@example.com' };
  render(<UserCard user={user} />);
  
  expect(screen.getByText('John Doe')).toBeInTheDocument();
  expect(screen.getByText('john@example.com')).toBeInTheDocument();
});
```

## Important Reminders

### High Priority Items
1. **URGENT**: Fix bundle size (implement code splitting)
2. **URGENT**: Fix security vulnerabilities (`npm audit fix`)
3. **URGENT**: Remove console.log statements from production builds
4. **HIGH**: Implement route-based code splitting
5. **HIGH**: Optimize TanStack Query configuration

### Performance Targets
- Initial bundle size: < 250KB (currently 628KB)
- First Contentful Paint: < 2s
- Largest Contentful Paint: < 3s
- Cumulative Layout Shift: < 0.1

### Dependency Management
- **Major Updates Needed**: React 19, @hookform/resolvers 5.x, Tailwind 4.x
- **Security Updates**: Run `npm audit fix` regularly
- **Version Strategy**: Update minor versions monthly, major versions quarterly

## Environment Configuration

### Development
```bash
# .env.development
VITE_API_BASE_URL=http://localhost:8080
VITE_ENABLE_DEV_TOOLS=true
```

### Production
```bash
# .env.production
VITE_API_BASE_URL=https://your-api-domain.com
VITE_ENABLE_DEV_TOOLS=false
```

---

**Critical Note**: This frontend has significant performance and security issues that must be addressed immediately. The bundle size is more than double the recommended size, and there are known security vulnerabilities. Address these issues before deploying to production.

**Integration**: This frontend is designed to work seamlessly with the Go backend RBAC system. The authentication flow, multi-tenancy, and permission checking are all integrated with the backend APIs defined in the main CLAUDE.md file.