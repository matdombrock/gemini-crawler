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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const client_1 = __importDefault(require("@derhuerst/gemini/client"));
// Required to avoid cert issues
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
class Info {
    constructor() {
        this.uri = 'undefined';
        this.opt = {};
        this.meta = {};
        this.statusCode = -1;
        this.statusMessage = 'undefined';
        this.links = [];
        this.timestamp = new Date().toISOString();
    }
}
class ProbeOut {
    constructor() {
        this.content = '';
    }
}
class GeminiProbe {
    constructor() { }
    probe(uri, opt = {}) {
        let info = new Info;
        info.uri = uri;
        info.opt = opt;
        const myPromise = new Promise((resolve, reject) => {
            // Call @derhuerst/gemini/client request
            (0, client_1.default)(uri, opt, (err, res, _info = info, _resolve = resolve, _reject = reject) => {
                this._callback(err, res, _info, _resolve, _reject);
            });
        });
        return myPromise;
    }
    _callback(err, res, info, resolve, reject) {
        return __awaiter(this, void 0, void 0, function* () {
            const out = new ProbeOut;
            let opt = info.opt;
            if (!res) {
                reject('NO_RESOPNSE');
                return;
            }
            // if(res.statusCode === 31){
            //     console.log('Following Redirect: '+res.meta);
            //     const x = await this.probe(res.meta, opt);
            //     resolve(x);
            //     return;
            // }
            try {
                info.meta = res.meta;
                info.statusCode = res.statusCode;
                info.statusMessage = res.statusMessage;
            }
            catch (err) {
                console.log(err);
                reject(err);
                return;
            }
            out.info = info;
            if (opt.infoOnly) {
                out.content = 'info-only';
                resolve(out);
                return;
            }
            ;
            if (err) {
                console.error(err);
                reject(err);
                return;
                //process.exit(1);
            }
            ;
            const pattern = /[^a-zA-Z0-9_\-\.]/g;
            const safeURI = info.uri.replace(pattern, '');
            const writeStream = fs.createWriteStream('/tmp/' + safeURI);
            //res.pipe(process.stdout);
            res.pipe(writeStream);
            writeStream.on('error', (err) => {
                console.log(err);
                reject(err);
                return;
            });
            writeStream.on('finish', () => {
                const readStream = fs.createReadStream('/tmp/' + safeURI);
                readStream.on('data', (chunk) => {
                    out.content += chunk.toString();
                });
                readStream.on('error', (err) => {
                    console.log(err);
                    reject(err);
                });
                readStream.on('end', () => {
                    out.info.contentLength = out.content.length;
                    const lines = out.content.split('\n');
                    for (let line of lines) {
                        if (line.substring(0, 3) == '=> ') {
                            line = line.replace('=> ', '');
                            if (line.substring(0, 9) !== 'gemini://') {
                                // Might add an extra slash
                                line = out.info.uri + '/' + line;
                            }
                            out.info.links.push(line.split(' ')[0]);
                        }
                    }
                    resolve(out);
                    return;
                });
            });
            setTimeout(() => { reject('timeout'); }, opt.timeout || 10000);
        });
    }
}
// const list: Array<string> = [
//     'gemini://earthfa.de/',
//     'gemini://kennedy.gemi.dev',
//     //'gemini://gemini.circumlunar.space/',
//     //'gemini://gemini.circumlunar.space:1965/news/',
//     'gemini://kennedy.gemi.dev:1965/observatory/known-hosts/',
//     'gemini://matdombrock.com',
//     'gemini://earthfa.de/',
// ];
exports.default = GeminiProbe;
