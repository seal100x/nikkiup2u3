import React, { useState, useEffect, useCallback } from "react";
import "./panel.css";
import { Button, Checkbox, Select, Modal, Input, Radio } from "antd";
import {
  ThunderboltOutlined,
  SettingOutlined,
  SearchOutlined,
  SlidersOutlined,
  TagsOutlined,
  FilterOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import type { QuickFilter } from "../App";

// 五维属性列表（与原始 FEATURES 顺序一致）
const FEATURES = [
  { key: "simple", pos: "简约", neg: "华丽" },
  { key: "cute", pos: "可爱", neg: "成熟" },
  { key: "active", pos: "活泼", neg: "优雅" },
  { key: "pure", pos: "清纯", neg: "性感" },
  { key: "cool", pos: "清凉", neg: "保暖" },
];

// 高级选项
const ADVANCED_OPTIONS = [
  { key: "sortbyscore", label: "按分数和id排序" },
  { key: "balance", label: "均衡权重" },
  { key: "highscore", label: "高分权重" },
  { key: "acc9", label: "9件饰品" },
  { key: "toulan", label: "偷懒模式" },
  { key: "byCategoryAndId", label: "上回试穿排序" },
];

const BASE_OPTIONS = ["SS", "S", "A", "B", "C"];

interface TagFilter {
  tag: string;
  method: "add" | "replace";
  base: string;
  weight: string;
}

interface FeatureState {
  direction: 1 | -1 | null; // 1=positive, -1=negative, null=unset
  weight: string;
  boost1d27: boolean; // ×1.27 active (highscore)
  boost1d778: boolean; // ×1.778 active (highscore)
  rank: string; // rank roman numeral display
}

// 快速筛选分组定义
const QF_SOURCE = [
  "少女级",
  "公主级",
  "店",
  "设计图",
  "活动",
  "梦境",
  "迷之屋限定",
  "赠送/签到",
];
const QF_STARS = ["3", "4", "5"];
const QF_MISC = ["尚缺材料", "暂不缺材料", "套装部件", "新品"];

interface FilterPanelProps {
  onFilter: (nameSearchOverride?: string) => void;
  nameSearch: string;
  onNameSearchChange: (value: string) => void;
  quickFilter: QuickFilter;
  onQuickFilterChange: (qf: QuickFilter) => void;
  onAddAll: (opts: {
    showOwn: boolean;
    showMissing: boolean;
    nameSearch: string;
  }) => void;
}

// Helper: read window.allThemes (populated from levels.js)
function getThemeOptions(): { label: string; value: string }[] {
  const w = window as any;
  if (!w.allThemes) return [];
  return [
    { label: "自定义关卡", value: "custom" },
    ...Object.keys(w.allThemes).map((k) => ({ label: k, value: k })),
  ];
}
function getThemeFilterOptions(): { label: string; value: string }[] {
  const w = window as any;
  if (!w.themeFilter) return [];
  return [
    { label: "筛选", value: "custom" },
    ...w.themeFilter.map((t: [string, string]) => ({
      label: t[0],
      value: t[1],
    })),
  ];
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  onFilter,
  nameSearch,
  onNameSearchChange,
  quickFilter,
  onQuickFilterChange,
  onAddAll,
}) => {
  const w = window as any;

  // ────────── state ──────────
  const [features, setFeatures] = useState<Record<string, FeatureState>>(() =>
    Object.fromEntries(
      FEATURES.map((f) => [
        f.key,
        {
          direction: null,
          weight: "1",
          boost1d27: false,
          boost1d778: false,
          rank: "",
        },
      ]),
    ),
  );
  const [tag1, setTag1] = useState<TagFilter>({
    tag: "",
    method: "add",
    base: "SS",
    weight: "1",
  });
  const [tag2, setTag2] = useState<TagFilter>({
    tag: "",
    method: "add",
    base: "SS",
    weight: "1",
  });

  const [showOwn, setShowOwn] = useState(true);
  const [showMissing, setShowMissing] = useState(true);

  const [advanced, setAdvanced] = useState<Record<string, boolean>>({
    sortbyscore: false,
    balance: false,
    highscore: false,
    acc9: false,
    toulan: false,
    byCategoryAndId: false,
  });

  const [themeFilter, setThemeFilter] = useState("custom");
  const [theme, setTheme] = useState("custom");
  const [filteredThemeOptions, setFilteredThemeOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [themeFilterOptions, setThemeFilterOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const [strategyVisible, setStrategyVisible] = useState(false);
  const [strategyHtml, setStrategyHtml] = useState("");

  const [levelInfo, setLevelInfo] = useState({
    tagInfo: "",
    skillInfo: "",
    categoryFInfo: "",
    hintInfo: "",
  });

  // Initialize theme options after data loads
  useEffect(() => {
    const check = () => {
      if (w.allThemes && w.themeFilter) {
        setThemeFilterOptions(getThemeFilterOptions());
        setFilteredThemeOptions(getThemeOptions());
      } else {
        setTimeout(check, 200);
      }
    };
    check();
  }, []);

  useEffect(() => {
    const detectTouchDevice = () => {
      const hasCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
      const hasTouchPoints = navigator.maxTouchPoints > 0;
      setIsTouchDevice(hasCoarsePointer || hasTouchPoints);
    };
    detectTouchDevice();
    window.addEventListener("resize", detectTouchDevice);
    return () => window.removeEventListener("resize", detectTouchDevice);
  }, []);

  // ────────── sync uiFilter → window ──────────
  const syncUiFilter = useCallback(
    (adv: Record<string, boolean>, own: boolean, missing: boolean) => {
      const filter: Record<string, boolean> = { own, missing };
      for (const k of Object.keys(adv)) {
        if (adv[k]) filter[k] = true;
      }
      // enable all category sub-types
      if (w.CATEGORY_HIERARCHY) {
        for (const c in w.CATEGORY_HIERARCHY) {
          const subs: string[] = w.CATEGORY_HIERARCHY[c];
          for (const s of subs) filter[s] = true;
          filter[c] = true;
        }
      }
      w.uiFilter = filter;
    },
    [],
  );

  // ────────── build criteria from state ──────────
  const buildCriteria = useCallback(
    (
      feats: Record<string, FeatureState>,
      t1: TagFilter,
      t2: TagFilter,
      isHighscore: boolean,
      currentTheme: string,
    ) => {
      const crit: Record<string, any> = {};
      for (const f of FEATURES) {
        const fs = feats[f.key];
        if (fs.direction === null) continue;
        let w_ = parseFloat(fs.weight) || 1;
        if (isHighscore) {
          if (fs.boost1d778) w_ = w_ * 1.778;
          if (fs.boost1d27) w_ = w_ * 1.27;
          if (fs.boost1d27) crit.highscore1 = f.key;
          if (fs.boost1d778) crit.highscore2 = f.key;
        }
        crit[f.key] = fs.direction * w_;
      }
      // tag bonuses
      buildTagBonus(crit, t1, "tag1");
      buildTagBonus(crit, t2, "tag2");
      // additional bonus from level
      if (w.global?.additionalBonus?.length > 0) {
        crit.bonus = w.global.additionalBonus;
      }
      crit.levelName = currentTheme;
      return crit;
    },
    [],
  );

  function buildTagBonus(crit: any, tf: TagFilter, id: string) {
    console.log(id);

    if (!tf.tag) return;
    const weight = parseFloat(tf.weight) || 1;
    let bonus = null;
    if (tf.method === "replace") {
      bonus = w.replaceScoreBonusFactory?.(tf.base, weight, tf.tag)?.(crit);
    } else {
      bonus = w.addScoreBonusFactory?.(tf.base, weight, tf.tag)?.(crit);
    }
    if (bonus) {
      if (!crit.bonus) crit.bonus = [];
      crit.bonus.push(bonus);
    }
  }

  // ────────── main apply function ──────────
  const applyFilter = useCallback(
    (
      feats?: Record<string, FeatureState>,
      adv?: Record<string, boolean>,
      own?: boolean,
      missing?: boolean,
      t1?: TagFilter,
      t2?: TagFilter,
      currentTheme?: string,
    ) => {
      const _feats = feats ?? features;
      const _adv = adv ?? advanced;
      const _own = own ?? showOwn;
      const _missing = missing ?? showMissing;
      const _t1 = t1 ?? tag1;
      const _t2 = t2 ?? tag2;
      const _theme = currentTheme ?? theme;

      syncUiFilter(_adv, _own, _missing);

      const isHighscore = _adv.highscore ?? false;

      if (isHighscore) {
        // Let autogenLimit handle it: but autogenLimit reads from DOM
        // So we sync to hidden DOM inputs then call it
        syncToHiddenDom(_feats, _t1, _t2, _theme);
        w.autogenLimit?.();
        // After autogenLimit, read back the boost state it computed
        readBackBoosts(_feats);
      } else {
        const crit = buildCriteria(_feats, _t1, _t2, false, _theme);
        w.criteria = crit;
        w.shoppingCart?.calc(crit);
        w.drawLevelInfo?.();
        setTimeout(() => w.chooseAccessories?.(crit), 0);
      }

      updateLevelInfo();
      onFilter();
    },
    [features, advanced, showOwn, showMissing, tag1, tag2, theme],
  );

  // Sync React state → hidden DOM inputs (for autogenLimit compatibility)
  function syncToHiddenDom(
    feats: Record<string, FeatureState>,
    t1: TagFilter,
    t2: TagFilter,
    currentTheme: string,
  ) {
    for (const f of FEATURES) {
      const fs = feats[f.key];
      const wEl = document.getElementById(f.key + "Weight") as HTMLInputElement;
      if (wEl) wEl.value = fs.weight || "1";
      const radios = document.querySelectorAll<HTMLInputElement>(
        `input[name="${f.key}"]`,
      );
      radios.forEach((r) => {
        r.checked = parseInt(r.value) === fs.direction;
      });
      // 同步 boost 状态到隐藏 span（autogenLimit 读取 .active 类）
      const el27 = document.getElementById(f.key + "1d27");
      const el778 = document.getElementById(f.key + "1d778");
      if (el27) el27.classList.toggle("active", !!fs.boost1d27);
      if (el778) el778.classList.toggle("active", !!fs.boost1d778);
    }
    // tag inputs
    (["tag1", "tag2"] as const).forEach((tid, idx) => {
      const tf = idx === 0 ? t1 : t2;
      const tagEl = document.getElementById(tid) as HTMLInputElement;
      const weightEl = document.getElementById(
        tid + "weight",
      ) as HTMLInputElement;
      const baseEl = document.getElementById(tid + "base") as HTMLSelectElement;
      if (tagEl) tagEl.value = tf.tag;
      if (weightEl) weightEl.value = tf.weight;
      if (baseEl) baseEl.value = tf.base;
      const methodRadios = document.querySelectorAll<HTMLInputElement>(
        `input[name="${tid}method"]`,
      );
      methodRadios.forEach((r) => {
        r.checked = r.value === tf.method;
      });
    });
    // theme — 确保隐藏 select 里有该 option，否则 showStrategy 读不到正确值
    const themeEl = document.getElementById("theme") as HTMLSelectElement;
    if (themeEl) {
      if (
        currentTheme !== "custom" &&
        !themeEl.querySelector(`option[value="${currentTheme}"]`)
      ) {
        const opt = document.createElement("option");
        opt.value = currentTheme;
        opt.text = currentTheme;
        themeEl.add(opt);
      }
      themeEl.value = currentTheme;
    }
  }

  // After autogenLimit runs, read back which boosts it activated
  function readBackBoosts(feats: Record<string, FeatureState>) {
    const newFeats = { ...feats };
    for (const f of FEATURES) {
      const el27 = document.getElementById(f.key + "1d27");
      const el778 = document.getElementById(f.key + "1d778");
      newFeats[f.key] = {
        ...newFeats[f.key],
        boost1d27: el27?.classList.contains("active") ?? false,
        boost1d778: el778?.classList.contains("active") ?? false,
      };
      // read rank
      const rankEl = document.getElementById(f.key + "rank");
      if (rankEl) newFeats[f.key].rank = rankEl.textContent ?? "";
    }
    setFeatures(newFeats);
  }

  function updateLevelInfo() {
    setLevelInfo({
      tagInfo: document.getElementById("tagInfo")?.textContent ?? "",
      skillInfo: document.getElementById("skillInfo")?.textContent ?? "",
      categoryFInfo:
        document.getElementById("categoryFInfo")?.textContent ?? "",
      hintInfo: document.getElementById("hintInfo")?.textContent ?? "",
    });
  }

  // ────────── quick filter toggle ──────────
  const toggleQF = (group: keyof QuickFilter, val: string) => {
    const prev = quickFilter[group];
    const next = prev.includes(val)
      ? prev.filter((v) => v !== val)
      : [...prev, val];
    onQuickFilterChange({ ...quickFilter, [group]: next });
  };

  const clearQF = () =>
    onQuickFilterChange({ source: [], stars: [], misc: [] });

  const activeCount =
    quickFilter.source.length +
    quickFilter.stars.length +
    quickFilter.misc.length;
  const activeAll = [
    ...quickFilter.source,
    ...quickFilter.stars.map((s) => s + "星"),
    ...quickFilter.misc,
  ];

  // ────────── handlers ──────────
  const handleFeatureDirection = (key: string, dir: 1 | -1) => {
    const current = features[key].direction;
    const newDir: 1 | -1 | null = current === dir ? null : dir;
    const newFeats = {
      ...features,
      [key]: { ...features[key], direction: newDir },
    };
    setFeatures(newFeats);
    if (theme !== "custom") setTheme("custom");
    applyFilter(newFeats);
  };

  const handleFeatureWeight = (key: string, val: string) => {
    const newFeats = { ...features, [key]: { ...features[key], weight: val } };
    setFeatures(newFeats);
    // 手动修改权重 → 切换为自定义关卡
    if (theme !== "custom") setTheme("custom");
    applyFilter(newFeats);
  };

  const handleHighscoreBoost = (key: string, boostType: "1d27" | "1d778") => {
    const field = boostType === "1d27" ? "boost1d27" : "boost1d778";
    const wasActive = features[key][field];
    // 同类 boost 互斥：先清除所有同类，再 toggle 当前
    const newFeats = Object.fromEntries(
      FEATURES.map((f) => [
        f.key,
        { ...features[f.key], [field]: f.key === key ? !wasActive : false },
      ]),
    ) as typeof features;
    setFeatures(newFeats);
    // 手动选择 boost 时直接用 buildCriteria（不走 autogenLimit，避免被覆盖）
    syncUiFilter(advanced, showOwn, showMissing);
    const crit = buildCriteria(newFeats, tag1, tag2, true, theme);
    w.criteria = crit;
    w.shoppingCart?.calc(crit);
    w.drawLevelInfo?.();
    setTimeout(() => w.chooseAccessories?.(crit), 0);
    updateLevelInfo();
    onFilter();
  };

  const handleAdvancedChange = (key: string, checked: boolean) => {
    const newAdv = { ...advanced, [key]: checked };
    setAdvanced(newAdv);

    if (key === "balance" && checked) {
      // balance mode: re-apply current theme with balance
      applyFilter(undefined, newAdv);
    } else if (key === "highscore") {
      applyFilter(undefined, newAdv);
    } else {
      syncUiFilter(newAdv, showOwn, showMissing);
      if (key === "byCategoryAndId") {
        w.refreshShoppingCart?.();
      }
      onFilter();
    }
  };

  const handleThemeFilterChange = (val: string) => {
    setThemeFilter(val);
    // filter theme options
    const all = getThemeOptions();
    if (val === "custom") {
      setFilteredThemeOptions(all);
    } else {
      setFilteredThemeOptions(
        all.filter((o) => o.value === "custom" || o.value.indexOf(val) >= 0),
      );
    }
  };

  const handleThemeChange = (val: string) => {
    setTheme(val);
    w.global = w.global || {};
    w.global.additionalBonus = null;
    // reset currentLevel
    w.currentLevel = null;
    if (val !== "custom" && w.allThemes?.[val]) {
      const level = w.allThemes[val];
      w.currentLevel = level;
      w.global.additionalBonus = level.additionalBonus;
      // Apply weights from level
      const newFeats = { ...features };
      for (const f of FEATURES) {
        let weight = level.weight[f.key];
        if (advanced.balance) {
          weight = weight > 0 ? 1 : weight < 0 ? -1 : 0;
        }
        newFeats[f.key] = {
          ...newFeats[f.key],
          direction: weight > 0 ? 1 : weight < 0 ? -1 : null,
          weight: String(Math.abs(weight)),
        };
      }
      // Apply tag bonuses from level
      let newTag1: TagFilter = {
        tag: "",
        method: "add",
        base: "SS",
        weight: "1",
      };
      let newTag2: TagFilter = {
        tag: "",
        method: "add",
        base: "SS",
        weight: "1",
      };
      if (level.bonus) {
        if (level.bonus[0]) {
          newTag1 = {
            tag: level.bonus[0].tag || "",
            method: level.bonus[0].replace ? "replace" : "add",
            base: level.bonus[0].base || "SS",
            weight: String(level.bonus[0].weight || 1),
          };
        }
        if (level.bonus[1]) {
          newTag2 = {
            tag: level.bonus[1].tag || "",
            method: level.bonus[1].replace ? "replace" : "add",
            base: level.bonus[1].base || "SS",
            weight: String(level.bonus[1].weight || 1),
          };
        }
      }
      setFeatures(newFeats);
      setTag1(newTag1);
      setTag2(newTag2);
      applyFilter(
        newFeats,
        undefined,
        undefined,
        undefined,
        newTag1,
        newTag2,
        val,
      );
    } else {
      // 切回自定义关卡：重置所有风格权重和 tag
      const resetFeats = Object.fromEntries(
        FEATURES.map((f) => [
          f.key,
          {
            direction: null,
            weight: "1",
            boost1d27: false,
            boost1d778: false,
            rank: "",
          },
        ]),
      ) as Record<string, FeatureState>;
      const resetTag: TagFilter = {
        tag: "",
        method: "add",
        base: "SS",
        weight: "1",
      };
      setFeatures(resetFeats);
      setTag1(resetTag);
      setTag2(resetTag);
      applyFilter(
        resetFeats,
        undefined,
        undefined,
        undefined,
        resetTag,
        resetTag,
        val,
      );
    }
  };

  const handleOnekey = () => {
    syncUiFilter(advanced, showOwn, showMissing);
    syncToHiddenDom(features, tag1, tag2, theme);
    // 确保隐藏 DOM 的关卡提示是最新的，showStrategy 会读取它们
    w.drawLevelInfo?.();
    w.showStrategy?.();
    setTimeout(() => {
      const el = document.getElementById("StrategyInfo");
      if (el) setStrategyHtml(el.innerHTML);
      setStrategyVisible(true);
    }, 50);
  };

  const handleOwn = (checked: boolean) => {
    setShowOwn(checked);
    syncUiFilter(advanced, checked, showMissing);
    onFilter();
  };

  const handleMissing = (checked: boolean) => {
    setShowMissing(checked);
    syncUiFilter(advanced, showOwn, checked);
    onFilter();
  };

  const handleTagChange = (idx: 1 | 2, field: keyof TagFilter, val: string) => {
    const setter = idx === 1 ? setTag1 : setTag2;
    const current = idx === 1 ? tag1 : tag2;
    const updated = { ...current, [field]: val };
    setter(updated);
    // 手动修改 TAG → 切换为自定义关卡
    if (theme !== "custom") setTheme("custom");
    if (idx === 1)
      applyFilter(undefined, undefined, undefined, undefined, updated, tag2);
    else applyFilter(undefined, undefined, undefined, undefined, tag1, updated);
  };

  // ────────── render ──────────
  return (
    <div className='panel-card'>
      {/* Hidden DOM elements for legacy JS compatibility */}
      <div style={{ display: "none" }}>
        {FEATURES.map((f) => (
          <span key={f.key}>
            <input type='text' id={f.key + "Weight"} defaultValue='1' />
            <input type='radio' name={f.key} value='1' />
            <input type='radio' name={f.key} value='-1' />
            <span className={"highscore-link 1d778"} id={f.key + "1d778"} />
            <span className={"highscore-link 1d27"} id={f.key + "1d27"} />
            <span className='highscore-rank' id={f.key + "rank"} />
          </span>
        ))}
        <input type='text' id='tag1' />
        <input type='text' id='tag1weight' defaultValue='1' />
        <select id='tag1base'>
          <option>SS</option>
          <option>S</option>
          <option>A</option>
          <option>B</option>
          <option>C</option>
        </select>
        <input type='radio' name='tag1method' value='add' defaultChecked />
        <input type='radio' name='tag1method' value='replace' />
        <input type='text' id='tag2' />
        <input type='text' id='tag2weight' defaultValue='1' />
        <select id='tag2base'>
          <option>SS</option>
          <option>S</option>
          <option>A</option>
          <option>B</option>
          <option>C</option>
        </select>
        <input type='radio' name='tag2method' value='add' defaultChecked />
        <input type='radio' name='tag2method' value='replace' />
        <select id='theme'>
          <option value='custom'>自定义关卡</option>
        </select>
        <div id='tagInfo' />
        <div id='skillInfo' />
        <div id='categoryFInfo' />
        <div id='hintInfo' />
        <div id='StrategyInfo' />
      </div>

      {/* ─── 顶部：关卡选择 + 一键攻略 ─── */}
      <div className='fp-topbar'>
        <div className='fp-topbar-left'>
          {isTouchDevice ? (
            <>
              <select
                className='fp-native-select fp-native-select--filter'
                value={themeFilter}
                onChange={(e) => handleThemeFilterChange(e.target.value)}
              >
                {themeFilterOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <select
                className='fp-native-select fp-native-select--theme'
                value={theme}
                onChange={(e) => handleThemeChange(e.target.value)}
              >
                {filteredThemeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </>
          ) : (
            <>
              <Select
                style={{ width: 150 }}
                value={themeFilter}
                options={themeFilterOptions}
                onChange={handleThemeFilterChange}
                placeholder='筛选'
                placement='bottomLeft'
                popupMatchSelectWidth={false}
              />
              <Select
                style={{ flex: 1, minWidth: 220 }}
                value={theme}
                options={filteredThemeOptions}
                onChange={handleThemeChange}
                showSearch
                optionFilterProp='label'
                placeholder='自定义关卡'
                placement='bottomLeft'
                popupMatchSelectWidth={false}
              />
            </>
          )}
        </div>

        <div className='fp-topbar-right'>
          <div className='fp-topbar-filters-row'>
            <Checkbox
              checked={showOwn}
              onChange={(e) => handleOwn(e.target.checked)}
            >
              已有
            </Checkbox>
            <Checkbox
              checked={showMissing}
              onChange={(e) => handleMissing(e.target.checked)}
            >
              未有
            </Checkbox>

            <div className='fp-search-wrap fp-search-wrap--top'>
              <Input
                className='fp-search-input'
                size='small'
                allowClear
                prefix={<SearchOutlined />}
                placeholder='输入名字搜索...'
                value={nameSearch}
                onChange={(e) => {
                  const v = e.target.value;
                  onNameSearchChange(v);
                  onFilter(v);
                }}
                onPressEnter={() => onFilter()}
              />
            </div>
          </div>

          <Button
            className='fp-strategy-btn'
            icon={<ThunderboltOutlined />}
            onClick={handleOnekey}
          >
            {advanced.toulan ? "懒黑攻略" : "一键攻略"}
          </Button>
        </div>
      </div>

      {/* 关卡提示信息 */}
      {(levelInfo.skillInfo ||
        levelInfo.tagInfo ||
        levelInfo.hintInfo ||
        levelInfo.categoryFInfo) && (
        <div className='fp-hint'>
          {levelInfo.skillInfo && <div>技能: {levelInfo.skillInfo}</div>}
          {levelInfo.tagInfo && <div>{levelInfo.tagInfo}</div>}
          {levelInfo.hintInfo && (
            <div className='fp-hint-warn'>过关提示: {levelInfo.hintInfo}</div>
          )}
          {levelInfo.categoryFInfo && <div>{levelInfo.categoryFInfo}</div>}
        </div>
      )}

      {/* ─── 五维属性 + 右侧面板 ─── */}
      <div className='fp-main'>
        {/* 五维属性 */}
        <div className='fp-features'>
          <div className='panel-section-title'>
            <span className='panel-section-title-left'>
              <SlidersOutlined />
              <span>风格权重</span>
            </span>
          </div>
          {FEATURES.map((f) => {
            const fs = features[f.key];
            return (
              <div key={f.key} className='fp-feature-row'>
                <div className='fp-toggle-pair'>
                  <button
                    className={`fp-toggle${fs.direction === 1 ? " active-pos" : ""}`}
                    onClick={() => handleFeatureDirection(f.key, 1)}
                  >
                    {f.pos}
                  </button>
                  <button
                    className={`fp-toggle${fs.direction === -1 ? " active-neg" : ""}`}
                    onClick={() => handleFeatureDirection(f.key, -1)}
                  >
                    {f.neg}
                  </button>
                </div>
                <Input
                  className='fp-weight-input'
                  size='small'
                  value={fs.weight}
                  onChange={(e) => handleFeatureWeight(f.key, e.target.value)}
                  onBlur={() => applyFilter()}
                  placeholder='权重'
                />
                {advanced.highscore && (
                  <>
                    <button
                      className={`fp-boost-btn${fs.boost1d778 ? " active" : ""}`}
                      onClick={() => handleHighscoreBoost(f.key, "1d778")}
                    >
                      微笑+飞吻
                    </button>
                    <button
                      className={`fp-boost-btn${fs.boost1d27 ? " active" : ""}`}
                      onClick={() => handleHighscoreBoost(f.key, "1d27")}
                    >
                      微笑
                    </button>
                    {fs.rank && (
                      <span className='fp-rank-badge'>{fs.rank}</span>
                    )}
                  </>
                )}
              </div>
            );
          })}

          <div className='panel-section-title panel-section-title--mt10'>
            <span className='panel-section-title-left'>
              <TagsOutlined />
              <span>TAG 加分</span>
            </span>
            <span className='panel-section-tag-pill'>可选</span>
          </div>
          {([1, 2] as const).map((idx) => {
            const tf = idx === 1 ? tag1 : tag2;
            return (
              <div key={idx} className='fp-tag-row'>
                <Input
                  size='small'
                  placeholder={`tag${idx}`}
                  value={tf.tag}
                  onChange={(e) => handleTagChange(idx, "tag", e.target.value)}
                  style={{ width: 76 }}
                />
                <Radio.Group
                  size='small'
                  value={tf.method}
                  onChange={(e) =>
                    handleTagChange(idx, "method", e.target.value)
                  }
                  optionType='button'
                  buttonStyle='solid'
                  options={[
                    { label: "加分", value: "add" },
                    { label: "替换", value: "replace" },
                  ]}
                />
                <Select
                  size='small'
                  value={tf.base}
                  onChange={(v) => handleTagChange(idx, "base", v)}
                  options={BASE_OPTIONS.map((o) => ({ label: o, value: o }))}
                  style={{ width: 56 }}
                />
                <Input
                  size='small'
                  value={tf.weight}
                  onChange={(e) =>
                    handleTagChange(idx, "weight", e.target.value)
                  }
                  style={{ width: 42 }}
                  placeholder='权重'
                />
              </div>
            );
          })}
        </div>

        {/* 右侧：高级选项 */}
        <div className='fp-right'>
          <div className='fp-advanced'>
            <div className='panel-section-title'>
              <span className='panel-section-title-left'>
                <SettingOutlined />
                <span>高级选项</span>
              </span>
            </div>
            <div className='fp-checkboxes'>
              {ADVANCED_OPTIONS.map((opt) => (
                <Checkbox
                  key={opt.key}
                  checked={advanced[opt.key]}
                  onChange={(e) =>
                    handleAdvancedChange(opt.key, e.target.checked)
                  }
                >
                  {opt.label}
                </Checkbox>
              ))}
            </div>
          </div>

          {/* ─── 快速筛选 ─── */}
          <div className='fp-qf'>
            <div className='fp-qf-header'>
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

            {/* 来源 */}
            <div className='fp-qf-row'>
              <span className='fp-qf-group-label fp-qf-group-label--source'>
                来源
              </span>
              <div className='fp-qf-tags'>
                {QF_SOURCE.map((s) => (
                  <button
                    key={s}
                    className={`fp-qf-tag${quickFilter.source.includes(s) ? " fp-qf-tag--active" : ""}`}
                    onClick={() => toggleQF("source", s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* 星级 + 其他 并排 */}
            <div className='fp-qf-row fp-qf-row--split'>
              <div className='fp-qf-col'>
                <span className='fp-qf-group-label fp-qf-group-label--stars'>
                  星级
                </span>
                <div className='fp-qf-tags'>
                  {QF_STARS.map((s) => (
                    <button
                      key={s}
                      className={`fp-qf-tag fp-qf-tag--stars${quickFilter.stars.includes(s) ? " fp-qf-tag--active" : ""}`}
                      onClick={() => toggleQF("stars", s)}
                    >
                      {s}星
                    </button>
                  ))}
                </div>
              </div>
              <div className='fp-qf-col'>
                <span className='fp-qf-group-label fp-qf-group-label--misc'>
                  其他
                </span>
                <div className='fp-qf-tags'>
                  {QF_MISC.map((s) => (
                    <button
                      key={s}
                      className={`fp-qf-tag fp-qf-tag--misc${quickFilter.misc.includes(s) ? " fp-qf-tag--active" : ""}`}
                      onClick={() => toggleQF("misc", s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* 当前筛选摘要 */}
              {activeCount > 0 && (
                <div className='fp-qf-active'>
                  <span className='fp-qf-active-label'>当前筛选</span>
                  <div className='fp-qf-active-tags'>
                    {activeAll.map((t) => (
                      <span key={t} className='fp-qf-active-tag'>
                        {t}
                      </span>
                    ))}
                  </div>
                  <button className='fp-qf-clear' onClick={clearQF}>
                    清空
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── 一键攻略 Modal ─── */}
      <Modal
        title='一键攻略'
        open={strategyVisible}
        onCancel={() => setStrategyVisible(false)}
        footer={null}
        width={700}
        styles={{ body: { maxHeight: "70vh", overflowY: "auto" } }}
      >
        <div
          dangerouslySetInnerHTML={{ __html: strategyHtml }}
          style={{ fontSize: 13, lineHeight: 1.8 }}
        />
      </Modal>
    </div>
  );
};

export default FilterPanel;
