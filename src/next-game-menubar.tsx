import { Icon, LocalStorage, MenuBarExtra } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { useEffect } from "react";
import { ScheduleData } from "./types";
import { isSchedule } from "./components/Schedule";
import { formatGame } from "./utils";
import { FALLBACK_SUBTITLE, NEXT_GAME_STORAGE_KEY } from "./constants";

export default function Command() {
  const { isLoading, data } = useFetch<ScheduleData>("https://api.unwi.se/sport/mff/schedule", {
    keepPreviousData: true,
  });

  const games = isSchedule(data) ? [...data.unplayed, ...data.played.slice().reverse()] : [];
  const nextGame = games.length > 0 ? formatGame(games[0]) : null;

  // Persist the latest next game so the main command can show it as its
  // root-search subtitle even when it hasn't been opened recently.
  useEffect(() => {
    if (isLoading) {
      return;
    }
    LocalStorage.setItem(NEXT_GAME_STORAGE_KEY, nextGame?.full ?? FALLBACK_SUBTITLE).catch(() => {
      // Non-fatal; the stored value just stays stale.
    });
  }, [isLoading, nextGame?.full]);

  return (
    <MenuBarExtra icon={Icon.SoccerBall} title={nextGame?.teams} tooltip="Malmö FF – Next game" isLoading={isLoading}>
      {games.slice(0, 10).map((game) => {
        const formatted = formatGame(game);
        return (
          <MenuBarExtra.Item
            key={`${game.date}-${game.homeSlug}-${game.awaySlug}`}
            title={formatted.teams}
            subtitle={formatted.date}
          />
        );
      })}
      {games.length === 0 && !isLoading && <MenuBarExtra.Item title="No games found" />}
    </MenuBarExtra>
  );
}
