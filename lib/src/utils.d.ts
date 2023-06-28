/**
 * Do a constant time string comparison. Always compare the complete strings
 * against each other to get a constant time. This method does not short-cut
 * if the two string's length differs.
 *
 * @see https://github.com/Bruce17/safe-compare/blob/a96e0fb1dd1b6e998f657b43987c5b7a6d48186e/index.js#L12-L38
 */
export declare const safeCompare: (a: string, b: string) => boolean;
export declare const randomSessionId: () => string;
export declare const getDefaultClientConfig: () => {
    url: string;
    appName: string;
    clientKey: string;
};
export declare const removeTrailingSlash: (url?: string) => string | undefined;
//# sourceMappingURL=utils.d.ts.map