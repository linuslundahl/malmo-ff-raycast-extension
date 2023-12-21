export type Table = {
  title: string;
  table: {
    teamName: string;
    teamSlug: string;
    rank: number;
    previousRank: number;
    stats: {
      gp: number;
      w: number;
      d: number;
      l: number;
      gf: number;
      ga: number;
      gd: number;
      pts: number;
    };
  }[];
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
  homeTeamScore: number;
  awayTeamScore: number;
  gameOutcome: "win" | "loss" | "tie";
  homeTeamPoints: number;
};

export type ScheduleData = {
  played: Game[];
  unplayed: Game[];
};
