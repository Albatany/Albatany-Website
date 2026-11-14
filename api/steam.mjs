const sendJSON = (response, status, payload, cache = "no-store") => {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", cache);
  response.end(JSON.stringify(payload));
};

const fetchJSON = async (url) => {
  const remote = await fetch(url, {
    signal: AbortSignal.timeout(8000),
        headers: {
      Accept: "application/json"
    }
  });

  const payload = await remote.json();

  if (!remote.ok) {
    throw new Error(`Steam API returned ${remote.status}`);
  }

  return payload;
};

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return sendJSON(response, 405, {
      message: "Method not allowed"
    });
  }

  const apiKey = process.env.STEAM_API_KEY?.trim();
  const steamId = process.env.STEAM_ID64?.trim();

  if (!apiKey || !steamId) {
    return sendJSON(response, 503, {
      message: "STEAM_API_KEY atau STEAM_ID64 belum diatur di Vercel"
    });
  }

  try {
    const key = encodeURIComponent(apiKey);
    const id = encodeURIComponent(steamId);

    const [summary, owned, level] = await Promise.all([
      fetchJSON(
        `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${key}&steamids=${id}`
      ),
      fetchJSON(
        `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${key}&steamid=${id}&include_appinfo=true&include_played_free_games=true&format=json`
      ),
      fetchJSON(
        `https://api.steampowered.com/IPlayerService/GetSteamLevel/v1/?key=${key}&steamid=${id}`
      )
    ]);

    const player = summary?.response?.players?.[0];

    if (!player) {
      throw new Error("Steam profile tidak ditemukan");
    }

    const games = owned?.response?.games || [];

    const totalMinutes = games.reduce(
      (total, game) => total + Number(game.playtime_forever || 0),
      0
    );

    const topGame = [...games].sort(
      (a, b) =>
        Number(b.playtime_forever || 0) -
        Number(a.playtime_forever || 0)
    )[0];

    return sendJSON(
      response,
      200,
      {
        profile: {
          name: player.personaname,
          avatar: player.avatarfull,
          url: player.profileurl
        },
        level: level?.response?.player_level ?? "—",
        gameCount: owned?.response?.game_count ?? games.length,
        totalHours: Math.round(totalMinutes / 60).toLocaleString("en-US"),
        topGame: topGame
          ? {
              name: topGame.name,
              hours: Math.round(
                Number(topGame.playtime_forever || 0) / 60
              ).toLocaleString("en-US")
            }
          : null
      },
      "s-maxage=300, stale-while-revalidate=600"
    );
  } catch (error) {
    return sendJSON(response, 502, {
      message: "Steam signal unavailable"
    });
  }
}