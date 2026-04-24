import React from "react";
import { Tabs, Badge } from "antd";

interface CategoryTabsProps {
  categories: string[];
  current: string;
  counts: Record<string, number>; // mainType -> count
  onChange: (cat: string) => void;
}

function getMainCategories(cats: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const c of cats) {
    const main = c.split("-")[0];
    if (!seen.has(main)) {
      seen.add(main);
      result.push(main);
    }
  }
  return [...result, "全部"];
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  current,
  counts,
  onChange,
}) => {
  const mainCats = getMainCategories(categories);

  const items = mainCats.map((cat) => ({
    key: cat,
    label: (
      <span>
        {cat}
        {counts[cat] != null && (
          <Badge
            count={counts[cat]}
            showZero
            overflowCount={999999}
            style={{
              marginLeft: 4,
              backgroundColor: cat === current ? "#1890ff" : "#d9d9d9",
              color: cat === current ? "#fff" : "#666",
              boxShadow: "none",
              fontSize: 11,
            }}
          />
        )}
      </span>
    ),
  }));

  return (
    <Tabs
      activeKey={current || "全部"}
      items={items}
      onChange={onChange}
      size='small'
      style={{ marginBottom: 0 }}
    />
  );
};

export default CategoryTabs;
