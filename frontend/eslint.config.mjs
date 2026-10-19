// Flat config.
//
// `next lint` was removed in Next 16, so the kit's "lint": "next lint" script
// simply errored — which meant nothing had ever been linted. The script is now
// plain `eslint .`, the same way core runs it (`eslint . --max-warnings=0`).
//
// eslint-config-next 16 ships native flat configs, so they are imported
// directly rather than wrapped in FlatCompat.
import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const config = [
    {
        ignores: [
            ".next/**",
            "node_modules/**",
            "next-env.d.ts",
            // Scaffold sample, not part of the delivered module.
            "src/app/api/v1/**",
        ],
    },
    ...coreWebVitals,
    ...typescript,
];

export default config;
