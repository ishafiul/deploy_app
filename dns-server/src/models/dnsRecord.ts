import mongoose, { Schema, Document } from 'mongoose';

// SOA Record Interface and Schema
interface SOA {
    name: string;
    minimum: number;
    expire: number;
    retry: number;
    refresh: number;
    serial: number;
    rname: string;
    mname: string;
    ttl: number;
}

const soaSchema = new Schema<SOA>({
    name: { type: String, required: true },
    minimum: { type: Number, required: true },
    expire: { type: Number, required: true },
    retry: { type: Number, required: true },
    refresh: { type: Number, required: true },
    serial: { type: Number, required: true },
    rname: { type: String, required: true },
    mname: { type: String, required: true },
    ttl: { type: Number, required: true }
});

// A Record Interface and Schema
interface ARecord {
    name: string;
    ip: string;
    ttl: number;
}

const aRecordSchema = new Schema<ARecord>({
    name: { type: String, required: true },
    ip: { type: String, required: true },
    ttl: { type: Number, required: true }
});

// CNAME Record Interface and Schema
interface CNAMERecord {
    name: string;
    alias: string;
    ttl: number;
}

const cnameRecordSchema = new Schema<CNAMERecord>({
    name: { type: String, required: true },
    alias: { type: String, required: true },
    ttl: { type: Number, required: true }
});

// MX Record Interface and Schema
interface MXRecord {
    name: string;
    preference: number;
    host: string;
    ttl: number;
}

const mxRecordSchema = new Schema<MXRecord>({
    name: { type: String, required: true },
    preference: { type: Number, required: true },
    host: { type: String, required: true },
    ttl: { type: Number, required: true }
});

// TXT Record Interface and Schema
interface TXTRecord {
    name: string;
    txt: string;
    ttl: number;
}

const txtRecordSchema = new Schema<TXTRecord>({
    name: { type: String, required: true },
    txt: { type: String, required: true },
    ttl: { type: Number, required: true }
});

// Full DNS Record Interface and Schema
interface DnsRecord extends Document {
    soa: SOA;
    a: ARecord[];
    cname: CNAMERecord[];
    mx: MXRecord[];
    txt: TXTRecord[];
}

const dnsRecordSchema = new Schema<DnsRecord>({
    soa: soaSchema,
    a: [aRecordSchema],
    cname: [cnameRecordSchema],
    mx: [mxRecordSchema],
    txt: [txtRecordSchema]
});

export const DnsRecord = mongoose.model<DnsRecord>('DnsRecord', dnsRecordSchema);
