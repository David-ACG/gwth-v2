"use client"

import { useReportWebVitals } from "next/web-vitals"

/**
 * Reports Core Web Vitals metrics to the console in development.
 * In production, these should be sent to an analytics endpoint (PostHog, Sentry, etc).
 * Metrics reported: LCP, INP, CLS, FCP, TTFB.
 */
export function WebVitals() {
  useReportWebVitals((metric) => {
    if (process.env.NODE_ENV === "development") {
      // Log to console in development for debugging
      const color =
        metric.rating === "good"
          ? "green"
          : metric.rating === "needs-improvement"
            ? "orange"
            : "red"
      console.log(
        `%c[Web Vital] ${metric.name}: ${Math.round(metric.value)}ms (${metric.rating})`,
        `color: ${color}; font-weight: bold`
      )
    }

    // TODO: Send to analytics in production
    // Example: posthog.capture('web_vital', {
    //   metric_name: metric.name,
    //   metric_value: metric.value,
    //   metric_rating: metric.rating,
    // })
  })

  return null
}
