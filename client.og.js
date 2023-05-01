const request = require('@derhuerst/gemini/client')
const fs = require('fs');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const uri = 'gemini://gemini.circumlunar.space/';

const opt = {
	// follow redirects automatically
	// Can also be a function `(nrOfRedirects, response) => boolean`.
	followRedirects: false,
	// client certificates
	useClientCerts: false,
	letUserConfirmClientCertUsage: null,
	//clientCertStore: defaultClientCertStore,
	// time to wait for socket connection & TLS handshake
	connectTimeout: 60 * 1000, // 60s
	// time to wait for response headers *after* the socket is connected
	headersTimeout: 30 * 1000, // 30s
	// time to wait for the first byte of the response body *after* the socket is connected
	timeout: 40 * 1000, // 40s
	// additional options to be passed into `tls.connect`
	tlsOpt: {},
	// verify the ALPN ID chosen by the server
	// see https://de.wikipedia.org/wiki/Application-Layer_Protocol_Negotiation
	verifyAlpnId: alpnId => alpnId ? (alpnId === ALPN_ID) : true,
};

request(uri, opt, (err, res) => {
    //console.log(opt);
	if (err) {
		console.error(err)
		process.exit(1)
	}

	console.log(res.statusCode, res.statusMessage)
	if (res.meta) console.log(res.meta)
    const info = {
        uri: uri,
        meta: res.meta,
        statusCode: res.statusCode,
        statusMessage: res.statusMessage
    }
    fs.writeFileSync('info.json', JSON.stringify(info, null, 2));
    const output = fs.createWriteStream('output.gemini');
    res.pipe(process.stdout);
    res.pipe(output);
    console.log('DONE!');
})