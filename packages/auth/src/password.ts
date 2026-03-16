import * as argon2 from "argon2";

export async function hashPassword(plaintext: string): Promise<string> {
    return argon2.hash(plaintext, {
        type: argon2.argon2id,
        memoryCost: 65536, // 64 MB
        timeCost: 3,
        parallelism: 4,
    });
}

export async function verifyPassword(plaintext: string, hash: string): Promise<boolean> {
    return argon2.verify(hash, plaintext);
}
