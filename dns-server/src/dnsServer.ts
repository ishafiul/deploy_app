import * as dgram from 'dgram';
import * as dnsPacket from 'dns-packet';
import {MongoClient} from 'mongodb';
import {createClient} from 'redis';

const PORT = 53; // Port to listen on
const server = dgram.createSocket('udp4');

// MongoDB setup
const mongoUri = 'mongodb://localhost:27017';
const dbName = 'dns_records';
const mongoClient = new MongoClient(mongoUri);

// Redis setup
const redisClient = createClient({url: 'redis://localhost:6379'});
redisClient.connect();

async function getDnsRecordsFromMongo(domain: string) {
    await mongoClient.connect();
    const db = mongoClient.db(dbName);
    const collection = db.collection('records');
    return await collection.findOne({_id: domain});
}

async function getDnsResponse(question: dnsPacket.Question) {
    const {type, name} = question;

    // Check Redis cache first
    const cachedRecord = await redisClient.get(name);
    if (cachedRecord) {
        return JSON.parse(cachedRecord);
    }

    // Fetch from MongoDB if not in cache
    const record = await getDnsRecordsFromMongo(name);
    if (!record) return [];

    const answers: dnsPacket.Answer[] = [];

    // Handle various DNS record types
    if (type === 'SOA' && record.soa) {
        answers.push({
            type: 'SOA',
            class: 'IN',
            name,
            ttl: record.soa.ttl,
            data: record.soa
        });
    } else if (type === 'A' && record.a) {
        record.a.forEach((aRecord: any) => {
            if (aRecord.name === name || (aRecord.name === '@')) {
                answers.push({
                    type: 'A',
                    class: 'IN',
                    name,
                    ttl: aRecord.ttl,
                    data: aRecord.ip
                });
            }
        });
    } else if (type === 'CNAME' && record.cname) {
        record.cname.forEach((cnameRecord: any) => {
            if (cnameRecord.name === name) {
                answers.push({
                    type: 'CNAME',
                    class: 'IN',
                    name,
                    ttl: cnameRecord.ttl,
                    data: cnameRecord.alias
                });
            }
        });
    } else if (type === 'MX' && record.mx) {
        record.mx.forEach((mxRecord: any) => {
            if (mxRecord.name === name) {
                answers.push({
                    type: 'MX',
                    class: 'IN',
                    name,
                    ttl: mxRecord.ttl,
                    data: {preference: mxRecord.preference, exchange: mxRecord.host}
                });
            }
        });
    } else if (type === 'TXT' && record.txt) {
        record.txt.forEach((txtRecord: any) => {
            if (txtRecord.name === name) {
                answers.push({
                    type: 'TXT',
                    class: 'IN',
                    name,
                    ttl: txtRecord.ttl,
                    data: txtRecord.txt
                });
            }
        });
    }

    // Cache in Redis
    await redisClient.set(name, JSON.stringify(answers), {EX: 3600});

    return answers;
}

// Handle incoming DNS requests
server.on('message', async (msg, rinfo) => {
    const query = dnsPacket.decode(msg); // Decode the incoming DNS packet
    console.log('Received query:', query);

    const answers: dnsPacket.Answer[] = [];

    for (const question of query.questions!) {
        console.log(`Processing question: ${question.name} (${question.type})`);
        const response = await getDnsResponse(question);
        answers.push(...response);
    }

    // Create the response packet
    const response = dnsPacket.encode({
        type: 'response',
        id: query.id,
        flags: dnsPacket.RECURSION_DESIRED | dnsPacket.RECURSION_AVAILABLE,
        questions: query.questions,
        answers
    });

    // Send the response
    server.send(response, rinfo.port, rinfo.address, (err) => {
        if (err) {
            console.error(`Error sending response: ${err.message}`);
        } else {
            console.log('Response sent');
        }
    });
});

// Bind the server to the port
server.bind(PORT, () => {
    console.log(`DNS server running on port ${PORT}`);
});
