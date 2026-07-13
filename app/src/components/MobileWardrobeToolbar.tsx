import { useState } from "react";
import { Button, Checkbox, Input } from "antd";
import {
  FilterOutlined,
  PlusCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import type { QuickFilter } from "../App";

const SOURCE_OPTIONS = [
  "少女级",
  "公主级",
  "店",
  "设计图",
  "活动",
  "梦境",
  "迷之屋限定",
  "赠送/签到",
];
const STAR_OPTIONS = ["3", "4", "5"];
const MISC_OPTIONS = ["尚缺材料", "暂不缺材料", "套装部件", "新品"];

interface MobileWardrobeToolbarProps {
  showOwn: boolean;
  showMissing: boolean;
  onShowOwnChange: (checked: boolean) => void;
  onShowMissingChange: (checked: boolean) => void;
  nameSearch: string;
  onNameSearchChange: (value: string) => void;
  onSearch: (value?: string) => void;
  quickFilter: QuickFilter;
  onQuickFilterChange: (filter: QuickFilter) => void;
  onAddAll: (opts: {
    showOwn: boolean;
    showMissing: boolean;
    nameSearch: string;
  }) => void;
}

export default function MobileWardrobeToolbar({
  showOwn,
  showMissing,
  onShowOwnChange,
  onShowMissingChange,
  nameSearch,
  onNameSearchChange,
  onSearch,
  quickFilter,
  onQuickFilterChange,
  onAddAll,
}: MobileWardrobeToolbarProps) {
  const [filterOpen, setFilterOpen] = useState(false);
  const activeCount =
    quickFilter.source.length + quickFilter.stars.length + quickFilter.misc.length;

  const toggle = (group: keyof QuickFilter, value: string) => {
    const selected = quickFilter[group];
    onQuickFilterChange({
      ...quickFilter,
      [group]: selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value],
    });
  };

  const renderOptions = (
    group: keyof QuickFilter,
    options: string[],
    modifier = "",
  ) => (
    <div className='mobile-wardrobe-filter-tags'>
      {options.map((option) => (
        <button
          key={option}
          className={`fp-qf-tag${modifier}${quickFilter[group].includes(option) ? " fp-qf-tag--active" : ""}`}
          onClick={() => toggle(group, option)}
        >
          {group === "stars" ? `${option}星` : option}
        </button>
      ))}
    </div>
  );

  return (
    <>
      <div className='mobile-wardrobe-toolbar'>
        <div className='mobile-wardrobe-toolbar-checks'>
          <Checkbox checked={showOwn} onChange={(e) => onShowOwnChange(e.target.checked)}>
            已有
          </Checkbox>
          <Checkbox checked={showMissing} onChange={(e) => onShowMissingChange(e.target.checked)}>
            未有
          </Checkbox>
        </div>
        <Input
          className='mobile-wardrobe-search'
          allowClear
          prefix={<SearchOutlined />}
          placeholder='搜索衣服'
          value={nameSearch}
          onChange={(e) => {
            onNameSearchChange(e.target.value);
            onSearch(e.target.value);
          }}
          onPressEnter={() => onSearch()}
        />
        <Button
          type={filterOpen ? "primary" : "default"}
          icon={<FilterOutlined />}
          onClick={() => setFilterOpen((open) => !open)}
        >
          筛选{activeCount > 0 ? ` ${activeCount}` : ""}
        </Button>
      </div>

      {filterOpen && (
        <div className='fp-qf mobile-wardrobe-filter-panel'>
          <div className='fp-qf-header mobile-wardrobe-filter-header'>
            <span className='fp-qf-title'>
              <FilterOutlined />
              <span>筛选</span>
              <span className='fp-qf-subtitle'>支持跨分组叠加筛选</span>
            </span>
            <button
              className='fp-qf-addall'
              onClick={() => onAddAll({ showOwn, showMissing, nameSearch })}
            >
              <PlusCircleOutlined />
              添加显示的衣服到衣柜
            </button>
          </div>
          <div className='fp-qf-row mobile-wardrobe-filter-group'>
            <span className='fp-qf-group-label fp-qf-group-label--source'>
              来源
            </span>
            {renderOptions("source", SOURCE_OPTIONS)}
          </div>
          <div className='fp-qf-row mobile-wardrobe-filter-group'>
            <span className='fp-qf-group-label fp-qf-group-label--stars'>
              星级
            </span>
            {renderOptions("stars", STAR_OPTIONS, " fp-qf-tag--stars")}
          </div>
          <div className='fp-qf-row mobile-wardrobe-filter-group'>
            <span className='fp-qf-group-label fp-qf-group-label--misc'>
              其他
            </span>
            {renderOptions("misc", MISC_OPTIONS, " fp-qf-tag--misc")}
          </div>
          {activeCount > 0 && (
            <div className='mobile-wardrobe-filter-footer'>
              <Button
                size='small'
                onClick={() =>
                  onQuickFilterChange({ source: [], stars: [], misc: [] })
                }
              >
                清空筛选
              </Button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
