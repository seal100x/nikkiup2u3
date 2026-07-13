import React from 'react'
import { Table, Button, message } from 'antd'
import {
  DeleteOutlined,
  ShoppingOutlined,
} from '@ant-design/icons'
// import { usePreferNoTooltip } from "../hooks/usePreferNoTooltip";
import './panel.css'

interface CartItem {
  name: string
  type: { type: string }
  id: string
  sumScore: number
  source: string
}

interface ShoppingCartProps {
  items: CartItem[]
  totalScore: number
  onRemove: (type: string) => void
  onClear: () => void
  onRefresh: () => void
}

const ShoppingCart: React.FC<ShoppingCartProps> = ({
  items,
  totalScore,
  onRemove,
  onClear,
  onRefresh,
}) => {
  // const noActionTooltip = usePreferNoTooltip();
  const copyName = async (name: string) => {
    try {
      await navigator.clipboard.writeText(name)
      message.success(`已复制：${name}`)
    } catch {
      // 复制失败时不打断其他操作
    }
  }
  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => name,
    },
    { title: '分类', dataIndex: ['type', 'type'], key: 'type', width: 100 },
    {
      title: '分数',
      dataIndex: 'sumScore',
      key: 'sumScore',
      width: 70,
      render: (v: number) => v ?? '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 44,
      render: (_: unknown, record: CartItem) => {
        const btn = (
          <div className="sc-row-actions">
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={(event) => {
                event.stopPropagation()
                onRemove(record.type.type)
              }}
            />
          </div>
        )
        return btn
      },
    },
  ]

  return (
    <div id="wardrobe-panel" className="panel-card">
      <div className="panel-section-title">
        <span className="panel-section-title-left">
          <ShoppingOutlined />
          <span>推荐搭配</span>
          <span className="panel-section-subtitle">
            点击搭配行复制名称，若衣橱有更新请刷新搭配
          </span>
        </span>
      </div>
      <div className="sc-panel-header">
        <div>
          <span className="sc-panel-score-label">总分 </span>
          <span className="sc-panel-score-value">{totalScore}</span>
          <span className="sc-panel-score-label"> 分</span>
        </div>
        <div className="sc-panel-actions">
          <Button className="sc-btn-refresh" size="small" onClick={onRefresh}>
            刷新搭配
          </Button>
          <Button className="sc-btn-clear" size="small" onClick={onClear}>
            清空
          </Button>
        </div>
      </div>
      <Table
        dataSource={items}
        columns={columns}
        rowKey={(r) => r.type?.type}
        size="small"
        pagination={false}
        locale={{ emptyText: '购物车为空，请手动添加衣服' }}
        onRow={(record) => ({
          tabIndex: 0,
          role: 'button',
          onClick: () => void copyName(record.name),
          onKeyDown: (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              void copyName(record.name)
            }
          },
          style: { cursor: 'pointer' },
        })}
      />
    </div>
  )
}

export default ShoppingCart
