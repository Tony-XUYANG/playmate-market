import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const dataDir = join(root, 'data');
const dbFile = join(dataDir, 'db.json');
const seedFile = join(dataDir, 'seed.json');
const uploadDir = join(root, 'uploads');
const port = Number(process.env.PORT || 8787);
const authSecret = process.env.AUTH_SECRET || 'playmate-local-development-secret';

await mkdir(dataDir, { recursive: true });
await mkdir(uploadDir, { recursive: true });

const loadDatabase = async () => {
  try {
    return JSON.parse(await readFile(dbFile, 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    const seed = JSON.parse(await readFile(seedFile, 'utf8'));
    await writeFile(dbFile, JSON.stringify(seed, null, 2));
    return seed;
  }
};

let writeQueue = Promise.resolve();
const mutateDatabase = operation => {
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

const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
const signToken = payload => {
  const body = encode(payload);
  const signature = createHmac('sha256', authSecret).update(body).digest('base64url');
  return `${body}.${signature}`;
};
const parseToken = token => {
  const [body, signature] = String(token || '').split('.');
  if (!body || !signature) return null;
  const expected = createHmac('sha256', authSecret).update(body).digest();
  const actual = Buffer.from(signature, 'base64url');
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
  const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  return payload.expiresAt > Date.now() ? payload : null;
};

const requireMerchant = (request, response, next) => {
  const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');
  const identity = parseToken(token);
  if (!identity || identity.role !== 'merchant') return response.status(403).json({ error: '需要店主权限' });
  request.identity = identity;
  next();
};

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (_request, file, callback) => callback(null, `${randomUUID()}${extname(file.originalname) || '.webm'}`)
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_request, file, callback) => callback(null, file.mimetype.startsWith('audio/'))
});

const app = express();
app.use(cors({ origin: ['http://127.0.0.1:4173', 'http://localhost:4173'] }));
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(uploadDir));

app.get('/api/health', (_request, response) => response.json({ ok: true, service: 'playmate-api' }));

app.post('/api/auth/demo-login', async (request, response) => {
  const role = request.body.role === 'merchant' ? 'merchant' : 'buyer';
  const database = await loadDatabase();
  const user = database.users.find(item => item.role === role);
  const token = signToken({ userId: user.id, role: user.role, storeId: user.storeId, expiresAt: Date.now() + 24 * 60 * 60 * 1000 });
  response.json({ user, token });
});

app.get('/api/stores', async (_request, response) => {
  const database = await loadDatabase();
  response.json({ stores: database.stores.filter(store => store.status === 'approved') });
});

app.post('/api/stores/register', async (request, response) => {
  const { name, contact, phone } = request.body;
  if (!name || !contact || !phone) return response.status(400).json({ error: '店铺名称、联系人和电话不能为空' });
  const application = await mutateDatabase(database => {
    const item = { id: randomUUID(), name, contact, phone, status: 'pending', createdAt: new Date().toISOString() };
    database.applications.push(item);
    return item;
  });
  response.status(201).json({ application });
});

app.get('/api/stores/:storeId/projects', async (request, response) => {
  const database = await loadDatabase();
  response.json({ projects: database.projects.filter(project => project.storeId === request.params.storeId) });
});

app.post('/api/stores/:storeId/projects', requireMerchant, async (request, response) => {
  if (request.identity.storeId !== request.params.storeId) return response.status(403).json({ error: '无权管理其他店铺' });
  const { name, game, price, unit = '小时' } = request.body;
  if (!name || !game || !Number.isFinite(Number(price))) return response.status(400).json({ error: '项目参数不完整' });
  const project = await mutateDatabase(database => {
    const item = { id: randomUUID(), storeId: request.params.storeId, name, game, price: Number(price), unit, active: true };
    database.projects.push(item);
    return item;
  });
  response.status(201).json({ project });
});

app.patch('/api/projects/:projectId', requireMerchant, async (request, response) => {
  const project = await mutateDatabase(database => {
    const item = database.projects.find(value => value.id === request.params.projectId && value.storeId === request.identity.storeId);
    if (!item) return null;
    for (const key of ['name', 'game', 'price', 'unit', 'active']) if (request.body[key] !== undefined) item[key] = request.body[key];
    return item;
  });
  if (!project) return response.status(404).json({ error: '项目不存在' });
  response.json({ project });
});

app.get('/api/orders', async (request, response) => {
  const database = await loadDatabase();
  const orders = database.orders.filter(order => !request.query.buyerId || order.buyerId === request.query.buyerId);
  response.json({ orders });
});

app.post('/api/orders', async (request, response) => {
  const { buyerId, serviceName, storeName, amount } = request.body;
  if (!buyerId || !serviceName || !storeName || !Number.isFinite(Number(amount))) return response.status(400).json({ error: '订单参数不完整' });
  const order = await mutateDatabase(database => {
    const item = { id: `PM${Date.now()}`, buyerId, serviceName, storeName, amount: Number(amount), status: 'pending', createdAt: new Date().toISOString() };
    database.orders.unshift(item);
    return item;
  });
  response.status(201).json({ order });
});

app.patch('/api/orders/:orderId', requireMerchant, async (request, response) => {
  const order = await mutateDatabase(database => {
    const item = database.orders.find(value => value.id === request.params.orderId);
    if (!item) return null;
    item.status = request.body.status || item.status;
    return item;
  });
  if (!order) return response.status(404).json({ error: '订单不存在' });
  response.json({ order });
});

app.get('/api/stores/:storeId/support', async (request, response) => {
  const database = await loadDatabase();
  const store = database.stores.find(item => item.id === request.params.storeId);
  if (!store) return response.status(404).json({ error: '店铺不存在' });
  response.json({ support: store.support });
});

app.put('/api/stores/:storeId/support', requireMerchant, async (request, response) => {
  if (request.identity.storeId !== request.params.storeId) return response.status(403).json({ error: '无权管理其他店铺' });
  const support = await mutateDatabase(database => {
    const store = database.stores.find(item => item.id === request.params.storeId);
    store.support = { enabled: Boolean(request.body.enabled), authorizedAgents: request.body.authorizedAgents || [] };
    return store.support;
  });
  response.json({ support });
});

app.get('/api/ads', async (_request, response) => {
  const database = await loadDatabase();
  response.json({ ads: database.ads.filter(ad => ad.status === 'active') });
});

app.post('/api/ads', requireMerchant, async (request, response) => {
  const ad = await mutateDatabase(database => {
    const item = { id: randomUUID(), storeId: request.identity.storeId, targetType: request.body.targetType, targetId: request.body.targetId, placement: request.body.placement, dailyBudget: Number(request.body.dailyBudget), status: 'pending', impressions: 0, clicks: 0 };
    database.ads.push(item);
    return item;
  });
  response.status(201).json({ ad });
});

app.post('/api/audio', upload.single('audio'), (request, response) => {
  if (!request.file) return response.status(400).json({ error: '请选择音频文件' });
  response.status(201).json({ url: `/uploads/${request.file.filename}`, size: request.file.size, mimeType: request.file.mimetype });
});

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ error: '服务端处理失败' });
});

app.listen(port, '127.0.0.1', () => console.log(`PLAYMATE API listening on http://127.0.0.1:${port}`));
