import React, { useMemo, useState } from "react";
import { Typography, Button, Modal, Tabs, Space } from "antd";
import "./AppHeader.css";
import { HistoryOutlined } from "@ant-design/icons";

const { Title } = Typography;

const FEATURE_OWNER_HTML = "功能更新：by 黑的升华 & Rean翎";
const CLOTHES_OWNER_HTML = "衣柜、设计图更新：by 翡翠 & Rean翎";
const LEVEL_OWNER_HTML =
  "关卡更新：by 兔子 " +
  '<a href="http://tieba.baidu.com/p/4223816101">贴吧反馈</a> | ' +
  '<a href="http://weibo.com/5674185517/D9pJb9iSF">微博反馈</a>';

const FEATURE_UPDATE_BRIEF_HTML =
  "2022.6.14: 短版备份文本使用1000+10代表编号1000-1010<br/>" +
  "2023.12.20: 随游戏更新了一波tag名字，若有bug请反馈<br/>";

// 来自旧版 `nikkiup2u3/index.html` 的 `#update_history` 全量内容（57-177）
const FEATURE_UPDATE_HISTORY_HTML =
  "0902update: 己做了一版0902服装的, 在ip君更新前临时使用=w=<br/>" +
  "主要修改内容: 0902衣柜, 竞技场和联盟委托权重, 因报错去掉了google脚本<br/>" +
  "0909update: 9-支2权重修复, 9-9-3tag修复, 衣柜数据更新到0909版本, 移动端尚未更新<br/>" +
  "0910update: 修女头饰修复<br/>" +
  "0911update: 添加返回最上按钮, 添加顶配模式(试验中)<br/>" +
  "0915update: 更新ip君0915数据, 补全联盟委托技能, 添加常用攻略页面, 添加均衡权重功能(测试ing)<br/>" +
  "0918update: 更新花嫁套装, 更新新版分数区间(与IP君略不同)<br/>" +
  "0922update: 更新小兔子=w=, 更新公众号链阳套<br/>" +
  "0922update2: 修复: 游园*黑,金发娃娃*珍稀,甜度*珍稀,时空颈圈*玫<br/>" +
  "0925update: 原始文件更新为ivangift's github@20150925(IP君最新版), 本次更新调整了全部JJC和联盟权重, 更新部分新衣服<br/>" +
  '在此基础上, 删除"苹果联邦高级成衣展"的tag需求, 修复:游园*黑,金发娃娃*珍稀,甜度*珍稀,时空颈圈*玫,花嫁头纱<br/>' +
  "0925update2: 修复:怪盗下装*华丽, 广寒精灵*白, 添加:锁扣包<br/>" +
  "0925update3: 添加:灵幔, 漫纱轻舞, 纱舞, 漫纱舞鞋(今天更新好多次<br/>" +
  "0925update4: 修复:乐园气球(会不会有5<br/>" +
  "0929update1: 国庆更新第一发, 添加梦恋奇迹5关权重<br/>" +
  "0929update2: 修复活动第三关权重<br/>" +
  "0929update3: 添加3套婚纱, 添加蓝冰瞳<br/>" +
  "0929update4: 添加幻阁限定, 仙履屋及染色 ps:魔幻领结是挎包..是挎包..挎包..包..<br/>" +
  "0929update5: 修复部分服装错误<br/>" +
  "0930update: 添加鸡米包, 玩趣*嘻嘻<br/>" +
  "长假的某天update: 易用性优化<br/>" +
  "1014update1: 第10章属性添加, 部分提示添加, 技能懒得写了=.=<br/>" +
  "1014update2: 修复了一下排序, 应该没bug了<br/>" +
  "1017update: <br/>" +
  "更新衣柜数据为 jillhx@QQ群 20151016<br/>" +
  "更新第十章权重数据及过关提示为 流水喵&兔子@QQ群 20151014 (技能数据暂时没有文字版, 有需要可以去流水喵的微博查看)<br/>" +
  "更正部分联盟委托技能<br/>" +
  "本次更新后需要注意的衣服: 魔幻领结 颈饰-->项链，藤萝链 手饰左-->手持左<br/>" +
  "本次更新后改名的衣服: 蓝宝石(下装)-->束腰蓝裙，甜心巧克力(袜子)-->甜心女仆袜, 晚霞(鞋子)-->绮霞景, 月饼-->寒月<br/>" +
  "1017update2: 添加了一个搭配赛提醒小时钟, 以纪念那离我而去的水晶玫瑰...(时差党可能会有些问题)<br/>" +
  "1020update: 更新精灵的月下舞会, 数据及攻略来自白残(*/ω\\*)@QQ群, tag数据仅供参考, 请自行调整, 小时钟稍后修复<br/>" +
  "1020update2: 更新衣柜数据为 jillhx@QQ群 20151020, 修复小时钟<br/>" +
  "1020update3: 更新设计图数据为 amy_翡翠@QQ群 1.5.2<br/>" +
  "1021update: 更新权重数据为 意念挖坟的ip君@ivangift's github 20151021<br/>" +
  "1029update: 更新第一个奇奇怪怪的东西:一键攻略, 仿流水喵攻略排版, 部分功能未实装, 有需要可以自己P上去=w=。<br/>" +
  "1029update2: 发现被强制使用兼容模式的情况比较多, 添加meta以建议非IE浏览器优先使用webkit内核, IE浏览器优先使用最高级文档模式, 效果未知<br/>" +
  "1030update: 更新衣柜<br/>" +
  "1030update2: 优化一键攻略<br/>" +
  "1030update3: 修复绮幻万圣夜和万圣帽的id, 之前有添加过这两件衣服的需要重新添加, 发现其他id问题请反馈~<br/>" +
  "1030update4: 一键攻略支持自定义关卡<br/>" +
  "1030update5: 修复梦想之音<br/>" +
  "1101update: 一键攻略更新, 如无特殊情况不会再对该功能进行大规模改动, 缺少的数据会根据网友贡献逐步收录<br/>" +
  "1102update: 更新衣柜记录, 打开方式: 高级选项 >> 衣柜数量记录, 应该会有BUG。搭配赛计时器改为36小时内变红(我才不会说我还剩10小时的时候才参赛<br/>" +
  '1106update: 更新昼夜回廊, 新分类"饰品-特殊*翅膀", 近期计划重做移动版, 有好的建议可以发给我(主要是排版), 顺便在考虑要不要做个APP<br/>' +
  "1106update2: 修复错误衣柜数据, 如果仍有问题及时反馈~<br/>" +
  '1106update3: 修改藤萝链为手饰*左, 做攻略的各位注意下(暖暖终于改回来了, 本次更新"万圣巫师帽·绮夜"的id有调整, 之前添加过的需要重新添加<br/>' +
  "11.09: 缓慢调整界面样式中<br/>" +
  "11.16: 修复一键攻略饰品排序错误, 缓慢调整界面样式中<br/>" +
  "11.16: 添加手动高分权重功能, 暂不支持一键攻略; 去掉按钮颜色(果然没有艺术细胞... <br/>" +
  "11.19: 高分权重功能添加分数排序提示, 调整购物车总分位置, 购物车自动计算连衣裙/上下装 <br/>" +
  "11.19: 更新全关卡的技能数据, 感谢兔子和猫猫的整理 <br/>" +
  "11.25: 版本更新 <br/>" +
  "11.26: 版本更新 <br/>" +
  "12.3: 更新火炮兰套装, 花蔓套装, 内衣套装; 更新联盟权重; 调整: 盛宴之梦&假面盛宴·梦<br/>" +
  "12.3: 更新所有关卡的过关提示, 更新所有联盟委托技能, 感谢morei猫猫&兔子的整理和提供 (耽搁了好久的某黑逃<br/>" +
  "12.6: 更新炮火如兰, 云谣, 生日套装<br/>" +
  "12.8: 更新满天繁星套装, 添加部位:饰品-特殊*耳朵, 调整部位:足下>>背景, 背景>>前景, 挎包>>肩部<br/>" +
  "12.10: 更新4件签到衣服, 活动关卡每天上午更新, 不特地说明了<br/>" +
  "12.14: 更新烟云锦, 今天是活动最后一天, 大家记得刷完自己想要的部件~<br/>" +
  "12.16: 添加F品/非F品一句话提示(仅功能添加, 数据未实装<br/>" +
  "12.18: 更新罂粟千狐, 圣诞设计图部件, 一元购部件<br/>" +
  '12.18: 更新全关卡部分F配件信息, 感谢兔子和猫猫的整理, F品信息补充请至<a href="http://tieba.baidu.com/p/4223816101">F品收集帖</a>汇报<br/>' +
  "12.18: 调整分类顺序, 将外套放在上下装之后, 袜子放在袜套前, 饰品按照游戏中进行排序<br/>" +
  "12.20: 添加饰品id排序功能，使用方式：刷新页面后选择饰品分数排序, 默默的加了个评论功能<br/>" +
  "12.22: 更新设计图数据为翡翠@QQ群 V1.6.3, 为未来原材料计算功能调整材料列表格式<br/>" +
  "12.23: 更新圣诞套, 新增分类'饰品-特殊*发卡'(临时命名, 有第二件时调整分类名称)<br/>" +
  "12.23: 添加原材料计算功能v2, 鼠标悬浮后会显示所需的原材料数量, 自动计算原材料总数, 可能最终数据有些错误, 欢迎报错, 悬浮窗效果调整会和手机适配版同时发布<br/>" +
  "12.23: 更新关卡过关提示, F配件数据<br/>" +
  "12.24: 移动适配版v1发布~ 已知缺陷: 650~850宽度的屏幕的衣服分类tab页样式错乱; 切换分类后浮动表头样式错乱;  显示更多衣服按钮是假的, 请继续使用顶配模式按钮;(趁晚上没人用偷偷更新一发<br/>" +
  "12.24: 修复浮动表头<br/>" +
  "12.24: 移动适配版v2发布: 调整650-850宽度的界面样式错乱; 调整顶配模式位置到衣柜下方; 调整移动版部分细节; 调整表格配色; 未选择关卡时不显示推荐部件;<br/>" +
  "12.27: 修改饰品分数计算规则, 一键攻略尚未更新<br/>" +
  '12.30: 配装器主功能没有修改, 做了一个针对梦幻大使的小功能, <a href="biguse.html">连接点此</a><br/>' +
  "1.2: 衣柜更新, 修复青花蝶<br/>" +
  "1.3: 修复一系列因为上次更新偷懒导致的问题<br/>" +
  "1.6: 过关提示与F品更新<br/>" +
  "1.8: 11章属性,tag更新完毕, 关卡过关提示持续更新中, <red>11-3, 11-5, 11-8 可以通过充值套连衣裙(不穿外套)拼技能(睡>微笑>挑剔>飞吻>微笑), 不做新套装达到S</red>, 其他容易F(分数为正常的1/10)的关卡也可以, 趁没改之前赶紧用吧<br/>" +
  "1.8: 更新11章过关提示from兔子<br/>" +
  "1.8: 更新衣柜至jillhx@QQ群20160108<br/>" +
  "1.8: 简单调整了一键攻略宽度<br/>" +
  "1.16: 衣柜数据更新, 设计图数据更新, 调整11章为普通关卡 by 翡翠<br/>" +
  "1.16: 一键攻略更新<br/>" +
  "1.17: 忘了写公告, 关卡, 设计图, 衣柜更新完毕<br/>" +
  "1.17: 添加筛选功能, 只在页面内筛选, 需要先点击显示全部衣柜后再筛选<br/>" +
  "1.17: 修复浮动条, 顶部添加显示全部衣柜按钮<br/>" +
  "1.17: 更新过关提示, F品 by 兔子<br/>" +
  "1.18: 测试一下完全解放我的方式, 无内容更新<br/>" +
  "1.19: 半夜忙完发现饰品分数规则改了, ip君那边估计commit代码后又忘了push, 所以算出的tag分数都是NaN, 根据原理自己理解写了一个规则, 有问题的话周末再改吧, 基本全关带20个饰品没问题, 也没见过哪几关权重相差10倍的<br/>" +
  "1.19: 修复移动版属性错误<br/>" +
  "1.24: 把冰雪女王活动去掉以证明一下自己还活着<br/>" +
  "1.30: 更新筛选功能和快速添加衣柜功能, 微博有春节期间活动时间表  ps:现在更新配装器有种给暖暖写(shuo)遗(qi)书(keng)的感觉<br/>" +
  "1.31: 梦幻大使工具更新了一个新功能, 欢迎测试和反馈问题, 不是特别准确, 不过可以做一定参考<br/>" +
  "2.2: 梦幻大使功能更新, 优化了颜色聚类算法, 欢迎测试~~<br/>" +
  "2.3: 梦幻大使功能更新完毕<br/>" +
  '2.19: 修复原筛选; 新增筛选: 清空, 套装部件, 新品; 增加分类"全部"; qjnn.gift域名试用中<br/>' +
  "2.23: 新增方便拆解查询的筛选: 迷之屋限定(不包含仙履), 3星,4星,5星; 注: 不确定以后更新的设计图会不会用到现有的迷阁限定/双阁限定, 请自行判断是否要拆; 修复一键添加BUG<br/>" +
  "2.29: 更新染/进筛选时, 会同时筛选出珍稀和珍稀染色<br/>" +
  '3.18: 修复全部分类下点击"添加所有显示的衣服到衣柜"功能, 调整一键攻略部分细节<br/>' +
  "3.23: F品筛选功能试用中<br/>" +
  "4.1 : 修复部分细节问题<br/>" +
  "5.5 : 一键攻略去除F品；双手持部位调整；部分tag关卡的推荐饰品调整；筛选增加暂不缺材料，但有机会成为以后设计图的材料，分解时请注意<br/>" +
  "5.9 : 新增9件饰品选项给不想带饰品的小黑<br/>" +
  "5.13: 更新萤光之灵, 感谢楼上的rean帮忙更新配装器~ o&gt;,&lt;o <br/>" +
  "5.15: 调整萤光之灵权重比例, 计分方法；点击高分权重自动推荐最高分的组合<br/>" +
  "6.1: 新增搜索功能，支持按套装名搜索，可选择添加到衣柜/购物车，暂时也想不到好的展示方法，先这样吧；顺便修复了导入时提示框过长的问题<br/>" +
  "6.7: 调整一键攻略, 现在各分类最后一件必定是比较容易获得的单品, 预祝大家端午快乐~<br/>" +
  "6.19: 推荐穿戴部件中高亮新品<br/>" +
  "6.27: 添加关卡筛选功能<br/>" +
  "7.19: 给梦幻大使在线工具上传了新品的小图标并做了些优化<br/>" +
  "8.30: 赶在新章节前优化了一下偷懒攻略<br/>" +
  "10.6: 优化排斥品推荐计算；一键攻略改为按满饰品衰减计算（懒黑模式按无衰减计算、9饰品模式按9饰品衰减计算）<br/>" +
  '12.6: 鉴于很多人问怎么检查少了一件衣服的问题，做了一个游戏衣柜对比页，<a href="wardrobechk.html">连接点此</a><br/>' +
  "4.28: 偷懒攻略大改版，测试中欢迎反馈<br/>" +
  "8.31: 重新计算了衣服属性取值，推荐结果会有所不同<br/>" +
  "9.5: 衣服筛选增加梦境选项<br/>" +
  "8.4: 衣服越来越多，为了方便拷贝备份，做了一个短版的衣柜备份文本，可以生成短版文本并恢复备份。测试阶段暂时不动原本备份区的逻辑，建议大家试用前先备份一次长版，以免丢失衣柜<br/>" +
  "2020.6.20: 久违的更新，本次增加模仿游戏中上回试穿的子类别按编号排序功能；并自动使用短版备份文本<br/>" +
  "2021.3.24: 推荐穿戴部件会计算假肢部件和皮肤冲突的情况，自动推荐更高分的组合（假肢+无皮肤/正常姿势+皮肤）；购物车分数会根据饰品数量自动计算衰减后分数<br/>";

const AppHeader: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const { clothesHtml, levelHtml, featureHtml } = useMemo(() => {
    const w = window as any;
    const clothesBrief = String(w.clothesNotice || "");
    const clothesHistory = String(w.clothesHistoryNotice || "");
    const levelBrief = String(w.levelNotice || "");
    const levelHistory = String(w.levelHistoryNotice || "");
    const divider =
      '<hr style="margin: 12px 0; border: 0; border-top: 1px solid rgba(0,0,0,0.06);"/>';
    const ownerLine =
      '<div style="margin-bottom: 8px; color: rgba(0,0,0,0.55);">__OWNER__</div>';

    return {
      featureHtml: showHistory
        ? ownerLine.replace("__OWNER__", FEATURE_OWNER_HTML) +
          FEATURE_UPDATE_HISTORY_HTML +
          divider +
          FEATURE_UPDATE_BRIEF_HTML
        : ownerLine.replace("__OWNER__", FEATURE_OWNER_HTML) +
          FEATURE_UPDATE_BRIEF_HTML,
      clothesHtml: showHistory
        ? ownerLine.replace("__OWNER__", CLOTHES_OWNER_HTML) +
          clothesHistory +
          divider +
          clothesBrief
        : ownerLine.replace("__OWNER__", CLOTHES_OWNER_HTML) + clothesBrief,
      levelHtml: showHistory
        ? ownerLine.replace("__OWNER__", LEVEL_OWNER_HTML) +
          levelHistory +
          divider +
          levelBrief
        : ownerLine.replace("__OWNER__", LEVEL_OWNER_HTML) + levelBrief,
    };
  }, [showHistory]);

  return (
    <div className='app-header'>
      <Title level={4} style={{ margin: 0 }}>
        奇迹暖暖在线配装器
      </Title>
      <Button
        size='small'
        icon={<HistoryOutlined />}
        className='app-header-history-btn'
        onClick={() => {
          setShowHistory(false);
          setOpen(true);
        }}
      >
        更新日志
      </Button>

      <Modal
        title='更新日志'
        open={open}
        onCancel={() => {
          setOpen(false);
          setShowHistory(false);
        }}
        footer={
          <Space style={{ width: "100%", justifyContent: "space-between" }}>
            <Typography.Text type='secondary'>
              {showHistory ? "当前：历史更新" : "当前：最新更新"}
            </Typography.Text>
            <Space>
              {!showHistory ? (
                <Button type='primary' onClick={() => setShowHistory(true)}>
                  查看历史更新
                </Button>
              ) : (
                <Button onClick={() => setShowHistory(false)}>
                  返回最新更新
                </Button>
              )}
              <Button
                onClick={() => {
                  setOpen(false);
                  setShowHistory(false);
                }}
              >
                关闭
              </Button>
            </Space>
          </Space>
        }
        width={760}
        destroyOnClose
      >
        <Tabs
          defaultActiveKey='feature'
          items={[
            {
              key: "feature",
              label: "功能更新",
              children: (
                <div
                  className='update-log-content'
                  dangerouslySetInnerHTML={{ __html: featureHtml }}
                />
              ),
            },
            {
              key: "clothes",
              label: "衣柜/设计图",
              children: (
                <div
                  className='update-log-content'
                  dangerouslySetInnerHTML={{ __html: clothesHtml || "暂无" }}
                />
              ),
            },
            {
              key: "level",
              label: "关卡更新",
              children: (
                <div
                  className='update-log-content'
                  dangerouslySetInnerHTML={{ __html: levelHtml || "暂无" }}
                />
              ),
            },
          ]}
        />
      </Modal>
    </div>
  );
};

export default AppHeader;
