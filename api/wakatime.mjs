import { json, method } from "../server/http.mjs";

const duration = (seconds) => {
  if (seconds == null || !Number.isFinite(Number(seconds))) {
    return "—";
  }

  const minutes = Math.floor(Math.max(0, Number(seconds)) / 60);
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
};

const rows = (value) =>
  (Array.isArray(value) ? value : []).map((item) => ({
    name: String(item.name || "Other"),
    text: String(item.text || duration(item.total_seconds)),
    time: String(item.text || duration(item.total_seconds)),
    percent: Math.max(0, Math.min(100, Number(item.percent) || 0))
  }));

export default async function handler(req, res) {
  if (!method(req, res)) return;

  const token = process.env.WAKATIME_ACCESS_TOKEN?.trim();

  if (!token) {
    return json(res, 503, {
      message: "WAKATIME_ACCESS_TOKEN belum diatur."
    });
  }

  try {
    const remote = await fetch(
      "https://api.wakatime.com/api/v1/users/current/stats/all_time",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json"
        },
        signal: AbortSignal.timeout(8000)
      }
    );

    if (!remote.ok) throw new Error("Upstream unavailable");

    const { data: s } = await remote.json();
    const totalSeconds =
      s?.total_seconds_including_other_language ?? s?.total_seconds;

    if (
      totalSeconds == null ||
      !Number.isFinite(Number(totalSeconds))
    ) {
      return json(res, 503, {
        message: "Statistik sedang disiapkan. Coba lagi sebentar."
      });
    }

    const updating =
      remote.status === 202 || s.is_up_to_date === false;

    const since = s.start
      ? new Date(s.start).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          timeZone: "Asia/Jakarta"
        })
      : "—";

    return json(
      res,
      200,
      {
        total:
          s.human_readable_total_including_other_language ||
          s.human_readable_total ||
          duration(totalSeconds),

        dailyAverage:
          s.human_readable_daily_average_including_other_language ||
          s.human_readable_daily_average ||
          duration(
            s.daily_average_including_other_language ?? s.daily_average
          ),

        since,
        codingSince: since,
        bestDay: s.best_day?.date || "—",
        bestDayTime: duration(s.best_day?.total_seconds),

        languages: rows(s.languages),
        editors: rows(s.editors),
        operatingSystems: rows(s.operating_systems),
        categories: rows(s.categories),
        updating
      },
      updating
        ? "no-store"
        : "public, max-age=0, s-maxage=300, stale-while-revalidate=600"
    );
  } catch {
    return json(res, 502, {
      message:
        "WakaTime belum dapat dihubungi. Periksa token dan coba lagi."
    });
  }
}