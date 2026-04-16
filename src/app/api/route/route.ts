import { NextRequest, NextResponse } from "next/server";

/**
 * Route API — haalt echte rijafstand en rijtijd op via OSRM (gratis, geen API key nodig).
 *
 * Query params:
 *   origins=lat,lng (gebruiker positie)
 *   destinations=lat1,lng1;lat2,lng2;... (locaties, max 10)
 *
 * Returns een array met { afstandKm, rijtijdMin } per bestemming.
 * Bij fout valt terug op hemelsbreed × 1.35 schatting.
 */

export const revalidate = 3600; // cache 1 uur

type RouteResult = {
  afstandKm: number;
  rijtijdMin: number;
  bron: "osrm" | "schatting";
};

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const originsParam = searchParams.get("origins");
  const destsParam = searchParams.get("destinations");

  if (!originsParam || !destsParam) {
    return NextResponse.json({ error: "origins en destinations zijn verplicht" }, { status: 400 });
  }

  const [originLat, originLng] = originsParam.split(",").map(Number);
  if (isNaN(originLat) || isNaN(originLng)) {
    return NextResponse.json({ error: "Ongeldige origins" }, { status: 400 });
  }

  const bestemmingen = destsParam.split(";").map((d) => {
    const [lat, lng] = d.split(",").map(Number);
    return { lat, lng };
  });

  if (bestemmingen.length === 0 || bestemmingen.length > 10) {
    return NextResponse.json({ error: "1-10 bestemmingen vereist" }, { status: 400 });
  }

  // Probeer OSRM table API (1 origin → N destinations in 1 call)
  try {
    const coords = [
      `${originLng},${originLat}`,
      ...bestemmingen.map((b) => `${b.lng},${b.lat}`),
    ].join(";");

    const osrmUrl = `https://router.project-osrm.org/table/v1/driving/${coords}?sources=0&annotations=distance,duration`;

    const res = await fetch(osrmUrl, {
      headers: { "User-Agent": "Grenspret/1.0 (info@grenspret.nl)" },
      signal: AbortSignal.timeout(8000),
    });

    if (res.ok) {
      const data = await res.json();

      if (data.code === "Ok" && data.distances?.[0] && data.durations?.[0]) {
        const results: RouteResult[] = bestemmingen.map((_, i) => ({
          afstandKm: Math.round(data.distances[0][i + 1] / 1000),
          rijtijdMin: Math.round(data.durations[0][i + 1] / 60),
          bron: "osrm" as const,
        }));

        return NextResponse.json({ routes: results });
      }
    }
  } catch {
    // OSRM niet bereikbaar, val terug op schatting
  }

  // Fallback: hemelsbreed × 1.35
  const results: RouteResult[] = bestemmingen.map((dest) => {
    const km = haversineKm(originLat, originLng, dest.lat, dest.lng);
    const rijKm = Math.round(km * 1.35);
    return {
      afstandKm: rijKm,
      rijtijdMin: Math.round((rijKm / 75) * 60),
      bron: "schatting" as const,
    };
  });

  return NextResponse.json({ routes: results });
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
