import { Action, ActionPanel, Icon, List, LocalStorage, updateCommandMetadata, useNavigation } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { useEffect } from "react";
import Table from "./components/Table";
import Schedule, { isSchedule } from "./components/Schedule";
import News from "./components/News";
import type { ScheduleData } from "./types";
import { formatGame } from "./utils";
import { FALLBACK_SUBTITLE, NEXT_GAME_STORAGE_KEY } from "./constants";

export default function Command() {
  const { push } = useNavigation();
  const { isLoading, data } = useFetch<ScheduleData>("https://api.unwi.se/sport/mff/schedule", {
    keepPreviousData: true,
  });

  const nextGame = isSchedule(data) && data.unplayed.length > 0 ? formatGame(data.unplayed[0]) : null;

  // Apply the next-game subtitle cached by the menu-bar command right away, so
  // the root-search subtitle is fresh even when this view hasn't been opened.
  useEffect(() => {
    LocalStorage.getItem<string>(NEXT_GAME_STORAGE_KEY)
      .then((stored) => {
        if (typeof stored === "string" && stored.length > 0) {
          return updateCommandMetadata({ subtitle: stored });
        }
        return undefined;
      })
      .catch(() => {
        // Non-fatal; keep the manifest subtitle.
      });
  }, []);

  // Once the live fetch resolves, reconcile the subtitle with fresh data.
  useEffect(() => {
    if (isLoading) {
      return;
    }
    updateCommandMetadata({ subtitle: nextGame?.full ?? FALLBACK_SUBTITLE }).catch(() => {
      // Non-fatal; keep the previous subtitle.
    });
  }, [isLoading, nextGame?.full]);

  return (
    <List
      navigationTitle={nextGame?.full ?? (isLoading ? "Loading next game…" : "Malmö FF")}
      isShowingDetail={false}
      isLoading={isLoading}
    >
      <List.Section title="News">
        <List.Item
          key="news"
          icon={Icon.Rss}
          title="News"
          subtitle="Latest headlines"
          actions={
            <ActionPanel>
              <Action title="Select" onAction={() => push(<News />)} />
            </ActionPanel>
          }
        />
      </List.Section>
      <List.Section title="Men">
        <List.Item
          key="table-men"
          icon={Icon.Trophy}
          title="Table"
          subtitle="Allsvenskan"
          actions={
            <ActionPanel>
              <Action title="Select" onAction={() => push(<Table />)} />
            </ActionPanel>
          }
        />
        <List.Item
          key="schedule-men"
          icon={Icon.Calendar}
          title="Schedule"
          subtitle="Allsvenskan"
          actions={
            <ActionPanel>
              <Action title="Select" onAction={() => push(<Schedule />)} />
            </ActionPanel>
          }
        />
      </List.Section>
      <List.Section title="Women">
        <List.Item
          key="table-women"
          icon={Icon.Trophy}
          title="Table"
          subtitle="Damallsvenskan"
          actions={
            <ActionPanel>
              <Action title="Select" onAction={() => push(<Table gender="dam" />)} />
            </ActionPanel>
          }
        />
        <List.Item
          key="schedule-women"
          icon={Icon.Calendar}
          title="Schedule"
          subtitle="Damallsvenskan"
          actions={
            <ActionPanel>
              <Action title="Select" onAction={() => push(<Schedule gender="dam" />)} />
            </ActionPanel>
          }
        />
      </List.Section>
    </List>
  );
}
