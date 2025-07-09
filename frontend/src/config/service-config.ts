// Configuration for service layer
export const serviceConfig = {
    // Set to false when real APIs are ready
    useMockServices: import.meta.env.VITE_USE_MOCK_SERVICES !== 'false',

    // API configuration
    api: {
        baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://api.delivery-system.com',
        version: 'v1',
        timeout: 10000, // 10 seconds
    },

    // Mock service configuration
    mock: {
        // Simulate network delays (in milliseconds)
        delays: {
            read: 200,    // GET requests
            write: 500,   // POST/PUT requests
            delete: 300,  // DELETE requests
        },

        // Error simulation (percentage chance of errors)
        errorRate: 0, // 0% chance of random errors (set to 5 for 5% chance)
    },

    // React Query configuration
    query: {
        staleTime: 5 * 60 * 1000,     // 5 minutes
        cacheTime: 10 * 60 * 1000,    // 10 minutes
        refetchOnWindowFocus: false,
        retry: 3,
    },
};

export default serviceConfig;
