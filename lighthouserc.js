/** @type {import('@lhci/cli').Config} */
module.exports = {
  ci: {
    collect: {
      startServerCommand: "npm run start",
      startServerReadyPattern: "Ready",
      url: [
        "http://localhost:3000/",
        "http://localhost:3000/dashboard",
        "http://localhost:3000/courses",
        "http://localhost:3000/pricing",
      ],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        "categories:performance": ["warn", { minScore: 0.8 }],
        "categories:accessibility": ["error", { minScore: 0.9 }],
        "categories:seo": ["warn", { minScore: 0.9 }],
        "categories:best-practices": ["warn", { minScore: 0.9 }],
        "largest-contentful-paint": ["warn", { maxNumericValue: 3000 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
