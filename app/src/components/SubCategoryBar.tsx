import React from "react";
import "./SubCategoryBar.css";

interface SubCategoryBarProps {
  mainCat: string;
  subCats: string[];
  current: string; // "" means 全部细类
  onChange: (sub: string) => void;
}

const SUPPORTED = ["饰品", "袜子"];

const SubCategoryBar: React.FC<SubCategoryBarProps> = ({
  mainCat,
  subCats,
  current,
  onChange,
}) => {
  if (!SUPPORTED.includes(mainCat) || subCats.length === 0) return null;

  const label = mainCat === "饰品" ? "饰品细分类" : "袜子细分类";
  const tags = ["全部细类", ...subCats];
  const prefix = mainCat + "-";

  return (
    <div className="sub-cat-wrapper">
      <span className="sub-cat-hint-label">{label}</span>
      <div className="sub-cat-tag-list">
        {tags.map((tag) => {
          const active = tag === "全部细类" ? !current : current === tag;
          const displayName = tag === "全部细类" ? tag : tag.startsWith(prefix) ? tag.slice(prefix.length) : tag;
          return (
            <button
              key={tag}
              onClick={() => onChange(tag === "全部细类" ? "" : tag)}
              className={`sub-cat-tag${active ? " active" : ""}`}
            >
              {displayName}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SubCategoryBar;
