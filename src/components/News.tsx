import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import type { NewsItem } from "../types";
import { formatDate } from "../utils";

export const isNews = (item: unknown): item is NewsItem[] =>
  Array.isArray(item) &&
  item.every((entry) => typeof entry === "object" && entry !== null && "title" in entry && "link" in entry);

const NewsListItem = ({ item }: { item: NewsItem }) => (
  <List.Item
    title={item.title.trim()}
    subtitle={item.source}
    accessories={[{ date: new Date(item.timestamp * 1000), tooltip: formatDate(item.timestamp) }]}
    actions={
      <ActionPanel>
        <Action.OpenInBrowser url={item.link} />
        <Action.CopyToClipboard title="Copy Link" content={item.link} shortcut={{ modifiers: ["cmd"], key: "c" }} />
      </ActionPanel>
    }
  />
);

export default function News() {
  const { isLoading, data } = useFetch<NewsItem[]>("https://api.unwi.se/sport/mff/rss", {
    keepPreviousData: true,
  });

  const items = isNews(data) ? data.slice(0, 40) : [];

  return (
    <List navigationTitle="News" isLoading={isLoading}>
      {items.length === 0 && !isLoading ? (
        <List.EmptyView icon={Icon.Rss} title="No news found" />
      ) : (
        items.map((item) => <NewsListItem key={`${item.timestamp}-${item.link}`} item={item} />)
      )}
    </List>
  );
}
