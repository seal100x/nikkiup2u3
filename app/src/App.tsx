import { useState, useEffect, useCallback, useRef } from "react";
import { ExclamationCircleFilled } from "@ant-design/icons";
import { Layout, Spin, Row, Col, Modal } from "antd";
import CategoryTabs from "./components/CategoryTabs";
import SubCategoryBar from "./components/SubCategoryBar";
import ClothesTable from "./components/ClothesTable";
import CountdownToolbar from "./components/CountdownToolbar";
import AppHeader from "./components/AppHeader";
import FilterPanel from "./components/FilterPanel";
import ShoppingCart from "./components/ShoppingCart";
import WardrobePanel from "./components/WardrobePanel";
import MobileFab from "./components/MobileFab";
import nikkiBgRaw from "./assets/nikki-background.svg?raw";
import "antd/dist/reset.css";
import "./App.css";

const nikkiBg = `data:image/svg+xml;base64,${btoa(nikkiBgRaw)}`;

const { Content } = Layout;

// 等待全局 JS 变量加载完成
function waitForData(): Promise<void> {
  return new Promise((resolve) => {
    const check = () => {
      if (
        typeof (window as any).wardrobe !== "undefined" &&
        typeof (window as any).category !== "undefined"
      ) {
        resolve();
      } else {
        setTimeout(check, 50);
      }
    };
    check();
  });
}

// 快速筛选状态类型
export interface QuickFilter {
  source: string[]; // 来源：少女级/公主级/店/设计图/活动/梦境/迷之屋限定/赠送签到
  stars: string[]; // 星级：3/4/5
  misc: string[]; // 其他：尚缺材料/暂不缺材料/套装部件/新品
}

// 来源匹配逻辑（对应原 filterClotherHTML）
function matchSource(item: any, src: string): boolean {
  const source: string = item.source || "";
  switch (src) {
    case "少女级":
      return (
        source.indexOf("少") >= 0 &&
        source.indexOf("定") < 0 &&
        source.indexOf("进") < 0
      );
    case "公主级":
      return (
        source.indexOf("公") >= 0 &&
        source.indexOf("定") < 0 &&
        source.indexOf("进") < 0
      );
    case "店":
      return (
        source.indexOf("店") >= 0 &&
        source.indexOf("定") < 0 &&
        source.indexOf("进") < 0
      );
    case "设计图":
      return (
        source.indexOf("设计图") >= 0 &&
        source.indexOf("定") < 0 &&
        source.indexOf("进") < 0
      );
    case "活动":
      return source.indexOf("活动·") >= 0;
    case "梦境":
      return source.indexOf("梦境·") >= 0;
    case "赠送/签到":
      return source.indexOf("赠送") >= 0 || source.indexOf("签到") >= 0;
    case "迷之屋限定": {
      const keys = ["谜", "幻", "云禅", "昼夜", "缥缈", "流光"];
      return keys.some((k) => source === k);
    }
    default:
      return false;
  }
}

function matchStars(item: any, star: string): boolean {
  return String(item.stars) === star;
}

function matchMisc(item: any, misc: string): boolean {
  switch (misc) {
    case "尚缺材料":
      return item.deps && item.deps.length > 0;
    case "暂不缺材料":
      return !item.deps || item.deps.length === 0;
    case "套装部件":
      return !!item.isSuit;
    case "新品":
      return (
        !!(window as any).lastVersion &&
        item.version === (window as any).lastVersion
      );
    default:
      return false;
  }
}

// 对 result 列表应用 quickFilter（同组 OR，跨组 AND）
function applyQuickFilter(list: any[], qf: QuickFilter): any[] {
  const { source, stars, misc } = qf;
  const hasSource = source.length > 0;
  const hasStars = stars.length > 0;
  const hasMisc = misc.length > 0;
  if (!hasSource && !hasStars && !hasMisc) return list;
  return list.filter((item) => {
    if (hasSource && !source.some((s) => matchSource(item, s))) return false;
    if (hasStars && !stars.some((s) => matchStars(item, s))) return false;
    if (hasMisc && !misc.some((s) => matchMisc(item, s))) return false;
    return true;
  });
}

function App() {
  const [ready, setReady] = useState(false);
  const [cats, setCats] = useState<string[]>([]);
  const [currentCat, setCurrentCat] = useState("发型");
  const [clothesList, setClothesList] = useState<any[]>([]);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [nameSearch, setNameSearch] = useState("");
  const [catCounts, setCatCounts] = useState<Record<string, number>>({});
  const [quickFilter, setQuickFilter] = useState<QuickFilter>({
    source: [],
    stars: [],
    misc: [],
  });
  const [subCatFilters, setSubCatFilters] = useState<Record<string, string[]>>({});

  const w = useRef(window as any).current;
  const mobileCartRef = useRef<HTMLDivElement>(null);
  const clothesTableRef = useRef<HTMLDivElement>(null);

  // 用 ref 保存最新 refresh，供全局覆盖函数调用
  const refreshRef = useRef<
    (nameSearchOverride?: string, qfOverride?: QuickFilter) => void
  >(() => {});
  const quickFilterRef = useRef<QuickFilter>(quickFilter);

  // 从全局状态同步数据到 React state
  const refresh = useCallback(
    (nameSearchOverride?: string, qfOverride?: QuickFilter) => {
      try {
        const q = (
          nameSearchOverride !== undefined ? nameSearchOverride : nameSearch
        )
          .trim()
          .toLowerCase();
        const qf =
          qfOverride !== undefined ? qfOverride : quickFilterRef.current;
        let result = w.filtering(w.criteria, w.uiFilter);
        if (q) {
          result = result.filter(
            (item: { name?: string }) =>
              item.name && String(item.name).toLowerCase().includes(q),
          );
        }
        result = applyQuickFilter(result, qf);
        setClothesList([...result]);

        // 直接从全量 clothes 统计各主分类已拥有数量
        const allClothes: any[] = w.clothes || [];
        const counts: Record<string, number> = { 全部: 0 };
        for (const item of allClothes) {
          const main = item.type?.mainType;
          if (main && !(main in counts)) counts[main] = 0;
          if (!item.own) continue;
          counts["全部"]++;
          if (main) counts[main]++;
        }
        setCatCounts(counts);

        const cartList = w.shoppingCart.toList(w.byCategoryAndId);
        setCartItems([...cartList]);
        setTotalScore(w.shoppingCart.totalScore?.sumScore || 0);
      } catch {
        // 数据尚未就绪时忽略错误
      }
    },
    [nameSearch, w],
  );

  // 保持 ref 指向最新 refresh 和 quickFilter
  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);
  useEffect(() => {
    quickFilterRef.current = quickFilter;
  }, [quickFilter]);

  // 初始化
  useEffect(() => {
    waitForData().then(() => {
      w.calcDependencies();
      const mine = w.loadFromStorage();
      mine.update(w.clothes);
      setCats(w.category || []);
      // 初始化 uiFilter：开启拥有/未有 + 所有分类
      const initialFilter: Record<string, boolean> = {
        own: true,
        missing: true,
      };
      if (w.CATEGORY_HIERARCHY) {
        for (const c in w.CATEGORY_HIERARCHY) {
          const subs: string[] = w.CATEGORY_HIERARCHY[c];
          for (const s of subs) initialFilter[s] = true;
          initialFilter[c] = true;
        }
      } else if (w.category) {
        w.category.forEach((c: string) => {
          initialFilter[c] = true;
        });
      }
      w.uiFilter = initialFilter;
      if (!w.criteria) w.criteria = {};
      w.shoppingCart?.calc(w.criteria);
      // 覆盖旧 jQuery UI 函数，避免 drawTable/refreshShoppingCart 报错
      w.drawTable = () => {};
      w.refreshShoppingCart = () => {
        refreshRef.current();
      };
      w.refreshTable = () => {
        refreshRef.current();
      };
      // 默认选中发型，若不存在则回退到全部
      const hier = w.CATEGORY_HIERARCHY as Record<string, string[]> | undefined;
      const defaultCat = hier && "发型" in hier ? "发型" : "全部";
      setCurrentCat(defaultCat);
      if (hier && defaultCat !== "全部") {
        for (const c in hier) {
          const active = c === defaultCat;
          w.uiFilter[c] = active;
          for (const s of hier[c]) w.uiFilter[s] = active;
        }
      }
      setReady(true);
      refresh();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleQuickFilterChange = (qf: QuickFilter) => {
    setQuickFilter(qf);
    refresh(undefined, qf);
  };

  const handleAddAll = ({ showOwn, showMissing, nameSearch: ns }: { showOwn: boolean; showMissing: boolean; nameSearch: string }) => {
    const allClothes: any[] = w.clothes || [];
    // 应用已有/未有/名称搜索/quickFilter 过滤，与当前显示一致
    let list = allClothes.filter((item: any) => {
      if (item.own && !showOwn) return false;
      if (!item.own && !showMissing) return false;
      if (ns.trim() && !String(item.name || "").toLowerCase().includes(ns.trim().toLowerCase())) return false;
      return true;
    });
    list = applyQuickFilter(list, quickFilter);
    const unowned = list.filter((item: any) => !item.own);
    if (!unowned.length) {
      Modal.info({ title: "提示", content: "当前筛选结果中没有未拥有的衣服" });
      return;
    }
    const grouped: Record<string, string[]> = {};
    for (const item of unowned) {
      const main = item.type?.mainType;
      if (!main) continue;
      if (!grouped[main]) grouped[main] = [];
      grouped[main].push(item.id);
    }
    const content = (
      <div style={{ maxHeight: 360, overflowY: "auto", fontSize: 13, lineHeight: 1.8 }}>
        {Object.entries(grouped).map(([type]) => {
          const names = unowned.filter((i: any) => i.type?.mainType === type).map((i: any) => i.name);
          const preview = names.length > 5 ? names.slice(0,5).join("、") + `…等${names.length}件` : names.join("、");
          return <div key={type}><b>【{type}】</b>{preview}</div>;
        })}
      </div>
    );
    Modal.confirm({
      icon: null,
      title: (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 600, fontSize: 16 }}>
          <ExclamationCircleFilled style={{ color: "#faad14", fontSize: 20 }} />
          将添加以下衣服到衣柜
        </span>
      ),
      content,
      okText: "确认添加",
      cancelText: "取消",
      onOk: () => {
        const myClothes = w.MyClothes();
        myClothes.filter(w.clothes);
        for (const type in grouped) {
          if (myClothes.mine[type]) {
            myClothes.mine[type] = myClothes.mine[type].concat(grouped[type]);
          } else {
            myClothes.mine[type] = grouped[type];
          }
        }
        myClothes.update(w.clothes);
        w.save();
        refresh();
      },
    });
  };

  const handleCategoryChange = (cat: string) => {
    setCurrentCat(cat);
    // 直接操作 uiFilter 中的分类子项，不依赖旧 DOM 的 switchCate
    const hier = w.CATEGORY_HIERARCHY as Record<string, string[]> | undefined;
    if (hier) {
      if (cat === "全部") {
        // 开启所有子分类
        for (const c in hier) {
          w.uiFilter[c] = true;
          for (const s of hier[c]) w.uiFilter[s] = true;
        }
      } else {
        // 只开启选中主分类的子分类，关闭其他
        for (const c in hier) {
          const active = c === cat;
          w.uiFilter[c] = active;
          for (const s of hier[c]) w.uiFilter[s] = active;
        }
      }
    }
    refresh();
  };

  const handleToggleOwn = (type: string, id: string) => {
    w.toggleInventory(type, id);
    w.save();
    refresh();
  };

  const handleAddCart = (type: string, id: string) => {
    w.addShoppingCart(type, id);
    w.shoppingCart.calc(w.criteria);
    refresh();
  };

  const handleRemoveCart = (type: string) => {
    w.removeShoppingCart(type);
    w.shoppingCart.calc(w.criteria);
    refresh();
  };

  const handleClearCart = () => {
    w.clearShoppingCart();
    w.shoppingCart.calc(w.criteria);
    refresh();
  };

  const handleRefreshCart = () => {
    w.chooseAccessories(w.criteria);
    refresh();
  };

  if (!ready) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size='large' tip='加载数据中...' />
      </div>
    );
  }

  return (
    <Layout className='app-layout'>
      <div className='app-bg' style={{ backgroundImage: `url(${nikkiBg})` }} />
      <AppHeader />
      <Content className='app-content'>
        <CountdownToolbar />
        <Row gutter={16}>
          <Col xs={24} lg={16}>
            <FilterPanel
              onFilter={refresh}
              nameSearch={nameSearch}
              onNameSearchChange={setNameSearch}
              quickFilter={quickFilter}
              onQuickFilterChange={handleQuickFilterChange}
              onAddAll={handleAddAll}
            />
            <div className='app-only-mobile' ref={mobileCartRef}>
              <ShoppingCart
                items={cartItems}
                totalScore={totalScore}
                onRemove={handleRemoveCart}
                onClear={handleClearCart}
                onRefresh={handleRefreshCart}
              />
            </div>
            <CategoryTabs
              categories={cats}
              current={currentCat}
              counts={catCounts}
              onChange={handleCategoryChange}
            />
            <SubCategoryBar
              mainCat={currentCat}
              subCats={cats.filter((c) => c.startsWith(currentCat + "-"))}
              selected={
                subCatFilters[currentCat] ??
                cats.filter((c) => c.startsWith(currentCat + "-"))
              }
              onChange={(subs) =>
                setSubCatFilters((prev) => ({ ...prev, [currentCat]: subs }))
              }
            />
            <div ref={clothesTableRef}>
            <ClothesTable
              data={
                (() => {
                  const currentSubCats = cats.filter((c) =>
                    c.startsWith(currentCat + "-"),
                  );
                  const selectedSubCats =
                    subCatFilters[currentCat] ?? currentSubCats;
                  if (currentSubCats.length === 0) return clothesList;
                  if (selectedSubCats.length === 0) return [];
                  return clothesList.filter((item) =>
                    selectedSubCats.includes(item.type?.type),
                  );
                })()
              }
              onToggleOwn={handleToggleOwn}
              onAddCart={handleAddCart}
            />
            </div>
          </Col>
          <Col xs={24} lg={8}>
            <div className='app-only-desktop'>
              <ShoppingCart
                items={cartItems}
                totalScore={totalScore}
                onRemove={handleRemoveCart}
                onClear={handleClearCart}
                onRefresh={handleRefreshCart}
              />
            </div>
            <div className='wardrobe-panel-col'>
              <WardrobePanel onRefresh={refresh} />
            </div>
          </Col>
        </Row>
      </Content>
      <MobileFab
        onScrollToCart={() => mobileCartRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
        onScrollToClothes={() => clothesTableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
      />
    </Layout>
  );
}

export default App;
