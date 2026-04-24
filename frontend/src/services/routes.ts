export interface RouteConfig {
  requireAdmin?: boolean;
  allowedAccountTypes?: string[];
  public?: boolean;
}

export const ROUTE_CONFIGS: Record<string, RouteConfig> = {
  '/': { public: true },
  '/dashboard': { allowedAccountTypes: ['Guest', 'Developer', 'NodeOperator', 'DAOAdmin'] }, // Redirector
  '/admin': { requireAdmin: true, allowedAccountTypes: ['DAOAdmin'] },
  '/developer': { allowedAccountTypes: ['Developer'] },
  '/node-operator': { allowedAccountTypes: ['NodeOperator'] },
  '/guest': { allowedAccountTypes: ['Guest', 'Developer', 'NodeOperator', 'DAOAdmin'] },
  '/billing': { allowedAccountTypes: ['Guest', 'Developer', 'DAOAdmin', 'NodeOperator'] },
  '/profile': { allowedAccountTypes: ['Guest', 'Developer', 'NodeOperator', 'DAOAdmin'] },
};

export const getRouteConfig = (pathname: string): RouteConfig => {
  // Exact match first
  if (ROUTE_CONFIGS[pathname]) return ROUTE_CONFIGS[pathname];
  
  // Dynamic or nested routes could be handled here if needed
  return { public: false }; // Default to private
};
