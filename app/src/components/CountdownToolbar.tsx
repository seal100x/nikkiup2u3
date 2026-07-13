import { useEffect, useState } from "react";
import { Alert, Button, Modal, Space, Typography } from "antd";
import { InfoCircleFilled } from "@ant-design/icons";
import "./CountdownToolbar.css";

function initCountdown(): number {
  const date = new Date();
  const offset = 8 + date.getTimezoneOffset() / 60;
  let d: number;
  if (date.getDay() > 2 || (date.getDay() === 2 && date.getHours() > 5)) {
    if (date.getDay() < 6 || (date.getDay() === 6 && date.getHours() < 5)) {
      d = 6 - date.getDay();
    } else {
      d = date.getDay() > 5 ? 9 - date.getDay() : 2 - date.getDay();
    }
  } else {
    d = date.getDay() > 5 ? 9 - date.getDay() : 2 - date.getDay();
  }
  const h = d * 24 - date.getHours() - 1 + 5 - offset;
  const m = 60 - date.getMinutes() - 1;
  const s = 60 - date.getSeconds();
  return h * 3600 + m * 60 + s;
}

function formatCountdown(secs: number): { text: string; urgent: boolean } {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return { text: `${pad(h)}:${pad(m)}:${pad(s)}`, urgent: h < 36 };
}

const CountdownToolbar = () => {
  const [countdown, setCountdown] = useState(() => initCountdown());
  const [linksOpen, setLinksOpen] = useState(false);
  const cd = formatCountdown(countdown);

  useEffect(() => {
    const id = setInterval(() => setCountdown((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <Alert
        title={
          <div className='app-countdown-alert-title'>
            <InfoCircleFilled className='app-countdown-alert-icon' />
            <span className='app-countdown-alert-text'>
              衣柜、设计图更新：by 翡翠 | 关卡信息更新：by 兔子
            </span>
            <Button
              size='small'
              className='app-countdown-alert-link-btn'
              onClick={() => setLinksOpen(true)}
            >
              友情链接
            </Button>
            <Button
              size='small'
              className='app-countdown-alert-link-btn'
              href={`${import.meta.env.BASE_URL}index_old.html`}
              target='_blank'
            >
              返回旧版
            </Button>
          </div>
        }
        type='info'
        showIcon={false}
        closable
        style={{ marginBottom: 8 }}
      />
      <div className='app-countdown-bar' style={{ marginBottom: 12 }}>
        <div className='app-countdown-toolbar'>
          <div className='app-countdown-left'>
            <span className='app-countdown-label'>距离搭配赛结束还有</span>
            <span
              className={`app-countdown-pill${cd.urgent ? " app-countdown-pill--urgent" : ""}`}
            >
              {cd.text}
            </span>
          </div>
          <div className='app-countdown-links'>
            <a
              className='app-countdown-link-pill'
              href='biguse.html'
              target='_blank'
              rel='noreferrer'
            >
              对比工具
            </a>
            <a
              className='app-countdown-link-pill'
              href='introduce.html'
              target='_blank'
              rel='noreferrer'
            >
              使用介绍
            </a>
            <a
              className='app-countdown-link-pill'
              href='../nikkiup2u3_data/FAQ.html'
              target='_blank'
              rel='noreferrer'
            >
              FAQ
            </a>
            <a
              className='app-countdown-link-pill'
              href='wardrobechk.html'
              target='_blank'
              rel='noreferrer'
            >
              衣柜对比
            </a>
          </div>
        </div>
      </div>

      <Modal
        title='友情链接'
        open={linksOpen}
        onCancel={() => setLinksOpen(false)}
        footer={
          <Button type='primary' onClick={() => setLinksOpen(false)}>
            关闭
          </Button>
        }
        width={520}
      >
        <Space direction='vertical' size={8}>
          <Typography.Text>
            小伙伴自行维护的{" "}
            <a
              href='http://nikkitw.github.io/nikkitw'
              target='_blank'
              rel='noreferrer'
            >
              台服版
            </a>
            、{" "}
            <a
              href='http://nikkijp.github.io/nikkijpch'
              target='_blank'
              rel='noreferrer'
            >
              日服简中版
            </a>
            、{" "}
            <a
              href='http://nikkijap.github.io/nikkijp'
              target='_blank'
              rel='noreferrer'
            >
              日服繁中版
            </a>
          </Typography.Text>
        </Space>
      </Modal>
    </>
  );
};

export default CountdownToolbar;
