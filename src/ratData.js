import sourceRatReports from "../data/mouse.json";

const isValidRatReport = (report) => {
  if (report?.type?.trim() !== "鼠蹤") return false;

  const location = String(report.location || "").trim();
  const lat = Number(report.lat);
  const lng = Number(report.lng);

  return Boolean(
    location &&
      /[市縣鄉鎮區]/u.test(location) &&
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      lat >= 20.5 && lat <= 27.5 &&
      lng >= 117 && lng <= 124.5
  );
};

export const validRatReports = sourceRatReports
  .map((item, index) => ({ item, index }))
  .filter(({ item }) => isValidRatReport(item));
