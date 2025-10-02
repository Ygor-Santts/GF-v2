"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const mongoose_1 = __importDefault(require("mongoose"));
const node_cron_1 = __importDefault(require("node-cron"));
const Transaction_1 = __importDefault(require("./models/Transaction"));
const transactions_1 = __importDefault(require("./routes/transactions"));
const recurring_1 = __importDefault(require("./routes/recurring"));
const financing_1 = __importDefault(require("./routes/financing"));
const reports_1 = __importDefault(require("./routes/reports"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use((0, cors_1.default)({ origin: corsOrigin }));
app.use((0, morgan_1.default)('dev'));
app.use('/api/transactions', transactions_1.default);
app.use('/api/recurring', recurring_1.default);
app.use('/api/financing', financing_1.default);
app.use('/api/reports', reports_1.default);
app.get('/health', (_req, res) => res.json({ ok: true }));
const PORT = Number(process.env.PORT) || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/gestao_financeira';
mongoose_1.default.connect(MONGO_URI).then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
}).catch(err => {
    console.error('Mongo connect error', err);
    process.exit(1);
});
// Auto-pay daily at 03:00 (disable with AUTO_PAY_CRON=false)
async function autoPayDue() {
    const now = new Date();
    const endToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const due = await Transaction_1.default.find({ status: 'PLANNED', date: { $lte: endToday } }).lean();
    for (const t of due) {
        const amount = t.amount ?? t.plannedAmount ?? 0;
        await Transaction_1.default.findByIdAndUpdate(t._id, { status: 'PAID', amount });
    }
    if (due.length)
        console.log(`[autoPayDue] Marked ${due.length} as PAID`);
}
if (process.env.AUTO_PAY_CRON !== 'false') {
    node_cron_1.default.schedule('0 3 * * *', () => { autoPayDue().catch(err => console.error('autoPayDue error', err)); });
}
