"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleWebhook = void 0;
const hubspotWebhookService_1 = require("../services/hubspotWebhookService");
const handleWebhook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { objectId } = req.body;
        console.log('📩 Webhook received with objectId:', objectId);
        yield (0, hubspotWebhookService_1.processWebhook)(objectId);
        res.status(200).json({ status: 'success' });
    }
    catch (err) {
        console.error('❌ Error:', err);
        if (err instanceof Error) {
            res
                .status(err.message === 'No associated contact found' ? 404 : 500)
                .json({ error: err.message });
        }
        else {
            res.status(500).json({ error: 'Unknown error occurred' });
        }
    }
});
exports.handleWebhook = handleWebhook;
