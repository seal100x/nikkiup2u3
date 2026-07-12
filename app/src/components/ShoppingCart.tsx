import React from "react";
import { Table, Button } from "antd";
import { DeleteOutlined, ShoppingOutlined, CopyOutlined } from "@ant-design/icons";
// import { usePreferNoTooltip } from "../hooks/usePreferNoTooltip";
import "./panel.css";

interface CartItem {
  name: string;
  type: { type: string };
  id: string;
  sumScore: number;
  source: string;
}

interface ShoppingCartProps {
  items: CartItem[];
  totalScore: number;
  onRemove: (type: string) => void;
  onClear: () => void;
  onRefresh: () => void;
}

const ShoppingCart: React.FC<ShoppingCartProps> = ({
  items,
  totalScore,
  onRemove,
  onClear,
  onRefresh,
}) => {
  // const noActionTooltip = usePreferNoTooltip();
  const handleCopyBackup = (name: string) => {
    navigator.clipboard.writeText(name);
  };
  const columns = [
    { title: "名称", dataIndex: "name", key: "name" },
    { title: "分类", dataIndex: ["type", "type"], key: "type", width: 100 },
    {
      title: "分数",
      dataIndex: "sumScore",
      key: "sumScore",
      width: 70,
      render: (v: number) => v ?? "-",
    },
    {
      title: "操作",
      key: "action",
      width: 120,
      render: (_: unknown, record: CartItem) => {
        const btn = (
          <div>
            <Button
              size='small'
              danger
              icon={<DeleteOutlined />}
              onClick={() => onRemove(record.type.type)}
            />
            <Button
              size='small'
              icon={<CopyOutlined />}
              onClick={() => handleCopyBackup(record.name)}
            />
          </div>
        );
        return btn
      },
    },
  ];

  return (
    <div id='wardrobe-panel' className='panel-card'>
      <div className='panel-section-title'>
        <span className='panel-section-title-left'>
          <ShoppingOutlined />
          <span>推荐搭配</span>
          <span className='panel-section-subtitle'>
            若衣橱有更新点击刷新搭配
          </span>
        </span>
      </div>
      <div className='sc-panel-header'>
        <div>
          <span className='sc-panel-score-label'>总分 </span>
          <span className='sc-panel-score-value'>{totalScore}</span>
          <span className='sc-panel-score-label'> 分</span>
        </div>
        <div className='sc-panel-actions'>
          <Button className='sc-btn-refresh' size='small' onClick={onRefresh}>
            刷新搭配
          </Button>
          <Button className='sc-btn-clear' size='small' onClick={onClear}>
            清空
          </Button>
        </div>
      </div>
      <Table
        dataSource={items}
        columns={columns}
        rowKey={(r) => r.type?.type}
        size='small'
        pagination={false}
        locale={{ emptyText: "购物车为空，请手动添加衣服" }}
      />
    </div>
  );
};

export default ShoppingCart;
