/**
 * Platform helper for Web & Node runtime
 */

export const currentPlatform: string = typeof window !== 'undefined' ? 'web' : 'node';
export const expoHostUri: string | undefined = undefined;
export const isPhysicalDevice: boolean = false;
