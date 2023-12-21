import { Icon, List } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { ContextProvider } from "../context";
import type { Data, Table } from "../types";

const isTable = (item: unknown): item is Table =>
  typeof item === "object" && item !== null && "title" in item && "table" in item;

const TableComponent = ({ gender }: { gender?: string }) => {
  const { isLoading, data } = useFetch(
    `https://api.unwi.se/sport/mff/${gender !== undefined ? `${gender}/` : ""}standings`,
    { keepPreviousData: true },
  );

  if (isLoading || data === undefined) {
    return (
      <List navigationTitle="Table">
        <List.EmptyView icon={Icon.SoccerBall} title={isLoading ? "Loading" : "Unable to load Table"} />
      </List>
    );
  }

  return (
    <List filtering={false} navigationTitle="Table" isLoading={isLoading}>
      {Object.values(data as Data).map((item) => {
        if ((isTable(item) && item.title === "Allsvenskan") || item.title === "Damallsvenskan") {
          return item.table.map((team) => {
            const accessories = [
              { text: { value: team.stats.gp.toString() }, tooltip: "Games Played" },
              { text: { value: team.stats.w.toString() }, tooltip: "Wins" },
              { text: { value: team.stats.d.toString() }, tooltip: "Draws" },
              { text: { value: team.stats.l.toString() }, tooltip: "Losses" },
              { text: { value: team.stats.gf.toString() }, tooltip: "Goals For" },
              { text: { value: team.stats.ga.toString() }, tooltip: "Goals Against" },
              { text: { value: team.stats.gd.toString() }, tooltip: "Goal Difference" },
              { text: { value: team.stats.pts.toString() }, tooltip: "Points" },
            ];

            return (
              <List.Item
                key={team.rank}
                title={team.rank.toString()}
                subtitle={team.teamName}
                accessories={accessories}
              />
            );
          });
        }
      })}
    </List>
  );
};

export default function Table({ gender }: { gender?: string }) {
  return (
    <ContextProvider>
      <TableComponent gender={gender} />
    </ContextProvider>
  );
}
