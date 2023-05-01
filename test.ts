import * as fs from 'fs';
import GeminiProbe from './client';
import toGem from './toGem';


const listRaw  = fs.readFileSync('./data/list.json', 'utf-8');
const list = JSON.parse(listRaw);

async function test(){
    console.log("RUNNING TEST");
    const gem: GeminiProbe = new GeminiProbe;
    const opt: GeminiProbe["Options"] = {
        followRedirects: true,
        //infoOnly:true
    };
   
    if(!fs.existsSync('./out')){
        fs.mkdirSync('./out');
    }
    fs.writeFileSync('./out/x.txt', '');

    let outJSON = [];
    let promises = [];
    let countP = 0;
    let countR = 0;
    for(let uri of list){
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
        .then((res)=>{
            countR++;
            console.log(`Returned: # ${countR}/${list.length} - ${uri}`);
            // Update timestamp
            res.info.timestamp = new Date().toISOString();
            fs.appendFileSync('./out/data', JSON.stringify(res.info, null, 2)+'\r\n');
        })
        .catch((err)=>{
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
        console.log('Processed: '+values.length);
        toGem();
        console.log('DONEZO');
    })
    .catch((err)=>{
        console.log(err);
    });
    
    //fs.writeFileSync('./out/listing.json', JSON.stringify(outJSON, null, 2));
}
test();