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
exports.processWebhook = void 0;
const slackClient_1 = require("../clients/slackClient");
const dbClient_1 = require("../clients/dbClient");
const hubspotClient_1 = require("../clients/hubspotClient");
const m2mClient_1 = require("../clients/m2mClient");
const processWebhook = (objectId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const meeting = yield (0, hubspotClient_1.fetchMeeting)(objectId);
    const contactId = (_d = (_c = (_b = (_a = meeting.associations) === null || _a === void 0 ? void 0 : _a.contacts) === null || _b === void 0 ? void 0 : _b.results) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.id;
    if (!contactId)
        throw new Error("No associated contact found");
    const contact = yield (0, hubspotClient_1.fetchContact)(contactId);
    // src/services/hubspotWebhookService.ts
    const cleaning_id = yield (0, m2mClient_1.makingTour)(contact, meeting); //taskチームがアサインされたツアーを作成する
    yield (0, slackClient_1.sendSlackMessage)(contact, meeting, cleaning_id); //フォーム回答次第、元のトラブル報告に通知
    yield (0, dbClient_1.saveToDatabase)({ meeting, contact });
});
exports.processWebhook = processWebhook;
