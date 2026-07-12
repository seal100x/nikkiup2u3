import React, { useEffect, useRef, useState } from "react";
import "./SubCategoryBar.css";

interface SubCategoryBarProps {
  mainCat: string;
  subCats: string[];
  selected: string[];
  onChange: (subs: string[]) => void;
}

const SUPPORTED = ["饰品", "袜子"];

const SubCategoryBar: React.FC<SubCategoryBarProps> = ({
  mainCat,
  subCats,
  selected,
  onChange,
}) => {
  const [collapsed, setCollapsed] = useState(true);
  const label = mainCat === "饰品" ? "饰品细分类" : "袜子细分类";
  const tags = subCats;
  const prefix = mainCat + "-";
  const selectedSet = new Set(selected.filter((tag) => subCats.includes(tag)));
  const selectedCount = selectedSet.size;
  const totalCount = subCats.length;
  const allSelected = selectedCount === totalCount;
  const partiallySelected = selectedCount > 0 && selectedCount < totalCount;
  const allCheckboxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (allCheckboxRef.current) {
      allCheckboxRef.current.indeterminate = partiallySelected;
    }
  }, [partiallySelected]);

  if (!SUPPORTED.includes(mainCat) || subCats.length === 0) return null;

  const toggleAll = () => {
    onChange(allSelected ? [] : [...subCats]);
  };

  const toggleOne = (tag: string) => {
    const next = new Set(selectedSet);
    if (next.has(tag)) {
      next.delete(tag);
    } else {
      next.add(tag);
    }
    onChange([...next]);
  };

  return (
    <div className='sub-cat-wrapper'>
      <div className='sub-cat-header'>
        <div className='sub-cat-header-left'>
          <span className='sub-cat-hint-label'>{label}</span>
          <label className='sub-cat-all-toggle'>
            <input
              ref={allCheckboxRef}
              type='checkbox'
              className='sub-cat-all-checkbox'
              checked={allSelected}
              onChange={toggleAll}
            />
            <span>全部细类</span>
          </label>
        </div>
        <div className='sub-cat-header-right'>
          <div
            className='sub-cat-toggle-btn'
            onClick={() => setCollapsed((prev) => !prev)}
          >
            {collapsed ? "展开" : "收起"}
          </div>
        </div>
      </div>
      <div
        className={`sub-cat-tag-panel${collapsed ? " is-collapsed" : " is-expanded"}`}
      >
        <div className='sub-cat-tag-list'>
          {tags.map((tag) => {
            const active = selectedSet.has(tag);
            const displayName = tag.startsWith(prefix)
              ? tag.slice(prefix.length)
              : tag;
            return (
              <button
                key={tag}
                onClick={() => toggleOne(tag)}
                className={`sub-cat-tag${active ? " active" : ""}`}
              >
                {displayName}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SubCategoryBar;
