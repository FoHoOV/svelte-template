import { z } from 'zod';

export const schema = z.object({
	username: z.string().nonempty().min(5).max(10),
	password: z.string().nonempty().min(5).max(10),
	confirmPassword: z.string().nonempty().min(5).max(10)
}).refine((data) => data.confirmPassword === data.password, {message: "passwords don't match", path: ["confirmPassword"]});
