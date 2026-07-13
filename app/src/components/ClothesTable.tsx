import React from "react";
import { Table, Tag, Button, Checkbox, Tooltip, message } from "antd";
import { CopyOutlined, PlusOutlined, StarFilled } from "@ant-design/icons";
import { usePreferNoTooltip } from "../hooks/usePreferNoTooltip";

interface ClothesItem {
  name: string;
  type: { type: string; mainType: string };
  id: string;
  stars: number | string;
  score?: Partial<
    Record<"simple" | "cute" | "active" | "pure" | "cool", string>
  >;
  simple?: unknown;
  cute?: unknown;
  active?: unknown;
  pure?: unknown;
  cool?: unknown;
  sumScore?: number;
  tmpScore?: number;
  own: boolean;
  isF: boolean | number;
  source: string;
  tags: string[];
}

interface ClothesTableProps {
  data: ClothesItem[];
  onToggleOwn: (type: string, id: string) => void;
  onAddCart: (type: string, id: string) => void;
}

const SCORE_COLORS: Record<string, string> = {
  SSS: "#722ed1",
  SS: "#eb2f96",
  S: "#f5222d",
  A: "#fa8c16",
  B: "#52c41a",
  C: "#1890ff",
};

function getRank(val: unknown): string | undefined {
  if (typeof val === "string") return val || undefined;
  if (Array.isArray(val)) {
    const a = typeof val[0] === "string" ? (val[0] as string) : "";
    const b = typeof val[1] === "string" ? (val[1] as string) : "";
    if (a) return a;
    if (b) return `-${b}`;
    return undefined;
  }
  return undefined;
}

function getScoreRank(
  r: ClothesItem,
  key: "simple" | "cute" | "active" | "pure" | "cool",
) {
  const rr = r as unknown as Record<string, unknown>;
  const score = rr.score as Record<string, unknown> | undefined;
  return getRank(score?.[key]) ?? getRank(rr[key]);
}

function ScoreTag({ val }: { val: unknown }) {
  const rank = getRank(val);
  if (!rank) return <span style={{ color: "#ccc" }}>-</span>;
  const showRank = rank.startsWith("-") ? rank.slice(1) : rank;
  return (
    <Tag
      color={SCORE_COLORS[showRank] || "default"}
      style={{ margin: 0, fontWeight: 600 }}
    >
      {showRank}
    </Tag>
  );
}

function ScoreAttrTag({
  r,
  attrKey,
  posLabel,
  negLabel,
}: {
  r: ClothesItem;
  attrKey: "simple" | "cute" | "active" | "pure" | "cool";
  posLabel: string;
  negLabel: string;
}) {
  const rank = getScoreRank(r, attrKey);
  if (!rank) return <span style={{ color: "#ccc" }}>-</span>;
  const raw = String(rank);
  const isNeg = raw.startsWith("-");
  const showRank = isNeg ? raw.slice(1) : raw;
  const label = isNeg ? negLabel : posLabel;
  return (
    <div>
      <Tag
        color={SCORE_COLORS[showRank] || "default"}
        style={{ margin: 0, fontWeight: 600 }}
      >
        {showRank}
      </Tag>
      <span
        style={{
          color: isNeg ? "#fb425b" : "#98a1b3",
          fontSize: 12,
          marginLeft: 4,
          fontWeight: 500,
        }}
      >
        {label}
      </span>
    </div>
  );
}

function formatStars(stars: unknown): React.ReactNode {
  if (stars == null || stars === "") return "-";
  return (
    <span
      style={{
        color: "#fbc224",
        display: "flex",
        alignItems: "center",
        gap: 2,
      }}
    >
      {String(stars)}
      <StarFilled style={{ fontSize: 11 }} />
    </span>
  );
}

function formatTags(tags: string[] | undefined): React.ReactNode {
  if (!tags?.length) return <span style={{ color: "#ccc" }}>-</span>;
  return tags.join("/");
}

function getScore(r: ClothesItem) {
  const v =
    (typeof r.sumScore === "number" ? r.sumScore : undefined) ??
    (typeof r.tmpScore === "number" ? r.tmpScore : undefined);
  return v == null ? "-" : String(Math.round(v));
}

function useIsMobile() {
  const mq = React.useRef(window.matchMedia("(max-width: 649px)"));
  const [mobile, setMobile] = React.useState(() => mq.current.matches);
  React.useEffect(() => {
    const mql = mq.current;
    const handler = (e: MediaQueryListEvent) => setMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);
  return mobile;
}

const SCORE_KEYS = [
  { key: "simple" as const, pos: "简", neg: "华" },
  { key: "cute" as const, pos: "可", neg: "成" },
  { key: "active" as const, pos: "活", neg: "雅" },
  { key: "pure" as const, pos: "纯", neg: "性" },
  { key: "cool" as const, pos: "凉", neg: "暖" },
];

function MobileRow({
  r,
  onToggleOwn,
  onAddCart,
}: {
  r: ClothesItem;
  onToggleOwn: (t: string, id: string) => void;
  onAddCart: (t: string, id: string) => void;
}) {
  const noTooltip = usePreferNoTooltip();
  const copyName = async () => {
    try {
      await navigator.clipboard.writeText(r.name);
      message.success(`已复制：${r.name}`);
    } catch {
      // 复制失败时不打断其他操作
    }
  };
  const addBtn = (
    <Button
      size='small'
      icon={<PlusOutlined />}
      onClick={(event) => {
        event.stopPropagation();
        onAddCart(r.type.mainType, r.id);
      }}
    />
  );
  return (
    <div
      role='button'
      tabIndex={0}
      aria-label={`复制${r.name}`}
      onClick={copyName}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          void copyName();
        }
      }}
      style={{
        borderBottom: "1px solid #f0f0f0",
        padding: "8px 10px",
        background: r.isF ? "#fafafa" : r.own ? "#fff8fa" : "#fff",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 4,
        }}
      >
        <Checkbox
          checked={r.own}
          onClick={(event) => event.stopPropagation()}
          onChange={() => onToggleOwn(r.type.mainType, r.id)}
        />
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <span
            style={{
              minWidth: 0,
              fontWeight: 600,
              fontSize: 14,
              color: r.isF ? "#aaa" : "#222",
              textDecoration: r.isF ? "line-through" : undefined,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {r.name}
          </span>
          <CopyOutlined
            aria-hidden
            style={{
              flexShrink: 0,
              color: "#8c8c8c",
              fontSize: 13,
            }}
          />
        </div>
        <span
          style={{
            color: "#fa8c16",
            fontWeight: 700,
            fontSize: 13,
            minWidth: 32,
            textAlign: "right",
          }}
        >
          {getScore(r)}
        </span>
        {noTooltip ? (
          addBtn
        ) : (
          <Tooltip title='加入购物车'>{addBtn}</Tooltip>
        )}
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "2px 12px",
          fontSize: 12,
          color: "#666",
          marginBottom: 4,
        }}
      >
        <span>
          <span style={{ color: "#bbb" }}>分类 </span>
          {r.type.type}
        </span>
        <span>
          <span style={{ color: "#bbb" }}>编号 </span>
          {r.id || "-"}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 2 }}>
          <span style={{ color: "#bbb" }}>星级 </span>
          {formatStars(r.stars)}
        </span>
        <span>
          <span style={{ color: "#bbb" }}>来源 </span>
          {r.source || "-"}
        </span>
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "3px 6px",
        }}
      >
        {SCORE_KEYS.map(({ key, pos, neg }) => {
          const rank = getScoreRank(r, key);
          if (!rank) return null;
          const label = rank.startsWith("-") ? neg : pos;
          return (
            <span
              key={key}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 2,
                fontSize: 11,
              }}
            >
              <span style={{ color: "#bbb" }}>{label}</span>
              <ScoreTag val={rank} />
            </span>
          );
        })}
        {r.tags?.length > 0 && (
          <span style={{ fontSize: 11, color: "#1890ff" }}>
            {r.tags.join("/")}
          </span>
        )}
      </div>
    </div>
  );
}

const ClothesTable: React.FC<ClothesTableProps> = ({
  data,
  onToggleOwn,
  onAddCart,
}) => {
  const isMobile = useIsMobile();
  const noActionTooltip = usePreferNoTooltip();
  const [page, setPage] = React.useState(1);
  const PAGE_SIZE = 50;

  // 切换数据时重置到第一页
  React.useEffect(() => {
    setPage(1);
  }, [data]);

  if (isMobile) {
    const total = data.length;
    const start = (page - 1) * PAGE_SIZE;
    const pageData = data.slice(start, start + PAGE_SIZE);
    const totalPages = Math.ceil(total / PAGE_SIZE);
    return (
      <div
        style={{
          border: "1px solid #f0f0f0",
          borderRadius: 6,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "6px 10px",
            background: "#fafafa",
            borderBottom: "1px solid #f0f0f0",
            fontSize: 12,
            color: "#888",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>共 {total} 件</span>
          {totalPages > 1 && (
            <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                style={{
                  padding: "2px 8px",
                  fontSize: 12,
                  border: "1px solid #d9d9d9",
                  borderRadius: 4,
                  background: page === 1 ? "#f5f5f5" : "#fff",
                  cursor: page === 1 ? "default" : "pointer",
                }}
              >
                上一页
              </button>
              <span>
                {page} / {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                style={{
                  padding: "2px 8px",
                  fontSize: 12,
                  border: "1px solid #d9d9d9",
                  borderRadius: 4,
                  background: page === totalPages ? "#f5f5f5" : "#fff",
                  cursor: page === totalPages ? "default" : "pointer",
                }}
              >
                下一页
              </button>
            </span>
          )}
        </div>
        {pageData.map((r) => (
          <MobileRow
            key={`${r.type?.type}-${r.id}`}
            r={r}
            onToggleOwn={onToggleOwn}
            onAddCart={onAddCart}
          />
        ))}
      </div>
    );
  }

  const attrColumns = [
    {
      title: "简约/华丽",
      key: "simple",
      width: 67,
      render: (_: unknown, r: ClothesItem) => (
        <ScoreAttrTag r={r} attrKey='simple' posLabel='简约' negLabel='华丽' />
      ),
    },
    {
      title: "可爱/成熟",
      key: "cute",
      width: 67,
      render: (_: unknown, r: ClothesItem) => (
        <ScoreAttrTag r={r} attrKey='cute' posLabel='可爱' negLabel='成熟' />
      ),
    },
    {
      title: "活泼/优雅",
      key: "active",
      width: 67,
      render: (_: unknown, r: ClothesItem) => (
        <ScoreAttrTag r={r} attrKey='active' posLabel='活泼' negLabel='优雅' />
      ),
    },
    {
      title: "清纯/性感",
      key: "pure",
      width: 67,
      render: (_: unknown, r: ClothesItem) => (
        <ScoreAttrTag r={r} attrKey='pure' posLabel='清纯' negLabel='性感' />
      ),
    },
    {
      title: "清凉/保暖",
      key: "cool",
      width: 67,
      render: (_: unknown, r: ClothesItem) => (
        <ScoreAttrTag r={r} attrKey='cool' posLabel='清凉' negLabel='保暖' />
      ),
    },
  ];

  const columns = [
    {
      title: "拥有",
      dataIndex: "own",
      key: "own",
      width: 50,
      fixed: "left" as const,
      render: (_: unknown, record: ClothesItem) => (
        <Checkbox
          checked={record.own}
          onChange={() => onToggleOwn(record.type.mainType, record.id)}
        />
      ),
    },
    {
      title: "分数",
      dataIndex: "sumScore",
      key: "sumScore",
      width: 70,
      fixed: "left" as const,
      render: (_: unknown, r: ClothesItem) => getScore(r),
      sorter: (a: ClothesItem, b: ClothesItem) =>
        ((typeof a.sumScore === "number" ? a.sumScore : a.tmpScore) || 0) -
        ((typeof b.sumScore === "number" ? b.sumScore : b.tmpScore) || 0),
    },
    {
      title: "名称",
      dataIndex: "name",
      key: "name",
      width: 140,
      fixed: "left" as const,
      render: (name: string, record: ClothesItem) => (
        <span
          style={{
            color: record.isF ? "#aaa" : undefined,
            textDecoration: record.isF ? "line-through" : undefined,
          }}
        >
          {name}
        </span>
      ),
    },
    { title: "分类", dataIndex: ["type", "type"], key: "type", width: 100 },
    { title: "编号", dataIndex: "id", key: "id", width: 52 },
    {
      title: "星级",
      dataIndex: "stars",
      key: "stars",
      width: 48,
      render: (s: unknown) => formatStars(s),
    },
    ...attrColumns,
    {
      title: "特殊属性",
      key: "tags",
      width: 100,
      ellipsis: true,
      render: (_: unknown, r: ClothesItem) => formatTags(r.tags),
    },
    {
      title: "来源",
      dataIndex: "source",
      key: "source",
      width: 100,
      ellipsis: true,
    },
    {
      title: "操作",
      key: "action",
      width: 40,
      fixed: "right" as const,
      render: (_: unknown, record: ClothesItem) => {
        const btn = (
          <Button
            size='small'
            icon={<PlusOutlined />}
            onClick={() => onAddCart(record.type.mainType, record.id)}
          />
        );
        return noActionTooltip ? (
          btn
        ) : (
          <Tooltip title='加入购物车'>{btn}</Tooltip>
        );
      },
    },
  ];

  return (
    <Table
      dataSource={data}
      columns={columns}
      rowKey={(r) => `${r.type?.type}-${r.id}`}
      size='small'
      pagination={{
        pageSize: 50,
        showSizeChanger: true,
        showTotal: (t) => `共 ${t} 件`,
      }}
      scroll={{ x: 1250 }}
      rowClassName={(r) => (r.isF ? "row-f" : r.own ? "row-own" : "")}
    />
  );
};

export default ClothesTable;
