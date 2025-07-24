// 常量定义
export const VERSIONS_PER_PAGE = 5;
export const SEARCH_DEBOUNCE_MS = 300;

export const compareVersions = (a: string, b: string): number => {
    const parseVersion = (version: string) => {
        return version.split('.').map(part => {
            const num = parseInt(part.replace(/[^\d]/g, ''), 10);
            return isNaN(num) ? 0 : num;
        });
    };

    const versionA = parseVersion(a);
    const versionB = parseVersion(b);

    for (let i = 0; i < Math.max(versionA.length, versionB.length); i++) {
        const numA = versionA[i] || 0;
        const numB = versionB[i] || 0;

        if (numA > numB) return -1;
        if (numA < numB) return 1;
    }
    return 0;
};

export const getPackageKey = (pkg: { name: string; type: string }): string => `${pkg.name}-${pkg.type}`;
