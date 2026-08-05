import express from "express";
import cors from "cors";
import multer from "multer";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { createServer } from "node:http";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { WebSocket, WebSocketServer } from "ws";

const root = dirname(fileURLToPath(import.meta.url));
const dataDir = join(root, "data");
const dbFile = process.env.DATABASE_FILE
  ? resolve(process.env.DATABASE_FILE)
  : join(dataDir, "db.json");
const seedFile = join(dataDir, "seed.json");
const uploadDir = join(root, "uploads");
const port = Number(process.env.PORT || 8787);
const authSecret =
  process.env.AUTH_SECRET || "playmate-local-development-secret";

await mkdir(dataDir, { recursive: true });
await mkdir(uploadDir, { recursive: true });

const loadDatabase = async () => {
  try {
    const database = JSON.parse(await readFile(dbFile, "utf8"));
    database.conversations ||= [];
    database.messages ||= [];
    database.players ||= [];
    database.users ||= [];
    database.orders ||= [];
    database.disputes ||= [];
    database.ledger ||= [];
    database.applications ||= [];
    database.verificationRequests ||= [];
    database.auditLogs ||= [];
    database.violations ||= [];
    const seed = JSON.parse(await readFile(seedFile, "utf8"));
    let migrated = false;
    for (const user of seed.users)
      if (!database.users.some((item) => item.id === user.id)) {
        database.users.push(user);
        migrated = true;
      }
    for (const player of seed.players || [])
      if (!database.players.some((item) => item.id === player.id)) {
        database.players.push(player);
        migrated = true;
      }
    for (const order of seed.orders || [])
      if (!database.orders.some((item) => item.id === order.id)) {
        database.orders.push(order);
        migrated = true;
      }
    if (migrated) await writeFile(dbFile, JSON.stringify(database, null, 2));
    return database;
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    const seed = JSON.parse(await readFile(seedFile, "utf8"));
    await writeFile(dbFile, JSON.stringify(seed, null, 2));
    return seed;
  }
};

let writeQueue = Promise.resolve();
const mutateDatabase = (operation) => {
  const next = writeQueue.then(async () => {
    const database = await loadDatabase();
    const result = await operation(database);
    const temporary = `${dbFile}.tmp`;
    await writeFile(temporary, JSON.stringify(database, null, 2));
    await rename(temporary, dbFile);
    return result;
  });
  writeQueue = next.catch(() => {});
  return next;
};

const recordAudit = (
  database,
  identity,
  action,
  targetType,
  targetId,
  details = {},
) => {
  database.auditLogs ||= [];
  database.auditLogs.unshift({
    id: randomUUID(),
    actorId: identity.userId,
    actorRole: identity.role,
    action,
    targetType,
    targetId,
    details,
    createdAt: new Date().toISOString(),
  });
};

const encode = (value) =>
  Buffer.from(JSON.stringify(value)).toString("base64url");
const signToken = (payload) => {
  const body = encode(payload);
  const signature = createHmac("sha256", authSecret)
    .update(body)
    .digest("base64url");
  return `${body}.${signature}`;
};
const parseToken = (token) => {
  try {
    const [body, signature] = String(token || "").split(".");
    if (!body || !signature) return null;
    const expected = createHmac("sha256", authSecret).update(body).digest();
    const actual = Buffer.from(signature, "base64url");
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected))
      return null;
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    return payload.expiresAt > Date.now() ? payload : null;
  } catch {
    return null;
  }
};

const requireIdentity = (request, response, next) => {
  const token = request.headers.authorization?.replace(/^Bearer\s+/i, "");
  const identity = parseToken(token);
  if (!identity) return response.status(401).json({ error: "请先登录" });
  request.identity = identity;
  next();
};

const requireMerchant = (request, response, next) => {
  requireIdentity(request, response, () => {
    if (request.identity.role !== "merchant")
      return response.status(403).json({ error: "需要店主权限" });
    next();
  });
};

const requirePlayer = (request, response, next) => {
  requireIdentity(request, response, () => {
    if (request.identity.role !== "player")
      return response.status(403).json({ error: "需要陪玩师权限" });
    next();
  });
};

const requireBuyer = (request, response, next) => {
  requireIdentity(request, response, () => {
    if (request.identity.role !== "buyer")
      return response.status(403).json({ error: "需要买家权限" });
    next();
  });
};

const requireAdmin = (request, response, next) => {
  requireIdentity(request, response, () => {
    if (request.identity.role !== "admin")
      return response.status(403).json({ error: "需要平台仲裁权限" });
    next();
  });
};

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (_request, file, callback) =>
      callback(null, `${randomUUID()}${extname(file.originalname) || ".webm"}`),
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_request, file, callback) =>
    callback(null, file.mimetype.startsWith("audio/")),
});

const app = express();
const server = createServer(app);
const subscribers = new Map();
const broadcastMessage = (conversationId, message) => {
  for (const socket of subscribers.get(conversationId) || []) {
    if (socket.readyState === WebSocket.OPEN)
      socket.send(JSON.stringify({ type: "message", message }));
  }
};
app.use(cors({ origin: ["http://127.0.0.1:4173", "http://localhost:4173"] }));
app.use(express.json({ limit: "1mb" }));
app.use("/uploads", express.static(uploadDir));

app.get("/api/health", (_request, response) =>
  response.json({ ok: true, service: "playmate-api" }),
);

app.post("/api/auth/demo-login", async (request, response) => {
  const role = ["merchant", "player", "admin"].includes(request.body.role)
    ? request.body.role
    : "buyer";
  const database = await loadDatabase();
  const user = database.users.find((item) => item.role === role);
  const token = signToken({
    userId: user.id,
    role: user.role,
    storeId: user.storeId,
    playerId: user.playerId,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  });
  response.json({ user, token });
});

app.get("/api/stores", async (_request, response) => {
  const database = await loadDatabase();
  response.json({
    stores: database.stores.filter((store) => store.status === "approved"),
  });
});

app.post("/api/stores/register", async (request, response) => {
  const { name, contact, phone } = request.body;
  if (!name || !contact || !phone)
    return response
      .status(400)
      .json({ error: "店铺名称、联系人和电话不能为空" });
  const application = await mutateDatabase((database) => {
    const item = {
      id: randomUUID(),
      name,
      contact,
      phone,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    database.applications.push(item);
    return item;
  });
  response.status(201).json({ application });
});

app.get(
  "/api/admin/store-applications",
  requireAdmin,
  async (_request, response) => {
    const database = await loadDatabase();
    response.json({ applications: database.applications });
  },
);

app.post(
  "/api/admin/store-applications/:applicationId/review",
  requireAdmin,
  async (request, response) => {
    const result = await mutateDatabase((database) => {
      const application = database.applications.find(
        (item) =>
          item.id === request.params.applicationId && item.status === "pending",
      );
      if (!application) return null;
      const decision = request.body.decision === "approve" ? "approved" : "rejected";
      application.status = decision;
      application.reviewNote = String(request.body.note || "").trim();
      application.reviewedAt = new Date().toISOString();
      let store = null;
      if (decision === "approved") {
        store = {
          id: `store_${randomUUID()}`,
          name: application.name,
          ownerId: null,
          status: "approved",
          support: { enabled: false, authorizedAgents: [] },
        };
        database.stores.push(store);
      }
      recordAudit(
        database,
        request.identity,
        `store_application_${decision}`,
        "store_application",
        application.id,
        { note: application.reviewNote },
      );
      return { application, store };
    });
    if (!result)
      return response.status(404).json({ error: "申请不存在或已审核" });
    response.json(result);
  },
);

app.get("/api/stores/:storeId/projects", async (request, response) => {
  const database = await loadDatabase();
  response.json({
    projects: database.projects.filter(
      (project) => project.storeId === request.params.storeId,
    ),
  });
});

app.post(
  "/api/stores/:storeId/projects",
  requireMerchant,
  async (request, response) => {
    if (request.identity.storeId !== request.params.storeId)
      return response.status(403).json({ error: "无权管理其他店铺" });
    const { name, game, price, unit = "小时" } = request.body;
    if (!name || !game || !Number.isFinite(Number(price)))
      return response.status(400).json({ error: "项目参数不完整" });
    const project = await mutateDatabase((database) => {
      const item = {
        id: randomUUID(),
        storeId: request.params.storeId,
        name,
        game,
        price: Number(price),
        unit,
        active: true,
      };
      database.projects.push(item);
      return item;
    });
    response.status(201).json({ project });
  },
);

app.patch(
  "/api/projects/:projectId",
  requireMerchant,
  async (request, response) => {
    const project = await mutateDatabase((database) => {
      const item = database.projects.find(
        (value) =>
          value.id === request.params.projectId &&
          value.storeId === request.identity.storeId,
      );
      if (!item) return null;
      for (const key of ["name", "game", "price", "unit", "active"])
        if (request.body[key] !== undefined) item[key] = request.body[key];
      return item;
    });
    if (!project) return response.status(404).json({ error: "项目不存在" });
    response.json({ project });
  },
);

app.get("/api/orders", async (request, response) => {
  const database = await loadDatabase();
  const orders = database.orders.filter(
    (order) =>
      !request.query.buyerId || order.buyerId === request.query.buyerId,
  );
  response.json({ orders });
});

app.post("/api/orders", async (request, response) => {
  const { buyerId, serviceName, storeName, amount } = request.body;
  if (
    !buyerId ||
    !serviceName ||
    !storeName ||
    !Number.isFinite(Number(amount))
  )
    return response.status(400).json({ error: "订单参数不完整" });
  const order = await mutateDatabase((database) => {
    const item = {
      id: `PM${Date.now()}`,
      buyerId,
      serviceName,
      storeName,
      amount: Number(amount),
      status: "pending_payment",
      createdAt: new Date().toISOString(),
    };
    database.orders.unshift(item);
    return item;
  });
  response.status(201).json({ order });
});

app.post(
  "/api/orders/:orderId/pay",
  requireBuyer,
  async (request, response) => {
    const order = await mutateDatabase((database) => {
      const item = database.orders.find(
        (value) =>
          value.id === request.params.orderId &&
          value.buyerId === request.identity.userId,
      );
      if (!item || item.status !== "pending_payment") return null;
      item.status = "paid_escrow";
      item.paidAt = new Date().toISOString();
    database.ledger.push({
        id: randomUUID(),
        orderId: item.id,
        type: "escrow_charge",
        amount: item.amount,
      createdAt: item.paidAt,
    });
    recordAudit(
      database,
      request.identity,
      "order_paid_to_escrow",
      "order",
      item.id,
      { amount: item.amount },
    );
      return item;
    });
    if (!order) return response.status(409).json({ error: "订单当前不可支付" });
    response.json({ order });
  },
);

app.post(
  "/api/orders/:orderId/cancel",
  requireBuyer,
  async (request, response) => {
    const order = await mutateDatabase((database) => {
      const item = database.orders.find(
        (value) =>
          value.id === request.params.orderId &&
          value.buyerId === request.identity.userId,
      );
      if (!item || !["pending_payment", "paid_escrow"].includes(item.status))
        return null;
      const previous = item.status;
      item.status = previous === "paid_escrow" ? "refunded" : "cancelled";
      if (previous === "paid_escrow")
        database.ledger.push({
          id: randomUUID(),
          orderId: item.id,
          type: "refund",
          amount: item.amount,
          createdAt: new Date().toISOString(),
        });
      recordAudit(
        database,
        request.identity,
        "order_cancelled",
        "order",
        item.id,
        { previousStatus: previous },
      );
      return item;
    });
    if (!order) return response.status(409).json({ error: "订单当前不可取消" });
    response.json({ order });
  },
);

app.post(
  "/api/orders/:orderId/disputes",
  requireBuyer,
  async (request, response) => {
    const dispute = await mutateDatabase((database) => {
      const order = database.orders.find(
        (value) =>
          value.id === request.params.orderId &&
          value.buyerId === request.identity.userId,
      );
      if (
        !order ||
        !["paid_escrow", "accepted", "in_progress", "completed"].includes(
          order.status,
        )
      )
        return null;
      const item = {
        id: `DSP${Date.now()}`,
        orderId: order.id,
        buyerId: request.identity.userId,
        reason: request.body.reason || "服务争议",
        description: String(request.body.description || "").trim(),
        status: "open",
        createdAt: new Date().toISOString(),
      };
      order.status = "disputed";
      database.disputes.push(item);
      return item;
    });
    if (!dispute)
      return response.status(409).json({ error: "订单当前不可发起纠纷" });
    response.status(201).json({ dispute });
  },
);

app.get("/api/disputes", requireAdmin, async (_request, response) => {
  const database = await loadDatabase();
  response.json({ disputes: database.disputes });
});

app.post(
  "/api/disputes/:disputeId/resolve",
  requireAdmin,
  async (request, response) => {
    const result = await mutateDatabase((database) => {
      const dispute = database.disputes.find(
        (value) =>
          value.id === request.params.disputeId && value.status === "open",
      );
      const order =
        dispute &&
        database.orders.find((value) => value.id === dispute.orderId);
      if (!dispute || !order) return null;
      const resolution = ["refund_full", "refund_partial", "reject"].includes(
        request.body.resolution,
      )
        ? request.body.resolution
        : "reject";
      const refundAmount =
        resolution === "refund_full"
          ? order.amount
          : resolution === "refund_partial"
            ? Math.min(
                order.amount,
                Math.max(0, Number(request.body.amount) || 0),
              )
            : 0;
      dispute.status = "resolved";
      dispute.resolution = resolution;
      dispute.refundAmount = refundAmount;
      dispute.resolvedAt = new Date().toISOString();
      order.status = refundAmount > 0 ? "refunded" : "completed";
      if (refundAmount > 0)
        database.ledger.push({
          id: randomUUID(),
          orderId: order.id,
          type: "dispute_refund",
          amount: refundAmount,
          createdAt: dispute.resolvedAt,
        });
      recordAudit(
        database,
        request.identity,
        "dispute_resolved",
        "dispute",
        dispute.id,
        { resolution, refundAmount },
      );
      return { dispute, order };
    });
    if (!result)
      return response.status(404).json({ error: "纠纷不存在或已处理" });
    response.json(result);
  },
);

app.patch(
  "/api/orders/:orderId",
  requireMerchant,
  async (request, response) => {
    const order = await mutateDatabase((database) => {
      const item = database.orders.find(
        (value) => value.id === request.params.orderId,
      );
      if (!item) return null;
      item.status = request.body.status || item.status;
      return item;
    });
    if (!order) return response.status(404).json({ error: "订单不存在" });
    response.json({ order });
  },
);

app.get("/api/player/dashboard", requirePlayer, async (request, response) => {
  const database = await loadDatabase();
  const player = database.players.find(
    (item) => item.id === request.identity.playerId,
  );
  if (!player) return response.status(404).json({ error: "陪玩师资料不存在" });
  const orders = database.orders
    .filter((item) => item.playerId === player.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  response.json({
    player,
    orders,
    earnings: {
      month: orders
        .filter((item) => item.status === "completed")
        .reduce((sum, item) => sum + Number(item.amount) * 0.92, 0),
      pending: orders
        .filter((item) => item.status !== "completed")
        .reduce((sum, item) => sum + Number(item.amount) * 0.92, 0),
    },
  });
});

app.patch("/api/player/profile", requirePlayer, async (request, response) => {
  const player = await mutateDatabase((database) => {
    const item = database.players.find(
      (value) => value.id === request.identity.playerId,
    );
    if (!item) return null;
    for (const key of ["bio", "rank", "price", "tags", "voiceIntro"])
      if (request.body[key] !== undefined) item[key] = request.body[key];
    return item;
  });
  if (!player) return response.status(404).json({ error: "陪玩师资料不存在" });
  response.json({ player });
});

app.post(
  "/api/player/verification",
  requirePlayer,
  async (request, response) => {
    const { realName, idLast4, game, rankProof } = request.body;
    if (!realName || !/^\d{4}$/.test(String(idLast4)) || !game || !rankProof)
      return response.status(400).json({ error: "认证资料不完整" });
    const verification = await mutateDatabase((database) => {
      const existing = database.verificationRequests.find(
        (item) =>
          item.playerId === request.identity.playerId && item.status === "pending",
      );
      if (existing) return existing;
      const item = {
        id: `VER${Date.now()}`,
        playerId: request.identity.playerId,
        userId: request.identity.userId,
        realName,
        idLast4: String(idLast4),
        game,
        rankProof,
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      database.verificationRequests.push(item);
      recordAudit(
        database,
        request.identity,
        "player_verification_submitted",
        "player_verification",
        item.id,
      );
      return item;
    });
    response.status(201).json({ verification });
  },
);

app.get(
  "/api/admin/player-verifications",
  requireAdmin,
  async (_request, response) => {
    const database = await loadDatabase();
    response.json({ verifications: database.verificationRequests });
  },
);

app.post(
  "/api/admin/player-verifications/:verificationId/review",
  requireAdmin,
  async (request, response) => {
    const result = await mutateDatabase((database) => {
      const verification = database.verificationRequests.find(
        (item) =>
          item.id === request.params.verificationId && item.status === "pending",
      );
      if (!verification) return null;
      const decision = request.body.decision === "approve" ? "approved" : "rejected";
      verification.status = decision;
      verification.reviewNote = String(request.body.note || "").trim();
      verification.reviewedAt = new Date().toISOString();
      const player = database.players.find(
        (item) => item.id === verification.playerId,
      );
      if (player)
        player.verification = decision === "approved" ? "verified" : "rejected";
      recordAudit(
        database,
        request.identity,
        `player_verification_${decision}`,
        "player_verification",
        verification.id,
        { note: verification.reviewNote },
      );
      return { verification, player };
    });
    if (!result)
      return response.status(404).json({ error: "认证申请不存在或已审核" });
    response.json(result);
  },
);

app.patch("/api/player/status", requirePlayer, async (request, response) => {
  const allowed = ["online", "busy", "offline"];
  if (!allowed.includes(request.body.status))
    return response.status(400).json({ error: "状态无效" });
  const player = await mutateDatabase((database) => {
    const item = database.players.find(
      (value) => value.id === request.identity.playerId,
    );
    if (!item) return null;
    item.status = request.body.status;
    return item;
  });
  if (!player) return response.status(404).json({ error: "陪玩师资料不存在" });
  response.json({ player });
});

app.post(
  "/api/player/orders/:orderId/:action",
  requirePlayer,
  async (request, response) => {
    const transitions = {
      accept: { from: "paid_escrow", to: "accepted" },
      start: { from: "accepted", to: "in_progress" },
      complete: { from: "in_progress", to: "completed" },
    };
    const transition = transitions[request.params.action];
    if (!transition) return response.status(400).json({ error: "操作无效" });
    const order = await mutateDatabase((database) => {
      const item = database.orders.find(
        (value) =>
          value.id === request.params.orderId &&
          value.playerId === request.identity.playerId,
      );
      if (!item || item.status !== transition.from) return null;
      item.status = transition.to;
      item.updatedAt = new Date().toISOString();
      return item;
    });
    if (!order)
      return response
        .status(409)
        .json({ error: "订单状态已变化，无法执行该操作" });
    response.json({ order });
  },
);

app.get("/api/stores/:storeId/support", async (request, response) => {
  const database = await loadDatabase();
  const store = database.stores.find(
    (item) => item.id === request.params.storeId,
  );
  if (!store) return response.status(404).json({ error: "店铺不存在" });
  response.json({ support: store.support });
});

app.put(
  "/api/stores/:storeId/support",
  requireMerchant,
  async (request, response) => {
    if (request.identity.storeId !== request.params.storeId)
      return response.status(403).json({ error: "无权管理其他店铺" });
    const support = await mutateDatabase((database) => {
      const store = database.stores.find(
        (item) => item.id === request.params.storeId,
      );
      store.support = {
        enabled: Boolean(request.body.enabled),
        authorizedAgents: request.body.authorizedAgents || [],
      };
      return store.support;
    });
    response.json({ support });
  },
);

const canAccessConversation = (database, conversation, identity) => {
  if (!conversation) return false;
  if (identity.role === "buyer")
    return conversation.buyerId === identity.userId;
  if (identity.role !== "merchant" || conversation.storeId !== identity.storeId)
    return false;
  const store = database.stores.find(
    (item) => item.id === conversation.storeId,
  );
  return (
    store?.ownerId === identity.userId ||
    store?.support?.authorizedAgents?.includes(identity.userId)
  );
};

app.get(
  "/api/support/conversations",
  requireMerchant,
  async (request, response) => {
    const database = await loadDatabase();
    const conversations = database.conversations
      .filter((item) => item.storeId === request.identity.storeId)
      .map((conversation) => {
        const buyer = database.users.find(
          (item) => item.id === conversation.buyerId,
        );
        const messages = database.messages
          .filter((item) => item.conversationId === conversation.id)
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
        const lastMessage = messages.at(-1);
        return {
          ...conversation,
          buyer: buyer
            ? { id: buyer.id, name: buyer.name }
            : { id: conversation.buyerId, name: "买家" },
          lastMessage,
          messageCount: messages.length,
        };
      })
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    response.json({ conversations });
  },
);

app.post(
  "/api/support/conversations",
  requireIdentity,
  async (request, response) => {
    if (request.identity.role !== "buyer")
      return response.status(403).json({ error: "请使用买家身份发起咨询" });
    const { storeId } = request.body;
    const result = await mutateDatabase((database) => {
      const store = database.stores.find(
        (item) => item.id === storeId && item.status === "approved",
      );
      if (!store || !store.support?.enabled) return null;
      let conversation = database.conversations.find(
        (item) =>
          item.storeId === storeId &&
          item.buyerId === request.identity.userId &&
          item.status === "open",
      );
      if (!conversation) {
        conversation = {
          id: randomUUID(),
          storeId,
          buyerId: request.identity.userId,
          status: "open",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        database.conversations.push(conversation);
        database.messages.push({
          id: randomUUID(),
          conversationId: conversation.id,
          senderId: store.support.authorizedAgents?.[0] || store.ownerId,
          senderRole: "merchant",
          type: "text",
          content: `你好，这里是${store.name}客服，有什么可以帮你？`,
          createdAt: new Date().toISOString(),
        });
      }
      return conversation;
    });
    if (!result)
      return response.status(404).json({ error: "店铺客服当前不可用" });
    response.json({ conversation: result });
  },
);

app.get(
  "/api/support/conversations/:conversationId/messages",
  requireIdentity,
  async (request, response) => {
    const database = await loadDatabase();
    const conversation = database.conversations.find(
      (item) => item.id === request.params.conversationId,
    );
    if (!canAccessConversation(database, conversation, request.identity))
      return response.status(403).json({ error: "无权查看该会话" });
    const messages = database.messages
      .filter((item) => item.conversationId === conversation.id)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    response.json({ messages });
  },
);

app.post(
  "/api/support/conversations/:conversationId/messages",
  requireIdentity,
  async (request, response) => {
    const { type = "text", content, duration } = request.body;
    if (!["text", "audio"].includes(type) || !String(content || "").trim())
      return response.status(400).json({ error: "消息内容无效" });
    if (type === "audio" && !String(content).startsWith("/uploads/"))
      return response.status(400).json({ error: "音频地址无效" });
    const message = await mutateDatabase((database) => {
      const conversation = database.conversations.find(
        (item) => item.id === request.params.conversationId,
      );
      if (!canAccessConversation(database, conversation, request.identity))
        return null;
      conversation.updatedAt = new Date().toISOString();
      const item = {
        id: randomUUID(),
        conversationId: conversation.id,
        senderId: request.identity.userId,
        senderRole: request.identity.role,
        type,
        content: String(content).trim(),
        duration:
          type === "audio" ? Math.max(1, Number(duration) || 1) : undefined,
        createdAt: new Date().toISOString(),
      };
      database.messages.push(item);
      return item;
    });
    if (!message)
      return response.status(403).json({ error: "无权发送该会话消息" });
    broadcastMessage(request.params.conversationId, message);
    response.status(201).json({ message });
  },
);

app.get("/api/ads", async (_request, response) => {
  const database = await loadDatabase();
  response.json({ ads: database.ads.filter((ad) => ad.status === "active") });
});

app.post("/api/ads", requireMerchant, async (request, response) => {
  const ad = await mutateDatabase((database) => {
    const item = {
      id: randomUUID(),
      storeId: request.identity.storeId,
      targetType: request.body.targetType,
      targetId: request.body.targetId,
      placement: request.body.placement,
      dailyBudget: Number(request.body.dailyBudget),
      status: "pending",
      impressions: 0,
      clicks: 0,
    };
    database.ads.push(item);
    return item;
  });
  response.status(201).json({ ad });
});

app.get("/api/admin/ads", requireAdmin, async (_request, response) => {
  const database = await loadDatabase();
  response.json({ ads: database.ads });
});

app.post(
  "/api/admin/ads/:adId/review",
  requireAdmin,
  async (request, response) => {
    const ad = await mutateDatabase((database) => {
      const item = database.ads.find((value) => value.id === request.params.adId);
      if (!item || !["pending", "active"].includes(item.status)) return null;
      item.status = request.body.decision === "approve" ? "active" : "rejected";
      item.reviewNote = String(request.body.note || "").trim();
      item.reviewedAt = new Date().toISOString();
      recordAudit(
        database,
        request.identity,
        `advertisement_${item.status}`,
        "advertisement",
        item.id,
        { note: item.reviewNote },
      );
      return item;
    });
    if (!ad) return response.status(404).json({ error: "广告不存在或不可审核" });
    response.json({ ad });
  },
);

app.get("/api/admin/ledger", requireAdmin, async (_request, response) => {
  const database = await loadDatabase();
  response.json({ ledger: database.ledger });
});

app.get("/api/admin/audit-logs", requireAdmin, async (_request, response) => {
  const database = await loadDatabase();
  response.json({ logs: database.auditLogs });
});

app.post("/api/admin/violations", requireAdmin, async (request, response) => {
  const violation = await mutateDatabase((database) => {
    const item = {
      id: `VIO${Date.now()}`,
      targetType: request.body.targetType,
      targetId: request.body.targetId,
      reason: String(request.body.reason || "").trim(),
      penalty: request.body.penalty || "warning",
      status: "active",
      createdAt: new Date().toISOString(),
    };
    if (!item.targetType || !item.targetId || !item.reason) return null;
    if (item.targetType === "player") {
      const player = database.players.find((value) => value.id === item.targetId);
      if (player && ["suspend", "ban"].includes(item.penalty))
        player.status = "offline";
    }
    if (item.targetType === "store") {
      const store = database.stores.find((value) => value.id === item.targetId);
      if (store && ["suspend", "ban"].includes(item.penalty))
        store.status = "suspended";
    }
    database.violations.push(item);
    recordAudit(
      database,
      request.identity,
      "violation_created",
      item.targetType,
      item.targetId,
      { reason: item.reason, penalty: item.penalty },
    );
    return item;
  });
  if (!violation) return response.status(400).json({ error: "处罚参数不完整" });
  response.status(201).json({ violation });
});

app.post(
  "/api/audio",
  requireIdentity,
  upload.single("audio"),
  (request, response) => {
    if (!request.file)
      return response.status(400).json({ error: "请选择音频文件" });
    response.status(201).json({
      url: `/uploads/${request.file.filename}`,
      size: request.file.size,
      mimeType: request.file.mimetype,
    });
  },
);

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ error: "服务端处理失败" });
});

const webSockets = new WebSocketServer({ server, path: "/ws" });
webSockets.on("connection", (socket, request) => {
  const token = new URL(
    request.url,
    `http://${request.headers.host}`,
  ).searchParams.get("token");
  const identity = parseToken(token);
  if (!identity) return socket.close(1008, "Unauthorized");
  socket.subscriptions = new Set();
  socket.on("message", async (raw) => {
    try {
      const payload = JSON.parse(raw.toString());
      if (payload.action !== "subscribe" || !payload.conversationId) return;
      const database = await loadDatabase();
      const conversation = database.conversations.find(
        (item) => item.id === payload.conversationId,
      );
      if (!canAccessConversation(database, conversation, identity))
        return socket.send(
          JSON.stringify({ type: "error", error: "Forbidden" }),
        );
      const group = subscribers.get(conversation.id) || new Set();
      group.add(socket);
      subscribers.set(conversation.id, group);
      socket.subscriptions.add(conversation.id);
      socket.send(
        JSON.stringify({ type: "subscribed", conversationId: conversation.id }),
      );
    } catch {
      socket.send(JSON.stringify({ type: "error", error: "Invalid message" }));
    }
  });
  socket.on("close", () => {
    for (const conversationId of socket.subscriptions) {
      const group = subscribers.get(conversationId);
      group?.delete(socket);
      if (!group?.size) subscribers.delete(conversationId);
    }
  });
});

server.listen(port, "127.0.0.1", () =>
  console.log(`PLAYMATE API listening on http://127.0.0.1:${port}`),
);
