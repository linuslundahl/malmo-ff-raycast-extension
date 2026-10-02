import { Game } from "./types";

export const formatDate = (timestamp: number): string =>
  new Date(timestamp * 1000).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export const formatShortDate = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yy = String(date.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
};

export const formatGame = (game: Game): { teams: string; date: string; full: string } => {
  const teams = `${game.homeTeam} - ${game.awayTeam}`;
  const date = formatDate(game.timestamp);
  return {
    teams,
    date,
    full: `${teams} (${date})`,
  };
};
