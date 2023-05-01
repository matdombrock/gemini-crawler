import * as fs from 'fs';
import request from '@derhuerst/gemini/client';

// Required to avoid cert issues
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

interface Options{
    // Derhurst options
    followRedirects?: boolean,
    useClientCerts?: boolean,
    letUserConfirmClientCertUseage?: boolean,
    connectTimeout?: number,
    headersTimeout?: number,
    timeout?: number,
    tlsOpt?: Object
    // Special options
    infoOnly?: boolean
}

class Info{
    uri: string = 'undefined';
    opt: Options = {};
    meta: any = {};
    statusCode: number = -1;
    statusMessage?: string = 'undefined';
    contentLength: number;
    links: Array<string> = [];
    timestamp: string = new Date().toISOString();
}

class ProbeOut{
    content: string = '';
    info: Info;
}

class GeminiProbe{
    ProbeOut: ProbeOut;
    Info: Info;
    Options: Options;
    constructor(){}
    probe(uri:string, opt: Options = {}):Promise<ProbeOut>{
        let info: Info = new Info;
        info.uri = uri;
        info.opt = opt;
        const myPromise:Promise<ProbeOut> = new Promise((resolve, reject) => {
            // Call @derhuerst/gemini/client request
           request(uri, opt, (err, res, _info=info, _resolve=resolve, _reject=reject)=>{
                this._callback(err, res, _info, _resolve, _reject);
           });
        });
        return myPromise;
    }
    async _callback(err:any, res:any, info:Info, resolve, reject){
        const out: ProbeOut = new ProbeOut;

        let opt = info.opt;

        if(!res){
            reject('NO_RESOPNSE');
            return;
        }

        // if(res.statusCode === 31){
        //     console.log('Following Redirect: '+res.meta);
        //     const x = await this.probe(res.meta, opt);
        //     resolve(x);
        //     return;
        // }

        try{
            info.meta = res.meta;
            info.statusCode = res.statusCode;
            info.statusMessage = res.statusMessage;  
        }
        catch(err){
            console.log(err);
            reject(err);
            return;
        }
        

        out.info = info;

        if(opt.infoOnly) {
            out.content = 'info-only'
            resolve(out);
            return;
        }; 

        if (err) {
            console.error(err);
            reject(err);
            return;
            //process.exit(1);
        };

        const pattern = /[^a-zA-Z0-9_\-\.]/g;
        const safeURI = info.uri.replace(pattern, '');
        const writeStream:fs.WriteStream = fs.createWriteStream('/tmp/'+safeURI);

        //res.pipe(process.stdout);
        res.pipe(writeStream);

        writeStream.on('error', (err)=>{
            console.log(err);
            reject(err);
            return;
        });

        writeStream.on('finish', ()=>{
            const readStream = fs.createReadStream('/tmp/'+safeURI);

            readStream.on('data', (chunk) => {
                out.content += chunk.toString();
            });

            readStream.on('error', (err)=>{
                console.log(err);
                reject(err);
            });

            readStream.on('end', () => {
                out.info.contentLength = out.content.length;
                const lines: Array<string> = out.content.split('\n');
                for(let line of lines){
                    if(line.substring(0,3) == '=> '){
                        line = line.replace('=> ','');
                        if(line.substring(0,9) !== 'gemini://'){
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

        setTimeout(()=>{reject('timeout')},opt.timeout||10000);
        
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

export default GeminiProbe;
