"use client";

import { useReportWebVitals } from "next/web-vitals";

type ReportWebVitalsCallback = Parameters<typeof useReportWebVitals>[0];

interface WebVitalsPayload {
  delta: number;
  id: string;
  name: string;
  navigationType: string;
  rating: string;
  value: number;
}

const WEB_VITALS_ENDPOINT = "/api/web-vitals";

const buildPayload = (metric: Parameters<Exclude<ReportWebVitalsCallback, undefined>>[0]): WebVitalsPayload => {
  return {
    delta: metric.delta,
    id: metric.id,
    name: metric.name,
    navigationType: metric.navigationType,
    rating: metric.rating,
    value: metric.value,
  };
};

const reportWebVitals: ReportWebVitalsCallback = (metric) => {
  if (!metric) {
    return;
  }

  const payload = buildPayload(metric);
  const body = JSON.stringify(payload);

  if (process.env.NODE_ENV !== "production") {
    console.info("[web-vitals]", payload);
  }

  if (navigator.sendBeacon) {
    navigator.sendBeacon(WEB_VITALS_ENDPOINT, body);
    return;
  }

  void fetch(WEB_VITALS_ENDPOINT, {
    body,
    headers: {
      "Content-Type": "application/json",
    },
    keepalive: true,
    method: "POST",
  });
};

export function WebVitals() {
  useReportWebVitals(reportWebVitals);

  return null;
}
