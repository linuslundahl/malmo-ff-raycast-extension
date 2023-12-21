import { Game } from "./types";

export const formatDate = (date: string, time?: string): string =>
  `${new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })}${![undefined, "00:00"].includes(time) ? ` at ${time}` : ""}`;

export const formatGame = (game: Game): { teams: string; date: string; full: string } => {
  const teams = `${game.homeTeam} - ${game.awayTeam}`;
  const date = formatDate(game.date, game.time);
  return {
    teams,
    date,
    full: `${teams} (${date})`,
  };
};
