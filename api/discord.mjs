const sendJSON = (response, status, payload, cache = "no-store") => {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", cache);
  response.end(JSON.stringify(payload));
};

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return sendJSON(response, 405, {
      message: "Method not allowed"
    });
  }

  const userId = process.env.DISCORD_USER_ID?.trim();

  if (!userId) {
    return sendJSON(response, 503, {
      message: "DISCORD_USER_ID belum diatur di Vercel"
    });
  }

  try {
    const remote = await fetch(
      `https://api.lanyard.rest/v1/users/${encodeURIComponent(userId)}`,
      {
        signal: AbortSignal.timeout(8000),
        headers: {
          Accept: "application/json"
        }
      }
    );

    const payload = await remote.json();

    if (!remote.ok || !payload.success || !payload.data) {
      throw new Error(
        "Discord belum tersedia di Lanyard. Pastikan akun sudah bergabung ke server Lanyard."
      );
    }

    const {
      discord_user: user,
      discord_status: status,
      activities = []
    } = payload.data;

    const avatar = user.avatar
      ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`
      : `https://cdn.discordapp.com/embed/avatars/0.png`;

    return sendJSON(
      response,
      200,
      {
        username: user.username,
        displayName:
          user.global_name ||
          user.display_name ||
          user.username,
        avatar,
        status: status || "offline",
        activities: activities
          .filter((activity) => activity.type !== 4)
          .slice(0, 3)
          .map((activity) => ({
            name: activity.name,
            details: activity.details || "",
            state: activity.state || ""
          }))
      },
      "s-maxage=30, stale-while-revalidate=60"
    );
  } catch (error) {
    return sendJSON(response, 502, {
      message: "Discord signal unavailable"
    });
  }
}