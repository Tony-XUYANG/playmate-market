import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import {
  Search,
  MapPin,
  ChevronRight,
  Star,
  ShieldCheck,
  Clock3,
  MessageCircle,
  ShoppingBag,
  Store,
  X,
  Check,
  SlidersHorizontal,
  Users,
  Gamepad2,
  Trophy,
  Zap,
  Headphones,
  Send,
  Plus,
  Trash2,
  Power,
  Megaphone,
  TrendingUp,
  Mic,
  Phone,
  PhoneOff,
  Play,
  Pause,
  Volume2,
  Award,
} from "lucide-react";
import "./styles.css";
import "./ads.css";
import "./voice.css";
import "./realtime.css";
import "./support-console.css";
import "./player-console.css";
import "./order-admin.css";
import "./governance.css";
import {
  connectSupportConversation,
  connectMerchantConversation,
  cancelOrder,
  createDispute,
  createOrder,
  listOrders,
  listMerchantConversations,
  listMerchantMessages,
  listSupportMessages,
  openSupportConversation,
  payOrder,
  listDisputes,
  resolveDispute,
  listStoreApplications,
  reviewStoreApplication,
  listPlayerVerifications,
  reviewPlayerVerification,
  listAdminAds,
  reviewAdvertisement,
  listLedger,
  listAuditLogs,
  createViolation,
  submitPlayerVerification,
  sendMerchantSupportMessage,
  sendSupportMessage,
  getPlayerDashboard,
  transitionPlayerOrder,
  updatePlayerStatus,
  uploadVoice,
} from "./api";

const games = [
  ["王者荣耀", "MOBA", "王者"],
  ["英雄联盟", "MOBA", "联盟"],
  ["和平精英", "射击", "和平"],
  ["无畏契约", "射击", "无畏"],
  ["原神", "开放世界", "原神"],
  ["永劫无间", "动作竞技", "永劫"],
];
const services = [
  {
    name: "王者荣耀 · 赛季冲刺陪玩",
    shop: "星河电竞陪玩馆",
    price: 38,
    unit: "小时起",
    rating: 4.9,
    sales: "2.8k",
    tag: "高胜率",
    color: "#fff0e6",
    icon: "王者",
    desc: "国服打手｜巅峰赛｜可指定英雄",
  },
  {
    name: "和平精英 · 王牌上分套餐",
    shop: "夜猫电竞俱乐部",
    price: 29,
    unit: "小时起",
    rating: 4.8,
    sales: "1.6k",
    tag: "包赢保障",
    color: "#e8f6ff",
    icon: "和平",
    desc: "四排车队｜声优开黑｜稳定上分",
  },
  {
    name: "英雄联盟 · 钻石晋级赛",
    shop: "峡谷通行证",
    price: 55,
    unit: "局起",
    rating: 5.0,
    sales: "986",
    tag: "大神认证",
    color: "#eeedff",
    icon: "联盟",
    desc: "峡谷之巅｜打野/中单｜赛后复盘",
  },
  {
    name: "无畏契约 · 段位突破",
    shop: "月蚀电竞",
    price: 42,
    unit: "小时起",
    rating: 4.9,
    sales: "1.2k",
    tag: "新店特惠",
    color: "#e8fff5",
    icon: "无畏",
    desc: "枪法陪练｜团队指挥｜全段位",
  },
];
const stores = [
  {
    id: "store_xinghe",
    name: "星河电竞陪玩馆",
    handle: "银河系最懂你的开黑搭子",
    avatar: "星",
    theme: "orange",
    city: "上海 · 静安",
    rating: 4.9,
    orders: "12.8k",
    online: 36,
    desc: "专注王者荣耀、英雄联盟与和平精英，国服打手与高质量声优陪玩。",
    tags: ["官方认证", "极速响应", "新客立减"],
    support: { enabled: true, agent: "星河店长", response: "3 分钟内" },
    projects: [
      {
        title: "王者荣耀 · 赛季冲刺",
        game: "王者荣耀",
        mode: "段位 / 巅峰赛",
        price: 38,
        unit: "小时",
        online: 12,
        tag: "热卖",
        icon: "王者",
        color: "#fff0e6",
      },
      {
        title: "王者荣耀 · 五排开黑车",
        game: "王者荣耀",
        mode: "娱乐 / 语音",
        price: 25,
        unit: "小时",
        online: 8,
        tag: "开黑",
        icon: "五排",
        color: "#fff5df",
      },
      {
        title: "英雄联盟 · 钻石晋级赛",
        game: "英雄联盟",
        mode: "排位 / 陪练",
        price: 55,
        unit: "局",
        online: 5,
        tag: "高胜率",
        icon: "联盟",
        color: "#eeedff",
      },
      {
        title: "和平精英 · 王牌四排",
        game: "和平精英",
        mode: "四排 / 声优",
        price: 29,
        unit: "小时",
        online: 7,
        tag: "包赢保障",
        icon: "和平",
        color: "#e8f6ff",
      },
      {
        title: "游戏陪聊 · 深夜电台",
        game: "通用",
        mode: "聊天 / 唱歌",
        price: 18,
        unit: "小时",
        online: 4,
        tag: "轻松局",
        icon: "陪聊",
        color: "#e8fff5",
      },
    ],
  },
  {
    id: "store_night",
    name: "夜猫电竞俱乐部",
    handle: "夜猫出没，快乐加倍",
    avatar: "夜",
    theme: "blue",
    city: "杭州 · 西湖",
    rating: 4.8,
    orders: "8.6k",
    online: 24,
    desc: "专业 FPS 陪练与王牌车队，固定车队不鸽单，支持语音指挥与技术复盘。",
    tags: ["满 100 减 20", "全员认证", "不满意包退"],
    support: { enabled: true, agent: "夜猫客服组", response: "5 分钟内" },
    projects: [
      {
        title: "和平精英 · 王牌冲刺",
        game: "和平精英",
        mode: "四排 / 上分",
        price: 32,
        unit: "小时",
        online: 9,
        tag: "热门",
        icon: "王牌",
        color: "#e8f6ff",
      },
      {
        title: "无畏契约 · 枪法陪练",
        game: "无畏契约",
        mode: "靶场 / 实战",
        price: 42,
        unit: "小时",
        online: 6,
        tag: "技术局",
        icon: "无畏",
        color: "#e8fff5",
      },
      {
        title: "无畏契约 · 段位突破",
        game: "无畏契约",
        mode: "排位 / 指挥",
        price: 68,
        unit: "小时",
        online: 4,
        tag: "大神带队",
        icon: "突破",
        color: "#f0ecff",
      },
      {
        title: "火力全开 · FPS 开黑",
        game: "通用",
        mode: "语音 / 欢乐",
        price: 22,
        unit: "小时",
        online: 5,
        tag: "新客特惠",
        icon: "FPS",
        color: "#fff0e6",
      },
    ],
  },
  {
    id: "store_valley",
    name: "峡谷通行证",
    handle: "每一局，都值得认真对待",
    avatar: "峡",
    theme: "purple",
    city: "广州 · 天河",
    rating: 5.0,
    orders: "6.2k",
    online: 18,
    desc: "峡谷高段位陪练，擅长打野、辅助和赛后复盘，帮助你稳定提升游戏理解。",
    tags: ["宗师认证", "赛后复盘", "可指定位置"],
    support: { enabled: true, agent: "峡谷教练组", response: "2 分钟内" },
    projects: [
      {
        title: "英雄联盟 · 上分陪练",
        game: "英雄联盟",
        mode: "排位 / 指定位置",
        price: 48,
        unit: "小时",
        online: 8,
        tag: "高评价",
        icon: "上分",
        color: "#eeedff",
      },
      {
        title: "英雄联盟 · 赛后复盘课",
        game: "英雄联盟",
        mode: "教学 / 语音",
        price: 88,
        unit: "小时",
        online: 3,
        tag: "系统教学",
        icon: "复盘",
        color: "#f8eaff",
      },
      {
        title: "王者荣耀 · 打野思路课",
        game: "王者荣耀",
        mode: "教学 / 进阶",
        price: 66,
        unit: "小时",
        online: 2,
        tag: "进阶",
        icon: "思路",
        color: "#fff0e6",
      },
    ],
  },
];
const players = [
  {
    name: "阿泽",
    avatar: "泽",
    theme: "p-orange",
    store: "星河电竞陪玩馆",
    game: "王者荣耀",
    rank: "百星王者 · 国服打野",
    rating: 4.99,
    orders: "3,286",
    online: true,
    price: 48,
    tags: ["技术流", "温柔指挥", "可教学"],
    bio: "6 年 MOBA 经验，擅长打野节奏和阵容分析，认真对待每一局。",
    voice: "你好，我是阿泽，主玩王者打野，可以陪你上分，也可以复盘思路。",
  },
  {
    name: "小鹿",
    avatar: "鹿",
    theme: "p-pink",
    store: "星河电竞陪玩馆",
    game: "和平精英",
    rank: "王牌 18 星 · 四排指挥",
    rating: 4.96,
    orders: "2,104",
    online: true,
    price: 36,
    tags: ["声优陪玩", "气氛组", "不冷场"],
    bio: "轻松局和技术局都可以，擅长四排运营，组队全程开麦沟通。",
    voice: "嗨，我是小鹿，和平精英王牌指挥，想上分或者快乐开黑都可以找我。",
  },
  {
    name: "K哥",
    avatar: "K",
    theme: "p-blue",
    store: "夜猫电竞俱乐部",
    game: "无畏契约",
    rank: "神话 3 · 枪法教练",
    rating: 4.98,
    orders: "1,864",
    online: false,
    price: 58,
    tags: ["枪法陪练", "复盘教学", "团队指挥"],
    bio: "前半职业青训成员，专注 FPS 枪法、预瞄和团队沟通训练。",
    voice:
      "我是 K 哥，主打无畏契约枪法和实战复盘，需要冲段位可以预约我的档期。",
  },
  {
    name: "七七",
    avatar: "七",
    theme: "p-purple",
    store: "峡谷通行证",
    game: "英雄联盟",
    rank: "峡谷之巅宗师 · 辅助",
    rating: 5.0,
    orders: "1,256",
    online: true,
    price: 66,
    tags: ["宗师认证", "赛后复盘", "情绪稳定"],
    bio: "擅长辅助游走与视野运营，提供一对一思路课和排位陪练。",
    voice:
      "你好呀，我是七七，峡谷宗师辅助，可以陪你排位，也可以帮你分析对线和视野。",
  },
];
function App() {
  const [active, setActive] = useState("首页");
  const [cart, setCart] = useState([]);
  const [modal, setModal] = useState(null);
  const [game, setGame] = useState("全部游戏");
  const [selectedStore, setSelectedStore] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  useEffect(() => {
    let mounted = true;
    listOrders()
      .then(({ orders }) => {
        if (mounted)
          setCart(
            orders.map((order) => ({
              id: order.id,
              name: order.serviceName,
              shop: order.storeName,
              price: order.amount,
            })),
          );
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);
  const add = (s) => {
    setCart((current) => [...current, s]);
    createOrder(s).catch(() => {});
  };
  return (
    <div className="app">
      <header>
        <div className="top">
          <div className="brand">
            <span className="brand-mark">P</span>
            <span>PLAYMATE</span>
            <small>游戏陪玩市场</small>
          </div>
          <nav>
            {["首页", "找陪玩", "游戏服务", "店铺入驻"].map((n) => (
              <button
                className={active === n ? "active" : ""}
                onClick={() =>
                  n === "店铺入驻" ? setModal("join") : setActive(n)
                }
                key={n}
              >
                {n}
              </button>
            ))}
          </nav>
          <div className="location">
            <MapPin size={16} /> 上海 <ChevronRight size={15} />
          </div>
          <button className="owner-link" onClick={() => setModal("owner")}>
            <Store size={16} /> 店主中心
          </button>
          <button className="player-link" onClick={() => setModal("player")}>
            <Gamepad2 size={16} /> 陪玩师中心
          </button>
          <button className="orders" onClick={() => setModal("orders")}>
            <ShoppingBag size={18} /> 我的订单{" "}
            {cart.length > 0 && <b>{cart.length}</b>}
          </button>
          <button className="login" onClick={() => setModal("login")}>
            登录 / 注册
          </button>
        </div>
      </header>
      <main>
        <FeaturedAds2 openStore={setSelectedStore} />
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">PLAY SMART · HAVE FUN</div>
            <h1>
              找到合拍的
              <br />
              <em>游戏搭子</em>
            </h1>
            <p>专业陪玩、段位冲刺、开黑娱乐，一站式游戏服务平台</p>
            <div className="search">
              <Search size={20} />
              <input placeholder="搜索游戏、服务或店铺" />
              <button>搜索</button>
            </div>
            <div className="trust">
              <span>
                <ShieldCheck size={16} /> 实名认证打手
              </span>
              <span>
                <Clock3 size={16} /> 7×24小时在线
              </span>
              <span>
                <Star size={16} /> 平台担保交易
              </span>
            </div>
          </div>
          <div className="hero-art">
            <div className="art-glow"></div>
            <div className="console">◈</div>
            <div className="float-card one">
              <span>今日在线</span>
              <strong>12,846</strong>
              <i>+18.6%</i>
            </div>
            <div className="float-card two">
              <span>热门服务</span>
              <strong>王者冲刺</strong>
              <i>98%好评</i>
            </div>
          </div>
        </section>
        <section className="section games">
          <div className="section-head">
            <div>
              <span className="kicker">EXPLORE BY GAME</span>
              <h2>热门游戏</h2>
            </div>
            <button className="link-btn" onClick={() => setActive("找陪玩")}>
              查看全部 <ChevronRight size={16} />
            </button>
          </div>
          <div className="game-grid">
            {games.map((g, i) => (
              <button
                onClick={() => setGame(g[0])}
                className={"game " + (game === g[0] ? "selected" : "")}
                key={g[0]}
              >
                <span className={"game-icon g" + i}>{g[2]}</span>
                <span>
                  <strong>{g[0]}</strong>
                  <small>{g[1]}</small>
                </span>
                <ChevronRight size={16} />
              </button>
            ))}
          </div>
        </section>
        <section className="section services">
          <div className="section-head">
            <div>
              <span className="kicker">CURATED FOR YOU</span>
              <h2>{game === "全部游戏" ? "精选服务" : " " + game + " 服务"}</h2>
            </div>
            <div className="filters">
              <button>
                <SlidersHorizontal size={16} /> 筛选
              </button>
              <button>
                综合排序 <ChevronRight size={14} />
              </button>
            </div>
          </div>
          <div className="service-grid">
            {services.map((s, i) => (
              <article className="service-card" key={s.name}>
                <div className="service-cover" style={{ background: s.color }}>
                  <span className={"cover-icon c" + i}>{s.icon}</span>
                  <span className="tag">{s.tag}</span>
                  <button className="heart">♡</button>
                </div>
                <div className="service-body">
                  <div className="service-title">
                    <h3>{s.name}</h3>
                    <span className="verified">
                      <ShieldCheck size={14} />
                      认证
                    </span>
                  </div>
                  <p>{s.desc}</p>
                  <button
                    className="shop-line"
                    onClick={() =>
                      setSelectedStore(
                        stores.find((store) => store.name === s.shop) ||
                          stores[0],
                      )
                    }
                  >
                    <Store size={14} />
                    {s.shop}
                    <span>·</span>
                    <Star size={14} fill="#f4ad2a" color="#f4ad2a" /> {s.rating}{" "}
                    <small>({s.sales})</small>
                  </button>
                  <div className="service-foot">
                    <div>
                      <b>¥{s.price}</b>
                      <small>/{s.unit}</small>
                    </div>
                    <button onClick={() => add(s)}>立即预约</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
        <PlayerShowcase onSelect={setSelectedPlayer} />
        <section className="section store-section">
          <div className="section-head">
            <div>
              <span className="kicker">DISCOVER GREAT STORES</span>
              <h2>精选电竞店铺</h2>
            </div>
            <button className="link-btn" onClick={() => setActive("游戏服务")}>
              查看全部店铺 <ChevronRight size={16} />
            </button>
          </div>
          <div className="store-grid">
            {stores.map((store) => (
              <button
                className="store-card"
                key={store.name}
                onClick={() => setSelectedStore(store)}
              >
                <div className={"store-avatar " + store.theme}>
                  {store.avatar}
                </div>
                <div className="store-info">
                  <div className="store-name">
                    <strong>{store.name}</strong>
                    <ShieldCheck size={15} />
                  </div>
                  <p>{store.handle}</p>
                  <div className="store-meta">
                    <Star size={14} fill="#f4ad2a" color="#f4ad2a" />{" "}
                    {store.rating} <span>·</span> 已服务 {store.orders} 单
                  </div>
                </div>
                <div className="store-arrow">
                  <span>
                    <Users size={14} /> {store.online}人在线
                  </span>
                  <ChevronRight size={18} />
                </div>
              </button>
            ))}
          </div>
        </section>
        <section className="join-banner">
          <div>
            <span className="kicker">FOR GAME STORE OWNERS</span>
            <h2>把你的热爱，变成一门生意</h2>
            <p>
              入驻 PLAYMATE，接触千万游戏玩家，平台提供订单、客服与交易保障。
            </p>
          </div>
          <button onClick={() => setModal("join")}>
            免费入驻 <ChevronRight size={18} />
          </button>
        </section>
      </main>
      {modal === "owner" && <OwnerDashboard close={() => setModal(null)} />}{" "}
      {modal === "player" && <PlayerDashboard close={() => setModal(null)} />}{" "}
      {modal === "orders" && <BuyerOrderCenter close={() => setModal(null)} />}{" "}
      {modal === "admin" && (
        <AdminGovernanceCenter close={() => setModal(null)} />
      )}{" "}
      {modal && !["owner", "player", "orders", "admin"].includes(modal) && (
        <Modal
          type={modal}
          cart={cart}
          close={() => setModal(null)}
          onRole={setModal}
        />
      )}{" "}
      {selectedStore && (
        <StoreModal2
          store={selectedStore}
          add={add}
          close={() => setSelectedStore(null)}
        />
      )}{" "}
      {selectedPlayer && (
        <PlayerProfileModal
          player={selectedPlayer}
          add={add}
          close={() => setSelectedPlayer(null)}
        />
      )}
      <footer>
        <span>© 2026 PLAYMATE</span>
        <span>平台规则　服务协议　隐私政策</span>
        <span>客服热线 400-888-2026</span>
      </footer>
    </div>
  );
}
function PlayerShowcase({ onSelect }) {
  return (
    <section className="section player-section">
      <div className="section-head">
        <div>
          <span className="kicker">VERIFIED PLAYERS</span>
          <h2>明星陪玩师</h2>
        </div>
        <button className="link-btn">
          查看全部名片 <ChevronRight size={16} />
        </button>
      </div>
      <div className="player-grid">
        {players.map((p) => (
          <article className="player-card" key={p.name}>
            <div className="player-top">
              <div className={"player-avatar " + p.theme}>
                {p.avatar}
                <span className={p.online ? "online" : "offline"}></span>
              </div>
              <div>
                <div className="player-name">
                  <strong>{p.name}</strong>
                  <ShieldCheck size={14} />
                </div>
                <small>{p.store}</small>
              </div>
              <span className="player-game">{p.game}</span>
            </div>
            <div className="player-rank">
              <Award size={14} />
              {p.rank}
            </div>
            <div className="player-tags">
              {p.tags.slice(0, 2).map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
            <div className="player-voice">
              <button onClick={() => onSelect(p)}>
                <Volume2 size={15} />
              </button>
              <div className="mini-wave">
                {[8, 13, 6, 17, 11, 19, 8, 15, 5, 12, 9, 16].map((h, i) => (
                  <i style={{ height: h }} key={i}></i>
                ))}
              </div>
              <span>试听语音</span>
            </div>
            <div className="player-foot">
              <div>
                <Star size={13} fill="#f4ad2a" color="#f4ad2a" />
                <b>{p.rating}</b>
                <small> · {p.orders} 单</small>
              </div>
              <strong>
                ¥{p.price}
                <small>/小时</small>
              </strong>
              <button onClick={() => onSelect(p)}>查看名片</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function VoiceIntro({ player }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(
      () => setProgress((v) => (v >= 100 ? 0 : v + 2)),
      100,
    );
    return () => clearInterval(timer);
  }, [playing]);
  const toggle = () => {
    if (playing) {
      window.speechSynthesis?.cancel();
      setPlaying(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(player.voice);
    utterance.lang = "zh-CN";
    utterance.rate = 0.95;
    utterance.onend = () => {
      setPlaying(false);
      setProgress(0);
    };
    window.speechSynthesis?.speak(utterance);
    setPlaying(true);
  };
  useEffect(() => () => window.speechSynthesis?.cancel(), []);
  return (
    <div className="voice-intro">
      <button onClick={toggle}>
        {playing ? <Pause size={18} /> : <Play size={18} />}
      </button>
      <div>
        <div className={"voice-wave " + (playing ? "playing" : "")}>
          {[12, 21, 8, 25, 16, 28, 11, 22, 9, 18, 14, 24, 10, 19, 7, 15].map(
            (h, i) => (
              <i style={{ height: h }} key={i}></i>
            ),
          )}
        </div>
        <span style={{ width: `${progress}%` }}></span>
      </div>
      <small>{playing ? "正在播放语音介绍" : "12 秒语音介绍"}</small>
    </div>
  );
}

function PlayerProfileModal({ player, add, close }) {
  return (
    <div className="overlay player-overlay" onClick={close}>
      <div className="player-profile" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={close}>
          <X />
        </button>
        <div className="profile-cover">
          <div className={"player-avatar profile " + player.theme}>
            {player.avatar}
            <span className={player.online ? "online" : "offline"}></span>
          </div>
          <div>
            <div className="profile-name">
              <h2>{player.name}</h2>
              <ShieldCheck size={16} />
              <span>实名认证</span>
            </div>
            <p>{player.rank}</p>
            <small>
              <Store size={13} />
              {player.store}
            </small>
          </div>
          <div className="profile-status">
            <span
              className={player.online ? "online-dot" : "offline-dot"}
            ></span>
            {player.online ? "在线可约" : "暂时离线"}
          </div>
        </div>
        <div className="profile-stats">
          <div>
            <b>{player.rating}</b>
            <span>综合评分</span>
          </div>
          <div>
            <b>{player.orders}</b>
            <span>已完成订单</span>
          </div>
          <div>
            <b>98%</b>
            <span>再次预约率</span>
          </div>
        </div>
        <div className="profile-body">
          <span className="profile-label">语音名片</span>
          <VoiceIntro player={player} />
          <span className="profile-label">个人介绍</span>
          <p className="profile-bio">{player.bio}</p>
          <div className="player-tags profile-tags">
            {player.tags.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
          <div className="profile-service">
            <div>
              <strong>{player.game} · 专属陪玩</strong>
              <small>支持语音开黑、技术陪练和赛后复盘</small>
            </div>
            <div>
              <b>¥{player.price}</b>
              <small>/小时</small>
            </div>
          </div>
          <div className="profile-actions">
            <button className="profile-chat">
              <MessageCircle size={16} /> 先聊一聊
            </button>
            <button
              className="profile-book"
              onClick={() =>
                add({
                  name: `${player.name} · ${player.game}专属陪玩`,
                  shop: player.store,
                  price: player.price,
                })
              }
            >
              立即预约
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeaturedAds({ openStore }) {
  const [current, setCurrent] = useState(0);
  const featured = [
    {
      store: stores[0],
      label: "星河电竞暑期专场",
      title: "王者赛季冲刺，首单立减 20 元",
      desc: "国服打手带队 · 可指定英雄 · 不满意随时换人",
      project: "王者荣耀 · 赛季冲刺",
      price: 38,
      theme: "ad-orange",
    },
    {
      store: stores[1],
      label: "夜猫电竞夜间档",
      title: "FPS 深夜车队，今晚立即开黑",
      desc: "固定车队不鸽单 · 语音指挥 · 全段位可约",
      project: "无畏契约 · 枪法陪练",
      price: 42,
      theme: "ad-blue",
    },
    {
      store: stores[2],
      label: "峡谷通行证进阶课",
      title: "不只上分，更懂每一局怎么赢",
      desc: "宗师教练一对一复盘 · 指定位置 · 定制训练计划",
      project: "英雄联盟 · 赛后复盘课",
      price: 88,
      theme: "ad-purple",
    },
  ];
  const ad = featured[current];
  return (
    <section className="ad-zone">
      <div className="ad-zone-head">
        <span>
          <Megaphone size={14} /> 商家精选推广
        </span>
        <small>广告内容由入驻店铺提供</small>
      </div>
      <div className="ad-layout">
        <button
          className={"feature-ad " + ad.theme}
          onClick={() => openStore(ad.store)}
        >
          <div className="ad-copy">
            <span className="ad-mark">广告</span>
            <small>{ad.label}</small>
            <h2>{ad.title}</h2>
            <p>{ad.desc}</p>
            <div className="ad-cta">
              <b>
                ¥{ad.price}
                <i> 起</i>
              </b>
              <span>
                查看项目 <ChevronRight size={16} />
              </span>
            </div>
          </div>
          <div className="ad-visual">
            <div className={"store-avatar large " + ad.store.theme}>
              {ad.store.avatar}
            </div>
            <strong>{ad.store.name}</strong>
            <span>
              <Star size={13} fill="#f4ad2a" color="#f4ad2a" />{" "}
              {ad.store.rating} · {ad.store.online} 人在线
            </span>
          </div>
        </button>
        <div className="side-ads">
          <button
            className="mini-ad mini-dark"
            onClick={() => openStore(stores[1])}
          >
            <span className="ad-mark">推广</span>
            <div>
              <small>夜猫电竞俱乐部</small>
              <strong>
                无畏契约
                <br />
                段位突破专场
              </strong>
              <em>¥68 / 小时</em>
            </div>
            <ChevronRight size={17} />
          </button>
          <button
            className="mini-ad mini-light"
            onClick={() => openStore(stores[2])}
          >
            <span className="ad-mark">推广</span>
            <div>
              <small>峡谷通行证</small>
              <strong>
                赛后复盘课
                <br />
                预约开放中
              </strong>
              <em>新客 8 折</em>
            </div>
            <ChevronRight size={17} />
          </button>
        </div>
      </div>
      <div className="ad-dots">
        {featured.map((x, i) => (
          <button
            className={current === i ? "active" : ""}
            onClick={() => setCurrent(i)}
            aria-label={`查看广告 ${i + 1}`}
            key={x.label}
          ></button>
        ))}
      </div>
    </section>
  );
}
function FeaturedAds2({ openStore }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="ad-shell">
      <FeaturedAds openStore={openStore} />
      <button className="ad-manage" onClick={() => setOpen(true)}>
        <Megaphone size={14} /> 商家投放广告
      </button>
      {open && <CampaignPanel close={() => setOpen(false)} />}
    </div>
  );
}

function CampaignPanel({ close }) {
  const [type, setType] = useState("首页焦点广告");
  const [target, setTarget] = useState("王者荣耀 · 赛季冲刺");
  const [budget, setBudget] = useState("500");
  const [created, setCreated] = useState(false);
  return (
    <div className="overlay campaign-overlay" onClick={close}>
      <div className="campaign-panel" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={close}>
          <X />
        </button>
        <div className="campaign-head">
          <div className="campaign-icon">
            <Megaphone />
          </div>
          <div>
            <span className="kicker">MERCHANT PROMOTION</span>
            <h2>店铺推广中心</h2>
            <p>为店铺或特殊项目购买首页展示位</p>
          </div>
        </div>
        <div className="campaign-stats">
          <div>
            <span>今日曝光</span>
            <b>18,426</b>
            <small className="up">↑ 16.8%</small>
          </div>
          <div>
            <span>广告点击</span>
            <b>1,284</b>
            <small>点击率 6.97%</small>
          </div>
          <div>
            <span>推广成交</span>
            <b>86</b>
            <small>转化率 6.70%</small>
          </div>
          <div>
            <span>今日消耗</span>
            <b>¥328</b>
            <small>预算剩余 ¥172</small>
          </div>
        </div>
        <div className="campaign-body">
          <div className="campaign-form">
            <div className="field-label">选择广告位置</div>
            <div className="ad-type-grid">
              {[
                ["首页焦点广告", "首屏大图展示"],
                ["顶部项目推荐", "推广特殊服务"],
                ["精选店铺推荐", "店铺列表置顶"],
              ].map(([name, desc]) => (
                <button
                  className={type === name ? "selected" : ""}
                  onClick={() => setType(name)}
                  key={name}
                >
                  <span>{name}</span>
                  <small>{desc}</small>
                  <Check size={15} />
                </button>
              ))}
            </div>
            <label>
              <span>推广对象</span>
              <select
                value={target}
                onChange={(e) => setTarget(e.target.value)}
              >
                <option>王者荣耀 · 赛季冲刺</option>
                <option>英雄联盟 · 钻石晋级赛</option>
                <option>星河电竞陪玩馆</option>
              </select>
            </label>
            <div className="campaign-fields">
              <label>
                <span>每日预算</span>
                <div className="money-input">
                  ¥{" "}
                  <input
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    type="number"
                  />
                </div>
              </label>
              <label>
                <span>投放周期</span>
                <select>
                  <option>连续投放 7 天</option>
                  <option>连续投放 14 天</option>
                  <option>连续投放 30 天</option>
                </select>
              </label>
            </div>
            <div className="campaign-check">
              <ShieldCheck size={14} /> 所有广告内容需通过平台审核，预计 1
              个工作日内完成。
            </div>
            <button
              className="campaign-submit"
              onClick={() => setCreated(true)}
            >
              {created ? (
                <>
                  <Check size={16} /> 广告计划已提交
                </>
              ) : (
                <>提交广告计划 · ¥{budget}/天</>
              )}
            </button>
          </div>
          <aside className="campaign-preview">
            <span>广告预览</span>
            <div className="preview-ad">
              <div className="preview-mark">广告</div>
              <small>星河电竞陪玩馆</small>
              <strong>{target}</strong>
              <p>专业陪玩团队，平台认证保障</p>
              <b>¥38 起</b>
              <button>查看项目</button>
            </div>
            <div className="estimate">
              <div>
                <span>预计每日曝光</span>
                <b>20,000 - 32,000</b>
              </div>
              <div>
                <span>预计每日点击</span>
                <b>1,200 - 2,100</b>
              </div>
              <small>实际效果会根据广告质量和用户兴趣变化</small>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Modal({ type, cart, close, onRole }) {
  return (
    <div className="overlay" onClick={close}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={close}>
          <X />
        </button>
        {type === "join" ? (
          <>
            <div className="modal-icon">
              <Store />
            </div>
            <h2>申请店铺入驻</h2>
            <p>提交资料后，平台将在 1-3 个工作日内完成审核</p>
            <input placeholder="店铺名称" />
            <input placeholder="联系人姓名" />
            <input placeholder="联系电话" />
            <button className="primary" onClick={close}>
              <Check size={18} /> 提交申请
            </button>
          </>
        ) : type === "orders" ? (
          <>
            <div className="modal-icon">
              <ShoppingBag />
            </div>
            <h2>我的预约</h2>
            {cart.length ? (
              <>
                {cart.map((x, i) => (
                  <div className="order" key={i}>
                    <div>
                      <strong>{x.name}</strong>
                      <small>{x.shop}</small>
                    </div>
                    <b>¥{x.price}</b>
                  </div>
                ))}
                <button className="primary" onClick={close}>
                  去结算
                </button>
              </>
            ) : (
              <div className="empty">还没有预约服务，去挑选一位陪玩吧</div>
            )}
          </>
        ) : (
          <>
            <div className="modal-icon">
              <MessageCircle />
            </div>
            <h2>选择工作视角</h2>
            <p>正式版登录后会根据账号权限自动进入对应工作台</p>
            <div className="role-entry-grid">
              <button onClick={close}>
                <ShoppingBag size={17} />
                <span>
                  <strong>需求者</strong>
                  <small>发现服务、支付和售后</small>
                </span>
              </button>
              <button onClick={() => onRole("owner")}>
                <Store size={17} />
                <span>
                  <strong>店铺老板</strong>
                  <small>经营、订单和客服授权</small>
                </span>
              </button>
              <button onClick={() => onRole("player")}>
                <Gamepad2 size={17} />
                <span>
                  <strong>陪玩师</strong>
                  <small>接单、履约和收入</small>
                </span>
              </button>
              <button onClick={() => onRole("admin")}>
                <ShieldCheck size={17} />
                <span>
                  <strong>平台仲裁</strong>
                  <small>纠纷、退款和风控</small>
                </span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
function StoreModal({ store, add, close }) {
  const [filter, setFilter] = useState("全部项目");
  const games = ["全部项目", ...new Set(store.projects.map((p) => p.game))];
  const projects =
    filter === "全部项目"
      ? store.projects
      : store.projects.filter((p) => p.game === filter);
  return (
    <div className="overlay store-overlay" onClick={close}>
      <div className="store-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={close}>
          <X />
        </button>
        <div className="store-hero">
          <div className={"store-avatar large " + store.theme}>
            {store.avatar}
          </div>
          <div className="store-hero-copy">
            <div className="store-name">
              <h2>{store.name}</h2>
              <ShieldCheck size={17} />
              <span>官方认证</span>
            </div>
            <p>{store.handle}</p>
            <div className="store-location">
              <MapPin size={14} /> {store.city} <span>·</span>{" "}
              <Clock3 size={14} /> 平均 3 分钟响应
            </div>
          </div>
          <button className="follow-btn">♡ 关注店铺</button>
        </div>
        <div className="store-stats">
          <div>
            <b>{store.rating}</b>
            <span>
              <Star size={13} fill="#f4ad2a" color="#f4ad2a" /> 店铺评分
            </span>
          </div>
          <div>
            <b>{store.orders}</b>
            <span>累计服务</span>
          </div>
          <div>
            <b>{store.online}</b>
            <span>当前在线</span>
          </div>
          <div className="store-desc">{store.desc}</div>
        </div>
        <div className="store-tabs">
          {games.map((g) => (
            <button
              className={filter === g ? "active" : ""}
              onClick={() => setFilter(g)}
              key={g}
            >
              {g}
            </button>
          ))}
        </div>
        <div className="project-list">
          {projects.map((p, i) => (
            <div className="project" key={p.title}>
              <div className="project-icon" style={{ background: p.color }}>
                {p.icon}
              </div>
              <div className="project-copy">
                <div className="project-title">
                  <h3>{p.title}</h3>
                  <span>{p.tag}</span>
                </div>
                <p>{p.mode}</p>
                <div className="project-online">
                  <span className="online-dot"></span>
                  {p.online} 位陪玩在线 · 可立即接单
                </div>
              </div>
              <div className="project-price">
                <b>¥{p.price}</b>
                <small>/{p.unit}</small>
                <button
                  onClick={() => add({ ...p, name: p.title, shop: store.name })}
                >
                  预约项目
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StoreModal2({ store, add, close }) {
  const [filter, setFilter] = useState("全部项目");
  const [chatOpen, setChatOpen] = useState(false);
  const games = ["全部项目", ...new Set(store.projects.map((p) => p.game))];
  const projects =
    filter === "全部项目"
      ? store.projects
      : store.projects.filter((p) => p.game === filter);
  return (
    <div className="overlay store-overlay" onClick={close}>
      <div className="store-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={close}>
          <X />
        </button>
        <div className="store-hero">
          <div className={"store-avatar large " + store.theme}>
            {store.avatar}
          </div>
          <div className="store-hero-copy">
            <div className="store-name">
              <h2>{store.name}</h2>
              <ShieldCheck size={17} />
              <span>官方认证</span>
            </div>
            <p>{store.handle}</p>
            <div className="store-location">
              <MapPin size={14} /> {store.city} <span>·</span>{" "}
              <Clock3 size={14} /> 平均 {store.support?.response || "5 分钟"}
              响应
            </div>
          </div>
          <div className="store-actions">
            <button className="follow-btn">♡ 关注店铺</button>
            {store.support?.enabled ? (
              <button className="contact-btn" onClick={() => setChatOpen(true)}>
                <Headphones size={15} /> 联系客服
              </button>
            ) : (
              <span className="support-off">店铺未开启客服</span>
            )}
          </div>
        </div>
        <div className="store-stats">
          <div>
            <b>{store.rating}</b>
            <span>
              <Star size={13} fill="#f4ad2a" color="#f4ad2a" /> 店铺评分
            </span>
          </div>
          <div>
            <b>{store.orders}</b>
            <span>累计服务</span>
          </div>
          <div>
            <b>{store.online}</b>
            <span>当前在线</span>
          </div>
          <div className="store-desc">{store.desc}</div>
        </div>
        <div className="store-tabs">
          {games.map((g) => (
            <button
              className={filter === g ? "active" : ""}
              onClick={() => setFilter(g)}
              key={g}
            >
              {g}
            </button>
          ))}
        </div>
        <div className="project-list">
          {projects.map((p) => (
            <div className="project" key={p.title}>
              <div className="project-icon" style={{ background: p.color }}>
                {p.icon}
              </div>
              <div className="project-copy">
                <div className="project-title">
                  <h3>{p.title}</h3>
                  <span>{p.tag}</span>
                </div>
                <p>{p.mode}</p>
                <div className="project-online">
                  <span className="online-dot"></span>
                  {p.online} 位陪玩在线 · 可立即接单
                </div>
              </div>
              <div className="project-price">
                <b>¥{p.price}</b>
                <small>/{p.unit}</small>
                <button
                  onClick={() => add({ ...p, name: p.title, shop: store.name })}
                >
                  预约项目
                </button>
              </div>
            </div>
          ))}
        </div>
        {chatOpen && (
          <CustomerService store={store} close={() => setChatOpen(false)} />
        )}
      </div>
    </div>
  );
}

function useVoiceRecorder(onReady) {
  const mediaRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const secondsRef = useRef(0);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState("");
  const stop = () => {
    if (mediaRef.current?.state === "recording") mediaRef.current.stop();
    clearInterval(timerRef.current);
    setRecording(false);
  };
  const start = async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const media = new MediaRecorder(stream);
      mediaRef.current = media;
      chunksRef.current = [];
      secondsRef.current = 0;
      setSeconds(0);
      media.ondataavailable = (e) =>
        e.data.size && chunksRef.current.push(e.data);
      media.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: media.mimeType || "audio/webm",
        });
        const url = URL.createObjectURL(blob);
        onReady(url, Math.max(1, secondsRef.current), blob);
        streamRef.current?.getTracks().forEach((t) => t.stop());
      };
      media.start();
      setRecording(true);
      timerRef.current = setInterval(() => {
        secondsRef.current += 1;
        setSeconds(secondsRef.current);
      }, 1000);
    } catch (e) {
      setError("无法使用麦克风，请在浏览器中允许录音权限。");
    }
  };
  useEffect(
    () => () => {
      clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    },
    [],
  );
  return { recording, seconds, error, start, stop };
}

function VoiceMessage({ message }) {
  const [playing, setPlaying] = useState(false);
  const playSpeech = () => {
    if (message.url) return;
    const utterance = new SpeechSynthesisUtterance(
      message.transcript || "语音消息",
    );
    utterance.lang = "zh-CN";
    utterance.onend = () => setPlaying(false);
    window.speechSynthesis?.speak(utterance);
    setPlaying(true);
  };
  return (
    <div className={"voice-message " + message.from}>
      {message.url ? (
        <audio controls src={message.url} />
      ) : (
        <button onClick={playSpeech}>
          {playing ? <Pause size={15} /> : <Volume2 size={15} />}
          <span className="voice-bars">
            {[8, 14, 6, 17, 10, 15, 7, 12].map((h, i) => (
              <i style={{ height: h }} key={i}></i>
            ))}
          </span>
          <small>{message.duration || 6}s</small>
        </button>
      )}
    </div>
  );
}

function VoiceCall({ store, hangup }) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);
  const time = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  return (
    <div className="voice-call">
      <div className={"store-avatar large " + store.theme}>{store.avatar}</div>
      <strong>{store.support?.agent || "店铺客服"}</strong>
      <span>{seconds ? "语音通话中" : "正在连接店铺客服..."}</span>
      <b>{time}</b>
      <div className="call-tools">
        <button>
          <Mic size={18} />
          <small>麦克风</small>
        </button>
        <button>
          <Volume2 size={18} />
          <small>免提</small>
        </button>
        <button className="hangup" onClick={hangup}>
          <PhoneOff size={19} />
          <small>挂断</small>
        </button>
      </div>
      <p>
        <ShieldCheck size={12} /> 本次通话由商家授权客服提供
      </p>
    </div>
  );
}

const mapSupportMessage = (message) => ({
  id: message.id,
  from: message.senderRole === "buyer" ? "user" : "agent",
  type: message.type === "audio" ? "voice" : undefined,
  text: message.type === "text" ? message.content : undefined,
  url: message.type === "audio" ? message.content : undefined,
  duration: message.duration,
});

function CustomerService({ store, close }) {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [calling, setCalling] = useState(false);
  const [connection, setConnection] = useState("connecting");
  const [syncError, setSyncError] = useState("");
  const conversationRef = useRef(null);
  const socketRef = useRef(null);

  const appendMessage = (message) => {
    const mapped = message.senderRole ? mapSupportMessage(message) : message;
    setMessages((list) =>
      mapped.id && list.some((item) => item.id === mapped.id)
        ? list
        : [...list, mapped],
    );
  };

  useEffect(() => {
    let disposed = false;
    const connect = async () => {
      try {
        const { conversation } = await openSupportConversation(store.id);
        const { messages: saved } = await listSupportMessages(conversation.id);
        if (disposed) return;
        conversationRef.current = conversation.id;
        setMessages(saved.map(mapSupportMessage));
        socketRef.current = await connectSupportConversation(
          conversation.id,
          (message) => !disposed && appendMessage(message),
          (status) => !disposed && setConnection(status),
        );
      } catch {
        if (disposed) return;
        setConnection("offline");
        setSyncError("当前为本地消息模式，服务恢复后可继续同步。");
        setMessages([
          {
            from: "agent",
            text: `你好，我是${store.support?.agent || "店铺客服"}，有什么可以帮你？`,
          },
        ]);
      }
    };
    connect();
    return () => {
      disposed = true;
      socketRef.current?.close();
    };
  }, [store.id]);

  const recorder = useVoiceRecorder(async (url, duration, blob) => {
    if (!conversationRef.current) {
      appendMessage({ from: "user", type: "voice", url, duration });
      return;
    }
    try {
      const uploaded = await uploadVoice(blob);
      const { message } = await sendSupportMessage(conversationRef.current, {
        type: "audio",
        content: uploaded.url,
        duration,
      });
      appendMessage(message);
    } catch {
      appendMessage({ from: "user", type: "voice", url, duration });
      setSyncError("语音暂未上传，已保留在本次会话中。");
    }
  });

  const send = async () => {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    if (!conversationRef.current) {
      appendMessage({ from: "user", text });
      return;
    }
    try {
      const { message } = await sendSupportMessage(conversationRef.current, {
        type: "text",
        content: text,
      });
      appendMessage(message);
    } catch {
      appendMessage({ from: "user", text });
      setSyncError("消息暂未同步到服务端。");
    }
  };
  return (
    <div className="chat-window voice-enabled">
      <div className="chat-head">
        <div>
          <strong>
            <span className="online-dot"></span>
            {store.support?.agent || "店铺客服"}
          </strong>
          <small>
            由商家授权 · {connection === "online" ? "实时在线" : "连接中"}
          </small>
        </div>
        <div className="chat-head-actions">
          <button onClick={() => setCalling(true)} title="发起语音通话">
            <Phone size={16} />
          </button>
          <button onClick={close}>
            <X size={16} />
          </button>
        </div>
      </div>
      <div className="chat-body">
        {messages.map((m, i) =>
          m.type === "voice" ? (
            <VoiceMessage message={m} key={m.id || i} />
          ) : (
            <div className={"chat-bubble " + m.from} key={m.id || i}>
              {m.text}
            </div>
          ),
        )}
        {connection === "connecting" && (
          <div className="chat-sync-status">正在恢复历史会话...</div>
        )}
        {syncError && <div className="chat-sync-status error">{syncError}</div>}
        {recorder.recording && (
          <div className="recording-status">
            <span></span>正在录音 {recorder.seconds}s
          </div>
        )}
        {recorder.error && <div className="record-error">{recorder.error}</div>}
      </div>
      <div className="chat-input voice-input">
        <button
          className={"record-btn " + (recorder.recording ? "recording" : "")}
          onClick={recorder.recording ? recorder.stop : recorder.start}
          title={recorder.recording ? "停止并发送" : "录制语音"}
        >
          {recorder.recording ? <Power size={16} /> : <Mic size={17} />}
        </button>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={
            recorder.recording
              ? "正在录音，点击左侧停止"
              : "输入消息或点击麦克风录音"
          }
        />
        <button onClick={send}>
          <Send size={16} />
        </button>
      </div>
      {calling && <VoiceCall store={store} hangup={() => setCalling(false)} />}
    </div>
  );
}

const mapMerchantMessage = (message) => ({
  id: message.id,
  from: message.senderRole === "merchant" ? "user" : "agent",
  type: message.type === "audio" ? "voice" : undefined,
  text: message.type === "text" ? message.content : undefined,
  url: message.type === "audio" ? message.content : undefined,
  duration: message.duration,
});

function MerchantSupportInbox() {
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [connection, setConnection] = useState("connecting");
  const [error, setError] = useState("");
  const socketRef = useRef(null);

  const append = (message) => {
    const mapped = message.senderRole ? mapMerchantMessage(message) : message;
    setMessages((list) =>
      mapped.id && list.some((item) => item.id === mapped.id)
        ? list
        : [...list, mapped],
    );
  };

  useEffect(() => {
    listMerchantConversations()
      .then(({ conversations: items }) => {
        setConversations(items);
        setSelected(items[0] || null);
      })
      .catch(() => setError("无法加载客服会话，请检查店铺授权状态。"));
  }, []);

  useEffect(() => {
    if (!selected) return;
    let disposed = false;
    setConnection("connecting");
    setError("");
    listMerchantMessages(selected.id)
      .then(({ messages: saved }) => {
        if (disposed) return;
        setMessages(saved.map(mapMerchantMessage));
        return connectMerchantConversation(
          selected.id,
          (message) => !disposed && append(message),
          (status) => !disposed && setConnection(status),
        );
      })
      .then((socket) => {
        if (disposed) socket?.close();
        else socketRef.current = socket;
      })
      .catch(() => {
        if (!disposed) {
          setConnection("offline");
          setError("会话连接失败，请稍后重试。");
        }
      });
    return () => {
      disposed = true;
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [selected?.id]);

  const send = async () => {
    const text = draft.trim();
    if (!text || !selected) return;
    setDraft("");
    try {
      const { message } = await sendMerchantSupportMessage(selected.id, {
        type: "text",
        content: text,
      });
      append(message);
    } catch {
      setDraft(text);
      setError("消息发送失败，内容已保留。");
    }
  };

  const recorder = useVoiceRecorder(async (url, duration, blob) => {
    if (!selected) return;
    try {
      const uploaded = await uploadVoice(blob, "merchant");
      const { message } = await sendMerchantSupportMessage(selected.id, {
        type: "audio",
        content: uploaded.url,
        duration,
      });
      append(message);
    } catch {
      append({ from: "user", type: "voice", url, duration });
      setError("录音未能同步，已暂存在当前页面。");
    }
  });

  return (
    <div className="support-workbench">
      <aside className="support-conversations">
        <div className="support-list-head">
          <div>
            <strong>买家会话</strong>
            <small>{conversations.length} 个进行中</small>
          </div>
          <span className="support-live">
            <span className="online-dot"></span>接待中
          </span>
        </div>
        <div className="support-search">
          <Search size={14} />
          <input placeholder="搜索买家或消息" />
        </div>
        <div className="support-conversation-list">
          {conversations.map((conversation) => (
            <button
              className={selected?.id === conversation.id ? "active" : ""}
              onClick={() => setSelected(conversation)}
              key={conversation.id}
            >
              <span className="buyer-avatar">
                {conversation.buyer.name.charAt(0)}
              </span>
              <span>
                <strong>{conversation.buyer.name}</strong>
                <small>
                  {conversation.lastMessage?.type === "audio"
                    ? "[语音消息]"
                    : conversation.lastMessage?.content || "新咨询"}
                </small>
              </span>
              <em>{conversation.messageCount}</em>
            </button>
          ))}
          {!conversations.length && !error && (
            <div className="support-empty-list">
              <MessageCircle size={22} />
              <span>还没有买家咨询</span>
              <small>新消息会实时出现在这里</small>
            </div>
          )}
        </div>
      </aside>
      <section className="support-thread">
        {selected ? (
          <>
            <div className="support-thread-head">
              <div className="buyer-avatar">
                {selected.buyer.name.charAt(0)}
              </div>
              <div>
                <strong>{selected.buyer.name}</strong>
                <small>
                  {connection === "online" ? "实时连接" : "正在连接"} · 买家咨询
                </small>
              </div>
              <span>
                <ShieldCheck size={13} /> 已授权客服会话
              </span>
            </div>
            <div className="support-thread-body">
              <div className="support-time">今天</div>
              {messages.map((message, index) =>
                message.type === "voice" ? (
                  <VoiceMessage message={message} key={message.id || index} />
                ) : (
                  <div
                    className={`merchant-bubble ${message.from}`}
                    key={message.id || index}
                  >
                    {message.text}
                  </div>
                ),
              )}
              {recorder.recording && (
                <div className="recording-status">
                  <span></span>正在录音 {recorder.seconds}s
                </div>
              )}
              {error && <div className="support-error">{error}</div>}
            </div>
            <div className="support-reply">
              <button
                className={recorder.recording ? "recording" : ""}
                onClick={recorder.recording ? recorder.stop : recorder.start}
                title={recorder.recording ? "停止并发送" : "录制语音"}
              >
                {recorder.recording ? <Power size={16} /> : <Mic size={17} />}
              </button>
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && send()}
                placeholder="回复买家，或点击麦克风发送语音"
              />
              <button className="send" onClick={send}>
                <Send size={16} /> 发送
              </button>
            </div>
          </>
        ) : (
          <div className="support-thread-empty">
            <Headphones size={35} />
            <strong>客服工作台</strong>
            <span>选择左侧会话后开始接待买家</span>
          </div>
        )}
      </section>
    </div>
  );
}

function BuyerOrderCenter({ close }) {
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [reason, setReason] = useState("服务与描述不符");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const refresh = () =>
    listOrders()
      .then(({ orders: items }) => setOrders(items))
      .catch(() => setError("订单暂时无法加载。"))
      .finally(() => setLoading(false));

  useEffect(() => {
    refresh();
  }, []);

  const run = (action) => {
    setError("");
    action()
      .then(refresh)
      .catch((failure) => setError(failure.message));
  };

  const submitDispute = () => {
    if (!selected) return;
    run(() =>
      createDispute(selected.id, { reason, description }).then(() => {
        setSelected(null);
        setDescription("");
      }),
    );
  };

  const labels = {
    pending: "待确认",
    pending_payment: "待支付",
    paid_escrow: "平台担保中",
    accepted: "陪玩师已接单",
    in_progress: "服务中",
    completed: "已完成",
    disputed: "纠纷处理中",
    refunded: "已退款",
    cancelled: "已取消",
  };

  return (
    <div className="overlay buyer-orders-overlay" onClick={close}>
      <div
        className="buyer-order-center"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="close" onClick={close}>
          <X />
        </button>
        <div className="buyer-orders-head">
          <div>
            <span className="kicker">ORDER & ESCROW</span>
            <h2>我的订单</h2>
            <p>支付资金由平台担保，完成服务后再进入结算</p>
          </div>
          <div className="escrow-badge">
            <ShieldCheck size={18} />
            <span>
              <strong>平台担保交易</strong>
              <small>支付、退款和纠纷全程留痕</small>
            </span>
          </div>
        </div>
        <div className="order-stepper">
          <span className="done">1 预约项目</span>
          <i></i>
          <span>2 担保支付</span>
          <i></i>
          <span>3 陪玩师履约</span>
          <i></i>
          <span>4 确认与结算</span>
        </div>
        {error && <div className="buyer-order-error">{error}</div>}
        <div className="buyer-order-list">
          {orders.map((order) => (
            <article className="buyer-order-item" key={order.id}>
              <div className="buyer-order-top">
                <span>{order.id}</span>
                <b className={`order-status ${order.status}`}>
                  {labels[order.status] || order.status}
                </b>
              </div>
              <div className="buyer-order-content">
                <div className="order-game-icon">
                  <Gamepad2 size={20} />
                </div>
                <div>
                  <strong>{order.serviceName}</strong>
                  <small>
                    <Store size={12} />
                    {order.storeName}
                  </small>
                  <em>{new Date(order.createdAt).toLocaleString("zh-CN")}</em>
                </div>
                <div className="buyer-order-price">
                  <small>订单金额</small>
                  <b>¥{order.amount}</b>
                </div>
              </div>
              <div className="buyer-order-actions">
                {order.status === "pending_payment" && (
                  <>
                    <button
                      className="secondary"
                      onClick={() => run(() => cancelOrder(order.id))}
                    >
                      取消订单
                    </button>
                    <button
                      className="pay"
                      onClick={() => run(() => payOrder(order.id))}
                    >
                      <ShieldCheck size={14} /> 担保支付
                    </button>
                  </>
                )}
                {[
                  "paid_escrow",
                  "accepted",
                  "in_progress",
                  "completed",
                ].includes(order.status) && (
                  <button
                    className="secondary"
                    onClick={() => setSelected(order)}
                  >
                    申请售后 / 纠纷
                  </button>
                )}
                {order.status === "paid_escrow" && (
                  <span className="fund-note">
                    ¥{order.amount} 已冻结在平台担保账户
                  </span>
                )}
                {order.status === "disputed" && (
                  <span className="fund-note warn">
                    平台仲裁员正在处理，请保留服务证据
                  </span>
                )}
                {order.status === "refunded" && (
                  <span className="fund-note success">退款已原路返回</span>
                )}
              </div>
            </article>
          ))}
          {!orders.length && (
            <div className="buyer-orders-empty">
              <ShoppingBag size={30} />
              <strong>{loading ? "正在加载订单..." : "还没有订单"}</strong>
              <span>预约服务后可以在这里完成支付与售后</span>
            </div>
          )}
        </div>
        {selected && (
          <div className="dispute-sheet">
            <div className="dispute-sheet-head">
              <div>
                <strong>申请平台介入</strong>
                <small>
                  {selected.serviceName} · {selected.id}
                </small>
              </div>
              <button onClick={() => setSelected(null)}>
                <X size={16} />
              </button>
            </div>
            <label>
              <span>纠纷原因</span>
              <select
                value={reason}
                onChange={(event) => setReason(event.target.value)}
              >
                <option>服务与描述不符</option>
                <option>陪玩师未按时履约</option>
                <option>服务质量问题</option>
                <option>骚扰或不当内容</option>
                <option>其他问题</option>
              </select>
            </label>
            <label>
              <span>问题说明</span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="描述发生时间、经过和希望的处理结果"
              />
            </label>
            <div className="dispute-tip">
              <ShieldCheck size={14} />{" "}
              提交后订单资金将继续冻结，平台会结合聊天与经授权证据处理。
            </div>
            <button className="dispute-submit" onClick={submitDispute}>
              提交平台仲裁
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function AdminGovernanceCenter({ close }) {
  const [tab, setTab] = useState("纠纷仲裁");
  const [disputes, setDisputes] = useState([]);
  const [applications, setApplications] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [ads, setAds] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");

  const refresh = () =>
    Promise.all([
      listDisputes(),
      listStoreApplications(),
      listPlayerVerifications(),
      listAdminAds(),
      listLedger(),
      listAuditLogs(),
    ])
      .then(([d, s, v, a, l, audit]) => {
        setDisputes(d.disputes);
        setApplications(s.applications);
        setVerifications(v.verifications);
        setAds(a.ads);
        setLedger(l.ledger);
        setLogs(audit.logs);
      })
      .catch((failure) => setError(failure.message));

  useEffect(() => {
    refresh();
  }, []);

  const act = (request) =>
    request.then(refresh).catch((failure) => setError(failure.message));

  const tabs = [
    ["纠纷仲裁", <ShieldCheck size={16} />],
    ["入驻审核", <Store size={16} />],
    ["陪玩师认证", <Award size={16} />],
    ["广告审核", <Megaphone size={16} />],
    ["资金对账", <TrendingUp size={16} />],
    ["审计日志", <Clock3 size={16} />],
  ];

  return (
    <div className="overlay admin-overlay" onClick={close}>
      <div
        className="admin-center governance"
        onClick={(event) => event.stopPropagation()}
      >
        <aside className="admin-side">
          <div className="admin-brand">
            <span className="brand-mark">P</span>
            <strong>平台治理中心</strong>
          </div>
          <nav>
            {tabs.map(([label, icon]) => (
              <button
                className={tab === label ? "active" : ""}
                onClick={() => setTab(label)}
                key={label}
              >
                {icon}
                {label}
              </button>
            ))}
          </nav>
          <button className="admin-close" onClick={close}>
            <X size={15} /> 返回市场
          </button>
        </aside>
        <section className="admin-main">
          <div className="admin-head">
            <div>
              <span className="kicker">PLATFORM GOVERNANCE</span>
              <h2>{tab}</h2>
            </div>
            <span>
              <ShieldCheck size={14} /> 所有操作写入审计日志
            </span>
          </div>
          <div className="admin-content">
            {error && <div className="admin-error">{error}</div>}
            {tab === "纠纷仲裁" && (
              <>
                <div className="admin-kpis">
                  <div>
                    <span>待处理纠纷</span>
                    <b>
                      {disputes.filter((item) => item.status === "open").length}
                    </b>
                  </div>
                  <div>
                    <span>今日已处理</span>
                    <b>
                      {
                        disputes.filter((item) => item.status === "resolved")
                          .length
                      }
                    </b>
                  </div>
                  <div>
                    <span>处理时效目标</span>
                    <b>24h</b>
                  </div>
                </div>
                <GovernanceList
                  headers={["纠纷编号", "订单 / 原因", "状态", "处理操作"]}
                >
                  {disputes.map((item) => (
                    <div className="governance-row dispute" key={item.id}>
                      <span>
                        <strong>{item.id}</strong>
                        <small>
                          {new Date(item.createdAt).toLocaleString("zh-CN")}
                        </small>
                      </span>
                      <span>
                        <strong>{item.orderId}</strong>
                        <small>
                          {item.reason} · {item.description || "未补充说明"}
                        </small>
                      </span>
                      <em className={item.status}>
                        {item.status === "open" ? "待处理" : "已结案"}
                      </em>
                      <div>
                        {item.status === "open" ? (
                          <>
                            <button
                              onClick={() =>
                                act(
                                  resolveDispute(item.id, {
                                    resolution: "reject",
                                  }),
                                )
                              }
                            >
                              驳回
                            </button>
                            <button
                              onClick={() =>
                                act(
                                  resolveDispute(item.id, {
                                    resolution: "refund_partial",
                                    amount: 20,
                                  }),
                                )
                              }
                            >
                              部分退款
                            </button>
                            <button
                              className="danger"
                              onClick={() =>
                                act(
                                  resolveDispute(item.id, {
                                    resolution: "refund_full",
                                  }),
                                )
                              }
                            >
                              全额退款
                            </button>
                          </>
                        ) : (
                          <span>
                            {item.refundAmount
                              ? `退款 ¥${item.refundAmount}`
                              : "维持订单"}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </GovernanceList>
              </>
            )}
            {tab === "入驻审核" && (
              <GovernanceList
                headers={["申请店铺", "联系人", "状态", "审核操作"]}
              >
                {applications.map((item) => (
                  <div className="governance-row" key={item.id}>
                    <span>
                      <strong>{item.name}</strong>
                      <small>{item.id}</small>
                    </span>
                    <span>
                      <strong>{item.contact}</strong>
                      <small>{item.phone}</small>
                    </span>
                    <em className={item.status}>
                      {item.status === "pending"
                        ? "待审核"
                        : item.status === "approved"
                          ? "已通过"
                          : "已拒绝"}
                    </em>
                    <div>
                      {item.status === "pending" ? (
                        <>
                          <button
                            onClick={() =>
                              act(reviewStoreApplication(item.id, "reject"))
                            }
                          >
                            拒绝
                          </button>
                          <button
                            className="approve"
                            onClick={() =>
                              act(reviewStoreApplication(item.id, "approve"))
                            }
                          >
                            通过
                          </button>
                        </>
                      ) : (
                        <span>审核完成</span>
                      )}
                    </div>
                  </div>
                ))}
              </GovernanceList>
            )}
            {tab === "陪玩师认证" && (
              <GovernanceList
                headers={["认证申请", "游戏 / 证明", "状态", "审核操作"]}
              >
                {verifications.map((item) => (
                  <div className="governance-row" key={item.id}>
                    <span>
                      <strong>{item.realName}</strong>
                      <small>身份证后四位 {item.idLast4}</small>
                    </span>
                    <span>
                      <strong>{item.game}</strong>
                      <small>{item.rankProof}</small>
                    </span>
                    <em className={item.status}>
                      {item.status === "pending"
                        ? "待复核"
                        : item.status === "approved"
                          ? "已认证"
                          : "未通过"}
                    </em>
                    <div>
                      {item.status === "pending" ? (
                        <>
                          <button
                            onClick={() =>
                              act(reviewPlayerVerification(item.id, "reject"))
                            }
                          >
                            驳回
                          </button>
                          <button
                            className="approve"
                            onClick={() =>
                              act(reviewPlayerVerification(item.id, "approve"))
                            }
                          >
                            认证通过
                          </button>
                        </>
                      ) : (
                        <button
                          className="danger"
                          onClick={() =>
                            act(
                              createViolation({
                                targetType: "player",
                                targetId: item.playerId,
                                reason: "认证后违规复核",
                                penalty: "suspend",
                              }),
                            )
                          }
                        >
                          暂停接单
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </GovernanceList>
            )}
            {tab === "广告审核" && (
              <GovernanceList
                headers={["广告编号", "投放位置 / 预算", "状态", "审核操作"]}
              >
                {ads.map((item) => (
                  <div className="governance-row" key={item.id}>
                    <span>
                      <strong>{item.id}</strong>
                      <small>
                        {item.targetType} · {item.targetId}
                      </small>
                    </span>
                    <span>
                      <strong>{item.placement}</strong>
                      <small>
                        ¥{item.dailyBudget}/天 · {item.impressions || 0} 曝光
                      </small>
                    </span>
                    <em className={item.status}>
                      {item.status === "pending"
                        ? "待审核"
                        : item.status === "active"
                          ? "投放中"
                          : "已拒绝"}
                    </em>
                    <div>
                      {["pending", "active"].includes(item.status) ? (
                        <>
                          <button
                            onClick={() =>
                              act(reviewAdvertisement(item.id, "reject"))
                            }
                          >
                            停止/拒绝
                          </button>
                          {item.status === "pending" && (
                            <button
                              className="approve"
                              onClick={() =>
                                act(reviewAdvertisement(item.id, "approve"))
                              }
                            >
                              批准投放
                            </button>
                          )}
                        </>
                      ) : (
                        <span>不可投放</span>
                      )}
                    </div>
                  </div>
                ))}
              </GovernanceList>
            )}
            {tab === "资金对账" && (
              <>
                <div className="admin-kpis">
                  <div>
                    <span>担保收款</span>
                    <b>
                      ¥
                      {ledger
                        .filter((item) => item.type === "escrow_charge")
                        .reduce((sum, item) => sum + item.amount, 0)}
                    </b>
                  </div>
                  <div>
                    <span>累计退款</span>
                    <b>
                      ¥
                      {ledger
                        .filter((item) => item.type.includes("refund"))
                        .reduce((sum, item) => sum + item.amount, 0)}
                    </b>
                  </div>
                  <div>
                    <span>资金流水</span>
                    <b>{ledger.length}</b>
                  </div>
                </div>
                <GovernanceList headers={["流水编号", "订单", "类型", "金额"]}>
                  {ledger.map((item) => (
                    <div className="governance-row ledger" key={item.id}>
                      <span>
                        <strong>{item.id.slice(0, 12)}</strong>
                        <small>
                          {new Date(item.createdAt).toLocaleString("zh-CN")}
                        </small>
                      </span>
                      <span>
                        <strong>{item.orderId}</strong>
                        <small>不可覆盖资金记录</small>
                      </span>
                      <em>{item.type}</em>
                      <div>
                        <b
                          className={
                            item.type.includes("refund")
                              ? "negative"
                              : "positive"
                          }
                        >
                          {item.type.includes("refund") ? "-" : "+"}¥
                          {item.amount}
                        </b>
                      </div>
                    </div>
                  ))}
                </GovernanceList>
              </>
            )}
            {tab === "审计日志" && (
              <GovernanceList
                headers={["时间 / 操作者", "操作对象", "动作", "详情"]}
              >
                {logs.map((item) => (
                  <div className="governance-row audit" key={item.id}>
                    <span>
                      <strong>
                        {new Date(item.createdAt).toLocaleString("zh-CN")}
                      </strong>
                      <small>
                        {item.actorRole} · {item.actorId}
                      </small>
                    </span>
                    <span>
                      <strong>{item.targetType}</strong>
                      <small>{item.targetId}</small>
                    </span>
                    <em>{item.action}</em>
                    <div>
                      <small>{JSON.stringify(item.details)}</small>
                    </div>
                  </div>
                ))}
              </GovernanceList>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function GovernanceList({ headers, children }) {
  const items = React.Children.toArray(children);
  return (
    <div className="governance-list">
      <div className="governance-list-head">
        {headers.map((header) => (
          <span key={header}>{header}</span>
        ))}
      </div>
      {items.length ? (
        items
      ) : (
        <div className="admin-empty">
          <ShieldCheck size={30} />
          <strong>当前没有待处理记录</strong>
          <span>新的申请或事件会出现在这里</span>
        </div>
      )}
    </div>
  );
}

function AdminDisputeCenter({ close }) {
  const [disputes, setDisputes] = useState([]);
  const [error, setError] = useState("");
  const refresh = () =>
    listDisputes()
      .then(({ disputes: items }) => setDisputes(items))
      .catch((failure) => setError(failure.message));
  useEffect(() => {
    refresh();
  }, []);
  const resolve = (item, resolution) =>
    resolveDispute(item.id, {
      resolution,
      amount: resolution === "refund_partial" ? 20 : undefined,
    })
      .then(refresh)
      .catch((failure) => setError(failure.message));
  return (
    <div className="overlay admin-overlay" onClick={close}>
      <div
        className="admin-center"
        onClick={(event) => event.stopPropagation()}
      >
        <aside className="admin-side">
          <div className="admin-brand">
            <span className="brand-mark">P</span>
            <strong>平台治理中心</strong>
          </div>
          <nav>
            <button className="active">
              <ShieldCheck size={16} /> 纠纷仲裁
            </button>
            <button>
              <Store size={16} /> 入驻审核
            </button>
            <button>
              <Megaphone size={16} /> 广告审核
            </button>
            <button>
              <TrendingUp size={16} /> 资金对账
            </button>
          </nav>
          <button className="admin-close" onClick={close}>
            <X size={15} /> 返回市场
          </button>
        </aside>
        <section className="admin-main">
          <div className="admin-head">
            <div>
              <span className="kicker">PLATFORM GOVERNANCE</span>
              <h2>纠纷仲裁</h2>
            </div>
            <span>
              <ShieldCheck size={14} /> 所有操作写入审计日志
            </span>
          </div>
          <div className="admin-content">
            <div className="admin-kpis">
              <div>
                <span>待处理纠纷</span>
                <b>
                  {disputes.filter((item) => item.status === "open").length}
                </b>
              </div>
              <div>
                <span>今日已处理</span>
                <b>
                  {disputes.filter((item) => item.status === "resolved").length}
                </b>
              </div>
              <div>
                <span>处理时效目标</span>
                <b>24h</b>
              </div>
            </div>
            {error && <div className="admin-error">{error}</div>}
            <div className="dispute-list">
              <div className="dispute-list-head">
                <span>纠纷编号</span>
                <span>订单 / 原因</span>
                <span>状态</span>
                <span>处理操作</span>
              </div>
              {disputes.map((item) => (
                <div className="admin-dispute-row" key={item.id}>
                  <span>
                    <strong>{item.id}</strong>
                    <small>
                      {new Date(item.createdAt).toLocaleString("zh-CN")}
                    </small>
                  </span>
                  <span>
                    <strong>{item.orderId}</strong>
                    <small>
                      {item.reason} · {item.description || "未补充说明"}
                    </small>
                  </span>
                  <em className={item.status}>
                    {item.status === "open" ? "待处理" : "已结案"}
                  </em>
                  <div>
                    {item.status === "open" ? (
                      <>
                        <button onClick={() => resolve(item, "reject")}>
                          驳回
                        </button>
                        <button onClick={() => resolve(item, "refund_partial")}>
                          部分退款
                        </button>
                        <button
                          className="refund"
                          onClick={() => resolve(item, "refund_full")}
                        >
                          全额退款
                        </button>
                      </>
                    ) : (
                      <span>
                        {item.refundAmount
                          ? `退款 ¥${item.refundAmount}`
                          : "维持订单"}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {!disputes.length && (
                <div className="admin-empty">
                  <ShieldCheck size={30} />
                  <strong>当前没有待处理纠纷</strong>
                  <span>买家发起仲裁后会进入这里</span>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function PlayerDashboard({ close }) {
  const [profile, setProfile] = useState(players[0]);
  const [orders, setOrders] = useState([]);
  const [earnings, setEarnings] = useState({ month: 0, pending: 0 });
  const [status, setStatus] = useState("online");
  const [tab, setTab] = useState("接单中心");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [verificationForm, setVerificationForm] = useState({
    realName: "张泽",
    idLast4: "1024",
    game: "王者荣耀",
    rankProof: "王者营地段位截图已上传",
  });
  const [verificationResult, setVerificationResult] = useState("");

  const refresh = () =>
    getPlayerDashboard()
      .then((data) => {
        setProfile((current) => ({ ...current, ...data.player }));
        setOrders(data.orders);
        setEarnings(data.earnings);
        setStatus(data.player.status);
      })
      .catch(() => setError("陪玩师数据暂时不可用，当前显示演示信息。"))
      .finally(() => setLoading(false));

  useEffect(() => {
    refresh();
  }, []);

  const changeStatus = (next) => {
    setStatus(next);
    updatePlayerStatus(next).catch(() => setError("状态暂未同步到服务端。"));
  };

  const transition = (order, action) => {
    transitionPlayerOrder(order.id, action)
      .then(({ order: updated }) => {
        setOrders((items) =>
          items.map((item) => (item.id === updated.id ? updated : item)),
        );
        refresh();
      })
      .catch(() => setError("订单状态已变化，请刷新后重试。"));
  };

  const statusText = {
    pending: "待接单",
    accepted: "已接单",
    in_progress: "服务中",
    completed: "已完成",
  };
  const statusAction = {
    pending: ["accept", "接受订单"],
    accepted: ["start", "开始服务"],
    in_progress: ["complete", "确认完成"],
  };

  return (
    <div className="overlay player-console-overlay" onClick={close}>
      <div
        className="player-console"
        onClick={(event) => event.stopPropagation()}
      >
        <aside className="player-console-side">
          <div className="player-console-brand">
            <span className="brand-mark">P</span>
            <strong>陪玩师中心</strong>
          </div>
          <div
            className={`player-console-avatar ${profile.theme || "p-orange"}`}
          >
            {profile.avatar || "泽"}
          </div>
          <strong className="player-console-name">
            {profile.name || "阿泽"}
          </strong>
          <span className="player-console-rank">{profile.rank}</span>
          <div className="player-status-options">
            {["online", "busy", "offline"].map((item) => (
              <button
                className={status === item ? "active" : ""}
                onClick={() => changeStatus(item)}
                key={item}
              >
                <span className={`status-dot ${item}`}></span>
                {item === "online"
                  ? "在线接单"
                  : item === "busy"
                    ? "忙碌中"
                    : "暂不接单"}
              </button>
            ))}
          </div>
          <nav className="player-console-nav">
            {[
              ["接单中心", <ShoppingBag size={16} />],
              ["我的名片", <Award size={16} />],
              ["身份认证", <ShieldCheck size={16} />],
              ["收入明细", <TrendingUp size={16} />],
            ].map(([label, icon]) => (
              <button
                className={tab === label ? "active" : ""}
                onClick={() => setTab(label)}
                key={label}
              >
                {icon} {label}
              </button>
            ))}
          </nav>
          <button className="player-console-close" onClick={close}>
            <X size={15} /> 返回市场
          </button>
        </aside>
        <section className="player-console-main">
          <div className="player-console-head">
            <div>
              <span className="kicker">PLAYER WORKSPACE</span>
              <h2>{tab}</h2>
            </div>
            <span className="player-head-store">
              <Store size={14} /> {profile.store || "星河电竞陪玩馆"}
            </span>
          </div>
          {error && <div className="player-console-error">{error}</div>}
          {tab === "接单中心" && (
            <div className="player-console-content">
              <div className="player-kpis">
                <div>
                  <span>今日完成</span>
                  <b>
                    {
                      orders.filter((item) => item.status === "completed")
                        .length
                    }
                  </b>
                  <small>单</small>
                </div>
                <div>
                  <span>待处理订单</span>
                  <b>
                    {
                      orders.filter((item) => item.status !== "completed")
                        .length
                    }
                  </b>
                  <small>需要及时响应</small>
                </div>
                <div>
                  <span>本月收入</span>
                  <b>¥{Math.round(earnings.month)}</b>
                  <small className="up">已扣平台服务费</small>
                </div>
              </div>
              <div className="player-order-panel">
                <div className="player-panel-head">
                  <strong>订单状态</strong>
                  <small>{loading ? "同步中..." : "实时同步"}</small>
                </div>
                {orders.map((order) => {
                  const action = statusAction[order.status];
                  return (
                    <div className="player-order-row" key={order.id}>
                      <div className="order-state-icon">
                        <Gamepad2 size={16} />
                      </div>
                      <div>
                        <strong>{order.serviceName}</strong>
                        <small>
                          {order.id} ·{" "}
                          {new Date(order.createdAt).toLocaleString("zh-CN", {
                            month: "numeric",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </small>
                      </div>
                      <span className={`player-order-status ${order.status}`}>
                        {statusText[order.status] || order.status}
                      </span>
                      <b>¥{order.amount}</b>
                      {action && (
                        <button onClick={() => transition(order, action[0])}>
                          {action[1]}
                        </button>
                      )}
                    </div>
                  );
                })}
                {!orders.length && (
                  <div className="player-empty">
                    暂时没有分配订单，保持在线会更容易接到合适的项目。
                  </div>
                )}
              </div>
            </div>
          )}
          {tab === "我的名片" && (
            <div className="player-console-content">
              <div className="player-profile-preview">
                <div
                  className={`player-avatar profile ${profile.theme || "p-orange"}`}
                >
                  {profile.avatar || "泽"}
                  <span className="online"></span>
                </div>
                <div>
                  <div className="player-profile-preview-name">
                    <h3>{profile.name}</h3>
                    <ShieldCheck size={15} />
                  </div>
                  <p>{profile.rank}</p>
                  <small>{profile.bio}</small>
                </div>
              </div>
              <div className="player-voice-edit">
                <div>
                  <strong>语音名片</strong>
                  <small>让买家先听到你的声音，提升预约转化</small>
                </div>
                <VoiceIntro
                  player={{
                    voice:
                      profile.voiceIntro ||
                      profile.voice ||
                      "你好，欢迎来到我的语音名片。",
                  }}
                />
              </div>
              <div className="player-card-metrics">
                <div>
                  <span>综合评分</span>
                  <b>{profile.rating}</b>
                </div>
                <div>
                  <span>完成订单</span>
                  <b>{profile.completedOrders || profile.orders}</b>
                </div>
                <div>
                  <span>当前报价</span>
                  <b>
                    ¥{profile.price}
                    <small>/小时</small>
                  </b>
                </div>
              </div>
            </div>
          )}
          {tab === "收入明细" && (
            <div className="player-console-content">
              <div className="player-income-hero">
                <div>
                  <span>可提现收入</span>
                  <b>¥{Math.round(earnings.month + earnings.pending)}</b>
                  <small>预计扣除平台服务费后</small>
                </div>
                <button>申请提现</button>
              </div>
              <div className="player-income-list">
                <div>
                  <span>本月已结算</span>
                  <b>¥{Math.round(earnings.month)}</b>
                  <small>按完成订单结算</small>
                </div>
                <div>
                  <span>待结算</span>
                  <b>¥{Math.round(earnings.pending)}</b>
                  <small>买家确认后到账</small>
                </div>
                <div>
                  <span>平台服务费</span>
                  <b>8%</b>
                  <small>透明费率</small>
                </div>
              </div>
              <div className="player-payout-note">
                <ShieldCheck size={15} />{" "}
                每笔收入都关联订单和服务确认，提现前可查看完整流水。
              </div>
            </div>
          )}
          {tab === "身份认证" && (
            <div className="player-console-content">
              <div className="verification-status-card">
                <div className={`verification-seal ${profile.verification}`}>
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <strong>
                    {profile.verification === "verified"
                      ? "实名认证与技能认证已通过"
                      : "完成认证后才能持续接单"}
                  </strong>
                  <p>
                    身份信息仅用于平台审核，买家只会看到认证标识和技能结果。
                  </p>
                </div>
                <span>
                  {profile.verification === "verified" ? "已认证" : "待认证"}
                </span>
              </div>
              <div className="verification-form">
                <div className="verification-form-head">
                  <div>
                    <strong>提交认证资料</strong>
                    <small>主体身份与游戏能力需要分别核验</small>
                  </div>
                  <span>
                    <ShieldCheck size={13} /> 加密传输
                  </span>
                </div>
                <div className="verification-fields">
                  <label>
                    <span>真实姓名</span>
                    <input
                      value={verificationForm.realName}
                      onChange={(event) =>
                        setVerificationForm({
                          ...verificationForm,
                          realName: event.target.value,
                        })
                      }
                    />
                  </label>
                  <label>
                    <span>身份证后四位</span>
                    <input
                      maxLength="4"
                      value={verificationForm.idLast4}
                      onChange={(event) =>
                        setVerificationForm({
                          ...verificationForm,
                          idLast4: event.target.value.replace(/\D/g, ""),
                        })
                      }
                    />
                  </label>
                  <label>
                    <span>认证游戏</span>
                    <select
                      value={verificationForm.game}
                      onChange={(event) =>
                        setVerificationForm({
                          ...verificationForm,
                          game: event.target.value,
                        })
                      }
                    >
                      <option>王者荣耀</option>
                      <option>英雄联盟</option>
                      <option>和平精英</option>
                      <option>无畏契约</option>
                    </select>
                  </label>
                  <label>
                    <span>段位证明</span>
                    <input
                      value={verificationForm.rankProof}
                      onChange={(event) =>
                        setVerificationForm({
                          ...verificationForm,
                          rankProof: event.target.value,
                        })
                      }
                    />
                  </label>
                </div>
                <div className="verification-agreement">
                  <Check size={13} />{" "}
                  本人承诺资料真实，并同意平台进行身份和技能复核。
                </div>
                {verificationResult && (
                  <div className="verification-result">
                    {verificationResult}
                  </div>
                )}
                <button
                  className="verification-submit"
                  onClick={() =>
                    submitPlayerVerification(verificationForm)
                      .then(({ verification }) =>
                        setVerificationResult(
                          verification.status === "pending"
                            ? "资料已提交，平台将在 1 个工作日内审核。"
                            : "认证资料已更新。",
                        ),
                      )
                      .catch((failure) =>
                        setVerificationResult(failure.message),
                      )
                  }
                >
                  提交认证审核
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function OwnerDashboard({ close }) {
  const [tab, setTab] = useState("概览");
  const [authorized, setAuthorized] = useState(true);
  const [agents, setAgents] = useState([
    { name: "星河店长", role: "店主", enabled: true },
    { name: "阿泽", role: "客服专员", enabled: true },
    { name: "小鹿", role: "客服专员", enabled: false },
  ]);
  const [projects, setProjects] = useState(
    stores[0].projects.map((p) => ({ ...p, active: true })),
  );
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [orders, setOrders] = useState([
    {
      id: "#PM240812",
      user: "Echo_77",
      project: "王者荣耀 · 赛季冲刺",
      price: "¥76",
      status: "待接单",
      time: "今天 14:20",
    },
    {
      id: "#PM240809",
      user: "Luna",
      project: "和平精英 · 王牌四排",
      price: "¥58",
      status: "进行中",
      time: "今天 13:48",
    },
    {
      id: "#PM240801",
      user: "Kimi",
      project: "游戏陪聊 · 深夜电台",
      price: "¥36",
      status: "已完成",
      time: "昨天 23:16",
    },
  ]);
  const addProject = () => {
    if (!title.trim() || !price.trim()) return;
    setProjects([
      {
        title: title.trim(),
        game: "通用",
        mode: "陪玩 / 待编辑",
        price: Number(price),
        unit: "小时",
        online: 0,
        tag: "待完善",
        icon: "新项目",
        color: "#eef3f5",
        active: true,
      },
      ...projects,
    ]);
    setTitle("");
    setPrice("");
  };
  const tabs = [
    "概览",
    "项目管理",
    "陪玩师",
    "订单",
    "收入",
    "客服会话",
    "客服授权",
  ];
  return (
    <div className="overlay owner-overlay" onClick={close}>
      <div className="owner-dashboard" onClick={(e) => e.stopPropagation()}>
        <aside className="owner-side">
          <div className="owner-brand">
            <span className="brand-mark">P</span>
            <strong>店主中心</strong>
          </div>
          <div className="owner-store">
            <div className="store-avatar orange">星</div>
            <div>
              <strong>星河电竞陪玩馆</strong>
              <small>
                <span className="online-dot"></span> 营业中
              </small>
            </div>
          </div>
          <nav className="owner-nav">
            {tabs.map((t) => (
              <button
                className={tab === t ? "active" : ""}
                onClick={() => setTab(t)}
                key={t}
              >
                {t === "概览" ? (
                  <Trophy size={16} />
                ) : t === "项目管理" ? (
                  <Gamepad2 size={16} />
                ) : t === "陪玩师" ? (
                  <Users size={16} />
                ) : t === "订单" ? (
                  <ShoppingBag size={16} />
                ) : t === "收入" ? (
                  <Zap size={16} />
                ) : (
                  <Headphones size={16} />
                )}{" "}
                {t}
              </button>
            ))}
          </nav>
          <button className="owner-close" onClick={close}>
            <X size={15} /> 返回市场
          </button>
        </aside>
        <section className="owner-main">
          <div className="owner-head">
            <div>
              <span className="kicker">STORE CONSOLE</span>
              <h2>{tab}</h2>
            </div>
            <div className="owner-head-actions">
              <span className="owner-notice">
                <span className="online-dot"></span> 店铺正常营业
              </span>
              <button className="owner-avatar">星</button>
            </div>
          </div>
          {tab === "概览" && (
            <div className="owner-content">
              <div className="owner-kpis">
                <div>
                  <span>今日成交额</span>
                  <b>¥2,486</b>
                  <small className="up">↑ 18.6%</small>
                </div>
                <div>
                  <span>待处理订单</span>
                  <b>12</b>
                  <small>需要及时接单</small>
                </div>
                <div>
                  <span>店铺访客</span>
                  <b>1,842</b>
                  <small className="up">↑ 9.2%</small>
                </div>
                <div>
                  <span>本月评分</span>
                  <b>4.9</b>
                  <small>较上月 +0.1</small>
                </div>
              </div>
              <div className="owner-panels">
                <div className="owner-panel">
                  <div className="panel-title">
                    <strong>今日订单</strong>
                    <button onClick={() => setTab("订单")}>
                      查看全部 <ChevronRight size={14} />
                    </button>
                  </div>
                  {orders.map((o) => (
                    <div className="mini-order" key={o.id}>
                      <span className="order-dot"></span>
                      <div>
                        <strong>{o.project}</strong>
                        <small>
                          {o.user} · {o.time}
                        </small>
                      </div>
                      <b>{o.price}</b>
                    </div>
                  ))}
                </div>
                <div className="owner-panel">
                  <div className="panel-title">
                    <strong>客服授权状态</strong>
                    <button onClick={() => setTab("客服授权")}>
                      管理授权 <ChevronRight size={14} />
                    </button>
                  </div>
                  <div className="support-summary">
                    <div
                      className={"support-icon " + (authorized ? "on" : "off")}
                    >
                      <Headphones size={19} />
                    </div>
                    <div>
                      <strong>
                        {authorized ? "客服窗口已开启" : "客服窗口已关闭"}
                      </strong>
                      <small>
                        {authorized
                          ? "已授权 2 位店员提供客服"
                          : "买家将无法联系店铺客服"}
                      </small>
                    </div>
                    <span
                      className={"switch " + (authorized ? "on" : "")}
                      onClick={() => setAuthorized(!authorized)}
                    >
                      <i></i>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          {tab === "项目管理" && (
            <div className="owner-content">
              <div className="manage-toolbar">
                <div>
                  <strong>我的项目</strong>
                  <small>已创建 {projects.length} 个项目</small>
                </div>
                <div className="add-project">
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="新项目名称"
                  />
                  <input
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="价格"
                    type="number"
                  />
                  <button onClick={addProject}>
                    <Plus size={15} /> 添加项目
                  </button>
                </div>
              </div>
              <div className="owner-table">
                {projects.map((p, i) => (
                  <div className="project-row" key={p.title}>
                    <div
                      className="project-icon"
                      style={{ background: p.color }}
                    >
                      {p.icon}
                    </div>
                    <div className="project-row-copy">
                      <strong>{p.title}</strong>
                      <small>
                        {p.mode} · ¥{p.price}/{p.unit}
                      </small>
                    </div>
                    <span className="row-tag">{p.tag}</span>
                    <span
                      className={"switch " + (p.active ? "on" : "")}
                      onClick={() =>
                        setProjects(
                          projects.map((x, j) =>
                            j === i ? { ...x, active: !x.active } : x,
                          ),
                        )
                      }
                    >
                      <i></i>
                    </span>
                    <button
                      className="icon-danger"
                      onClick={() =>
                        setProjects(projects.filter((_, j) => j !== i))
                      }
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {tab === "陪玩师" && (
            <div className="owner-content">
              <div className="manage-toolbar">
                <div>
                  <strong>陪玩师团队</strong>
                  <small>共 18 位签约陪玩师，12 位当前在线</small>
                </div>
                <button className="outline-action">
                  <Plus size={15} /> 邀请陪玩师
                </button>
              </div>
              <div className="staff-grid">
                {[
                  "阿泽 · 王者打野",
                  "小鹿 · 声优陪聊",
                  "K哥 · FPS 枪法",
                  "七七 · LOL 辅助",
                  "橙子 · 和平车队",
                  "Momo · 全能",
                ].map((s, i) => (
                  <div className="staff-card" key={s}>
                    <div className={"staff-avatar sa" + i}>{s.charAt(0)}</div>
                    <div>
                      <strong>{s}</strong>
                      <small>
                        <span className="online-dot"></span>{" "}
                        {i % 3 === 0 ? "在线接单" : "今日休息"}
                      </small>
                    </div>
                    <ChevronRight size={15} />
                  </div>
                ))}
              </div>
            </div>
          )}
          {tab === "订单" && (
            <div className="owner-content">
              <div className="manage-toolbar">
                <div>
                  <strong>订单管理</strong>
                  <small>共 286 笔订单</small>
                </div>
                <div className="order-filters">
                  <button className="selected">全部</button>
                  <button>待接单 12</button>
                  <button>进行中 8</button>
                  <button>已完成</button>
                </div>
              </div>
              <div className="owner-table order-table">
                <div className="order-header">
                  <span>订单编号</span>
                  <span>项目</span>
                  <span>买家</span>
                  <span>金额</span>
                  <span>状态</span>
                  <span>操作</span>
                </div>
                {orders.map((o, i) => (
                  <div className="order-line" key={o.id}>
                    <span>
                      {o.id}
                      <small>{o.time}</small>
                    </span>
                    <strong>{o.project}</strong>
                    <span>{o.user}</span>
                    <b>{o.price}</b>
                    <span
                      className={
                        "status " +
                        (o.status === "已完成"
                          ? "done"
                          : o.status === "进行中"
                            ? "doing"
                            : "pending")
                      }
                    >
                      {o.status}
                    </span>
                    <button
                      onClick={() =>
                        setOrders(
                          orders.map((x, j) =>
                            j === i ? { ...x, status: "已完成" } : x,
                          ),
                        )
                      }
                    >
                      {o.status === "待接单" ? "立即接单" : "查看详情"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {tab === "收入" && (
            <div className="owner-content">
              <div className="owner-kpis income-kpis">
                <div>
                  <span>本月收入</span>
                  <b>¥38,624</b>
                  <small className="up">↑ 24.8%</small>
                </div>
                <div>
                  <span>可提现余额</span>
                  <b>¥12,860</b>
                  <button className="withdraw">申请提现</button>
                </div>
                <div>
                  <span>平台服务费</span>
                  <b>¥3,218</b>
                  <small>费率 8.3%</small>
                </div>
              </div>
              <div className="owner-panel income-panel">
                <div className="panel-title">
                  <strong>近 7 日收入趋势</strong>
                  <small>单位：元</small>
                </div>
                <div className="bars">
                  {[
                    ["周一", 360],
                    ["周二", 510],
                    ["周三", 420],
                    ["周四", 680],
                    ["周五", 560],
                    ["周六", 820],
                    ["周日", 740],
                  ].map(([d, v]) => (
                    <div key={d}>
                      <span style={{ height: `${v / 4}px` }}></span>
                      <small>{d}</small>
                      <b>{v}</b>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {tab === "客服会话" && (
            <div className="owner-content support-owner-content">
              <MerchantSupportInbox />
            </div>
          )}
          {tab === "客服授权" && (
            <div className="owner-content">
              <div className="support-setting">
                <div className="setting-copy">
                  <div className="support-icon on">
                    <Headphones size={20} />
                  </div>
                  <div>
                    <strong>店铺客服窗口</strong>
                    <p>开启后，买家可以在店铺详情内直接联系你的客服团队。</p>
                    <small>授权范围：项目咨询、陪玩师档期、订单售后</small>
                  </div>
                </div>
                <span
                  className={"switch large " + (authorized ? "on" : "")}
                  onClick={() => setAuthorized(!authorized)}
                >
                  <i></i>
                </span>
              </div>
              <div className="auth-note">
                <ShieldCheck size={15} />{" "}
                客服消息仅对本店铺可见，平台会保留必要的服务记录。
              </div>
              <div className="manage-toolbar auth-toolbar">
                <div>
                  <strong>已授权客服人员</strong>
                  <small>只有授权成员可以接收买家消息</small>
                </div>
                <button className="outline-action">
                  <Plus size={15} /> 添加成员
                </button>
              </div>
              <div className="auth-list">
                {agents.map((a, i) => (
                  <div className="auth-row" key={a.name}>
                    <div className="staff-avatar sa0">{a.name.charAt(0)}</div>
                    <div>
                      <strong>{a.name}</strong>
                      <small>
                        {a.role} · {a.enabled ? "已授权接待" : "仅查看订单"}
                      </small>
                    </div>
                    <span
                      className={
                        "switch " + (a.enabled && authorized ? "on" : "")
                      }
                      onClick={() =>
                        setAgents(
                          agents.map((x, j) =>
                            j === i ? { ...x, enabled: !x.enabled } : x,
                          ),
                        )
                      }
                    >
                      <i></i>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
createRoot(document.getElementById("root")).render(<App />);
