import type { LayoutRouteId } from './$types';

export const unProtectedRoutes: LayoutRouteId[] = ['/user/login', '/user/signup'];

export const isRouteProtected = (route: string | null) => {
	return !unProtectedRoutes.includes(<any>route ?? '');
};
