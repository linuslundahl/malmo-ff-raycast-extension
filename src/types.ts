export type Table = {
  title: string;
  table: Team[];
};

export type Team = {
  teamName: string;
  teamSlug: string;
  rank: number;
  previousRank: number;
  /** The API returns all stats as strings, e.g. `"pts": "51"` */
  stats: {
    gp: string;
    w: string;
    d: string;
    l: string;
    gf: string;
    ga: string;
    gd: string;
    pts: string;
  };
};

export type Data = {
  [key: string]: Table;
};

export type Game = {
  timestamp: number;
  date: string;
  time: string;
  homeTeam: string;
  awayTeam: string;
  homeSlug: string;
  awaySlug: string;
  venue: string;
  competition: string;
  location: string;
  /** null for games that haven't been played yet */
  homeTeamScore: number | null;
  /** null for games that haven't been played yet */
  awayTeamScore: number | null;
  /** null for games that haven't been played yet */
  gameOutcome: "win" | "loss" | "tie" | null;
  homeTeamPoints: number | null;
  awayTeamPoints: number | null;
  played: boolean;
};

export type ScheduleData = {
  played: Game[];
  unplayed: Game[];
};

export type NewsItem = {
  title: string;
  link: string;
  description: string | null;
  timestamp: number;
  date: string;
  type: string;
  source: string;
};
