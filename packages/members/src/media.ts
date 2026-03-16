import { randomUUID } from "node:crypto";

export interface IS3Adapter {
    generatePresignedUploadUrl(key: string, mimeType: string): Promise<string>;
    checkExists(key: string): Promise<boolean>;
    deleteObject(key: string): Promise<void>;
}

export function createS3Adapter(_config?: { bucket?: string; region?: string }): IS3Adapter {
    // Production S3 adapter — to be wired when infrastructure is ready
    return {
        async generatePresignedUploadUrl(key: string, _mimeType: string): Promise<string> {
            throw new Error("S3 adapter not configured — use mock for tests");
        },
        async checkExists(_key: string): Promise<boolean> {
            throw new Error("S3 adapter not configured — use mock for tests");
        },
        async deleteObject(_key: string): Promise<void> {
            throw new Error("S3 adapter not configured — use mock for tests");
        },
    };
}

export function createMockS3Adapter(): IS3Adapter {
    const store = new Set<string>();

    return {
        async generatePresignedUploadUrl(key: string, _mimeType: string): Promise<string> {
            store.add(key);
            return `https://mock-s3.example.com/${key}?X-Amz-Signature=mock`;
        },
        async checkExists(key: string): Promise<boolean> {
            return store.has(key);
        },
        async deleteObject(key: string): Promise<void> {
            store.delete(key);
        },
    };
}

export async function generateUploadUrl(
    s3: IS3Adapter,
    userId: string,
    filename: string,
    mimeType: string,
): Promise<{ uploadUrl: string; key: string }> {
    const ext = filename.split(".").pop() ?? "";
    const key = `members/${userId}/${randomUUID()}.${ext}`;
    const uploadUrl = await s3.generatePresignedUploadUrl(key, mimeType);
    return { uploadUrl, key };
}

export async function confirmUpload(
    s3: IS3Adapter,
    _userId: string,
    key: string,
): Promise<{ confirmed: boolean }> {
    const exists = await s3.checkExists(key);
    return { confirmed: exists };
}

export async function deleteMedia(s3: IS3Adapter, key: string): Promise<void> {
    await s3.deleteObject(key);
}
