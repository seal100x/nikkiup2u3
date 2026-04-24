import React, { useState, useEffect } from "react";
import {
  Button,
  Select,
  Input,
  Divider,
  Typography,
  message,
  Space,
} from "antd";
import {
  CopyOutlined,
  UploadOutlined,
  RedoOutlined,
  SkinOutlined,
} from "@ant-design/icons";
import "./panel.css";

const { TextArea } = Input;
const { Text } = Typography;

interface WardrobePanelProps {
  onRefresh: () => void;
}

const WardrobePanel: React.FC<WardrobePanelProps> = ({ onRefresh }) => {
  const w = window as any;
  const [importCate, setImportCate] = useState("");
  const [importData, setImportData] = useState("");
  const [myClothes, setMyClothes] = useState("");
  const [cateOptions, setCateOptions] = useState<
    { label: string; value: string }[]
  >([]);

  useEffect(() => {
    const check = () => {
      if (w.scoring) {
        setCateOptions(
          Object.keys(w.scoring).map((k: string) => ({ label: k, value: k })),
        );
        try {
          setMyClothes(w.save?.()?.serialize() || "");
        } catch {
          console.error("Failed to serialize save data");
        }
      } else {
        setTimeout(check, 200);
      }
    };
    check();
  }, []);

  const handleImport = () => {
    if (!importCate) {
      message.warning("请先选择类别");
      return;
    }
    const data = importData.match(/[\d-]+/g);
    if (!data) {
      message.warning("未找到有效编号");
      return;
    }
    const mapping: Record<string, boolean> = {};
    const imdata: string[] = [];
    for (const d of data) {
      if (!isNaN(Number(d))) {
        const id = w.numberToInventoryId(Number(d));
        mapping[id] = true;
        imdata.push(id);
      } else if (d.indexOf("-") > 0) {
        const [s, e] = d.split("-");
        for (let k = Number(s); k <= Number(e); k++) {
          const id = w.numberToInventoryId(k);
          mapping[id] = true;
          imdata.push(id);
        }
      }
    }
    const updating: string[] = (w.clothes || [])
      .filter((c: any) => c.type.mainType === importCate && mapping[c.id])
      .map((c: any) => c.name);
    let names = updating.join(",");
    if (names.length > 50)
      names = names.substring(0, 50) + `...等${updating.length}件衣服`;
    if (!confirm(`你将要在>>${importCate}<<中导入：\n${names}`)) return;
    const mc = w.MyClothes();
    mc.filter(w.clothes);
    mc.mine[importCate] = mc.mine[importCate]
      ? mc.mine[importCate].concat(imdata)
      : imdata;
    mc.update(w.clothes);
    w.saveAndUpdate();
    setImportData("");
    try {
      setMyClothes(w.save?.()?.serialize() || "");
    } catch {
      console.error("Failed to serialize save data");
    }
    onRefresh();
    message.success("导入成功");
  };

  const handleRestore = () => {
    if (myClothes.indexOf("|") > 0) w.loadNew(myClothes);
    else w.load(myClothes);
    w.saveAndUpdate();
    onRefresh();
    message.success("恢复成功");
  };

  const handleCopyBackup = async () => {
    try {
      await navigator.clipboard.writeText(myClothes);
      message.success("已复制到剪贴板");
    } catch {
      message.error("复制失败，请手动选中文本框后复制");
    }
  };

  return (
    <div className='panel-card'>
      <div className='panel-section-title'>
        <span className='panel-section-title-left'>
          <SkinOutlined />
          <span>衣橱</span>
        </span>
      </div>
      <div className='wp-panel-content'>
        <Text style={{ fontSize: 13 }}>
          导入批量衣服，请先选择要导入的类别，然后在文本框内输入编号，用空格、逗号或者换行隔开。不知道编号在哪儿的请点
          <a
            href='http://tieba.baidu.com/p/3808711082'
            target='_blank'
            rel='noreferrer'
          >
            这里
          </a>
        </Text>
        <div>
          <div style={{ flex: 1 }}>
            <Select
              size='small'
              placeholder='请选择类别'
              value={importCate || undefined}
              options={cateOptions}
              onChange={(v) => {
                setImportCate(v);
                setImportData("");
              }}
              style={{ width: "100%", marginBottom: 6 }}
            />
            <TextArea
              rows={4}
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder='输入编号，用空格、逗号或换行隔开'
            />
          </div>
          <Button
            size='small'
            type='primary'
            icon={<UploadOutlined />}
            onClick={handleImport}
            style={{ marginTop: 8 }}
          >
            导入
          </Button>
        </div>

        <Divider style={{ margin: "4px 0" }} />

        <Text style={{ fontSize: 13 }}>
          我拥有的服装（复制文本框内容以备份衣橱）
        </Text>
        <TextArea
          rows={6}
          value={myClothes}
          onChange={(e) => setMyClothes(e.target.value)}
        />
        <Space wrap>
          <Button
            size='small'
            icon={<CopyOutlined />}
            onClick={handleCopyBackup}
          >
            复制
          </Button>
          <Button size='small' icon={<RedoOutlined />} onClick={handleRestore}>
            恢复备份
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default WardrobePanel;
