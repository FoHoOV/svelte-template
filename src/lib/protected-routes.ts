import type { LayoutRouteId as UserRouteIds } from '../routes/user/$types';
export type UnprotectedRoutes = UserRouteIds | "/"
export const unProtectedRoutes: UnprotectedRoutes[] = ['/', '/user/login', '/user/signup'];

export const isRouteProtected = (route: string | null) => {
	return !unProtectedRoutes.includes(<any>route ?? '');
};
