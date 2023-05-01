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
const client_1 = __importDefault(require("./client"));
const toGem_1 = __importDefault(require("./toGem"));
const listRaw = fs.readFileSync('./list.json', 'utf-8');
const list = JSON.parse(listRaw);
function test() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("RUNNING TEST");
        const gem = new client_1.default;
        const opt = {
            followRedirects: true,
            //infoOnly:true
        };
        if (!fs.existsSync('./out')) {
            fs.mkdirSync('./out');
        }
        fs.writeFileSync('./out/x.txt', '');
        let outJSON = [];
        let promises = [];
        let countP = 0;
        let countR = 0;
        for (let uri of list) {
            countP++;
            console.log(`Probing: ${uri} - # ${countP}/${list.length}`);
            // const x = await gem.probe(uri,opt)
            // .catch((err)=>{
            //     console.log(err);
            // });
            // if(!x){
            //     continue;
            // }
            // outJSON.push(x.info);
            const prom = gem.probe(uri, opt)
                .then((res) => {
                countR++;
                console.log(`Returned: # ${countR}/${list.length} - ${uri}`);
                // Update timestamp
                res.info.timestamp = new Date().toISOString();
                fs.appendFileSync('./out/data', JSON.stringify(res.info, null, 2) + '\r\n');
            })
                .catch((err) => {
                countR++;
                console.log(`!Returned: # ${countR}/${list.length} - ${uri}`);
                console.log(err);
            });
            promises.push(prom);
            // gem.probe(uri, opt)
            // .then((x)=>{
            //     console.log('GOT: '+uri);
            //     fs.appendFileSync('./out/x.txt', JSON.stringify(x.info, null, 2)+'\r\n');
            // })
            // .catch((err)=>{
            //     console.log(err);
            // });
        }
        Promise.all(promises).then((values) => {
            // for(let value of values){
            //     fs.appendFileSync('./out/x.txt', JSON.stringify(value.info, null, 2)+'\r\n');
            // }
            //fs.appendFileSync('./out/x.txt', JSON.stringify(values, null, 2));
            console.log('///////');
            console.log('Processed: ' + values.length);
            (0, toGem_1.default)();
            console.log('DONEZO');
        })
            .catch((err) => {
            console.log(err);
        });
        //fs.writeFileSync('./out/listing.json', JSON.stringify(outJSON, null, 2));
    });
}
test();
