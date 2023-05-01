import * as fs from 'fs';

export default ()=>{
    const dataRaw = fs.readFileSync('./out/data','utf-8');
    const data = dataRaw.split('\r\n');
    let gemActive = `# Active Capsules \r\n`;
    gemActive = 'Capsules which are active as of the last check!\r\n';
    let gemDead = `# Dead Capsules \r\n`;
    gemDead = 'Capsules where are dead as of the last check!\r\n'
    for(let item of data){
        if(item === ''){
            continue;
        }
        const parsed = JSON.parse(item);
        if(parsed.statusCode === 20){
            gemActive += `=> ${parsed.uri}\r\n`; 
            gemActive += `Content Length: ${parsed.contentLength}\r\n`;
            gemActive += `Link Count: ${parsed.links.length}\r\n`;
            gemActive += `Meta: ${parsed.meta}\r\n`;
            gemActive += `Timestamp: ${parsed.timestamp}\r\n`;
            gemActive += '\r\n';
        }
        else{
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
}
