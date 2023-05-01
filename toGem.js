"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
exports.default = () => {
    const dataRaw = fs.readFileSync('./out/data', 'utf-8');
    const data = dataRaw.split('\r\n');
    let gemActive = `# Active Capsules \r\n`;
    gemActive = 'Capsules which are active as of the last check!\r\n';
    let gemDead = `# Dead Capsules \r\n`;
    gemDead = 'Capsules where are dead as of the last check!\r\n';
    for (let item of data) {
        if (item === '') {
            continue;
        }
        const parsed = JSON.parse(item);
        if (parsed.statusCode === 20) {
            gemActive += `=> ${parsed.uri}\r\n`;
            gemActive += `Content Length: ${parsed.contentLength}\r\n`;
            gemActive += `Link Count: ${parsed.links.length}\r\n`;
            gemActive += `Meta: ${parsed.meta}\r\n`;
            gemActive += `Timestamp: ${parsed.timestamp}\r\n`;
            gemActive += '\r\n';
        }
        else {
            gemDead += `=> ${parsed.uri}\r\n`;
            gemDead += `Status Code: ${parsed.statusCode}\r\n`;
            gemDead += `Status Message: ${parsed.statusMessage}\r\n`;
            gemDead += `Meta: ${parsed.meta}\r\n`;
            gemDead += `Timestamp: ${parsed.timestamp}\r\n`;
            gemDead += '\r\n';
        }
        fs.writeFileSync('./out/activeCaps.gemini', gemActive);
        fs.writeFileSync('./out/deadCaps.gemini', gemDead);
    }
};
